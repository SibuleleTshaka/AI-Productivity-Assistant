export type Client = {
  id: string;
  name: string;
  org: string;
  email: string;
  phone: string;
  tier: "standard" | "priority" | "vip";
  notes: string;
};

export type Venue = {
  id: string;
  name: string;
  capacity: number;
  ratePerDay: number;
  features: string[];
};

export type BookingStatus = "enquiry" | "pending" | "confirmed" | "completed" | "cancelled";

export type Booking = {
  id: string;
  ref: string;
  clientId: string;
  venueId: string;
  date: string; // ISO date
  startTime: string;
  endTime: string;
  guests: number;
  status: BookingStatus;
  purpose: string;
};

export type Task = {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  bookingRef?: string;
};

export type Notification = {
  id: string;
  title: string;
  detail: string;
  kind: "deadline" | "approval" | "booking" | "system";
  at: string;
  read: boolean;
};

export type DraftStatus = "awaiting_review" | "approved" | "sent" | "rejected";

export type Draft = {
  id: string;
  subject: string;
  body: string;
  to: string;
  kind: "email" | "reply";
  status: DraftStatus;
  createdAt: string;
  reviewer?: string | undefined;
};

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const venues: Venue[] = [
  { id: "v1", name: "Maroon Hall", capacity: 420, ratePerDay: 18500, features: ["Stage", "AV rig", "Catering kitchen"] },
  { id: "v2", name: "Chancellor Boardroom", capacity: 24, ratePerDay: 4200, features: ["Video conf", "Whiteboard"] },
  { id: "v3", name: "Riverside Marquee", capacity: 250, ratePerDay: 12800, features: ["Outdoor", "Generator", "Parking"] },
  { id: "v4", name: "Studio 4 Workshop", capacity: 60, ratePerDay: 5600, features: ["Flexible seating", "Projector"] },
];

export const seedClients: Client[] = [
  { id: "c1", name: "Naledi Mokoena", org: "Sable Foundation", email: "naledi@sablefoundation.org", phone: "+27 82 555 0142", tier: "vip", notes: "Annual gala, prefers Maroon Hall. Invoice via finance office." },
  { id: "c2", name: "Grant Whitfield", org: "Northbridge Legal", email: "g.whitfield@northbridge.co", phone: "+27 21 445 9910", tier: "priority", notes: "Quarterly partner meetings, needs video conferencing." },
  { id: "c3", name: "Aisha Patel", org: "Lumen Health", email: "aisha.patel@lumenhealth.io", phone: "+27 83 220 7781", tier: "standard", notes: "Wellness workshops, flexible on dates." },
  { id: "c4", name: "Thabo Nkosi", org: "Kite Collective", email: "thabo@kitecollective.art", phone: "+27 71 908 3344", tier: "standard", notes: "Outdoor exhibitions, weather contingency required." },
  { id: "c5", name: "Elena Rossi", org: "Verde Catering", email: "elena@verdecatering.com", phone: "+27 84 617 2255", tier: "priority", notes: "Supplier and occasional client for tasting events." },
];

export const seedBookings: Booking[] = [
  { id: "b1", ref: "TT-2401", clientId: "c1", venueId: "v1", date: day(6), startTime: "17:00", endTime: "23:00", guests: 380, status: "confirmed", purpose: "Sable Foundation annual gala" },
  { id: "b2", ref: "TT-2402", clientId: "c2", venueId: "v2", date: day(2), startTime: "09:00", endTime: "13:00", guests: 18, status: "pending", purpose: "Q3 partner review" },
  { id: "b3", ref: "TT-2403", clientId: "c4", venueId: "v3", date: day(12), startTime: "10:00", endTime: "18:00", guests: 210, status: "enquiry", purpose: "Open-air art exhibition" },
  { id: "b4", ref: "TT-2404", clientId: "c3", venueId: "v4", date: day(-9), startTime: "08:30", endTime: "16:00", guests: 45, status: "completed", purpose: "Staff wellness workshop" },
  { id: "b5", ref: "TT-2405", clientId: "c5", venueId: "v4", date: day(-24), startTime: "12:00", endTime: "15:00", guests: 30, status: "completed", purpose: "Menu tasting showcase" },
  { id: "b6", ref: "TT-2406", clientId: "c1", venueId: "v3", date: day(-40), startTime: "11:00", endTime: "17:00", guests: 160, status: "cancelled", purpose: "Donor garden lunch" },
  { id: "b7", ref: "TT-2407", clientId: "c2", venueId: "v1", date: day(20), startTime: "08:00", endTime: "12:00", guests: 300, status: "pending", purpose: "Legal industry conference" },
];

export const seedTasks: Task[] = [
  { id: "t1", title: "Send gala floor plan for sign-off", owner: "Lerato", due: day(1), priority: "high", done: false, bookingRef: "TT-2401" },
  { id: "t2", title: "Confirm catering headcount", owner: "Sipho", due: day(3), priority: "high", done: false, bookingRef: "TT-2401" },
  { id: "t3", title: "Issue quote for exhibition marquee", owner: "Lerato", due: day(2), priority: "medium", done: false, bookingRef: "TT-2403" },
  { id: "t4", title: "Chase signed venue agreement", owner: "Dineo", due: day(-1), priority: "high", done: false, bookingRef: "TT-2402" },
  { id: "t5", title: "Archive workshop feedback forms", owner: "Sipho", due: day(5), priority: "low", done: true, bookingRef: "TT-2404" },
];

export const seedNotifications: Notification[] = [
  { id: "n1", title: "Deadline overdue", detail: "Signed venue agreement for TT-2402 is 1 day late.", kind: "deadline", at: day(-1), read: false },
  { id: "n2", title: "Draft awaiting review", detail: "AI reply to Northbridge Legal needs human approval.", kind: "approval", at: day(0), read: false },
  { id: "n3", title: "New enquiry", detail: "Kite Collective requested Riverside Marquee.", kind: "booking", at: day(0), read: false },
  { id: "n4", title: "Availability clash avoided", detail: "Maroon Hall double-booking blocked on " + day(20) + ".", kind: "system", at: day(-2), read: true },
];

export const seedDrafts: Draft[] = [
  {
    id: "d1",
    subject: "Q3 partner review — provisional hold confirmed",
    body: "Dear Grant,\n\nThank you for your request. We have placed a provisional hold on the Chancellor Boardroom.\n\nPlease confirm the final headcount and we will issue the agreement for signature.\n\nKind regards,\nVenue Administration",
    to: "g.whitfield@northbridge.co",
    kind: "reply",
    status: "awaiting_review",
    createdAt: day(0),
  },
];

export const teamMembers = ["Lerato", "Sipho", "Dineo", "Unassigned"];
