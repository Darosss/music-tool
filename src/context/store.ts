import { create } from "zustand";
import type { AudioStore, RecorderStore } from "./types";
import type { AudioEngineEvent } from "../audio/types";
import { NoteVibe } from "../audio/vibe";
import { generateImpulseResponse } from "../audio/effects-chain-cache";

export const useRecorderStore = create<RecorderStore>((set, get) => ({
  togglePlayback: (audioCtx) => {
    const { isPlaybackOn } = get();
    set({
      isPlaybackOn: !isPlaybackOn,
      playStartTime: audioCtx.currentTime,
    });
  },
  startRecording: (audioCtx, loopLengthSeconds) =>
    set({
      isRecording: true,
      events: [],
      openNotes: new Map(),
      loopLength: loopLengthSeconds || null,
      recordStartTime: audioCtx?.currentTime || 0,
    }),
  stopRecording: (audioCtx) => {
    const { getRelativeTime, openNotes } = get();
    const now = getRelativeTime(audioCtx);
    const newOpenNotes = openNotes;
    for (const ev of newOpenNotes.values()) ev.end = now;
    set({ isRecording: false, openNotes: newOpenNotes });
  },

  isRecording: false,
  isPlaybackOn: false,
  openNotes: new Map(),
  loopLength: 0,
  recordStartTime: 0,
  playStartTime: 0,
  events: [],

  getRelativeTime: (audioCtx) => {
    const { recordStartTime, loopLength } = get();
    const t = (audioCtx.currentTime || 0) - recordStartTime;
    return loopLength ? t % (loopLength || 0) : t;
  },
  setIsRecording: (isRecording) => set({ isRecording: isRecording }),
  recordNote: (note, audioCtx) => {
    const { isRecording, getRelativeTime, events, openNotes } = get();
    if (!isRecording) return;

    const ev: AudioEngineEvent = {
      ...note,
      start: getRelativeTime(audioCtx),
      end: null,
    };

    const newEvents = [...events, ev];
    const newOpenNotes = openNotes;
    newOpenNotes.set(note.note, ev);

    set({
      events: newEvents,
      openNotes: newOpenNotes,
    });
  },
  endNote: (note, audioCtx) => {
    const { openNotes, events, loopLength } = get();
    const foundOpenNote = openNotes.get(note);
    const foundEventIdx = events.findIndex(
      (n) => n.start === foundOpenNote?.start,
    );
    if (foundEventIdx == -1) return;

    const newEvents = events;
    const endTime = get().getRelativeTime(audioCtx);

    const currentEvent = newEvents[foundEventIdx];
    newEvents[foundEventIdx] = {
      ...currentEvent,
      end: endTime > currentEvent.start ? endTime : loopLength,
    };

    const newOpenNotes = openNotes;
    newOpenNotes.delete(note);
    set({ events: newEvents, openNotes: newOpenNotes });
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
    const { echoMaxDelayTime, reverbDuration, reverbDecay, reverbLevel } =
      get();
    const delayNode = audioCtx.createDelay(echoMaxDelayTime);
    delayNode.delayTime.value = 0.4;
    const delayGain = audioCtx.createGain();
    delayGain.gain.value = get().echoLevel;
    const reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = generateImpulseResponse(
      audioCtx,
      reverbDuration,
      reverbDecay,
    );
    const reverbGain = audioCtx.createGain();
    reverbGain.gain.value = reverbLevel;

    masterGain.connect(reverbNode).connect(reverbGain);
    reverbGain.connect(audioCtx.destination);

    delayNode.connect(delayGain);
    delayGain.connect(delayNode);
    delayGain.connect(masterGain);
    set({
      audioCtx,
      masterGain,
      delayNode,
      delayGain,
      reverbNode,
      reverbGain,
      isInitialized: true,
    });
  },
  setEchoLevel: (level) => {
    const { audioCtx, delayGain } = get();
    if (delayGain && audioCtx)
      delayGain.gain.setTargetAtTime(level, audioCtx.currentTime, 0.01);

    set({ echoLevel: level });
  },
  setEchoMaxDelayTime: (time) => {
    const { audioCtx, masterGain, delayGain, echoLevel } = get();
    if (!audioCtx || !masterGain || !delayGain) return;

    get().delayNode?.disconnect();

    const delayNode = audioCtx.createDelay(time);
    delayNode.delayTime.value = echoLevel ?? 0.4;

    masterGain.connect(delayNode);
    delayNode.connect(delayGain);
    delayGain.connect(delayNode);

    set({ delayNode, echoMaxDelayTime: time });
  },
  setReverbLevel: (level) => {
    const { audioCtx, reverbGain } = get();
    if (reverbGain && audioCtx)
      reverbGain.gain.setTargetAtTime(level, audioCtx.currentTime, 0.01);

    set({ reverbLevel: level });
  },
  setReverbDuration: (value) => {
    const { reverbNode, audioCtx, reverbDecay } = get();
    if (!audioCtx || !reverbNode) return;
    reverbNode.buffer = generateImpulseResponse(audioCtx, value, reverbDecay);
    set({ reverbDuration: value });
  },
  setReverbDecay: (value) => {
    const { reverbNode, audioCtx, reverbDuration } = get();
    if (!audioCtx || !reverbNode) return;
    reverbNode.buffer = generateImpulseResponse(
      audioCtx,
      reverbDuration,
      value,
    );
    set({ reverbDecay: value });
  },
  setVibe: (vibe) => set({ vibe }),
}));
