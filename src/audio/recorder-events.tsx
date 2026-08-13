import { Button } from "../components/button";
import { useRecorderStore } from "../context/store";
interface RecorderEventsProps {
  open: boolean;
  onClose: () => void;
}
export function RecorderEvents({ open, onClose }: RecorderEventsProps) {
  const events = useRecorderStore((s) => s.events);
  return (
    <div
      className={`z-[100] bg-black/90 inset-2 absolute p-2 rounded-xl ${!open && "hidden"}`}
    >
      <Button
        className="bg-red-500/70 absolute  right-0 top-0 w-8 h-8 m-1 rounded-xl"
        onClick={onClose}
      >
        X
      </Button>
      {events.map((ev) => (
        <div key={ev.note + ev.start}>
          {ev.note} - {ev.start.toFixed(2)} | {ev.end?.toFixed(2) || " -"}
        </div>
      ))}
    </div>
  );
}
