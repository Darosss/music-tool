import type { AudioEngineEvent, AudioSoundNote } from "../audio/types";
import type { NoteVibe } from "../audio/vibe";

export interface RecorderStore {
  startRecording: (
    audioCtx: AudioContext,
    loopLengthSeconds?: number | null,
  ) => void;
  stopRecording: (audioCtx: AudioContext) => void;
  getRelativeTime: (audioCtx: AudioContext) => number;
  isRecording: boolean;
  isPlaybackOn: boolean;
  togglePlayback: (audioCtx: AudioContext) => void;
  openNotes: Map<string, AudioEngineEvent>;
  events: AudioEngineEvent[];
  recordStartTime: number;
  playStartTime: number;
  loopLength: number | null;
  setIsRecording: (isRecording: boolean) => void;
  recordNote: (note: AudioEngineEvent, audioCtx: AudioContext) => void;
  endNote: (note: AudioEngineEvent["note"], audioCtx: AudioContext) => void;
}

export interface AudioStore {
  audioCtx: AudioContext | null;
  vibe: NoteVibe;
  reverbLevel: number;
  reverbDecay: number;
  reverbDuration: number;
  echoLevel: number;
  echoMaxDelayTime: number;
  masterGain: GainNode | null;
  reverbNode: ConvolverNode | null;
  reverbGain: GainNode | null;
  delayNode: DelayNode | null;
  delayGain: GainNode | null;
  isInitialized: boolean;
  activeOscillators: Map<
    AudioSoundNote["note"],
    {
      oscs: OscillatorNode[];
      gain: GainNode;
    }
  >;
  initAudio: () => void;
  setEchoLevel: (level: number) => void;
  setEchoMaxDelayTime: (time: number) => void;
  setReverbLevel: (level: number) => void;
  setReverbShape: (duration: number, decay: number) => void;
  setVibe: (vibe: NoteVibe) => void;
}
