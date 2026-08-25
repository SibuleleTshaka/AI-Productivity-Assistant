import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  seedBookings,
  seedClients,
  seedDrafts,
  seedNotifications,
  seedTasks,
  venues,
  type Booking,
  type Client,
  type Draft,
  type Notification,
  type Task,
} from "./demo-data";

type State = {
  clients: Client[];
  bookings: Booking[];
  tasks: Task[];
  notifications: Notification[];
  drafts: Draft[];
};

const initial: State = {
  clients: seedClients,
  bookings: seedBookings,
  tasks: seedTasks,
  notifications: seedNotifications,
  drafts: seedDrafts,
};

const KEY = "task-tracker-state-v1";

type Ctx = State & {
  venues: typeof venues;
  clientById: (id: string) => Client | undefined;
  venueById: (id: string) => (typeof venues)[number] | undefined;
  isVenueAvailable: (venueId: string, date: string, ignoreId?: string) => boolean;
  addBooking: (b: Omit<Booking, "id" | "ref">) => Booking;
  setBookingStatus: (id: string, status: Booking["status"]) => void;
  addClient: (c: Omit<Client, "id">) => void;
  addTask: (t: Omit<Task, "id">) => void;
  toggleTask: (id: string) => void;
  addDraft: (d: Omit<Draft, "id" | "createdAt" | "status">) => void;
  setDraftStatus: (id: string, status: Draft["status"], reviewer?: string) => void;
  notify: (n: Omit<Notification, "id" | "at" | "read">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);
const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...(JSON.parse(raw) as State) });
    } catch {
      /* ignore corrupt local state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state]);

  const notify = useCallback((n: Omit<Notification, "id" | "at" | "read">) => {
    setState((s) => ({
      ...s,
      notifications: [{ ...n, id: uid(), at: today(), read: false }, ...s.notifications],
    }));
  }, []);

  const value = useMemo<Ctx>(() => {
    const clientById = (id: string) => state.clients.find((c) => c.id === id);
    const venueById = (id: string) => venues.find((v) => v.id === id);
    const isVenueAvailable = (venueId: string, date: string, ignoreId?: string) =>
      !state.bookings.some(
        (b) =>
          b.venueId === venueId &&
          b.date === date &&
          b.id !== ignoreId &&
          b.status !== "cancelled" &&
          b.status !== "completed",
      );

    return {
      ...state,
      venues,
      clientById,
      venueById,
      isVenueAvailable,
      addBooking: (b) => {
        const booking: Booking = {
          ...b,
          id: uid(),
          ref: `TT-${2408 + state.bookings.length}`,
        };
        setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
        return booking;
      },
      setBookingStatus: (id, status) =>
        setState((s) => ({
          ...s,
          bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        })),
      addClient: (c) => setState((s) => ({ ...s, clients: [{ ...c, id: uid() }, ...s.clients] })),
      addTask: (t) => setState((s) => ({ ...s, tasks: [{ ...t, id: uid() }, ...s.tasks] })),
      toggleTask: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        })),
      addDraft: (d) =>
        setState((s) => ({
          ...s,
          drafts: [
            { ...d, id: uid(), createdAt: today(), status: "awaiting_review" as const },
            ...s.drafts,
          ],
        })),
      setDraftStatus: (id, status, reviewer) =>
        setState((s) => ({
          ...s,
          drafts: s.drafts.map((d) => (d.id === id ? { ...d, status, reviewer } : d)),
        })),
      notify,
      markAllRead: () =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      markRead: (id) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    };
  }, [state, notify]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
