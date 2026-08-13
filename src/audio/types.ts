import type { ChordMode } from "./enums";
import type { NoteVibe } from "./vibe";

export interface AudioSoundNote {
  note: string;
  freq: number;
}
export interface AudioEngineEvent extends AudioSoundNote {
  start: number;
  end: number | null;
  effects?: TrackEffects;
  chordMode: ChordMode;
  octave: number;
  vibe: NoteVibe;
}
export interface TrackEffects {
  reverb?: { mix: number };
  delay?: { time: number; feedback: number; mix: number };
}
export interface Voice {
  oscs: OscillatorNode[];
  gain: GainNode;
}
export interface AggregatedVoice {
  oscs: OscillatorNode[];
  gain: GainNode;
}
export interface PlaybackOpts {
  when: number;
  duration: number;
}
export interface EngineNodes {
  ctx: AudioContext | OfflineAudioContext;
  masterGain?: GainNode | null;
  delayNode?: DelayNode | null;
  delayGain?: GainNode | null;
  reverbNode?: AudioNode | null;
}
export interface TriggerNoteConfig {
  vibe: NoteVibe;
  octave: number;
  chordMode: ChordMode;
  playbackOpts?: PlaybackOpts;
}
