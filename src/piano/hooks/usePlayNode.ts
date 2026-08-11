import { useCallback } from "preact/hooks";
import { switchVibe, ChordMode, PianoVibe } from "../utils";
import type { AudioEngineEvent, AudioSoundNote } from "../../audio/types";
export interface UsePlayNoteArgs {
  vibe: PianoVibe;
  masterGain: GainNode | null;
  delayNode: DelayNode | null;
  reverbNode: ConvolverNode | null;
  octave: number;
  chordMode: ChordMode;
  activeOscillators: Map<
    AudioSoundNote["note"],
    { oscs: OscillatorNode[]; gain: GainNode }
  >;
  onKeyActive: (note: AudioSoundNote["note"]) => void;
  onStopNote: (note: AudioSoundNote["note"]) => void;
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
    (
      key: AudioSoundNote,
      ctx: AudioContext | null,
    ): AudioEngineEvent | null => {
      if (!ctx || activeOscillators.has(key.note)) return null;

      if (ctx.state === "suspended") ctx.resume();

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

      activeOscillators.set(key.note, aggregated);

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

      onKeyActive(key.note);
      return {
        start: ctx.currentTime,
        end: null,
        note: key.note,
        freq: key.freq,
      };
    },
    [vibe, octave, chordMode, onKeyActive],
  );
  const stopNote = useCallback(
    (
      note: AudioSoundNote,
      ctx: AudioContext | null,
    ): Omit<AudioEngineEvent, "start"> | null => {
      const data = activeOscillators.get(note.note);
      if (!ctx) return null;
      if (data && ctx) {
        const now = ctx.currentTime;
        data.gain.gain.setTargetAtTime(0, now, 0.1);
        setTimeout(() => {
          data.oscs.forEach((o) => o.stop());
          activeOscillators.delete(note.note);
        }, 200);
        onStopNote(note.note);
      }
      return {
        end: ctx.currentTime,
        ...note,
      };
    },
    [onStopNote],
  );

  return { playNote, stopNote };
};
