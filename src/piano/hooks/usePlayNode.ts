import { useCallback } from "preact/hooks";
import { KEYS, switchVibe, ChordMode, PianoVibe } from "../utils";
export interface UsePlayNoteArgs {
  vibe: PianoVibe;
  masterGain: GainNode | null;
  delayNode: DelayNode | null;
  reverbNode: ConvolverNode | null;
  octave: number;
  chordMode: ChordMode;
  activeOscillators: Map<number, { oscs: OscillatorNode[]; gain: GainNode }>;
  onKeyActive: (index: number) => void;
  onStopNote: (index: number) => void;
}

export const usePlayPiano = ({
  vibe,
  masterGain,
  delayNode,
  reverbNode,
  octave,
  activeOscillators,
  onKeyActive,
  onStopNote,
  chordMode,
}: UsePlayNoteArgs) => {
  const playNote = useCallback(
    (index: number, ctx: AudioContext | null) => {
      if (!ctx || activeOscillators.has(index)) return;

      if (ctx.state === "suspended") ctx.resume();

      const key = KEYS[index];
      const octaveMultiplier = Math.pow(2, octave);
      const now = ctx.currentTime;

      const playFreq = (freq: number) => {
        const oscs: OscillatorNode[] = [];

        const noteGain = ctx.createGain();
        switchVibe(vibe, ctx, freq, now, oscs, noteGain);
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.3, now + 0.05);

        if (masterGain) noteGain.connect(masterGain);
        if (delayNode) noteGain.connect(delayNode);
        if (reverbNode) noteGain.connect(reverbNode);
        oscs.forEach((o) => o.start());
        return { oscs, gain: noteGain };
      };

      const rootFreq = key.freq * octaveMultiplier;
      const allInstances: { oscs: OscillatorNode[]; gain: GainNode }[] = [
        playFreq(rootFreq),
      ];

      if (chordMode === ChordMode.MAJOR) {
        allInstances.push(playFreq(rootFreq * 1.2599));
        allInstances.push(playFreq(rootFreq * 1.4983));
      } else if (chordMode === ChordMode.MINOR) {
        allInstances.push(playFreq(rootFreq * 1.1892));
        allInstances.push(playFreq(rootFreq * 1.4983));
      }

      const aggregated = {
        oscs: allInstances.flatMap((i) => i.oscs),
        gain: allInstances[0].gain,
      };

      activeOscillators.set(index, aggregated);

      aggregated.gain = {
        ...allInstances[0].gain,
        gain: {
          ...allInstances[0].gain.gain,
          setTargetAtTime: (val: number, time: number, constant: number) => {
            allInstances.forEach((inst) =>
              inst.gain.gain.setTargetAtTime(val, time, constant),
            );
          },
        },
      } as any;

      onKeyActive(index);
    },
    [vibe, octave, chordMode, onKeyActive],
  );
  const stopNote = useCallback(
    (index: number, ctx: AudioContext | null) => {
      const data = activeOscillators.get(index);
      if (data && ctx) {
        const now = ctx.currentTime;
        data.gain.gain.setTargetAtTime(0, now, 0.1);
        setTimeout(() => {
          data.oscs.forEach((o) => o.stop());
          activeOscillators.delete(index);
        }, 200);
        onStopNote(index);
      }
    },
    [onStopNote],
  );

  return { playNote, stopNote };
};
