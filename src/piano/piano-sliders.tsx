import { Volume2, Waves } from "lucide-react";

interface PianoSlidersProps {
  reverbLevel: number;
  onSetReverbLevel: (value: number) => void;
  echoLevel: number;
  onSetEchoLevel: (value: number) => void;
  reverbDecay: number;
  reverbDuration: number;
  onSetReverbDuration: (value: number) => void;
  onSetReverbDecay: (value: number) => void;
  echoMaxDelayTime: number;
  onSetEchoMaxDelayTime: (value: number) => void;
}

interface SettingsBlockProps<TVal extends number, TSetVal extends Function> {
  id: string;
  label: string;
  value: TVal;
  onSet: TSetVal;
  min: number;
  max: number;
  step: number;
}

function SettingsBlock<
  TVal extends number = number,
  TSetVal extends Function = (...args: any[]) => void,
>({
  id,
  label,
  value,
  onSet,
  min,
  max,
  step,
}: SettingsBlockProps<TVal, TSetVal>) {
  return (
    <div className="flex flex-col relative">
      <label id={`${id}-value`} for={id}>
        {label}: {value}
      </label>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const target = e.target;
          if (target != null) {
            onSet(parseFloat((target as HTMLInputElement).value));
          }
        }}
        className="w-full accent-white z-[1]"
      />
    </div>
  );
}

export function PianoSliders({
  reverbLevel,
  onSetReverbLevel,
  echoLevel,
  onSetEchoLevel,
  reverbDecay,
  reverbDuration,
  onSetReverbDuration,
  onSetReverbDecay,
  echoMaxDelayTime,
  onSetEchoMaxDelayTime,
}: PianoSlidersProps) {
  const mappedEchoSettings = [
    {
      id: "echo-level",
      label: "Level",
      value: echoLevel,
      onSet: onSetEchoLevel,
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: "echo-delay",
      label: "Max Delay",
      value: echoMaxDelayTime,
      onSet: onSetEchoMaxDelayTime,
      min: 0,
      max: 30,
      step: 0.1,
    },
  ] satisfies SettingsBlockProps<number, (...args: any[]) => void>[];
  const mappedReverbSettings = [
    {
      id: "reverb-level",
      label: "Level",
      value: reverbLevel,
      onSet: onSetReverbLevel,
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      id: "reverb-decay",
      label: "Decay",
      value: reverbDecay,
      onSet: onSetReverbDecay,
      min: 0,
      max: 20,
      step: 0.1,
    },
    {
      id: "reverb-duration",
      label: "Duration",
      value: reverbDuration,
      onSet: onSetReverbDuration,
      min: 0,
      max: 20,
      step: 0.1,
    },
  ] satisfies SettingsBlockProps<number, (...args: any[]) => void>[];
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Waves size={16} /> Reverb
          </div>
          <div className="flex flex-col gap-1">
            {mappedReverbSettings.map((sett) => (
              <div className="flex flex-col relative" key={sett.id}>
                <SettingsBlock {...sett} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
            <Volume2 size={16} /> Echo
          </div>
          <div className="flex flex-col gap-1">
            {mappedEchoSettings.map((sett) => (
              <div className="flex flex-col relative" key={sett.id}>
                <SettingsBlock {...sett} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
