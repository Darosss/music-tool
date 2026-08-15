import { create } from "zustand";
import type { AudioStore, RecorderStore } from "./types";
import type { AudioEngineEvent } from "../audio/types";
import { NoteVibe } from "../audio/vibe";
import { generateImpulseResponse } from "../audio/effects-chain-cache";

export const useRecorderStore = create<RecorderStore>((set, get) => ({
  togglePlayback: (audioCtx) => {
    set((state) => ({
      ...state,
      isPlaybackOn: !state.isPlaybackOn,
      playStartTime: audioCtx.currentTime,
    }));
  },
  startRecording: (audioCtx, loopLengthSeconds) => {
    set((state) => ({
      ...state,
      isRecording: true,
      events: [],
      openNotes: new Map(),
      loopLength: loopLengthSeconds || null,
      recordStartTime: audioCtx?.currentTime || 0,
    }));
  },
  stopRecording: (audioCtx) => {
    set((state) => {
      const now = state.getRelativeTime(audioCtx);
      const newOpenNotes = state.openNotes;
      for (const ev of newOpenNotes.values()) ev.end = now;
      return { ...state, isRecording: false, openNotes: newOpenNotes };
    });
  },

  isRecording: false,
  isPlaybackOn: false,
  openNotes: new Map(),
  loopLength: 0,
  recordStartTime: 0,
  playStartTime: 0,
  events: [],

  getRelativeTime: (audioCtx) => {
    const t = (audioCtx.currentTime || 0) - get().recordStartTime;
    return get().loopLength ? t % (get().loopLength || 0) : t;
  },
  setIsRecording: (isRecording) => {
    set((state) => ({
      ...state,
      isRecording: isRecording,
    }));
  },
  recordNote: (note, audioCtx) => {
    if (!get().isRecording) return;
    const ev: AudioEngineEvent = {
      ...note,
      start: get().getRelativeTime(audioCtx),
      end: null,
    };

    set((state) => {
      const newEvents = [...state.events, ev];
      const newOpenNotes = state.openNotes;
      newOpenNotes.set(note.note, ev);
      return {
        ...state,
        events: newEvents,
        openNotes: newOpenNotes,
      };
    });
  },
  endNote: (note, audioCtx) => {
    set((state) => {
      const foundOpenNote = state.openNotes.get(note);
      const foundEventIdx = state.events.findIndex(
        (n) => n.start === foundOpenNote?.start,
      );
      if (foundEventIdx == -1) return state;

      const newEvents = state.events;
      const endTime = get().getRelativeTime(audioCtx);

      const currentEvent = newEvents[foundEventIdx];
      newEvents[foundEventIdx] = {
        ...currentEvent,
        end: endTime > currentEvent.start ? endTime : state.loopLength,
      };

      const newOpenNotes = state.openNotes;
      newOpenNotes.delete(note);
      return { ...state, events: newEvents, openNotes: newOpenNotes };
    });
  },
}));

export const useAudioStore = create<AudioStore>((set, get) => ({
  audioCtx: null,
  isInitialized: false,
  vibe: NoteVibe.CLASSIC,
  reverbLevel: 0,
  reverbDuration: 0,
  reverbDecay: 0,
  echoLevel: 0,
  echoMaxDelayTime: 2.0,
  masterGain: null,
  reverbNode: null,
  reverbGain: null,
  delayNode: null,
  delayGain: null,
  activeOscillators: new Map(),
  initAudio: () => {
    if (get().audioCtx) return;
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);

    const delayNode = audioCtx.createDelay(get().echoMaxDelayTime);
    delayNode.delayTime.value = 0.4;
    const delayGain = audioCtx.createGain();
    delayGain.gain.value = get().echoLevel;
    const reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = generateImpulseResponse(
      audioCtx,
      get().reverbDuration,
      get().reverbDecay,
    );
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = get().reverbLevel;

    masterGain.connect(reverbNode).connect(reverbGain);
    reverbGain.connect(audioCtx.destination);

    delayNode.connect(delayGain);
    delayGain.connect(delayNode);
    delayGain.connect(masterGain);
    set((state) => ({
      ...state,
      audioCtx,
      masterGain,
      delayNode,
      delayGain,
      reverbNode,
      reverbGain,
      isInitialized: true,
    }));
  },
  setEchoLevel: (level) => {
    set((state) => {
      const delayGain = state.delayGain;
      const audioCtx = state.audioCtx;
      if (delayGain && audioCtx)
        delayGain.gain.setTargetAtTime(level, audioCtx.currentTime, 0.01);

      return {
        ...state,
        echoLevel: level,
        delayGain,
      };
    });
  },
  setEchoMaxDelayTime: (time) => {
    const { audioCtx, masterGain, delayGain } = get();
    if (!audioCtx || !masterGain || !delayGain) return;

    get().delayNode?.disconnect();

    const delayNode = audioCtx.createDelay(time);
    delayNode.delayTime.value = get().echoLevel ?? 0.4;

    masterGain.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(delayNode);

    set({ delayNode, echoMaxDelayTime: time });
  },
  setReverbLevel: (level) => {
    set((state) => {
      const reverbGain = state.reverbGain;
      const audioCtx = state.audioCtx;
      if (reverbGain && audioCtx)
        reverbGain.gain.setTargetAtTime(level, audioCtx.currentTime, 0.01);
      return {
        ...state,
        reverbLevel: level,
        reverbGain,
      };
    });
  },
  setReverbShape: (duration, decay) => {
    const { reverbNode, audioCtx } = get();
    if (!audioCtx || !reverbNode) return;
    reverbNode.buffer = generateImpulseResponse(audioCtx, duration, decay);
    set({ reverbDuration: duration, reverbDecay: decay });
  },
  setVibe: (vibe) => {
    set((state) => ({
      ...state,
      vibe: vibe,
    }));
  },
}));
