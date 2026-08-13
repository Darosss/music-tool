import { useState } from "preact/hooks";
import { useAudioStore, useRecorderStore } from "../context/store";
import { Downloader } from "./downloader";
import { RecorderEvents } from "./recorder-events";
import { Button } from "../components/button";

export function Recorder() {
  const [recordLength, setRecordLength] = useState(20);

  const isRecording = useRecorderStore((s) => s.isRecording);
  const isPlaybackOn = useRecorderStore((s) => s.isPlaybackOn);
  const startRecording = useRecorderStore((s) => s.startRecording);
  const stopRecording = useRecorderStore((s) => s.stopRecording);
  const togglePlayback = useRecorderStore((s) => s.togglePlayback);
  const [eventsOpen, setEventsOpen] = useState(false);
  const audioCtx = useAudioStore((state) => state.audioCtx);
  const [canDownload, setCanDownload] = useState(false);
  const toggleRecord = () => {
    if (!audioCtx)
      return console.warn("TODO: add info abotu no audioCtx in toggleRecord");
    if (!isRecording) {
      setCanDownload(false);
      startRecording(audioCtx, recordLength);
    } else {
      stopRecording(audioCtx);
      setCanDownload(true);
    }
  };

  return (
    <div className={"py-5 h-full"}>
      <div>
        <RecorderEvents
          open={eventsOpen}
          onClose={() => setEventsOpen(false)}
        />
      </div>
      <div className="flex w-full bg-red-500 h-16">
        <div className="flex grow gap-2 justify-center px-5 z-[1] bg-black/90">
          <Button
            onClick={() => audioCtx && togglePlayback(audioCtx)}
            className="grow"
          >
            {isPlaybackOn ? "⬛ Stop playback" : `▶ Start Playback`}
          </Button>
          {canDownload && <Downloader />}

          <Button
            onClick={() => setEventsOpen((prev) => !prev)}
            className="grow"
          >
            Events
          </Button>
        </div>
        <div className="flex gap-2 grow justify-center px-5 z-[1] bg-black/90">
          <Button onClick={toggleRecord} className="grow">
            {isRecording
              ? "⬛ Stop Recording"
              : `🔴 Record (${recordLength}s loop)`}
          </Button>
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
      </div>
    </div>
  );
}
