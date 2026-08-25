import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Loader2, Copy, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { runAi } from "@/lib/ai.functions";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Task = "email" | "reply" | "summarise" | "plan" | "research";

export function AiWorkbench({
  task,
  title,
  description,
  placeholder,
  examples = [],
  controls,
  buildPrompt,
  actions,
  outputLabel = "AI draft — human review required",
}: {
  task: Task;
  title: string;
  description: string;
  placeholder: string;
  examples?: string[];
  controls?: ReactNode;
  buildPrompt?: (input: string) => string;
  actions?: (output: string, reset: () => void) => ReactNode;
  outputLabel?: string;
}) {
  const call = useServerFn(runAi);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [protectClientData, setProtect] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!input.trim()) {
      toast.error("Add some context first.");
      return;
    }
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await call({
        data: {
          task,
          prompt: buildPrompt ? buildPrompt(input) : input,
          protectClientData,
        },
      });
      setOutput(res.text);
    } catch (e) {
      setError((e as Error)?.message ?? "AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="shadow-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" /> {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {controls}
          <div className="space-y-2">
            <Label htmlFor="ai-input">Context</Label>
            <Textarea
              id="ai-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              rows={10}
            />
          </div>
          {examples.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-secondary-foreground hover:bg-accent"
                >
                  {ex.length > 46 ? ex.slice(0, 46) + "…" : ex}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between rounded-md border border-border bg-primary-soft/60 px-3 py-2">
            <div className="flex items-start gap-2 pr-3">
              <ShieldCheck className="mt-0.5 size-4 text-primary" />
              <div className="text-xs leading-snug">
                <p className="font-medium">Mask client contact details</p>
                <p className="text-muted-foreground">
                  Emails, phone numbers and card numbers are redacted before the model sees them.
                </p>
              </div>
            </div>
            <Switch checked={protectClientData} onCheckedChange={setProtect} />
          </div>
          <Button onClick={generate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Generating…" : "Generate with AI"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{outputLabel}</CardTitle>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertTriangle className="size-3.5 text-warning" />
            Nothing is sent or committed until a person approves it.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {!output && !error && (
            <p className="rounded-md border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
              Your AI output will appear here for review.
            </p>
          )}
          {output && (
            <>
              <div className="max-h-[26rem] overflow-y-auto rounded-md border border-border bg-card p-3">
                <Markdown>{output}</Markdown>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void navigator.clipboard.writeText(output);
                    toast.success("Copied for review");
                  }}
                >
                  <Copy className="size-4" /> Copy
                </Button>
                {actions?.(output, () => setOutput(""))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
