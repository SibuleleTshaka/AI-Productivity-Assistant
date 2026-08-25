import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  CalendarCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Mail,
  Menu,
  Search,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email assistant", icon: Mail },
  { to: "/summariser", label: "Summariser", icon: FileText },
  { to: "/planner", label: "Task planner", icon: ClipboardList },
  { to: "/research", label: "Research", icon: Sparkles },
  { to: "/chat", label: "Assistant chat", icon: Bot },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/notifications", label: "Notifications", icon: Bell },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notifications, drafts } = useStore();
  const unread = notifications.filter((n) => !n.read).length;
  const pending = drafts.filter((d) => d.status === "awaiting_review").length;

  return (
    <nav className="space-y-1">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        const badge = to === "/notifications" ? unread : to === "/email" ? pending : 0;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{label}</span>
            {badge > 0 && (
              <span className="rounded-full bg-sidebar-primary px-2 py-0.5 text-[11px] font-semibold text-sidebar-primary-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
        TT
      </div>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold text-sidebar-foreground">Task Tracker</p>
        <p className="text-[11px] text-sidebar-foreground/70">Venue administration AI</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { clients, bookings, notifications } = useStore();
  const [query, setQuery] = useState("");
  const unread = notifications.filter((n) => !n.read).length;

  const results = query.trim()
    ? [
        ...clients
          .filter((c) => `${c.name} ${c.org}`.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map((c) => ({ to: "/clients" as const, label: `${c.name} · ${c.org}` })),
        ...bookings
          .filter((b) => `${b.ref} ${b.purpose}`.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map((b) => ({ to: "/bookings" as const, label: `${b.ref} · ${b.purpose}` })),
      ]
    : [];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar px-3 pb-6 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto rounded-md bg-sidebar-accent p-3 text-[11px] leading-relaxed text-sidebar-foreground/85">
          <Shield className="mb-1 size-4" />
          Human approval is required before any AI email is sent. Client contact details are masked
          before reaching the model.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-maroon-gradient px-3 py-2.5 sm:px-5">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 bg-sidebar p-3">
              <Brand />
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <span className="font-display text-sm font-semibold text-primary-foreground sm:text-base">
            Task Tracker
          </span>

          <div className="relative ml-auto w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients, bookings…"
              className="h-9 bg-card pl-8"
            />
            {results.length > 0 && (
              <div className="absolute left-0 right-0 top-11 overflow-hidden rounded-md border border-border bg-popover shadow-raised">
                {results.map((r, i) => (
                  <Link
                    key={i}
                    to={r.to}
                    onClick={() => setQuery("")}
                    className="block px-3 py-2 text-sm hover:bg-muted"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/notifications"
            className="relative grid size-9 shrink-0 place-items-center rounded-md text-primary-foreground hover:bg-primary-deep/40"
          >
            <Bell className="size-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-warning" />
            )}
          </Link>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
