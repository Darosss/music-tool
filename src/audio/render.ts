import { createEffectsChainCache } from "./effects-chain-cache";
import { ChordMode } from "./enums";
import { triggerNote } from "./note-engine";
import type { AudioEngineEvent } from "./types";

export interface RenderOptions {
  events: AudioEngineEvent[];
  loopLength: number;
  sampleRate?: number;
  reverbTailPadding?: number;
  fallbackVibe?: string;
  fallbackOctave?: number;
}

export async function renderEventsToWav({
  events,
  loopLength,
  sampleRate = 44100,
  reverbTailPadding = 0,
  fallbackVibe = "sine",
  fallbackOctave = 0,
}: RenderOptions): Promise<Blob> {
  const numChannels = 2;
  const totalDuration = loopLength + reverbTailPadding;
  const length = Math.ceil(totalDuration * sampleRate);

  const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

  const master = offlineCtx.createGain();
  master.gain.value = 0.8;
  master.connect(offlineCtx.destination);

  const { getChain } = createEffectsChainCache(offlineCtx, master);

  for (const ev of events) {
    const duration = Math.max(0.02, (ev.end ?? ev.start + 0.2) - ev.start);
    const { input } = getChain(ev.effects);

    triggerNote(
      { note: ev.note, freq: ev.freq },
      { ctx: offlineCtx, masterGain: input as any },
      {
        vibe: ev.vibe ?? fallbackVibe,
        octave: ev.octave ?? fallbackOctave,
        chordMode: ev.chordMode ?? ChordMode.NONE,
        playbackOpts: { when: ev.start, duration },
      },
    );
  }

  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true,
      );
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++)
    view.setUint8(offset + i, str.charCodeAt(i));
}
