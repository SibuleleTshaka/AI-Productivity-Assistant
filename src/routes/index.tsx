import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Mail,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Task Tracker Venue AI" },
      {
        name: "description",
        content:
          "Task Tracker admin dashboard for venue rental teams: bookings, deadlines, AI drafts awaiting review, and client activity in one Outlook-style workspace.",
      },
      { property: "og:title", content: "Admin Dashboard | Task Tracker Venue AI" },
      {
        property: "og:description",
        content:
          "Monitor venue bookings, deadlines, notifications and AI drafts awaiting human approval.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { bookings, clients, tasks, drafts, notifications, venueById, toggleTask } = useStore();
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = bookings
    .filter((b) => b.date >= today && b.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));
  const overdue = tasks.filter((t) => !t.done && t.due < today);
  const pendingDrafts = drafts.filter((d) => d.status === "awaiting_review");

  const utilisation = useStore().venues.map((v) => ({
    name: v.name.split(" ")[0],
    bookings: bookings.filter((b) => b.venueId === v.id && b.status !== "cancelled").length,
  }));

  const stats = [
    { label: "Upcoming bookings", value: upcoming.length, icon: CalendarCheck, to: "/bookings" },
    { label: "Drafts to review", value: pendingDrafts.length, icon: Mail, to: "/email" },
    { label: "Overdue tasks", value: overdue.length, icon: AlertTriangle, to: "/planner" },
    { label: "Active clients", value: clients.length, icon: Users, to: "/clients" },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Administration dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Venue operations overview — AI assists, people approve.
          </p>
        </div>
        <Button asChild>
          <Link to="/bookings">
            New booking <ArrowUpRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to}>
            <Card className="shadow-panel transition-shadow hover:shadow-raised">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="grid size-10 place-items-center rounded-md bg-primary-soft text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-panel lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming bookings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcoming.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <div className="w-16 shrink-0 text-center">
                  <p className="font-display text-sm font-semibold">{b.date.slice(8)}</p>
                  <p className="text-[11px] uppercase text-muted-foreground">
                    {new Date(b.date).toLocaleString("en", { month: "short" })}
                  </p>
                </div>
                <div className="min-w-40 flex-1">
                  <p className="text-sm font-medium">{b.purpose}</p>
                  <p className="text-xs text-muted-foreground">
                    {venueById(b.venueId)?.name} · {b.startTime}–{b.endTime} · {b.guests} guests
                  </p>
                </div>
                <Badge variant={b.status === "confirmed" ? "default" : "secondary"}>
                  {b.status}
                </Badge>
              </div>
            ))}
            {upcoming.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No upcoming bookings.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks
              .filter((t) => !t.done)
              .sort((a, b) => a.due.localeCompare(b.due))
              .slice(0, 6)
              .map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
                >
                  <Checkbox checked={t.done} onCheckedChange={() => toggleTask(t.id)} />
                  <span className="flex-1 text-sm">
                    {t.title}
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" /> {t.due} · {t.owner}
                      {t.due < today && (
                        <span className="font-medium text-destructive">· overdue</span>
                      )}
                    </span>
                  </span>
                </label>
              ))}
            {tasks.every((t) => t.done) && (
              <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-success" /> All caught up.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-panel lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Venue utilisation</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilisation}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Latest notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.slice(0, 5).map((n) => (
              <div key={n.id} className="rounded-md border border-border px-3 py-2">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.detail}</p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/notifications">View all</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
