import { useCallback } from "preact/hooks";
import { useRecorderStore } from "../context/store";
import { renderEventsToWav } from "./render";
import { Button } from "../components/button";

export function Downloader() {
  const events = useRecorderStore((s) => s.events);
  const loopLength = useRecorderStore((s) => s.loopLength);

  const onDownload = useCallback(() => {
    renderEventsToWav({
      events,
      reverbTailPadding: 1.5,
      loopLength: loopLength || events.at(-1)?.end || 200,
    }).then((wavBlob) => {
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sample-${new Date().toLocaleString()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [events]);

  return <Button onClick={onDownload}> Download </Button>;
}
