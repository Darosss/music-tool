import { Volume2, Waves } from "lucide-react";

interface PianoSlidersProps {
  reverbLevel: number;
  onSetReverbLevel: (value: number) => void;
  echoLevel: number;
  onSetEchoLevel: (value: number) => void;
}

export function PianoSliders({
  reverbLevel,
  onSetReverbLevel,
  echoLevel,
  onSetEchoLevel,
}: PianoSlidersProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Waves size={16} /> Reverb
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbLevel}
            onChange={(e) => {
              const target = e.target;
              if (target != null) {
                onSetReverbLevel(
                  parseFloat((target as HTMLInputElement).value),
                );
              }
            }}
            className="w-full accent-white"
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Volume2 size={16} /> Echo
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={echoLevel}
            onChange={(e) => {
              const target = e.target;
              if (target != null) {
                onSetEchoLevel(parseFloat((target as HTMLInputElement).value));
              }
            }}
            className="w-full accent-white"
          />
        </div>
      </div>
    </>
  );
}
