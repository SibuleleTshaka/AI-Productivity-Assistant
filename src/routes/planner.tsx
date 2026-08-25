import { createFileRoute } from "@tanstack/react-router";
import { CalendarPlus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiWorkbench } from "@/components/AiWorkbench";
import { useStore } from "@/lib/store";
import { teamMembers } from "@/lib/demo-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner & Scheduler | Task Tracker" },
      {
        name: "description",
        content:
          "Plan venue-rental work with AI: generate ordered task plans with owners and dates, then approve them into your team's deadline board.",
      },
      { property: "og:title", content: "AI Task Planner & Scheduler | Task Tracker" },
      {
        property: "og:description",
        content: "Generate task plans with owners, dates and priorities for venue operations.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { tasks, toggleTask, addTask, bookings } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState(teamMembers[0] ?? "Unassigned");
  const [due, setDue] = useState(today);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const grouped = [
    { label: "Overdue", items: tasks.filter((t) => !t.done && t.due < today) },
    { label: "Due today", items: tasks.filter((t) => !t.done && t.due === today) },
    { label: "Upcoming", items: tasks.filter((t) => !t.done && t.due > today) },
    { label: "Completed", items: tasks.filter((t) => t.done) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI task planner & scheduler</h1>
        <p className="text-sm text-muted-foreground">
          Generate a plan, review it, then commit tasks to the deadline board.
        </p>
      </div>

      <AiWorkbench
        task="plan"
        title="Plan a workstream"
        description="Describe the event or deadline; the assistant proposes tasks, owners and dates."
        placeholder="Plan the run-up to the Sable Foundation gala in 6 days: floor plan sign-off, catering headcount, security, AV rehearsal…"
        outputLabel="Proposed plan — review before committing"
        examples={[
          `Prepare for booking ${bookings[0]?.ref ?? "TT-2401"} including supplier confirmations and client sign-off.`,
        ]}
        actions={(output, reset) => (
          <Button
            size="sm"
            onClick={() => {
              const rows = output
                .split("\n")
                .filter((l) => l.trim().startsWith("|") && !/^\|[\s:|-]+\|$/.test(l.trim()))
                .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean))
                .filter((c) => c.length >= 2 && !/^task$/i.test(c[0] ?? ""));
              if (rows.length === 0) {
                toast.error("No task rows detected — copy them in manually.");
                return;
              }
              rows.forEach((c) =>
                addTask({
                  title: (c[0] ?? "Task").slice(0, 120),
                  owner: c[1] ?? "Unassigned",
                  due: /\d{4}-\d{2}-\d{2}/.test(c[2] ?? "") ? (c[2] as string) : today,
                  priority: /high/i.test(c[3] ?? "")
                    ? "high"
                    : /low/i.test(c[3] ?? "")
                      ? "low"
                      : "medium",
                  done: false,
                }),
              );
              toast.success(`${rows.length} tasks approved and scheduled`);
              reset();
            }}
          >
            <CalendarPlus className="size-4" /> Approve & schedule tasks
          </Button>
        )}
      />

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Add a task manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              addTask({ title, owner, due, priority, done: false });
              setTitle("");
              toast.success("Task added");
            }}
          >
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="t">Task</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">Due</Label>
              <Input id="d" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="lg:col-span-5 lg:w-40">
              <Plus className="size-4" /> Add task
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {grouped.map((g) => (
          <Card key={g.label} className="shadow-panel">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {g.label}
                <Badge variant={g.label === "Overdue" ? "destructive" : "secondary"}>
                  {g.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {g.items.length === 0 && (
                <p className="py-4 text-sm text-muted-foreground">Nothing here.</p>
              )}
              {g.items.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} />
                  <span className="flex-1">
                    <span className={t.done ? "text-sm line-through text-muted-foreground" : "text-sm"}>
                      {t.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t.owner} · due {t.due}
                      {t.bookingRef ? ` · ${t.bookingRef}` : ""} · {t.priority}
                    </span>
                  </span>
                </label>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
