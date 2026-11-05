import type { CostItem } from "./costing";

export const hajjStatuses = ["Draft", "Open", "Closed", "Archived"] as const;
export const hajjRegistrationStatuses = ["Minat", "Terdaftar", "Dikonfirmasi"] as const;
export const hajjPlanningStatuses = ["Belum direncanakan", "Persiapan", "Siap ditinjau", "Selesai"] as const;
export type HajjRegistrationStatus = typeof hajjRegistrationStatuses[number];
export type HajjPlanningStatus = typeof hajjPlanningStatuses[number];
export type HajjPackage = {
  id: string; productType: "HAJJ_SPECIAL"; name: string; status: typeof hajjStatuses[number];
  currency: "IDR" | "USD" | "SAR"; sellingPrice: string; exchangeRate: string; assumptionDate: string;
  departureYear: number; departureDate: string; capacity: number; inclusions: string[];
  requirements: string[]; milestones: { name: string; percent: number }[];
  planningNotes: string;
};

export function hajjCostItems(prefix: string): CostItem[] {
  const row = (key: string, name: string, category: string, type: CostItem["type"], unitPrice: string, currency: CostItem["currency"], exchangeRate: string): CostItem => ({ id: `${prefix}-${key}`, name, category, type, audience: "paying", quantity: "1", unit: type === "person" ? "jamaah" : "grup", unitPrice, currency, exchangeRate, notes: "Asumsi demo; perlu validasi operasional dan penawaran vendor." });
  return [
    row("flight", "Penerbangan Haji pulang pergi", "Tiket pesawat", "person", "22000000", "IDR", "1"),
    row("stay", "Akomodasi dan konsumsi Haji", "Akomodasi Haji", "person", "14000", "SAR", "4300"),
    row("services", "Layanan lapangan Haji (ilustrasi)", "Layanan Haji", "person", "3200", "USD", "16000"),
    row("group", "Transportasi dan pendampingan grup", "Transportasi", "group", "120000000", "IDR", "1"),
    row("commission", "Komisi agen rencana", "Komisi agen", "person", "3000000", "IDR", "1"),
    row("reserve", "Cadangan biaya grup", "Kontingensi", "group", "30000000", "IDR", "1"),
    row("ops", "Administrasi operasional tambahan", "Biaya operasional", "group", "15000000", "IDR", "1"),
  ];
}

export function createHajjSeed(): HajjPackage[] {
  return [
    { id: "HAJ-2028-A", productType: "HAJJ_SPECIAL", name: "Haji Khusus Amanah 2028 — Demo", status: "Open", currency: "USD", sellingPrice: "12500", exchangeRate: "16000", assumptionDate: "2026-10-02", departureYear: 2028, departureDate: "", capacity: 30, inclusions: ["Akomodasi Makkah dan Madinah", "Pendampingan ibadah", "Transportasi dan konsumsi"], requirements: ["KTP", "KK", "Paspor", "Foto"], milestones: [{ name: "Konfirmasi rencana", percent: 20 }, { name: "Persiapan layanan", percent: 30 }, { name: "Pelunasan sesuai kesepakatan", percent: 50 }], planningNotes: "Tahun dan layanan hanya rencana demo. Tanggal, kelayakan, dokumen dan skema pembayaran perlu validasi operasional; bukan kepastian keberangkatan atau ketentuan pemerintah." },
    { id: "HAJ-2029-B", productType: "HAJJ_SPECIAL", name: "Haji Khusus Keluarga 2029 — Demo", status: "Draft", currency: "IDR", sellingPrice: "215000000", exchangeRate: "1", assumptionDate: "2026-10-02", departureYear: 2029, departureDate: "", capacity: 24, inclusions: ["Akomodasi keluarga", "Pendampingan ibadah"], requirements: ["KTP", "Paspor"], milestones: [{ name: "Konfirmasi rencana", percent: 25 }, { name: "Pelunasan sesuai kesepakatan", percent: 75 }], planningNotes: "Paket fiktif untuk simulasi perencanaan. Tidak memuat nomor porsi, estimasi antrean resmi atau koneksi sistem pemerintah." },
  ];
}
