import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AiInput = z.object({
  task: z.enum(["email", "reply", "summarise", "plan", "research", "chat"]),
  prompt: z.string().min(1).max(12000),
  tone: z.string().max(60).optional(),
  protectClientData: z.boolean().optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(30)
    .optional(),
});

const SYSTEM: Record<string, string> = {
  email:
    "You are the email drafting assistant for a venue-rental administration team. Draft a complete, professional email (subject line first as 'Subject: ...', then body). Never invent prices, dates or contract terms that were not provided — write [confirm] placeholders instead. End with a short sign-off.",
  reply:
    "You are a reply assistant for a venue-rental admin team. Draft a courteous reply to the message provided. Acknowledge the request, answer only with information given, and use [confirm] placeholders for anything unverified.",
  summarise:
    "Summarise the supplied email thread, meeting notes or document for a venue-rental administrator. Output markdown with: **Summary** (3 bullets), **Decisions**, **Action items** (owner + due date if stated), **Risks / open questions**. Be concise and never speculate.",
  plan:
    "You are a task planner for venue-rental administrators. Turn the request into an ordered, realistic plan. Output a markdown table with columns Task | Owner | Suggested date | Priority, then a short 'Watch-outs' list. Assume normal business hours and reference deadlines given.",
  research:
    "You are a research assistant for venue-rental operations (pricing benchmarks, compliance, event logistics, supplier options). Answer in markdown with clear headings, note assumptions explicitly, and finish with 'Verify before use:' listing what a human must confirm. Do not fabricate citations.",
  chat:
    "You are Task Tracker's assistant for a venue-rental organisation: bookings, availability, clients, deadlines and admin workflow. Be concise, practical and use markdown. Remind the user that emails and bookings require human approval before sending or confirming.",
};

export const runAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AiInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured (missing key).");

    const { streamText } = await import("ai");
    const { createLovableAiGatewayProvider, redactPii } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(apiKey);

    const clean = (t: string) => (data.protectClientData === false ? t : redactPii(t));
    const system =
      SYSTEM[data.task] +
      (data.tone ? `\nWrite in a ${data.tone} tone.` : "") +
      (data.protectClientData === false
        ? ""
        : "\nSome personal details are masked as [email redacted]/[phone redacted]; keep the masks in your output.");

    const messages = [
      ...(data.history ?? []).map((m) => ({ role: m.role, content: clean(m.content) })),
      { role: "user" as const, content: clean(data.prompt) },
    ];

    try {
      const result = streamText({
        model: gateway("google/gemini-3.7-flash"),
        system,
        messages: messages as { role: "user" | "assistant"; content: string }[],
      });
      const text = await result.text;
      return { text };
    } catch (error) {
      const status = (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { status?: number })?.status;
      if (status === 429) throw new Error("AI is rate limited right now — please retry in a moment.");
      if (status === 402)
        throw new Error("AI credits are exhausted. Add credits in Lovable to continue.");
      if (status === 403) throw new Error("AI access is blocked by workspace policy.");
      throw new Error((error as Error)?.message ?? "AI request failed.");
    }
  });
