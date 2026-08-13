import type { TrackEffects } from "./types";

export interface EffectDestination {
  input: AudioNode;
}

export function createEffectsChainCache(
  ctx: BaseAudioContext,
  output: AudioNode,
) {
  const cache = new Map<string, EffectDestination>();

  function getChain(effects?: TrackEffects): EffectDestination {
    const key =
      effects && Object.keys(effects).length
        ? JSON.stringify(effects)
        : "__dry__";
    const cached = cache.get(key);
    if (cached) return cached;

    const built = buildChain(ctx, output, effects);
    cache.set(key, built);
    return built;
  }

  return { getChain };
}

function buildChain(
  ctx: BaseAudioContext,
  output: AudioNode,
  fx?: TrackEffects,
): EffectDestination {
  const input = ctx.createGain();

  if (!fx || (!fx.reverb && !fx.delay)) {
    input.connect(output);
    return { input };
  }

  if (fx.delay) {
    const delay = ctx.createDelay(5);
    delay.delayTime.value = fx.delay.time;
    const feedback = ctx.createGain();
    feedback.gain.value = fx.delay.feedback;
    const wet = ctx.createGain();
    wet.gain.value = fx.delay.mix;

    input.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(output);
  }

  if (fx.reverb) {
    const convolver = ctx.createConvolver();
    convolver.buffer = generateImpulseResponse(ctx, 2, 2.5);
    const wet = ctx.createGain();
    wet.gain.value = fx.reverb.mix;

    input.connect(convolver).connect(wet).connect(output);
  }

  input.connect(output);
  return { input };
}

function generateImpulseResponse(
  ctx: BaseAudioContext,
  duration: number,
  decay: number,
): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.max(1, Math.floor(rate * duration));
  const impulse = ctx.createBuffer(2, length, rate);
  for (let c = 0; c < 2; c++) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}
