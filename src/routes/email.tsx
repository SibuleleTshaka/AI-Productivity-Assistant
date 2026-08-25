import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, Send, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiWorkbench } from "@/components/AiWorkbench";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "AI Email Generator & Reply Assistant | Task Tracker" },
      {
        name: "description",
        content:
          "Draft venue-rental emails and replies with AI, then approve, edit or reject each draft before anything is sent to a client.",
      },
      { property: "og:title", content: "AI Email Generator & Reply Assistant | Task Tracker" },
      {
        property: "og:description",
        content: "Generate client emails and replies with mandatory human review before sending.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const { clients, drafts, addDraft, setDraftStatus, notify } = useStore();
  const [mode, setMode] = useState<"email" | "reply">("email");
  const [tone, setTone] = useState("professional");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const client = clients.find((c) => c.id === clientId);
  const queue = drafts.filter((d) => d.status === "awaiting_review");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI email generator & reply assistant</h1>
        <p className="text-sm text-muted-foreground">
          Every draft lands in the review queue — a person approves before it can be sent.
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "email" | "reply")}>
        <TabsList>
          <TabsTrigger value="email">New email</TabsTrigger>
          <TabsTrigger value="reply">Reply to a message</TabsTrigger>
        </TabsList>
      </Tabs>

      <AiWorkbench
        key={mode}
        task={mode}
        title={mode === "email" ? "Compose a new client email" : "Draft a reply"}
        description={
          mode === "email"
            ? "Describe the purpose, venue, dates and any terms to mention."
            : "Paste the client's message; the assistant proposes a courteous reply."
        }
        placeholder={
          mode === "email"
            ? "Quote for Riverside Marquee on the 12th, 210 guests, includes generator and parking, deposit 30%…"
            : "Paste the received email here…"
        }
        examples={[
          "Confirm the gala floor plan and request final headcount by Friday.",
          "Politely decline a date clash and offer two alternative dates.",
        ]}
        controls={
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} · {c.org}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["professional", "warm", "formal", "concise", "apologetic"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        buildPrompt={(input) =>
          `Client: ${client?.name ?? "Unknown"} (${client?.org ?? ""}). Tone: ${tone}.\n\n${input}`
        }
        actions={(output, reset) => (
          <Button
            size="sm"
            onClick={() => {
              const firstLine = output.split("\n")[0] ?? "";
              const subject = firstLine.replace(/^\**subject:?\**\s*/i, "").slice(0, 120);
              addDraft({
                subject: subject || "AI draft",
                body: output,
                to: client?.email ?? "unassigned",
                kind: mode,
              });
              notify({
                title: "Draft awaiting review",
                detail: `AI ${mode} for ${client?.org ?? "client"} needs human approval.`,
                kind: "approval",
              });
              toast.success("Sent to the review queue");
              reset();
            }}
          >
            <Mail className="size-4" /> Send to review queue
          </Button>
        )}
      />

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Review queue
            <Badge variant="secondary">{queue.length} awaiting approval</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing awaiting review.
            </p>
          )}
          {queue.map((d) => (
            <div key={d.id} className="rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex-1 text-sm font-medium">{d.subject}</p>
                <Badge variant="outline">{d.kind}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                To {d.to} · created {d.createdAt}
              </p>
              <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">
                {d.body}
              </pre>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setDraftStatus(d.id, "approved", "You");
                    toast.success("Approved — ready to send");
                  }}
                >
                  <Check className="size-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDraftStatus(d.id, "sent", "You");
                    notify({
                      title: "Email sent",
                      detail: `${d.subject} was approved and sent.`,
                      kind: "approval",
                    });
                    toast.success("Approved and sent");
                  }}
                >
                  <Send className="size-4" /> Approve & send
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraftStatus(d.id, "rejected", "You");
                    toast("Draft rejected");
                  }}
                >
                  <X className="size-4" /> Reject
                </Button>
              </div>
            </div>
          ))}

          {drafts.filter((d) => d.status !== "awaiting_review").length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">History</p>
              {drafts
                .filter((d) => d.status !== "awaiting_review")
                .map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                  >
                    <span className="flex-1 truncate">{d.subject}</span>
                    <Badge variant={d.status === "rejected" ? "destructive" : "secondary"}>
                      {d.status}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
