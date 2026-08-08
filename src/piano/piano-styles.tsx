import { Music } from "lucide-react";
import { PianoVibe } from "./utils";

interface PianoStylesProps {
  vibe: PianoVibe;
  onSetVibe: (vibe: PianoVibe) => void;
}

export function PianoStyles({ vibe, onSetVibe }: PianoStylesProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
          <Music size={16} /> Synthesis Styles
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {Object.values(PianoVibe).map((v) => (
          <button
            key={v}
            onClick={() => onSetVibe(v)}
            className={`px-2 py-3 rounded-2xl text-[10px] uppercase tracking-widest font-bold transition-all border ${
              vibe === v
                ? "bg-white text-black border-white shadow-lg"
                : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
