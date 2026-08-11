import { useState } from "preact/hooks";
import { useAudioStore, useRecorderStore } from "../context/store";

export function Recorder() {
  const [recordLength, setRecordLength] = useState(20);

  const isRecording = useRecorderStore((s) => s.isRecording);
  const startRecording = useRecorderStore((s) => s.startRecording);
  const stopRecording = useRecorderStore((s) => s.stopRecording);
  const events = useRecorderStore((s) =>
    s.events.sort((e, e2) => e.start - e2.start),
  );
  const audioCtx = useAudioStore((state) => state.audioCtx);
  const toggleRecord = () => {
    if (!audioCtx)
      return console.warn("TODO: add info abotu no audioCtx in toggleRecord");
    if (!isRecording) {
      startRecording(audioCtx, recordLength);
    } else {
      stopRecording(audioCtx);
    }
  };

  return (
    <div>
      <div className="flex px-5">
        <button onClick={toggleRecord}>
          {isRecording
            ? "⬛ Stop Recording"
            : `🔴 Record (${recordLength}s loop)`}
        </button>
        {!isRecording && (
          <input
            type="range"
            min="-1"
            max="200"
            step="0.5"
            value={recordLength || 0}
            onChange={(e) => setRecordLength(parseInt(e.currentTarget.value))}
            className="w-full accent-white"
          />
        )}
      </div>

      <div>
        {events.map((ev) => (
          <div key={ev.note + ev.start}>
            {ev.note} - {ev.start.toFixed(2)} | {ev.end?.toFixed(2) || " -"}
          </div>
        ))}
      </div>
    </div>
  );
}
