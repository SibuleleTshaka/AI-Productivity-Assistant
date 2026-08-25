import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarCheck, CheckCheck, Cog, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Deadlines | Task Tracker" },
      {
        name: "description",
        content:
          "Track deadline alerts, approval requests and booking updates for your venue-rental administration team in one place.",
      },
      { property: "og:title", content: "Notifications & Deadlines | Task Tracker" },
      {
        property: "og:description",
        content: "Deadline alerts, approval requests and booking updates in one feed.",
      },
    ],
  }),
  component: NotificationsPage,
});

const icons = {
  deadline: AlertTriangle,
  approval: ShieldCheck,
  booking: CalendarCheck,
  system: Cog,
} as const;

function NotificationsPage() {
  const { notifications, markAllRead, markRead, tasks, drafts } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => !t.done && t.due < today);
  const pending = drafts.filter((d) => d.status === "awaiting_review");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications & deadlines</h1>
          <p className="text-sm text-muted-foreground">
            Approvals, overdue deadlines and booking activity.
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead}>
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="shadow-panel">
          <CardContent className="py-4">
            <p className="font-display text-2xl font-semibold">{overdue.length}</p>
            <p className="text-xs text-muted-foreground">Overdue deadlines</p>
          </CardContent>
        </Card>
        <Card className="shadow-panel">
          <CardContent className="py-4">
            <p className="font-display text-2xl font-semibold">{pending.length}</p>
            <p className="text-xs text-muted-foreground">AI drafts awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="shadow-panel">
          <CardContent className="py-4">
            <p className="font-display text-2xl font-semibold">
              {notifications.filter((n) => !n.read).length}
            </p>
            <p className="text-xs text-muted-foreground">Unread alerts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="size-4 text-primary" /> Activity feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                  n.read ? "border-border" : "border-primary/40 bg-primary-soft/50"
                }`}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block text-xs text-muted-foreground">{n.detail}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{n.at}</span>
                {!n.read && <Badge variant="secondary">new</Badge>}
              </button>
            );
          })}
          {notifications.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No notifications.</p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Overdue deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overdue.map((t) => (
            <div
              key={t.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
            >
              <span className="flex-1">{t.title}</span>
              <span className="text-xs text-muted-foreground">
                {t.owner} · due {t.due}
              </span>
              <Badge variant="destructive">overdue</Badge>
            </div>
          ))}
          {overdue.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No overdue deadlines. Nice work.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
