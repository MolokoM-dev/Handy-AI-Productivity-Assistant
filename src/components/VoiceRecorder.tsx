import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t));
      if (!mimeType) {
        stream.getTracks().forEach((t) => t.stop());
        toast.error("This browser can't record a supported audio format.");
        return;
      }
      const rec = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        if (blob.size < 1024) {
          toast.error("Recording was too short — please try again.");
          return;
        }
        setTranscribing(true);
        try {
          const fd = new FormData();
          const ext = rec.mimeType.includes("mp4") ? "mp4" : "webm";
          fd.append("file", blob, `recording.${ext}`);
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (!res.ok) throw new Error(await res.text());
          const { text } = (await res.json()) as { text: string };
          if (text?.trim()) {
            onTranscript(text.trim());
            toast.success("Transcribed");
          } else {
            toast.error("No speech detected.");
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Transcription failed");
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied.");
    }
  };

  const stop = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <Button type="button" variant="destructive" size="sm" onClick={stop}>
          <Square className="mr-1.5 h-3.5 w-3.5" /> Stop ({mm}:{ss})
        </Button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={start} disabled={transcribing}>
          {transcribing ? (
            <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Transcribing…</>
          ) : (
            <><Mic className="mr-1.5 h-3.5 w-3.5" /> Record</>
          )}
        </Button>
      )}
      {recording && <span className="text-xs text-muted-foreground">Recording…</span>}
    </div>
  );
}
