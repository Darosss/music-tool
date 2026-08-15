import { Volume2, Waves } from "lucide-react";

interface PianoSlidersProps {
  reverbLevel: number;
  onSetReverbLevel: (value: number) => void;
  echoLevel: number;
  onSetEchoLevel: (value: number) => void;
  reverbDecay: number;
  reverbDuration: number;
  onSetReverbShape: (duration: number, decay: number) => void;
  echoMaxDelayTime: number;
  onSetEchoMaxDelayTime: (value: number) => void;
}

export function PianoSliders({
  reverbLevel,
  onSetReverbLevel,
  echoLevel,
  onSetEchoLevel,
  reverbDecay,
  reverbDuration,
  onSetReverbShape,
  echoMaxDelayTime,
  onSetEchoMaxDelayTime,
}: PianoSlidersProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Waves size={16} /> Reverb
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex flex-col relative">
              <label id="reverb-level-value" for="reverb-level">
                Level: {reverbLevel}
              </label>

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
                className="w-full accent-white z-[1]"
              />
            </div>
            <div className="flex flex-col relative">
              <label id="reverb-decay-value" for="reverb-decay">
                Decay: {reverbDecay}
              </label>

              <input
                id="reverb-decay"
                type="range"
                min="0"
                max="30"
                step="0.1"
                value={reverbDecay}
                onChange={(e) => {
                  const target = e.target;
                  if (target != null) {
                    onSetReverbShape(
                      reverbDuration,
                      parseFloat((target as HTMLInputElement).value),
                    );
                  }
                }}
                className="w-full accent-white z-[1]"
              />
            </div>
            <div className="flex flex-col relative">
              <label id="reverb-duration-value" for="reverb-duration">
                Duration: {reverbDuration}
              </label>

              <input
                id="reverb-duration"
                type="range"
                min="0"
                max="30"
                step="0.1"
                value={reverbDuration}
                onChange={(e) => {
                  const target = e.target;
                  if (target != null) {
                    onSetReverbShape(
                      parseFloat((target as HTMLInputElement).value),
                      reverbDecay,
                    );
                  }
                }}
                className="w-full accent-white z-[1]"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Volume2 size={16} /> Echo
          </div>
          <div className="flex flex-col relative">
            <label id="echo-level-value" for="echo-level">
              Level: {echoLevel}
            </label>

            <input
              id="echo-level"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={echoLevel}
              onChange={(e) => {
                const target = e.target;
                if (target != null) {
                  onSetEchoLevel(
                    parseFloat((target as HTMLInputElement).value),
                  );
                }
              }}
              className="w-full accent-white z-[1]"
            />
          </div>{" "}
          <div className="flex flex-col relative">
            <label id="echo-level-value" for="echo-level">
              Max Delay: {echoMaxDelayTime}
            </label>

            <input
              id="echo-level"
              type="range"
              min="0"
              max="30"
              step="0.1"
              value={echoMaxDelayTime}
              onChange={(e) => {
                const target = e.target;
                if (target != null) {
                  onSetEchoMaxDelayTime(
                    parseFloat((target as HTMLInputElement).value),
                  );
                }
              }}
              className="w-full accent-white z-[1]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
