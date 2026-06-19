import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit.server";

// Strict schema: limits message count and per-message text size to prevent
// prompt-flooding / credit-draining abuse on an unauthenticated endpoint.
const PartSchema = z
  .object({
    type: z.string().max(32),
    text: z.string().max(8_000).optional(),
  })
  .passthrough();

const MessageSchema = z
  .object({
    id: z.string().max(128).optional(),
    role: z.enum(["system", "user", "assistant"]),
    parts: z.array(PartSchema).max(32).optional(),
    content: z.string().max(8_000).optional(),
  })
  .passthrough();

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Rate limit per client IP: 20 requests / minute.
        const rl = rateLimit(`chat:${clientKey(request)}`, {
          limit: 20,
          windowMs: 60_000,
        });
        if (!rl.ok) return tooManyRequests(rl.retryAfter);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }
        const parsed = BodySchema.safeParse(raw);
        if (!parsed.success) {
          return new Response("Invalid request payload", { status: 400 });
        }
        const messages = parsed.data.messages as unknown as UIMessage[];

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("AI service not configured", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: `You are Handy Assistant. Help professionals with:
- Drafting emails and messages
- Summarizing meetings
- Planning and prioritizing tasks
- Quick research and explanations
- General productivity advice

Privacy: do not ask users for sensitive personal data (passwords, full payment
details, government IDs, health records). If a user shares such information,
gently remind them not to and continue without storing or repeating it verbatim.

Be concise, professional, and actionable. Format responses with markdown when helpful.`,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
