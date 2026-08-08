export interface PianoKey {
  note: string;
  freq: number;
  type: "white" | "black";
  label: string;
}

export const KEYS: PianoKey[] = [
  { note: "C3", freq: 130.81, type: "white", label: "Z" },
  { note: "C#3", freq: 138.59, type: "black", label: "S" },
  { note: "D3", freq: 146.83, type: "white", label: "X" },
  { note: "D#3", freq: 155.56, type: "black", label: "D" },
  { note: "E3", freq: 164.81, type: "white", label: "C" },
  { note: "F3", freq: 174.61, type: "white", label: "V" },
  { note: "F#3", freq: 185.0, type: "black", label: "G" },
  { note: "G3", freq: 196.0, type: "white", label: "B" },
  { note: "G#3", freq: 207.65, type: "black", label: "H" },
  { note: "A3", freq: 220.0, type: "white", label: "N" },
  { note: "A#3", freq: 233.08, type: "black", label: "J" },
  { note: "B3", freq: 246.94, type: "white", label: "M" },

  { note: "C4", freq: 261.63, type: "white", label: "Q" },
  { note: "C#4", freq: 277.18, type: "black", label: "2" },
  { note: "D4", freq: 293.66, type: "white", label: "W" },
  { note: "D#4", freq: 311.13, type: "black", label: "3" },
  { note: "E4", freq: 329.63, type: "white", label: "E" },
  { note: "F4", freq: 349.23, type: "white", label: "R" },
  { note: "F#4", freq: 369.99, type: "black", label: "5" },
  { note: "G4", freq: 392.0, type: "white", label: "T" },
  { note: "G#4", freq: 415.3, type: "black", label: "6" },
  { note: "A4", freq: 440.0, type: "white", label: "Y" },
  { note: "A#4", freq: 466.16, type: "black", label: "7" },
  { note: "B4", freq: 493.88, type: "white", label: "U" },

  { note: "C5", freq: 523.25, type: "white", label: "I" },
  { note: "C#5", freq: 554.37, type: "black", label: "9" },
  { note: "D5", freq: 587.33, type: "white", label: "O" },
  { note: "D#5", freq: 622.25, type: "black", label: "0" },
  { note: "E5", freq: 659.25, type: "white", label: "P" },
  { note: "F5", freq: 698.46, type: "white", label: "[" },
  { note: "F#5", freq: 739.99, type: "black", label: "=" },
  { note: "G5", freq: 783.99, type: "white", label: "]" },
  { note: "G#5", freq: 830.61, type: "black", label: "A" },
  { note: "A5", freq: 880.0, type: "white", label: "K" },
  { note: "A#5", freq: 932.33, type: "black", label: "L" },
  { note: "B5", freq: 987.77, type: "white", label: ";" },
  { note: "C6", freq: 1046.5, type: "white", label: "'" },
];

export const KEY_MAP: Record<string, number> = {
  z: 0,
  s: 1,
  x: 2,
  d: 3,
  c: 4,
  v: 5,
  g: 6,
  b: 7,
  h: 8,
  n: 9,
  j: 10,
  m: 11,
  q: 12,
  "2": 13,
  w: 14,
  "3": 15,
  e: 16,
  r: 17,
  "5": 18,
  t: 19,
  "6": 20,
  y: 21,
  "7": 22,
  u: 23,
  i: 24,
  "9": 25,
  o: 26,
  "0": 27,
  p: 28,
  "[": 29,
  "=": 30,
  "]": 31,
  a: 32,
  k: 33,
  l: 34,
  ";": 35,
  "'": 36,
};

export enum ChordMode {
  NONE = "none",
  MAJOR = "major",
  MINOR = "minor",
}
export enum PianoVibe {
  CLASSIC = "classic",
  DARK = "dark",
  SOFT = "soft",
  ACCORDION = "accordion",
  FLUTE = "flute",
}

export const switchVibe = (
  vibe: PianoVibe,
  ctx: AudioContext,
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
