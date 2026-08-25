import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Venue Booking & Availability | Task Tracker" },
      {
        name: "description",
        content:
          "Check venue availability, capture bookings with clash prevention, and review complete booking history for every client.",
      },
      { property: "og:title", content: "Venue Booking & Availability | Task Tracker" },
      {
        property: "og:description",
        content: "Availability checks, clash prevention and full booking history for your venues.",
      },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  const {
    bookings,
    clients,
    venues,
    venueById,
    clientById,
    isVenueAvailable,
    addBooking,
    setBookingStatus,
    notify,
  } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState<"upcoming" | "history" | "all">("upcoming");
  const [form, setForm] = useState({
    clientId: clients[0]?.id ?? "",
    venueId: venues[0]?.id ?? "v1",
    date: today,
    startTime: "09:00",
    endTime: "17:00",
    guests: 50,
    purpose: "",
  });

  const available = isVenueAvailable(form.venueId, form.date);
  const capacityOk = form.guests <= (venueById(form.venueId)?.capacity ?? 0);

  const rows = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => b.date.localeCompare(a.date));
    if (tab === "upcoming")
      return sorted.filter((b) => b.date >= today && b.status !== "cancelled").reverse();
    if (tab === "history") return sorted.filter((b) => b.date < today || b.status === "cancelled");
    return sorted;
  }, [bookings, tab, today]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Venue booking & availability</h1>
        <p className="text-sm text-muted-foreground">
          Real-time clash and capacity checks before a booking is captured.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {venues.map((v) => {
          const free = isVenueAvailable(v.id, form.date);
          return (
            <Card key={v.id} className="shadow-panel">
              <CardContent className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{v.name}</p>
                  <Badge variant={free ? "secondary" : "destructive"}>
                    {free ? "Available" : "Booked"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Up to {v.capacity} guests · R{v.ratePerDay.toLocaleString()} / day
                </p>
                <p className="text-xs text-muted-foreground">{v.features.join(" · ")}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="size-4 text-primary" /> Capture a booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!available) {
                toast.error("That venue is already booked on this date.");
                return;
              }
              if (!capacityOk) {
                toast.error("Guest count exceeds venue capacity.");
                return;
              }
              const b = addBooking({ ...form, status: "pending" });
              notify({
                title: "Booking captured",
                detail: `${b.ref} · ${venueById(form.venueId)?.name} on ${form.date} — awaiting confirmation.`,
                kind: "booking",
              });
              toast.success(`${b.ref} captured as pending — confirm after review`);
              setForm({ ...form, purpose: "" });
            }}
          >
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm({ ...form, clientId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
              <Label>Venue</Label>
              <Select value={form.venueId} onValueChange={(v) => setForm({ ...form, venueId: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input
                id="start"
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input
                id="end"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guests">Guests</Label>
              <Input
                id="guests"
                type="number"
                min={1}
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="Annual gala, board meeting…"
              />
            </div>
            <div className="md:col-span-3 flex flex-wrap items-center gap-3">
              <Button type="submit">
                <CalendarCheck className="size-4" /> Capture as pending
              </Button>
              <p className="text-xs text-muted-foreground">
                {available ? "Slot is free." : "Clash: venue already booked that day."}{" "}
                {capacityOk ? "" : "Capacity exceeded."}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bookings</CardTitle>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.ref}</TableCell>
                  <TableCell>
                    <span className="block text-sm">{clientById(b.clientId)?.org ?? "—"}</span>
                    <span className="text-xs text-muted-foreground">{b.purpose}</span>
                  </TableCell>
                  <TableCell>{venueById(b.venueId)?.name}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {b.date}
                    <span className="block text-xs text-muted-foreground">
                      {b.startTime}–{b.endTime}
                    </span>
                  </TableCell>
                  <TableCell>{b.guests}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        b.status === "confirmed"
                          ? "default"
                          : b.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {b.status === "pending" || b.status === "enquiry" ? (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setBookingStatus(b.id, "confirmed");
                            toast.success(`${b.ref} confirmed`);
                          }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setBookingStatus(b.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                    No bookings in this view.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
