import type { CSSProperties } from "preact";

interface PianoKeyProps {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  style?: CSSProperties;
  className: string;
  label: string;
  note: string;
}
export function WhitePianoKey({
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  className,
  style,
  label,
  note,
}: PianoKeyProps) {
  return (
    <button
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={`relative flex-1 h-full border-x border-black/10 rounded-b-lg transition-all duration-75 flex flex-col justify-end pb-3 items-center ${className}`}
      style={style}
    >
      <span className="text-[9px] font-bold text-neutral-500 mb-1">{note}</span>
      <span className="text-[8px] font-mono text-neutral-400">{label}</span>
    </button>
  );
}
