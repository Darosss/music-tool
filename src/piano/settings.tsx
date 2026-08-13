import { Button } from "../components/button";
import { ChordMode } from "./utils";

interface SettingsProps {
  onLowOctave: () => void;
  onHighOctave: () => void;
  octave: number;
  onChordModeChange: (mode: ChordMode) => void;
  chordMode: ChordMode;
}
export function Settings({
  onLowOctave,
  onHighOctave,
  octave,
  onChordModeChange,
  chordMode,
}: SettingsProps) {
  return (
    <>
      <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
        <Button
          onClick={onLowOctave}
          className="px-3 py-1 hover:bg-white/10 rounded-full text-xs text-white"
        >
          Low
        </Button>
        <span className="px-3 py-1 text-xs text-white/40 font-mono">
          Oct {octave > 0 ? `+${octave}` : octave}
        </span>
        <Button
          onClick={onHighOctave}
          className="px-3 py-1 hover:bg-white/10 rounded-full text-xs text-white"
        >
          High
        </Button>
      </div>

      <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
        {Object.values(ChordMode).map((mode) => (
          <Button
            key={mode}
            onClick={() => onChordModeChange(mode)}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              chordMode === mode
                ? "bg-white text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {mode === "none"
              ? "Single"
              : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        ))}
      </div>
    </>
  );
}
