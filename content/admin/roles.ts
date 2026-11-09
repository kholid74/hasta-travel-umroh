/**
 * Demo role model (M3.1). Single source of truth for role labels, homes, module access,
 * sensitive actions and portal tabs. See docs/HASTA_V2_ROLE_MATRIX.md.
 *
 * DEMO ACCESS, NOT SECURITY: these rules shape navigation and permitted demo actions.
 * Production authorisation must be enforced server-side.
 */
export const roleIds = ["SUPERADMIN", "OWNER", "SALES_CS", "FINANCE", "OPERATIONS", "AGENT", "TOUR_LEADER", "PILGRIM"] as const;
export type UserRole = typeof roleIds[number];
export const isRole = (value: unknown): value is UserRole => typeof value === "string" && (roleIds as readonly string[]).includes(value);

export type ModuleAccess = "read" | "write";
/** Sensitive actions that cut across modules (Role Matrix §4). */
export const actionIds = [
  "lead.create", "booking.create", "booking.cancel",
  "payment.record", "payment.verify",
  "hpp.finalize",
  "commission.approve", "commission.pay",
  "document.upload", "document.verify", "visa.update",
  "notification.read", "demo.reset",
] as const;
export type DemoAction = typeof actionIds[number];
/** `<slug>:write` checks module write access; a bare action id checks a sensitive action. */
export type Permission = `${string}:write` | `${string}:read` | DemoAction;

export type PortalTab = { id: string; label: string; icon: string };
export type RoleDefinition = {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  destination: string;
  shell: "admin" | "portal";
  home: string;
  persona: { kind: "staff" | "agent" | "pilgrim" | "tourLeader"; defaultId: string };
  modules: Readonly<Record<string, ModuleAccess>>;
  actions: readonly DemoAction[];
  portalTabs?: readonly PortalTab[];
};

const ALL_SLUGS = ["dashboard", "panduan", "crm", "booking", "jamaah", "paket", "haji-khusus", "keberangkatan", "manifest", "dokumen", "rooming", "manasik", "transportasi", "hpp", "pembayaran", "invoice", "pengeluaran", "komisi", "agen", "vendor", "perlengkapan", "broadcast", "notifikasi", "laporan", "analytics", "website-paket", "artikel", "testimoni", "galeri", "leads-website", "users", "aktivitas", "settings"] as const;
const access = (read: readonly string[], write: readonly string[] = []): Record<string, ModuleAccess> => ({
  ...Object.fromEntries(read.map(slug => [slug, "read" as const])),
  ...Object.fromEntries(write.map(slug => [slug, "write" as const])),
});
// Every staff role may mark its own notifications as read (personal UI state, not business data).
const STAFF_BASE = ["dashboard", "panduan", "notifikasi"] as const;

