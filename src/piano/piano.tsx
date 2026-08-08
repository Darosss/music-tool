import { useState, useEffect, useRef } from "react";
import { KEYS, KEY_MAP, PianoVibe } from "./utils";
import { BlackPianoKey } from "./black-piano-key";
import { Settings } from "./settings";
import { ChordMode } from "./utils";
import { WhitePianoKey } from "./white-piano-key";
import { usePlayPiano, type UsePlayNoteArgs } from "./hooks/usePlayNode";
import { PianoStyles } from "./piano-styles";
import { PianoSliders } from "./piano-sliders";
export default function Piano() {
  const [vibe, setVibe] = useState<PianoVibe>(PianoVibe.CLASSIC);
  const [reverbLevel, setReverbLevel] = useState(0.4);
  const [echoLevel, setEchoLevel] = useState(0.3);
  const [octave, setOctave] = useState(0);
  const [chordMode, setChordMode] = useState<ChordMode>(ChordMode.NONE);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());

  const audioCtx = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);
  const reverbNode = useRef<ConvolverNode | null>(null);
  const delayNode = useRef<DelayNode | null>(null);
  const delayGain = useRef<GainNode | null>(null);
  const activeOscillators = useRef<UsePlayNoteArgs["activeOscillators"]>(
    new Map(),
  );

  useEffect(() => {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    audioCtx.current = ctx;
    console.log(audioCtx.current);
    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    masterGain.current = master;

    const delay = ctx.createDelay(2.0);
    delay.delayTime.value = 0.4;
    const dGain = ctx.createGain();
    dGain.gain.value = echoLevel;

    delay.connect(dGain);
    dGain.connect(delay);
    dGain.connect(master);

    delayNode.current = delay;
    delayGain.current = dGain;

    return () => {
      ctx.close();
    };
  }, []);

  useEffect(() => {
    if (delayGain.current) {
      delayGain.current.gain.setTargetAtTime(
        echoLevel * 0.6,
        audioCtx.current!.currentTime,
        0.1,
      );
    }
  }, [echoLevel]);
  const { playNote, stopNote } = usePlayPiano({
    vibe,
    masterGain: masterGain.current,
    delayNode: delayNode.current,
    reverbNode: reverbNode.current,
    activeOscillators: activeOscillators.current,
    chordMode,
    octave,
    onKeyActive: (index) => setActiveKeys((prev) => new Set(prev).add(index)),
    onStopNote: (index) =>
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      }),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = KEY_MAP[e.key.toLowerCase()];

      if (idx !== undefined) playNote(idx, audioCtx.current);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const idx = KEY_MAP[e.key.toLowerCase()];
      if (idx !== undefined) stopNote(idx, audioCtx.current);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [playNote, stopNote]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 transition-all duration-700 bg-gradient-to-br from-zinc-900 to-black text-zinc-100">
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
          />
        </div>

        <div className="relative h-60 w-full flex justify-center overflow-x-auto select-none py-2">
          <div className="relative flex min-w-[700px] w-full h-full">
            {KEYS.map((key, i) =>
              key.type === "white" ? (
                <WhitePianoKey
                  key={i}
                  onMouseDown={() => playNote(i, audioCtx.current)}
                  onMouseUp={() => stopNote(i, audioCtx.current)}
                  onMouseLeave={() => stopNote(i, audioCtx.current)}
                  className={`${
                    activeKeys.has(i)
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
                  onMouseDown={() => playNote(i, audioCtx.current)}
                  onMouseUp={() => stopNote(i, audioCtx.current)}
                  onMouseLeave={() => stopNote(i, audioCtx.current)}
                  className={`${
                    activeKeys.has(i)
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
