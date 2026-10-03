import type { Booking, DemoState, Jamaah, Room } from "@/content/admin/types";
import { DEMO_TODAY, newJamaah } from "@/content/admin/seed";

export const uid = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export const dateLabel = (iso: string) => iso ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso.slice(0, 10) + "T00:00:00Z")) : "Belum diisi";
export const members = (s: DemoState, departureId: string) => s.bookings.filter(b => b.departureId === departureId && b.status === "Aktif").map(b => s.jamaah.find(j => j.id === b.jamaahId)!);
export const bookingFor = (s: DemoState, jamaahId: string) => s.bookings.find(b => b.jamaahId === jamaahId && b.status === "Aktif");
export const paid = (s: DemoState, bookingId: string) => s.payments.filter(p => p.bookingId === bookingId && p.status === "Terverifikasi").reduce((n, p) => n + p.amount, 0);
export const outstanding = (s: DemoState, b: Booking) => b.status === "Batal" ? 0 : Math.max(0, b.total - paid(s, b.id));
export function paymentStatus(s: DemoState, b: Booking) {
  if (b.status === "Batal") return "Batal";
  const amount = paid(s, b.id);
  if (amount >= b.total) return "Lunas";
  if (b.due < DEMO_TODAY) return "Jatuh tempo";
  return amount === 0 ? "Belum bayar" : amount <= 10000000 ? "DP" : "Cicilan";
}
export const documentPercent = (j: Jamaah) => Math.round(Object.values(j.documents).filter(s => s === "Terverifikasi").length / Object.keys(j.documents).length * 100);
export const validPassport = (j: Jamaah, departureDate: string) => Boolean(j.passport && j.passportExpiry && new Date(j.passportExpiry).getTime() - new Date(departureDate).getTime() > 180 * 86400000);
export function readiness(s: DemoState, departureId: string) {
  const d = s.departures.find(d => d.id === departureId)!;
  const people = members(s, departureId);
  const ratio = (fn: (j: Jamaah) => boolean) => people.length ? Math.round(people.filter(fn).length / people.length * 100) : 0;
  const checks: Record<string, number> = {
    "Jamaah terkonfirmasi": people.length ? 100 : 0,
    Pembayaran: ratio(j => { const b = bookingFor(s, j.id); return Boolean(b && outstanding(s, b) === 0); }),
    Paspor: ratio(j => j.documents.Paspor === "Terverifikasi" && validPassport(j, d.date)),
    Visa: ratio(j => j.visa === "Disetujui"),
    Kamar: ratio(j => ["Makkah", "Madinah"].every(h => s.rooms.some(r => r.departureId === departureId && r.hotel === h && r.jamaahIds.includes(j.id)))),
    Manasik: ratio(j => s.manasik.some(e => e.departureId === departureId && e.attendees.includes(j.id))),
    Perlengkapan: ratio(j => s.inventory.every(i => j.equipment.includes(i.name))),
    ...Object.fromEntries(Object.entries(d.checks).map(([k, v]) => [k, v ? 100 : 0])),
  };
  return { checks, percent: Math.round(Object.values(checks).reduce((a, b) => a + b, 0) / Object.keys(checks).length) };
}
export function manifestReady(s: DemoState, j: Jamaah, departureId: string) {
  const d = s.departures.find(d => d.id === departureId)!;
  const b = bookingFor(s, j.id);
  return Boolean(j.nik && j.birthDate && documentPercent(j) === 100 && validPassport(j, d.date) && j.visa === "Disetujui" && b && outstanding(s, b) === 0 && d.checks["Tiket pesawat"]);
}
export function addBooking(s: DemoState, jamaahId: string, departureId: string, roomType: Booking["roomType"] = "Quad") {
  const d = s.departures.find(d => d.id === departureId);
  const p = s.packages.find(p => p.id === d?.packageId);
  if (!d || !p || !s.jamaah.some(j => j.id === jamaahId)) throw new Error("Pilih jamaah dan keberangkatan yang valid.");
  if (p.status !== "Terbit" || d.status !== "Persiapan") throw new Error("Pendaftaran keberangkatan ini sudah ditutup.");
  if (bookingFor(s, jamaahId)) throw new Error("Jamaah sudah memiliki booking aktif.");
  if (members(s, departureId).length >= d.capacity) throw new Error("Kapasitas keberangkatan sudah penuh.");
  const booking: Booking = { id: uid("BK"), jamaahId, departureId, roomType, total: p.price[roomType.toLowerCase() as "quad" | "triple" | "double"], date: DEMO_TODAY, due: d.date, status: "Aktif" };
  s.bookings.unshift(booking);
  return booking;
}
export function convertLead(s: DemoState, leadId: string, departureId: string) {
  const lead = s.leads.find(l => l.id === leadId);
  if (!lead || lead.bookingId) throw new Error("Lead tidak tersedia atau sudah menjadi booking.");
  const d = s.departures.find(d => d.id === departureId);
  if (!d || d.packageId !== lead.packageId) throw new Error("Pilih keberangkatan dari paket yang diminati.");
  const j = newJamaah(uid("JMH"), lead.name, lead.phone);
  s.jamaah.unshift(j);
  const b = addBooking(s, j.id, departureId);
  lead.stage = "Booking";
  lead.bookingId = b.id;
  return b;
}
export function recordPayment(s: DemoState, bookingId: string, amount: number, method: string) {
  const b = s.bookings.find(b => b.id === bookingId);
  if (!b || b.status !== "Aktif") throw new Error("Booking tidak aktif.");
  const pending = s.payments.filter(p => p.bookingId === b.id && p.status === "Menunggu").reduce((n, p) => n + p.amount, 0);
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > outstanding(s, b) - pending) throw new Error("Nominal harus lebih dari nol dan tidak melebihi sisa tagihan setelah pembayaran tertunda.");
  s.payments.unshift({ id: uid("PAY"), bookingId, amount, date: DEMO_TODAY, method, status: "Menunggu" });
}
export function verifyPayment(s: DemoState, id: string) {
  const p = s.payments.find(p => p.id === id);
  if (!p || p.status !== "Menunggu") throw new Error("Pembayaran sudah diproses.");
  const b = s.bookings.find(b => b.id === p.bookingId)!;
  if (b.status !== "Aktif" || p.amount > outstanding(s, b)) throw new Error("Pembayaran melebihi sisa tagihan atau booking dibatalkan.");
  p.status = "Terverifikasi";
  const lead = s.leads.find(l => l.bookingId === b.id);
  if (lead && outstanding(s, b) === 0) lead.stage = "Won";
}
export function assignRoom(s: DemoState, jamaahId: string, roomId: string) {
  const room = s.rooms.find(r => r.id === roomId);
  const j = s.jamaah.find(j => j.id === jamaahId);
  if (!room || !j || !members(s, room.departureId).some(p => p.id === j.id)) throw new Error("Jamaah bukan anggota keberangkatan ini.");
  if (room.jamaahIds.includes(j.id)) return;
  if (room.gender !== j.gender) throw new Error("Jenis kelamin jamaah tidak sesuai kamar.");
  if (room.jamaahIds.length >= room.capacity) throw new Error("Kamar sudah penuh.");
  s.rooms.filter(r => r.departureId === room.departureId && r.hotel === room.hotel).forEach(r => { r.jamaahIds = r.jamaahIds.filter(id => id !== j.id); });
  room.jamaahIds.push(j.id);
}
export function autoAssign(s: DemoState, departureId: string, hotel: Room["hotel"]) {
  for (const j of members(s, departureId)) {
    if (s.rooms.some(r => r.departureId === departureId && r.hotel === hotel && r.jamaahIds.includes(j.id))) continue;
    const room = s.rooms.find(r => r.departureId === departureId && r.hotel === hotel && r.gender === j.gender && r.jamaahIds.length < r.capacity);
    if (room) assignRoom(s, j.id, room.id);
  }
}
export function distribute(s: DemoState, jamaahIds: string[], itemName: string) {
  const item = s.inventory.find(i => i.name === itemName);
  if (!item) throw new Error("Barang tidak ditemukan.");
  const people = s.jamaah.filter(j => jamaahIds.includes(j.id) && !j.equipment.includes(itemName));
  const distributed = s.jamaah.filter(j => j.equipment.includes(itemName)).length;
  if (people.length > item.stock - distributed) throw new Error("Stok tidak cukup. Tambahkan stok sebelum distribusi.");
  people.forEach(j => j.equipment.push(itemName));
}
