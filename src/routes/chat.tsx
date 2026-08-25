import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Loader2, Send, ShieldCheck, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/Markdown";
import { runAi } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot for Venue Admin Teams | Task Tracker" },
      {
        name: "description",
        content:
          "Ask Task Tracker's AI chatbot about bookings, availability, deadlines and client admin workflow, with client data masked and approvals kept with humans.",
      },
      { property: "og:title", content: "AI Chatbot for Venue Admin Teams | Task Tracker" },
      {
        property: "og:description",
        content: "Conversational help for bookings, availability and admin workflow.",
      },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const call = useServerFn(runAi);
  const { bookings, venueById, tasks } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hello — I'm the Task Tracker assistant. Ask me about venue availability, booking history, deadlines or drafting client communication. I'll never send anything without your approval.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const context = `Operational snapshot — bookings: ${bookings
        .slice(0, 6)
        .map((b) => `${b.ref} ${venueById(b.venueId)?.name} ${b.date} ${b.status}`)
        .join("; ")}. Open tasks: ${tasks
        .filter((t) => !t.done)
        .map((t) => `${t.title} (due ${t.due})`)
        .join("; ")}.`;
      const res = await call({
        data: {
          task: "chat",
          prompt: `${context}\n\nQuestion: ${trimmed}`,
          history: next.slice(-8, -1),
          protectClientData: true,
        },
      });
      setMessages((m) => [...m, { role: "assistant", content: res.text }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${(e as Error)?.message ?? "AI request failed."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Which bookings need attention this week?",
    "Is Maroon Hall free next month?",
    "What should I chase before the gala?",
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Assistant chat</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" /> Client contact details are masked before
          reaching the model.
        </p>
      </div>

      <Card className="shadow-panel">
        <CardContent className="flex h-[60vh] flex-col gap-4 overflow-y-auto py-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
              {m.role === "assistant" && (
                <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-lg border border-border bg-card px-3 py-2"
                }
              >
                {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
              </div>
              {m.role === "user" && (
                <div className="ml-2 mt-1 grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Thinking…
            </p>
          )}
          <div ref={endRef} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => void send(s)}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about bookings, availability or admin tasks…"
        />
        <Button type="submit" disabled={loading}>
          <Send className="size-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
