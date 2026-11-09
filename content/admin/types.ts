import type { Package } from "../types";
import type { Costing, CostScenario, CostTemplate } from "./costing";
import type { HajjPackage, HajjRegistrationStatus, HajjPlanningStatus } from "./hajj";
import type { InventoryState } from "./inventory";
import type { UserRole } from "./roles";
import type { CareerRuleSet, CareerSnapshot, AgentHierarchyEvent, BookingAttribution } from "./career";

export type ProductType = "UMRAH" | "HAJJ_SPECIAL";
export const productLabels: Record<ProductType, string> = { UMRAH: "Umrah", HAJJ_SPECIAL: "Haji Khusus" };
export type AdminPackage = Omit<Package, "departures"> & { productType: "UMRAH"; status: "Draft" | "Terbit" | "Ditutup" | "Arsip" };
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
  contractDescription?: string;
  productType: ProductType; hajjPackageId?: string;
  hajjRegistration?: HajjRegistrationStatus; hajjPlanning?: HajjPlanningStatus;
  priceAssumption?: { currency: "IDR" | "USD" | "SAR"; amount: string; exchangeRate: string; date: string };
  id: string; jamaahId: string; departureId: string; roomType: "Quad" | "Triple" | "Double";
  total: number; date: string; due: string; status: "Aktif" | "Batal";
  attribution?: BookingAttribution;
};
export type Payment = { verifiedAt?: string; reference?: string; id: string; bookingId: string; amount: number; date: string; method: string; status: "Menunggu" | "Terverifikasi" | "Dikembalikan" };
export const leadStages = ["Lead Baru", "Dihubungi", "Follow Up", "Qualified", "Booking", "Won", "Lost"] as const;
export type Lead = {
  id: string; name: string; phone: string; packageId: string; source: string; sales: string;
  stage: typeof leadStages[number]; lastContact: string; followUp: string; notes: string[];
  bookingId?: string; agentId?: string; referralCode?: string;
};
export type Agent = {
  id: string; name: string; phone: string; city: string;
  level: string; commission: number; status: "Menunggu" | "Disetujui" | "Dibayar";
  code: string; parentId: string; joinedAt: string;
  accountStatus: "ACTIVE" | "SUSPENDED" | "INACTIVE";
  levelId: string; email?: string;
};
export type Room = { id: string; departureId: string; hotel: "Makkah" | "Madinah"; number: string; capacity: number; gender: "Laki-laki" | "Perempuan"; jamaahIds: string[] };
export type Expense = { id: string; departureId: string; category: string; vendor: string; amount: number; date: string; status: "Menunggu" | "Dibayar" };
export type Manasik = { id: string; name: string; date: string; time: string; location: string; speaker: string; departureId: string; attendees: string[] };
export type Activity = { id: string; date: string; user: string; module: string; action: string };
export type Notification = { id: string; category: string; title: string; text: string; href: string; read: boolean };
export type CmsEntry = { id: string; kind: "artikel" | "testimoni" | "galeri"; title: string; category: string; body: string; status: "Draft" | "Terbit"; date: string; image?: string };
/** `role` is the legacy display label; `roleId` (storage v3) links the staff member to a demo role. */
export type Staff = { id: string; name: string; email: string; role: string; roleId: UserRole; active: boolean };
export type DemoState = InventoryState & {
  hajjPackages: HajjPackage[];
  costings: Costing[]; costTemplates: CostTemplate[]; costScenarios: CostScenario[];
  packages: AdminPackage[]; departures: Departure[]; jamaah: Jamaah[]; bookings: Booking[];
  payments: Payment[]; leads: Lead[]; agents: Agent[]; rooms: Room[]; expenses: Expense[];
  manasik: Manasik[]; activities: Activity[]; notifications: Notification[];
  cms: CmsEntry[]; users: Staff[]; permissions: Record<string, string[]>;
  settings: Record<string, string>; broadcasts: { id: string; title: string; recipients: number; channel: string; date: string }[];
  careerRuleSets: CareerRuleSet[];
  careerSnapshots: CareerSnapshot[];
  agentHierarchyEvents: AgentHierarchyEvent[];
};
