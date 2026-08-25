import { createFileRoute } from "@tanstack/react-router";
import { ListPlus } from "lucide-react";
import { toast } from "sonner";
import { AiWorkbench } from "@/components/AiWorkbench";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/summariser")({
  head: () => ({
    meta: [
      { title: "Email, Meeting & Document Summariser | Task Tracker" },
      {
        name: "description",
        content:
          "Turn long email threads, meeting notes and venue documents into summaries, decisions and action items with AI you can verify.",
      },
      { property: "og:title", content: "Email, Meeting & Document Summariser | Task Tracker" },
      {
        property: "og:description",
        content: "Summarise threads, meetings and contracts into decisions and action items.",
      },
    ],
  }),
  component: SummariserPage,
});

function SummariserPage() {
  const { addTask, notify } = useStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Email, meeting & document summariser</h1>
        <p className="text-sm text-muted-foreground">
          Paste a thread, meeting notes or document text — get a summary, decisions and action items.
        </p>
      </div>

      <AiWorkbench
        task="summarise"
        title="Summarise content"
        description="Long threads and site-visit notes become a reviewable brief."
        placeholder="Paste the email thread, minutes or document text here…"
        outputLabel="Summary — verify before circulating"
        examples={[
          "Minutes: gala walkthrough with Sable Foundation — stage placement, load-in times, security cover, catering headcount pending.",
        ]}
        actions={(output, reset) => (
          <Button
            size="sm"
            onClick={() => {
              const line =
                output
                  .split("\n")
                  .map((l) => l.replace(/^[-*|\s]+/, "").trim())
                  .find((l) => l.length > 12 && !l.startsWith("#") && !l.startsWith("**")) ??
                "Follow up on summary";
              const due = new Date();
              due.setDate(due.getDate() + 3);
              addTask({
                title: line.slice(0, 110),
                owner: "Unassigned",
                due: due.toISOString().slice(0, 10),
                priority: "medium",
                done: false,
              });
              notify({
                title: "Task created from summary",
                detail: line.slice(0, 90),
                kind: "system",
              });
              toast.success("Action item added to the planner");
              reset();
            }}
          >
            <ListPlus className="size-4" /> Add action item to planner
          </Button>
        )}
      />
    </div>
  );
}
