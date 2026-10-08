import type { AdminPackage, Departure } from "./types";

export const costCategories = ["Tiket pesawat", "Hotel Makkah", "Hotel Madinah", "Visa dan administrasi", "Transportasi", "Konsumsi / catering", "Handling dan ground service", "Tour leader / muthawif", "Perlengkapan jamaah", "Asuransi", "Manasik", "Biaya operasional", "Biaya lain-lain"];
export type CostItem = {
  id: string; name: string; category: string; type: "person" | "group" | "unit";
  audience: "all" | "paying" | "foc"; quantity: string; unit: string;
  unitPrice: string; currency: "IDR" | "SAR" | "USD"; exchangeRate: string; notes: string;
};
export type CostPlan = {
  payingCount: number; focCount: number; sellingPrice: string; discountPerPerson: string;
  items: CostItem[]; notes: string;
};
export type Costing = CostPlan & {
  id: string; departureId: string; revision: number; status: "Draft" | "Final";
  finalizedAt?: string;
};
export type CostTemplate = { packageId: string; items: CostItem[] };
export type CostScenario = CostPlan & { id: string; costingId: string; name: string };

export function createCostingSeed(packages: AdminPackage[], departures: Departure[]) {
  const templates: CostTemplate[] = departures.slice(0, 3).map((d, i) => ({
    packageId: d.packageId,
    items: [
      { id: `CI-${i}-flight`, name: "Tiket pulang pergi termasuk pendamping", category: "Tiket pesawat", type: "person", audience: "all", quantity: "1", unit: "tiket", unitPrice: ["11500000", "14500000", "17500000"][i], currency: "IDR", exchangeRate: "1", notes: "Harga contoh, bukan penawaran maskapai." },
      { id: `CI-${i}-makkah`, name: "Hotel Makkah — kamar × malam", category: "Hotel Makkah", type: "unit", audience: "all", quantity: "45", unit: "kamar-malam", unitPrice: "380", currency: "SAR", exchangeRate: "4300", notes: "9 kamar × 5 malam; jumlah unit tetap dalam simulasi, sesuaikan bila rombongan berubah." },
      { id: `CI-${i}-madinah`, name: "Hotel Madinah — kamar × malam", category: "Hotel Madinah", type: "unit", audience: "all", quantity: "27", unit: "kamar-malam", unitPrice: "320", currency: "SAR", exchangeRate: "4300", notes: "9 kamar × 3 malam, termasuk alokasi pendamping." },
      { id: `CI-${i}-visa`, name: "Visa, handling dan asuransi", category: "Visa dan administrasi", type: "person", audience: "all", quantity: "1", unit: "layanan", unitPrice: "160", currency: "USD", exchangeRate: "16000", notes: "Kurs simulasi tersimpan, bukan kurs pasar langsung." },
      { id: `CI-${i}-meals`, name: "Konsumsi perjalanan", category: "Konsumsi / catering", type: "person", audience: "all", quantity: "9", unit: "hari", unitPrice: "150000", currency: "IDR", exchangeRate: "1", notes: "" },
      { id: `CI-${i}-bus`, name: "Bus dan handling rombongan", category: "Transportasi", type: "group", audience: "all", quantity: "1", unit: "grup", unitPrice: "24000000", currency: "IDR", exchangeRate: "1", notes: "Satu bus; tinjau ulang untuk rombongan lebih besar." },
      { id: `CI-${i}-leader`, name: "Honor tour leader dan muthawif", category: "Tour leader / muthawif", type: "group", audience: "all", quantity: "1", unit: "grup", unitPrice: "9000000", currency: "IDR", exchangeRate: "1", notes: "Tiket dan konsumsi pendamping dihitung pada baris seluruh peserta." },
      { id: `CI-${i}-kit`, name: "Perlengkapan jamaah berbayar", category: "Perlengkapan jamaah", type: "person", audience: "paying", quantity: "1", unit: "set", unitPrice: "650000", currency: "IDR", exchangeRate: "1", notes: "" },
    ],
  }));
  const costings: Costing[] = templates.map((template, i) => ({
    id: `HPP-${i + 1}`, departureId: departures[i].id, revision: 1, status: "Draft",
    payingCount: [35, 30, 20][i], focCount: 2,
    sellingPrice: String(packages.find(p => p.id === template.packageId)!.price.quad),
    discountPerPerson: "0", notes: ["Reguler: biaya tetap terbagi ke 35 jamaah.", "Paket dengan tiket lebih mahal dan 30 jamaah.", "Contoh risiko rugi: tiket mahal dan hanya 20 jamaah berbayar."][i],
    items: structuredClone(template.items),
  }));
  return { costTemplates: templates, costings, costScenarios: [] as CostScenario[] };
}
