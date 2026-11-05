import { hajjStatuses, hajjRegistrationStatuses, hajjPlanningStatuses, type HajjPackage } from "@/content/admin/hajj";
import type { Booking, DemoState } from "@/content/admin/types";
import { decimal } from "./costing";
import { bookingFor, uid } from "./model";
import { DEMO_TODAY } from "@/content/admin/seed";

export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function hajjPrice(p: Pick<HajjPackage, "sellingPrice" | "exchangeRate" | "currency">) {
  if (!["IDR", "USD", "SAR"].includes(p.currency)) throw new Error("Mata uang tidak valid.");
  const price = decimal(p.sellingPrice, 2, "Harga jual"), rate = decimal(p.exchangeRate, 6, "Kurs");
  if (price <= BigInt(0) || rate <= BigInt(0) || (p.currency === "IDR" && rate !== BigInt(1000000))) throw new Error("Harga dan kurs harus positif; kurs IDR harus 1.");
  // Shared bookings and payments use whole rupiah; round the contract once, half up.
  const idr = (price * rate + BigInt(50000000)) / BigInt(100000000);
  if (idr <= BigInt(0) || idr > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Harga konversi IDR di luar batas yang didukung.");
  return Number(idr);
}
export function validateHajjPackage(p: HajjPackage, registrations = 0) {
  hajjPrice(p);
  if (!p.id || p.productType !== "HAJJ_SPECIAL" || p.name.trim().length < 3 || p.name.length > 120 || !hajjStatuses.includes(p.status)) throw new Error("Nama paket minimal 3 karakter dan status harus valid.");
  if (!Number.isSafeInteger(p.departureYear) || p.departureYear < 2026 || p.departureYear > 2100) throw new Error("Tahun rencana harus 2026–2100.");
  if (!Number.isSafeInteger(p.capacity) || p.capacity < Math.max(1, registrations) || p.capacity > 10000) throw new Error("Kapasitas harus 1–10.000 dan tidak kurang dari jamaah terdaftar.");
  if (!validDate(p.assumptionDate)) throw new Error("Isi tanggal asumsi kurs yang valid.");
  if (p.departureDate && (!validDate(p.departureDate) || Number(p.departureDate.slice(0, 4)) !== p.departureYear)) throw new Error("Tanggal rencana harus sesuai tahun keberangkatan.");
  if (!p.inclusions.length || !p.requirements.length || [...p.inclusions, ...p.requirements].some(s => !s.trim()) || new Set(p.inclusions).size !== p.inclusions.length || new Set(p.requirements).size !== p.requirements.length || p.requirements.some(s => s in Object.prototype)) throw new Error("Isi fasilitas dan dokumen dengan nama yang valid, tidak kosong atau ganda.");
  if (!p.milestones.length || p.milestones.some(m => !m.name.trim() || !Number.isSafeInteger(m.percent) || m.percent <= 0 || m.percent > 100) || p.milestones.reduce((n, m) => n + m.percent, 0) !== 100) throw new Error("Isi nama tahapan pembayaran dan persentase bulat positif dengan total 100%.");
}
export function saveHajjPackage(state: DemoState, p: HajjPackage) {
  const registrations = state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif").length;
  validateHajjPackage(p, registrations);
  const index = state.hajjPackages.findIndex(k => k.id === p.id);
  if (index < 0) state.hajjPackages.unshift(structuredClone(p));
  else state.hajjPackages[index] = structuredClone(p);
  state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif").forEach(b => {
    const person = state.jamaah.find(j => j.id === b.jamaahId)!;
    p.requirements.forEach(r => { person.documents[r] ??= "Belum ada"; });
  });
}
export function registerHajj(state: DemoState, packageId: string, jamaahId: string) {
  const p = state.hajjPackages.find(p => p.id === packageId);
  if (!p || p.status !== "Open") throw new Error("Paket harus Open untuk menerima pendaftaran.");
  if (!state.jamaah.some(j => j.id === jamaahId) || bookingFor(state, jamaahId)) throw new Error("Pilih jamaah tanpa booking aktif.");
  const count = state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif").length;
  if (count >= p.capacity) throw new Error("Kapasitas paket sudah penuh.");
  validateHajjPackage(p, count);
  const person = state.jamaah.find(j => j.id === jamaahId)!;
  p.requirements.forEach(r => { person.documents[r] ??= "Belum ada"; });
  const booking: Booking = {
    id: uid("BK-HAJ"), contractDescription: p.name, productType: "HAJJ_SPECIAL", hajjPackageId: p.id, departureId: "", jamaahId, roomType: "Quad",
    total: hajjPrice(p), date: DEMO_TODAY, due: "", status: "Aktif", hajjRegistration: "Terdaftar", hajjPlanning: "Belum direncanakan",
    priceAssumption: { currency: p.currency, amount: p.sellingPrice, exchangeRate: p.exchangeRate, date: p.assumptionDate },
  };
  state.bookings.unshift(booking);
  return booking;
}
export function updateHajjRegistration(state: DemoState, bookingId: string, registration: string, planning: string) {
  const b = state.bookings.find(b => b.id === bookingId && b.productType === "HAJJ_SPECIAL" && b.status === "Aktif");
  if (!b || !hajjRegistrationStatuses.includes(registration as NonNullable<Booking["hajjRegistration"]>) || !hajjPlanningStatuses.includes(planning as NonNullable<Booking["hajjPlanning"]>)) throw new Error("Status pendaftaran atau perencanaan tidak valid.");
  b.hajjRegistration = registration as Booking["hajjRegistration"];
  b.hajjPlanning = planning as Booking["hajjPlanning"];
}
