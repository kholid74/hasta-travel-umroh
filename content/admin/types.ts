import type { Package } from "../types";
import type { Costing, CostScenario, CostTemplate } from "./costing";

export type AdminPackage = Omit<Package, "departures"> & { status: "Draft" | "Terbit" | "Ditutup" | "Arsip" };
export type Departure = {
  id: string; packageId: string; date: string; capacity: number; airline: string;
  flight: string; origin: string; pnr: string; status: "Persiapan" | "Berangkat" | "Selesai";
  checks: Record<string, boolean>;
};
export type DocumentStatus = "Belum ada" | "Diunggah" | "Terverifikasi" | "Ditolak";
export type VisaStatus = "Belum diajukan" | "Diajukan" | "Diproses" | "Disetujui" | "Ditolak";
export type Jamaah = {
  id: string; name: string; gender: "Laki-laki" | "Perempuan"; phone: string; email: string;
  city: string; address: string; nik: string; birthPlace: string; birthDate: string; marital: string; blood: string;
  emergency: string; passport: string; passportOffice: string; passportIssue: string; passportExpiry: string;
  documents: Record<string, DocumentStatus>; visa: VisaStatus; visaNumber: string;
  visaSubmitted: string; visaApproved: string; visaExpiry: string; visaNotes: string;
  agentId: string; family: string; equipment: string[]; bus: string;
};
export type Booking = {
  id: string; jamaahId: string; departureId: string; roomType: "Quad" | "Triple" | "Double";
  total: number; date: string; due: string; status: "Aktif" | "Batal";
};
export type Payment = { id: string; bookingId: string; amount: number; date: string; method: string; status: "Menunggu" | "Terverifikasi" | "Dikembalikan" };
export const leadStages = ["Lead Baru", "Dihubungi", "Follow Up", "Qualified", "Booking", "Won", "Lost"] as const;
export type Lead = { id: string; name: string; phone: string; packageId: string; source: string; sales: string; stage: typeof leadStages[number]; lastContact: string; followUp: string; notes: string[]; bookingId?: string };
export type Agent = { id: string; name: string; phone: string; city: string; level: string; commission: number; status: "Menunggu" | "Disetujui" | "Dibayar" };
export type Room = { id: string; departureId: string; hotel: "Makkah" | "Madinah"; number: string; capacity: number; gender: "Laki-laki" | "Perempuan"; jamaahIds: string[] };
export type Expense = { id: string; departureId: string; category: string; vendor: string; amount: number; date: string; status: "Menunggu" | "Dibayar" };
export type Inventory = { id: string; name: string; stock: number; minimum: number };
export type Manasik = { id: string; name: string; date: string; time: string; location: string; speaker: string; departureId: string; attendees: string[] };
export type Activity = { id: string; date: string; user: string; module: string; action: string };
export type Notification = { id: string; category: string; title: string; text: string; href: string; read: boolean };
export type CmsEntry = { id: string; kind: "artikel" | "testimoni" | "galeri"; title: string; category: string; body: string; status: "Draft" | "Terbit"; date: string; image?: string };
export type Staff = { id: string; name: string; email: string; role: string; active: boolean };
export type DemoState = {
  costings: Costing[]; costTemplates: CostTemplate[]; costScenarios: CostScenario[];
  packages: AdminPackage[]; departures: Departure[]; jamaah: Jamaah[]; bookings: Booking[];
  payments: Payment[]; leads: Lead[]; agents: Agent[]; rooms: Room[]; expenses: Expense[];
  inventory: Inventory[]; manasik: Manasik[]; activities: Activity[]; notifications: Notification[];
  cms: CmsEntry[]; users: Staff[]; permissions: Record<string, string[]>;
  settings: Record<string, string>; broadcasts: { id: string; title: string; recipients: number; channel: string; date: string }[];
};
