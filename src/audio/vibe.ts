export enum NoteVibe {
  CLASSIC = "classic",
  DARK = "dark",
  SOFT = "soft",
  ACCORDION = "accordion",
  FLUTE = "flute",
}
export const switchVibe = (
  vibe: NoteVibe,
  ctx: BaseAudioContext,
  freq: number,
  currentTime: number,
  oscs: OscillatorNode[],
  noteGain: GainNode,
) => {
  if (vibe === "classic") {
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq, currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    oscs.push(osc1, osc2);

    noteGain.gain.setValueAtTime(0, currentTime);
    noteGain.gain.linearRampToValueAtTime(0.4, currentTime + 0.01);
    noteGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.8);
  } else if (vibe === "dark") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, currentTime);
    osc.connect(filter);
    filter.connect(noteGain);
    oscs.push(osc);
  } else if (vibe === "soft") {
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, currentTime);
    osc.connect(filter);
    filter.connect(noteGain);
    oscs.push(osc);
  } else if (vibe === "accordion") {
    [freq, freq * 1.005, freq * 0.5].forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 2 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(f, currentTime);
      osc.connect(noteGain);
      oscs.push(osc);
    });
    noteGain.gain.setValueAtTime(0.15, currentTime);
  } else if (vibe === "flute") {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, currentTime);
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5, currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(5, currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    osc.connect(noteGain);
    oscs.push(osc);
  }
};
