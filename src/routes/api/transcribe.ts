import { createFileRoute } from "@tanstack/react-router";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit.server";

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set([
  "audio/webm",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
]);

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Tight per-IP limit: transcription is expensive.
        const rl = rateLimit(`transcribe:${clientKey(request)}`, {
          limit: 10,
          windowMs: 60_000,
        });
        if (!rl.ok) return tooManyRequests(rl.retryAfter);

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI service not configured", { status: 500 });

        let inForm: FormData;
        try {
          inForm = await request.formData();
        } catch {
          return new Response("Invalid form data", { status: 400 });
        }
        const file = inForm.get("file");
        if (!(file instanceof File) || file.size < 1024) {
          return new Response("Empty or invalid audio", { status: 400 });
        }
        if (file.size > MAX_AUDIO_BYTES) {
          return new Response("Audio file is too large (max 20 MB).", { status: 413 });
        }

        const mime = (file.type || "audio/webm").split(";")[0];
        if (!ALLOWED_MIME.has(mime)) {
          return new Response("Unsupported audio format", { status: 415 });
        }
        const extMap: Record<string, string> = {
          "audio/webm": "webm",
          "audio/mp4": "mp4",
          "audio/mpeg": "mp3",
          "audio/wav": "wav",
          "audio/x-wav": "wav",
          "audio/ogg": "ogg",
        };
        const ext = extMap[mime] ?? "webm";

        const upstream = new FormData();
        upstream.append("model", "openai/gpt-4o-mini-transcribe");
        upstream.append("file", file, `recording.${ext}`);

        const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}` },
          body: upstream,
        });
        if (!res.ok) {
          // Never leak upstream error bodies to clients — log server-side only.
          console.error("Transcription upstream error", res.status, await res.text().catch(() => ""));
          return new Response("Transcription failed. Please try again.", { status: 502 });
        }
        const json = (await res.json()) as { text?: string };
        return Response.json({ text: json.text ?? "" });
      },
    },
  },
});
