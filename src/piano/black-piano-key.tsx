import type { CSSProperties } from "preact";

interface PianoKeyProps {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  style: CSSProperties;
  className: string;
  label: string;
}
export function BlackPianoKey({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  className,
  style,
  label,
}: PianoKeyProps) {
  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={`absolute h-36 z-10 -ml-[1.2%] w-[2.4%] rounded-b-md transition-all duration-75 flex flex-col justify-end pb-2 items-center ${className}`}
      style={style}
    >
      <span className="text-[8px] font-mono text-neutral-400">{label}</span>
    </button>
  );
}