export const roles: Readonly<Record<UserRole, RoleDefinition>> = {
  SUPERADMIN: {
    id: "SUPERADMIN", label: "Superadmin", shortLabel: "Superadmin",
    description: "Seluruh modul workspace, pengaturan, dan reset data demo.",
    destination: "Dashboard lengkap · 33 modul",
    shell: "admin", home: "/admin/dashboard", persona: { kind: "staff", defaultId: "USR-1" },
    modules: access([], ALL_SLUGS),
    actions: actionIds,
  },
  OWNER: {
    id: "OWNER", label: "Owner / Direktur", shortLabel: "Owner",
    description: "Ringkasan eksekutif, keuangan, kesiapan keberangkatan, dan persetujuan.",
    destination: "Dashboard eksekutif",
    shell: "admin", home: "/admin/dashboard", persona: { kind: "staff", defaultId: "USR-4" },
    modules: access(ALL_SLUGS.filter(s => s !== "settings"), ["notifikasi", "paket", "haji-khusus", "hpp", "settings"]),
    actions: ["booking.cancel", "hpp.finalize", "commission.approve", "notification.read"],
  },
  SALES_CS: {
    id: "SALES_CS", label: "Sales & Customer Service", shortLabel: "Sales & CS",
    description: "Lead, follow-up, booking, pendaftaran Haji, dan pencatatan pembayaran.",
    destination: "Dashboard penjualan",
    shell: "admin", home: "/admin/dashboard", persona: { kind: "staff", defaultId: "USR-2" },
    modules: access(
      [...STAFF_BASE, "paket", "keberangkatan", "manifest", "rooming", "manasik", "invoice", "agen", "perlengkapan", "laporan", "analytics"],
      ["notifikasi", "crm", "booking", "jamaah", "haji-khusus", "dokumen", "pembayaran", "broadcast", "website-paket", "artikel", "testimoni", "galeri", "leads-website"],
    ),
    actions: ["lead.create", "booking.create", "payment.record", "document.upload", "notification.read"],
  },
  FINANCE: {
    id: "FINANCE", label: "Finance", shortLabel: "Finance",
    description: "Verifikasi pembayaran, piutang, invoice, pengeluaran, HPP, dan komisi.",
    destination: "Dashboard keuangan",
    shell: "admin", home: "/admin/dashboard", persona: { kind: "staff", defaultId: "USR-3" },
    modules: access(
      [...STAFF_BASE, "booking", "jamaah", "paket", "haji-khusus", "keberangkatan", "agen", "perlengkapan", "laporan", "analytics", "aktivitas", "settings"],
      ["notifikasi", "hpp", "pembayaran", "invoice", "pengeluaran", "komisi", "vendor"],
    ),
    actions: ["payment.record", "payment.verify", "booking.cancel", "commission.pay", "notification.read"],
  },
  OPERATIONS: {
    id: "OPERATIONS", label: "Operasional", shortLabel: "Operasional",
    description: "Kesiapan keberangkatan, dokumen & visa, manifest, kamar, dan perlengkapan.",
    destination: "Dashboard operasional",
    shell: "admin", home: "/admin/dashboard", persona: { kind: "staff", defaultId: "USR-5" },
    modules: access(
      [...STAFF_BASE, "crm", "booking", "hpp", "pengeluaran", "vendor", "laporan", "analytics"],
      ["notifikasi", "jamaah", "paket", "haji-khusus", "keberangkatan", "manifest", "dokumen", "rooming", "manasik", "transportasi", "perlengkapan", "broadcast"],
    ),
    actions: ["document.upload", "document.verify", "visa.update", "notification.read"],
  },
  AGENT: {
    id: "AGENT", label: "Agen / Mitra", shortLabel: "Agen",
    description: "Portal mitra: jamaah binaan, komisi, dan jaringan.",
    destination: "Portal agen · ponsel",
    shell: "portal", home: "/portal/agen", persona: { kind: "agent", defaultId: "AGT-001" },
    modules: {}, actions: [],
    portalTabs: [{ id: "", label: "Beranda", icon: "home" }, { id: "jamaah", label: "Jamaah", icon: "users" }, { id: "tim", label: "Tim", icon: "network" }, { id: "karier", label: "Karier", icon: "award" }, { id: "lainnya", label: "Lainnya", icon: "menu" }],
  },
  TOUR_LEADER: {
    id: "TOUR_LEADER", label: "Tour Leader", shortLabel: "Tour Leader",
    description: "Portal lapangan: rombongan, presensi, itinerary, dan insiden.",
    destination: "Portal tour leader · ponsel",
    shell: "portal", home: "/portal/tour-leader", persona: { kind: "tourLeader", defaultId: "USR-6" },
    modules: {}, actions: [],
    portalTabs: [{ id: "", label: "Hari ini", icon: "home" }, { id: "rombongan", label: "Rombongan", icon: "users" }, { id: "presensi", label: "Presensi", icon: "check" }, { id: "insiden", label: "Insiden", icon: "alert" }, { id: "lainnya", label: "Lainnya", icon: "menu" }],
  },
  PILGRIM: {
    id: "PILGRIM", label: "Jamaah", shortLabel: "Jamaah",
    description: "Portal jamaah: pendaftaran, pembayaran, dokumen, dan perjalanan.",
    destination: "Portal jamaah · ponsel",
    shell: "portal", home: "/portal/jamaah", persona: { kind: "pilgrim", defaultId: "JMH-10288" },
    modules: {}, actions: [],
    portalTabs: [{ id: "", label: "Beranda", icon: "home" }, { id: "pembayaran", label: "Pembayaran", icon: "wallet" }, { id: "dokumen", label: "Dokumen", icon: "file" }, { id: "perjalanan", label: "Perjalanan", icon: "plane" }, { id: "lainnya", label: "Lainnya", icon: "menu" }],
  },
};

/** Portal URL segment per portal role. */
export const portalSlug: Partial<Record<UserRole, string>> = { AGENT: "agen", TOUR_LEADER: "tour-leader", PILGRIM: "jamaah" };

/** Staff personas added in storage v3 (M3.1). Names deliberately do not collide with seed jamaah. */
export const personaUsers = [
  { id: "USR-4", name: "Zainal Abidin", email: "zainal@hasta.example", role: "Owner", roleId: "OWNER" as const, active: true },
  { id: "USR-5", name: "Wulan Sari", email: "wulan@hasta.example", role: "Operations", roleId: "OPERATIONS" as const, active: true },
  { id: "USR-6", name: "Ust. Harun Rasyid", email: "harun@hasta.example", role: "Tour Leader", roleId: "TOUR_LEADER" as const, active: true },
];

/** Legacy free-text staff role labels → role ids (used by the v2→v3 migration and the Users screen). */
export const roleIdFromLabel = (label: string): UserRole => ({
  "Super Admin": "SUPERADMIN", Owner: "OWNER", Sales: "SALES_CS", Finance: "FINANCE",
  Operations: "OPERATIONS", "Document Officer": "OPERATIONS", "Tour Leader": "TOUR_LEADER",
} as Record<string, UserRole>)[label] ?? "OPERATIONS";
