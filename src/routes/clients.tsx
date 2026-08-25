import { createFileRoute } from "@tanstack/react-router";
import { Eye, EyeOff, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Client Management & Search | Task Tracker" },
      {
        name: "description",
        content:
          "Search clients, review booking history and manage venue-rental relationships with contact details hidden until explicitly revealed.",
      },
      { property: "og:title", content: "Client Management & Search | Task Tracker" },
      {
        property: "og:description",
        content: "Search clients, view booking history and protect contact details by default.",
      },
    ],
  }),
  component: ClientsPage,
});

const mask = (value: string) => value.replace(/./g, (c, i) => (i < 3 ? c : "•"));

function ClientsPage() {
  const { clients, bookings, venueById, addClient } = useStore();
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    phone: "",
    tier: "standard" as "standard" | "priority" | "vip",
    notes: "",
  });

  const filtered = clients.filter((c) =>
    `${c.name} ${c.org} ${c.notes}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Client management & search</h1>
          <p className="text-sm text-muted-foreground">
            Contact details stay masked until you choose to reveal them.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="size-4" /> Add client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a client</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              {(
                [
                  ["name", "Contact name"],
                  ["org", "Organisation"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(v) => setForm({ ...form, tier: v as typeof form.tier })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["standard", "priority", "vip"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  if (!form.name || !form.org) {
                    toast.error("Name and organisation are required.");
                    return;
                  }
                  addClient(form);
                  setForm({ name: "", org: "", email: "", phone: "", tier: "standard", notes: "" });
                  setOpen(false);
                  toast.success("Client added");
                }}
              >
                Save client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, organisation or notes…"
          className="pl-8"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered.map((c) => {
          const history = bookings
            .filter((b) => b.clientId === c.id)
            .sort((a, b) => b.date.localeCompare(a.date));
          const show = revealed[c.id];
          return (
            <Card key={c.id} className="shadow-panel">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="flex-1 text-base">{c.name}</CardTitle>
                  <Badge variant={c.tier === "vip" ? "default" : "secondary"}>{c.tier}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.org}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs">
                  <p>Email: {show ? c.email : mask(c.email)}</p>
                  <p>Phone: {show ? c.phone : mask(c.phone)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-7 px-2"
                    onClick={() => setRevealed((r) => ({ ...r, [c.id]: !r[c.id] }))}
                  >
                    {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    {show ? "Hide details" : "Reveal details"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{c.notes}</p>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Booking history ({history.length})
                  </p>
                  <div className="space-y-1">
                    {history.slice(0, 4).map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs"
                      >
                        <span className="font-medium">{b.ref}</span>
                        <span className="flex-1 truncate text-muted-foreground">
                          {venueById(b.venueId)?.name} · {b.date}
                        </span>
                        <Badge variant="outline">{b.status}</Badge>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p className="text-xs text-muted-foreground">No bookings yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">No clients matched.</p>
        )}
      </div>
    </div>
  );
}
