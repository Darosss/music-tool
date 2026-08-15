import { Volume2, Waves } from "lucide-react";
import { useAudioStore } from "../context/store";

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

export function PianoSliders() {
  const reverbLevel = useAudioStore((s) => s.reverbLevel);
  const echoLevel = useAudioStore((s) => s.echoLevel);
  const reverbDecay = useAudioStore((s) => s.reverbDecay);
  const reverbDuration = useAudioStore((s) => s.reverbDuration);
  const setEchoLevel = useAudioStore((s) => s.setEchoLevel);
  const setReverbLevel = useAudioStore((s) => s.setReverbLevel);
  const setReverbDecay = useAudioStore((s) => s.setReverbDecay);
  const setReverbDuration = useAudioStore((s) => s.setReverbDuration);
  const setEchoMaxDelayTime = useAudioStore((s) => s.setEchoMaxDelayTime);
  const echoMaxDelayTime = useAudioStore((s) => s.echoMaxDelayTime);
  const mappedEchoSettings = [
    {
      id: "echo-level",
      label: "Level",
      value: echoLevel,
      onSet: setEchoLevel,
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      id: "echo-delay",
      label: "Max Delay",
      value: echoMaxDelayTime,
      onSet: setEchoMaxDelayTime,
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
      onSet: setReverbLevel,
      min: 0,
      max: 1,
      step: 0.1,
    },
    {
      id: "reverb-decay",
      label: "Decay",
      value: reverbDecay,
      onSet: setReverbDecay,
      min: 0,
      max: 20,
      step: 0.1,
    },
    {
      id: "reverb-duration",
      label: "Duration",
      value: reverbDuration,
      onSet: setReverbDuration,
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
