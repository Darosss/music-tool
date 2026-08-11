export interface AudioSoundNote {
  note: string;
  freq: number;
}
export interface AudioEngineEvent extends AudioSoundNote {
  start: number;
  end: number | null;
}
