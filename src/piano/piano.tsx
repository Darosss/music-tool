import { useState, useEffect, useCallback } from "react";
import { KEYS, getKeyByKeyboardKey, startPlayback } from "./utils";
import { BlackPianoKey } from "./black-piano-key";
import { Settings } from "./settings";
import { ChordMode } from "./utils";
import { WhitePianoKey } from "./white-piano-key";
import { usePlayPiano } from "./hooks/usePlayNode";
import { PianoStyles } from "./piano-styles";
import { PianoSliders } from "./piano-sliders";
import { useAudioStore, useRecorderStore } from "../context/store";
import type { AudioSoundNote } from "../audio/types";
const SCHEDULED_NOTES = new Set<string>();

export default function Piano() {
  const [octave, setOctave] = useState(0);
  const [chordMode, setChordMode] = useState<ChordMode>(ChordMode.NONE);
  const [activeKeys, setActiveKeys] = useState<Set<AudioSoundNote["note"]>>(
    new Set(),
  );
  const recordNote = useRecorderStore((s) => s.recordNote);
  const loopLength = useRecorderStore((s) => s.loopLength);
  const events = useRecorderStore((s) => s.events);
  const playStartTime = useRecorderStore((s) => s.playStartTime);
  const endNote = useRecorderStore((s) => s.endNote);

  const isPlaybackOn = useRecorderStore((s) => s.isPlaybackOn);
  const {
    vibe,
    masterGain,
    delayNode,
    delayGain,
    reverbNode,
    activeOscillators,
    audioCtx,
    reverbLevel,
    echoLevel,
    reverbDecay,
    reverbDuration,
    setReverbLevel,
    setEchoLevel,
    setReverbDecay,
    setReverbDuration,
    setEchoMaxDelayTime,
    echoMaxDelayTime,
    setVibe,
  } = useAudioStore();
  const { playNote, stopNote } = usePlayPiano({
    vibe,
    masterGain: masterGain,
    delay: {
      node: delayNode,
      gain: delayGain,
    },
    reverbNode: reverbNode,
    activeOscillators,
    chordMode,
    octave,
    onKeyActive: (note) => setActiveKeys((prev) => new Set(prev).add(note)),
    onStopNote: (note) =>
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      }),
  });

  const playNoteWithRecording = useCallback(
    (key: AudioSoundNote, audioCtx: AudioContext | null) => {
      if (!audioCtx)
        return console.warn(
          "TODO: message for -> no audio context. Please refresh site",
        );
      const data = playNote(key, audioCtx);
      if (data) recordNote(data, audioCtx);
    },
    [playNote, recordNote],
  );
  const stopNoteWithRecording = useCallback(
    (key: AudioSoundNote, audioCtx: AudioContext | null) => {
      if (!audioCtx)
        return console.warn(
          "TODO: message for -> no audio context. Please refresh site",
        );
      const data = stopNote(key, audioCtx);
      if (data) endNote(key.note, audioCtx);
    },
    [stopNote, recordNote],
  );
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = getKeyByKeyboardKey(e.key);

      if (key !== undefined) playNoteWithRecording(key, audioCtx);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = getKeyByKeyboardKey(e.key);
      if (key !== undefined) stopNoteWithRecording(key, audioCtx);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNoteWithRecording, stopNoteWithRecording]);

  useEffect(() => {
    if (!loopLength || !isPlaybackOn) return;
    if (!audioCtx)
      return console.warn(
        "TODO: info about no audio context | permission / refresh site",
      );

    const onStartPlayback = () =>
      startPlayback(
        SCHEDULED_NOTES,
        (ev, when, duration) =>
          playNote(ev, audioCtx, {
            duration,
            when,
          }),
        (ev) => stopNote(ev, audioCtx, true),
        audioCtx,
        playStartTime,
        loopLength > 0 ? loopLength : -1,
        0.1,
        events,
      );
    const schedulerTimer = setInterval(() => {
      onStartPlayback();
    }, 25);
    return () => {
      clearInterval(schedulerTimer);
    };
  }, [isPlaybackOn]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 transition-all duration-700">
      <div className="bg-white/5 backdrop-blur-2xl p-10 rounded-md shadow-2xl border border-white/10 w-full max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 transition-colors text-white">
              Piano
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Settings
              onLowOctave={() => setOctave((prev) => Math.max(-2, prev - 1))}
              onHighOctave={() => setOctave((prev) => Math.min(2, prev + 1))}
              onChordModeChange={setChordMode}
              chordMode={chordMode}
              octave={octave}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <PianoStyles vibe={vibe} onSetVibe={setVibe} />

          <PianoSliders
            reverbLevel={reverbLevel}
            onSetReverbLevel={setReverbLevel}
            echoLevel={echoLevel}
            onSetEchoLevel={setEchoLevel}
            reverbDecay={reverbDecay}
            reverbDuration={reverbDuration}
            onSetReverbDuration={setReverbDuration}
            onSetReverbDecay={setReverbDecay}
            onSetEchoMaxDelayTime={setEchoMaxDelayTime}
            echoMaxDelayTime={echoMaxDelayTime}
          />
        </div>

        <div className="relative h-60 w-full flex justify-center overflow-x-auto select-none py-2">
          <div className="relative flex xl:min-w-[700px] w-full h-full">
            {KEYS.map((key) =>
              key.type === "white" ? (
                <WhitePianoKey
                  key={key.note}
                  onMouseDown={() => playNoteWithRecording(key, audioCtx)}
                  onMouseUp={() => stopNoteWithRecording(key, audioCtx)}
                  onMouseLeave={() => stopNoteWithRecording(key, audioCtx)}
                  className={`${
                    activeKeys.has(key.note)
                      ? "bg-white translate-y-1 shadow-inner"
                      : "bg-neutral-100 hover:bg-white shadow-md"
                  }`}
                  label={key.label}
                  note={key.note}
                />
              ) : null,
            )}

            {KEYS.map((key, i) => {
              if (key.type !== "black") return null;

              const whiteKeyCount = KEYS.slice(0, i).filter(
                (k) => k.type === "white",
              ).length;
              const totalWhiteKeys = KEYS.filter(
                (k) => k.type === "white",
              ).length;
              const percentLeft = (whiteKeyCount / totalWhiteKeys) * 100;

              return (
                <BlackPianoKey
                  key={i}
                  onMouseDown={() => playNoteWithRecording(key, audioCtx)}
                  onMouseUp={() => stopNoteWithRecording(key, audioCtx)}
                  onMouseLeave={() => stopNoteWithRecording(key, audioCtx)}
                  className={`${
                    activeKeys.has(key.note)
                      ? "bg-neutral-800 scale-95"
                      : "bg-neutral-900 hover:bg-neutral-800 shadow-xl"
                  }`}
                  style={{ left: `${percentLeft}%` }}
                  label={key.label}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-[120px] transition-all duration-[3000ms] opacity-20 bg-indigo-500/30"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: activeKeys.size > 0 ? "scale(1.2)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
