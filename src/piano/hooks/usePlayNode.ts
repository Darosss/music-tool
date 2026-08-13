import { useCallback } from "preact/hooks";
import { ChordMode } from "../utils";
import type {
  AudioEngineEvent,
  AudioSoundNote,
  PlaybackOpts,
} from "../../audio/types";
import { triggerNote } from "../../audio/note-engine";
import type { NoteVibe } from "../../audio/vibe";
export interface UsePlayNoteArgs {
  vibe: NoteVibe;
  masterGain: GainNode | null;
  delay?: {
    node: DelayNode | null;
    gain: GainNode | null;
  };
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
  delay,
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
      playbackOpts?: PlaybackOpts,
    ): AudioEngineEvent | null => {
      if (!ctx || activeOscillators.has(key.note)) return null;
      if (ctx.state === "suspended") ctx.resume();

      const { voice, event } = triggerNote(
        key,
        {
          ctx,
          masterGain,
          delayNode: delay?.node,
          delayGain: delay?.gain,
          reverbNode,
        },
        { vibe, octave, chordMode, playbackOpts },
      );

      activeOscillators.set(key.note, voice);
      if (!playbackOpts) onKeyActive(key.note);

      return event;
    },
    [vibe, octave, chordMode, onKeyActive, masterGain, delay, reverbNode],
  );
  const stopNote = useCallback(
    (
      note: AudioSoundNote,
      ctx: AudioContext | null,
      ignoreOnStopNote: boolean = false,
    ): AudioSoundNote | null => {
      const data = activeOscillators.get(note.note);
      if (!ctx) return null;
      if (data && ctx) {
        const now = ctx.currentTime;
        data.gain.gain.setTargetAtTime(0, now, 0.1);
        setTimeout(() => {
          data.oscs.forEach((o) => o.stop());
          activeOscillators.delete(note.note);
        }, 200);
        if (!ignoreOnStopNote) onStopNote(note.note);
      }
      return note;
    },
    [onStopNote],
  );

  return { playNote, stopNote };
};
