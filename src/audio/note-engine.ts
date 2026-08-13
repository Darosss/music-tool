import { ChordMode } from "./enums";
import type {
  AggregatedVoice,
  AudioEngineEvent,
  AudioSoundNote,
  EngineNodes,
  PlaybackOpts,
  TrackEffects,
  TriggerNoteConfig,
  Voice,
} from "./types";
import { NoteVibe, switchVibe } from "./vibe";

const CHORD_INTERVALS: Record<ChordMode, number[]> = {
  [ChordMode.NONE]: [1],
  [ChordMode.MAJOR]: [1, 1.2599, 1.4983],
  [ChordMode.MINOR]: [1, 1.1892, 1.4983],
};

export function getChordFrequencies(
  rootFreq: number,
  chordMode: ChordMode,
): number[] {
  return CHORD_INTERVALS[chordMode].map((mult) => rootFreq * mult);
}
export function createVoice(
  ctx: BaseAudioContext,
  freq: number,
  vibe: NoteVibe,
  when: number,
): Voice {
  const oscs: OscillatorNode[] = [];
  const gain = ctx.createGain();
  switchVibe(vibe, ctx, freq, when, oscs, gain);
  return { oscs, gain };
}
export function connectVoice(voice: Voice, nodes: EngineNodes) {
  const { masterGain, delayNode, reverbNode } = nodes;
  if (masterGain) voice.gain.connect(masterGain);
  if (delayNode) voice.gain.connect(delayNode);
  if (reverbNode) voice.gain.connect(reverbNode);
}
export function applyEnvelope(
  voice: Voice,
  now: number,
  playbackOpts?: PlaybackOpts,
) {
  const { gain, oscs } = voice;

  if (playbackOpts) {
    const { duration, when } = playbackOpts;
    oscs.forEach((o) => {
      o.start(when);
      o.stop(when + duration + 0.02);
    });
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.setValueAtTime(0.3, now + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, when + duration);
  } else {
    oscs.forEach((o) => o.start());
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
  }
}
export function aggregateVoices(instances: Voice[]): AggregatedVoice {
  const primary = instances[0].gain;

  const proxyGain = new Proxy(primary, {
    get(target, prop) {
      if (prop === "gain") {
        return new Proxy(target.gain, {
          get(gainTarget, gainProp) {
            if (gainProp === "setTargetAtTime") {
              return (val: number, time: number, constant: number) => {
                instances.forEach((inst) =>
                  inst.gain.gain.setTargetAtTime(val, time, constant),
                );
              };
            }
            return Reflect.get(gainTarget, gainProp);
          },
        });
      }
      return Reflect.get(target, prop);
    },
  }) as GainNode;

  return {
    oscs: instances.flatMap((i) => i.oscs),
    gain: proxyGain,
  };
}
export function buildEffectsSnapshot(nodes: EngineNodes): TrackEffects {
  const effects: TrackEffects = {};
  if (nodes.delayNode) {
    effects.delay = {
      time: nodes.delayNode.delayTime.value || 0,
      feedback: 0,
      mix: nodes.delayGain?.gain.value || 0,
    };
  }
  if (nodes.reverbNode) {
    console.log("ADD reverb node effect");
  }
  return effects;
}
export function triggerNote(
  key: AudioSoundNote,
  nodes: EngineNodes,
  config: TriggerNoteConfig,
): { voice: AggregatedVoice; event: AudioEngineEvent } {
  const { ctx } = nodes;
  const { vibe, octave, chordMode, playbackOpts } = config;

  const now = playbackOpts?.when ?? ctx.currentTime;
  const octaveMultiplier = Math.pow(2, octave);
  const rootFreq = key.freq * octaveMultiplier;

  const freqs = getChordFrequencies(rootFreq, chordMode);
  const instances = freqs.map((freq) => {
    const voice = createVoice(ctx, freq, vibe, now);
    connectVoice(voice, nodes);
    applyEnvelope(voice, now, playbackOpts);
    return voice;
  });

  const aggregated = aggregateVoices(instances);
  const effects = buildEffectsSnapshot(nodes);

  const event: AudioEngineEvent = {
    start: now,
    end: null,
    note: key.note,
    freq: key.freq,
    effects,
    chordMode: config.chordMode,
    octave: config.octave,
    vibe: config.vibe,
  };

  return { voice: aggregated, event };
}
