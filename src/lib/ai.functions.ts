import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const MODEL = "google/gemini-3-flash-preview";

async function callAI(system: string, prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
  const gateway = createLovableAiGatewayProvider(key);
  try {
    const { text } = await generateText({
      model: gateway(MODEL),
      system,
      prompt,
    });
    return { text };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429")) throw new Error("Rate limit reached. Please try again shortly.");
    if (message.includes("402")) throw new Error("AI credits exhausted. Add credits in your workspace billing settings.");
    throw new Error(message);
  }
}

/* ===== Email Generator ===== */
const EmailInput = z.object({
  persona: z.string().min(1),
  purpose: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  context: z.string().optional().default(""),
});
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a professional communication expert. Write polished, concise, and clear emails.
Rules:
- Write from the sender persona's perspective and voice.
- Match the requested tone exactly.
- Tailor language to the specified audience.
- Use a clear subject line, greeting, body (1-3 short paragraphs), and sign-off.
- Avoid filler. Do not include explanations outside the email itself.`;
    const prompt = `Write an email with:
SENDER PERSONA (who I am): ${data.persona}
PURPOSE: ${data.purpose}
AUDIENCE: ${data.audience}
TONE: ${data.tone}
ADDITIONAL CONTEXT: ${data.context || "None"}

Output the email in markdown, starting with "**Subject:** <subject>".`;
    return callAI(system, prompt);
  });

/* ===== Meeting Notes Summarizer ===== */
const NotesInput = z.object({ notes: z.string().min(10) });
export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an expert meeting analyst. Convert raw notes/transcripts into structured summaries.
Always return markdown with these sections in this exact order:
## Summary
A 2-3 sentence executive summary.
## Key Discussion Points
Bullet list of major topics.
## Action Items
Table with columns: Owner | Task | Deadline. Use "TBD" when unknown.
## Decisions Made
Bullet list. Omit section if none.
## Open Questions
Bullet list. Omit section if none.`;
    return callAI(system, `Meeting notes:\n\n${data.notes}`);
  });

/* ===== Task Planner ===== */
const PlanInput = z.object({
  tasks: z.string().min(3),
  horizon: z.string().default("today"),
});
export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a productivity coach using the Eisenhower matrix and time-blocking.
Return markdown with:
## Prioritized Plan
A table: Priority (P1-P4) | Task | Why | Estimated Time | Suggested Time Block.
## Eisenhower Matrix
4 sections: Urgent & Important, Important Not Urgent, Urgent Not Important, Neither.
## Recommended Schedule
A time-blocked schedule for the requested horizon.
## Tips
2-3 brief, specific productivity suggestions for this list.`;
    return callAI(system, `Planning horizon: ${data.horizon}\n\nTasks (one per line or freeform):\n${data.tasks}`);
  });

/* ===== Research Assistant ===== */
const ResearchInput = z.object({ topic: z.string().min(2), focus: z.string().optional().default("") });
export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a senior research analyst. Provide structured, balanced briefings from your training knowledge.
Return markdown with:
## Overview
2-4 sentence framing.
## Key Insights
5-7 substantive bullets.
## Opportunities
Bullet list.
## Risks & Considerations
Bullet list.
## Suggested Next Steps
Numbered list of concrete actions.
At the end add: *Note: Information may not reflect the latest developments. Verify critical facts with primary sources.*`;
    const prompt = `Topic: ${data.topic}\nFocus area: ${data.focus || "general overview"}`;
    return callAI(system, prompt);
  });
