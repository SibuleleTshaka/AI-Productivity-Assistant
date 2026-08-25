import { createFileRoute } from "@tanstack/react-router";
import { AiWorkbench } from "@/components/AiWorkbench";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant for Venue Operations | Task Tracker" },
      {
        name: "description",
        content:
          "Research pricing benchmarks, compliance requirements, suppliers and event logistics for venue rentals, with assumptions flagged for human verification.",
      },
      { property: "og:title", content: "AI Research Assistant for Venue Operations | Task Tracker" },
      {
        property: "og:description",
        content: "Research venue pricing, compliance and logistics with verification prompts.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">AI research assistant</h1>
        <p className="text-sm text-muted-foreground">
          Background research for quotes, compliance and logistics — always verify before quoting a
          client.
        </p>
      </div>

      <AiWorkbench
        task="research"
        title="Ask a research question"
        description="Pricing benchmarks, licensing, accessibility, supplier options and event logistics."
        placeholder="What should we check before hosting a 200-guest outdoor exhibition, including noise and safety compliance?"
        outputLabel="Research notes — verify before use"
        examples={[
          "Benchmark day rates for a 400-seat conference hall with AV in a major metro.",
          "Checklist for wheelchair accessibility and emergency egress at outdoor marquee events.",
        ]}
      />
    </div>
  );
}
