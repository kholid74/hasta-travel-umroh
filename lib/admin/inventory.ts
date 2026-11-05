import type { DemoState } from "@/content/admin/types";
import { snapshotItem, type Handover, type InventoryItem, type PilgrimKitAllocation, type PilgrimKitTemplate, type StockMovement } from "@/content/admin/inventory";
import { packageForBooking, uid } from "./model";
import { validDate } from "./hajj";
import type { HandoverPDFModel } from "./financial-pdf";
import { dateLabel } from "./model";
import { productLabels } from "@/content/admin/types";

export function handoverDocument(s: DemoState, id: string): HandoverPDFModel {
  const h = s.handovers.find(h => h.id === id);
  if (!h) throw new Error("Bukti serah terima belum diposting atau telah direset.");
  validateInventory(s);
  return { id: h.receiptNumber, kind: "handover", title: "Serah Terima Kit", presentation: {
    customer: h.pilgrimName, phone: "", bookingId: h.bookingId, product: productLabels[h.productType], description: h.packageName,
    legacyDescription: false, issued: dateLabel(h.receivedAt), generated: dateLabel(h.receivedAt), due: "", status: "Serah terima · DEMO",
    assumptions: "Bukti ini hanya mencakup barang dan kuantitas pada penyerahan ini. Penyerahan parsial atau berikutnya memiliki bukti tersendiri. Tidak menyatakan tanda tangan digital atau persetujuan hukum.", instructions: "",
    recipient: h.receivedBy, receivedAt: dateLabel(h.receivedAt), operator: h.operatorId, warehouse: h.warehouseName, notes: h.notes, items: structuredClone(h.items),
  } };
}

export const movementLabels = { OPENING: "Saldo awal", RECEIPT: "Barang masuk", HANDOVER: "Serah terima", RETURN: "Retur", ADJUSTMENT_IN: "Koreksi masuk", ADJUSTMENT_OUT: "Koreksi keluar" };
export const allocationLabels = { ALLOCATED: "Dialokasikan", PARTIAL: "Sebagian diterima", COMPLETED: "Selesai", RELEASED: "Sisa dirilis" };
const positive = (n: number) => { if (!Number.isSafeInteger(n) || n < 1 || n > 10000000) throw new Error("Kuantitas harus bilangan bulat 1–10.000.000."); };
const nonnegative = (n: number) => { if (!Number.isSafeInteger(n) || n < 0) throw new Error("Kuantitas tidak valid."); };
function dated(value: string) { if (!validDate(value.slice(0, 10))) throw new Error("Tanggal transaksi tidak valid."); }
function location(s: DemoState, id: string) { const w = s.warehouses.find(w => w.id === id && w.active); if (!w) throw new Error("Pilih gudang aktif yang valid."); return w; }
function item(s: DemoState, id: string) { const i = s.inventory.find(i => i.id === id); if (!i) throw new Error("Barang tidak ditemukan."); return i; }
export const delivered = (s: DemoState, allocationId: string, itemId: string) => s.handovers.filter(h => h.allocationId === allocationId).reduce((n, h) => n + (h.items.find(i => i.itemId === itemId)?.quantity ?? 0), 0);
export const remaining = (s: DemoState, a: PilgrimKitAllocation, itemId: string) => { const i = a.allocatedItems.find(i => i.itemId === itemId)!; return i.quantity - i.releasedQuantity - delivered(s, a.id, itemId); };
export function stockBalance(s: DemoState, itemId: string, warehouseId: string) {
  const physical = s.stockMovements.filter(m => m.itemId === itemId && m.warehouseId === warehouseId).reduce((n, m) => n + (["HANDOVER", "ADJUSTMENT_OUT"].includes(m.type) ? -m.quantity : m.quantity), 0);
  const reserved = s.kitAllocations.filter(a => a.warehouseId === warehouseId).reduce((n, a) => n + (a.allocatedItems.some(i => i.itemId === itemId) ? remaining(s, a, itemId) : 0), 0);
  return { physical, reserved, available: physical - reserved };
}
export const kitReady = (s: DemoState, bookingId: string) => { const records = s.kitAllocations.filter(a => a.bookingId === bookingId); return records.length > 0 && records.every(a => a.status === "COMPLETED"); };
export function saveInventoryItem(s: DemoState, value: InventoryItem) {
  if (!value.id || !value.sku.trim() || value.name.trim().length < 3 || !value.category.trim() || !value.unit.trim()) throw new Error("Lengkapi SKU, nama, kategori dan satuan barang.");
  nonnegative(value.minimumStock);
  if (s.inventory.some(i => i.id !== value.id && i.sku.toLowerCase() === value.sku.trim().toLowerCase())) throw new Error("SKU sudah digunakan.");
  const previous = s.inventory.find(i => i.id === value.id);
  if (previous && previous.unit !== value.unit && s.stockMovements.some(m => m.itemId === value.id)) throw new Error("Satuan barang yang sudah memiliki ledger tidak dapat diubah.");
  const next = { ...value, name: value.name.trim(), sku: value.sku.trim() };
  if (previous) Object.assign(previous, next); else s.inventory.push(next);
}
export function saveKitTemplate(s: DemoState, value: PilgrimKitTemplate) {
  if (!value.id || value.name.trim().length < 3 || !["UMRAH", "HAJJ_SPECIAL"].includes(value.productType) || !value.items.length || new Set(value.items.map(i => i.itemId)).size !== value.items.length) throw new Error("Lengkapi template dengan barang unik dan produk yang valid.");
  value.items.forEach(i => { positive(i.requiredQuantity); if (!item(s, i.itemId).active && value.active) throw new Error("Template aktif harus memakai barang aktif."); });
  const previous = s.kitTemplates.find(t => t.id === value.id);
  if (previous) Object.assign(previous, structuredClone(value)); else s.kitTemplates.push(structuredClone(value));
}
export function allocateKit(s: DemoState, bookingId: string, templateId: string, warehouseId: string, id = uid("ALLOC")) {
  const b = s.bookings.find(b => b.id === bookingId && b.status === "Aktif"), t = s.kitTemplates.find(t => t.id === templateId && t.active);
  location(s, warehouseId);
  if (!b || !t || b.productType !== t.productType) throw new Error("Pilih booking aktif dan template sesuai produk.");
  if (s.kitAllocations.some(a => a.id === id || (a.bookingId === bookingId && a.templateId === templateId))) throw new Error("Kit ini sudah pernah dialokasikan pada booking tersebut.");
  const product = packageForBooking(s, b), pilgrim = s.jamaah.find(j => j.id === b.jamaahId);
  if (!product || !pilgrim) throw new Error("Asosiasi booking tidak lengkap.");
  saveKitTemplate(structuredClone(s), t);
  const allocatedItems = t.items.map(i => {
    if (stockBalance(s, i.itemId, warehouseId).available < i.requiredQuantity) throw new Error(`Stok tersedia ${item(s, i.itemId).name} tidak cukup.`);
    return { ...snapshotItem(item(s, i.itemId)), quantity: i.requiredQuantity, releasedQuantity: 0 };
  });
  const a: PilgrimKitAllocation = { id, bookingId, pilgrimId: b.jamaahId, productType: b.productType, packageId: product.id, departureId: b.departureId, packageName: b.contractDescription || product.name, pilgrimName: pilgrim.name, templateId, templateName: t.name, warehouseId, allocatedItems, status: "ALLOCATED" };
  s.kitAllocations.push(a); return a;
}
export function postMovement(s: DemoState, input: { id: string; itemId: string; warehouseId: string; type: "RECEIPT" | "ADJUSTMENT_IN" | "ADJUSTMENT_OUT"; quantity: number; createdAt: string; note: string; referenceId: string }) {
  const i = item(s, input.itemId); location(s, input.warehouseId); positive(input.quantity); dated(input.createdAt);
  if (!["RECEIPT", "ADJUSTMENT_IN", "ADJUSTMENT_OUT"].includes(input.type) || !input.id || s.stockMovements.some(m => m.id === input.id)) throw new Error("Jenis transaksi tidak valid atau transaksi sudah diposting.");
  if (input.type !== "RECEIPT" && !input.note.trim()) throw new Error("Koreksi stok wajib disertai alasan.");
  if (input.type === "RECEIPT" && !i.active) throw new Error("Barang nonaktif tidak menerima stok baru.");
  if (input.type === "ADJUSTMENT_OUT" && stockBalance(s, i.id, input.warehouseId).available < input.quantity) throw new Error("Koreksi keluar melebihi stok tersedia; rilis reservasi dahulu.");
  s.stockMovements.push({ ...input, referenceType: "MANUAL", operatorId: "USR-1", itemSnapshot: snapshotItem(i) });
}
export function postHandover(s: DemoState, input: { id: string; allocationId: string; quantities: { itemId: string; quantity: number }[]; receivedBy: string; receivedAt: string; notes: string }) {
  const a = s.kitAllocations.find(a => a.id === input.allocationId);
  if (!a || !s.bookings.some(b => b.id === a.bookingId && b.status === "Aktif")) throw new Error("Booking tidak aktif atau alokasi tidak ditemukan.");
  const w = location(s, a.warehouseId);
  if (!input.id || s.handovers.some(h => h.id === input.id) || s.stockMovements.some(m => m.referenceId === input.id)) throw new Error("Serah terima sudah diposting. Jangan mengirim ulang.");
  if (!input.receivedBy.trim() || input.receivedBy.length > 120) throw new Error("Isi nama penerima, maksimal 120 karakter.");
  dated(input.receivedAt);
  if (!input.quantities.length || new Set(input.quantities.map(i => i.itemId)).size !== input.quantities.length) throw new Error("Pilih minimal satu barang unik untuk diserahkan.");
  const items = input.quantities.map(i => {
    positive(i.quantity);
    const allocated = a.allocatedItems.find(k => k.itemId === i.itemId);
    if (!allocated || remaining(s, a, i.itemId) < i.quantity || stockBalance(s, i.itemId, a.warehouseId).physical < i.quantity) throw new Error("Jumlah serah terima melebihi sisa alokasi atau stok fisik.");
    return { itemId: allocated.itemId, name: allocated.name, sku: allocated.sku, unit: allocated.unit, variant: allocated.variant, quantity: i.quantity };
  });
  const h: Handover = { id: input.id, allocationId: a.id, pilgrimId: a.pilgrimId, bookingId: a.bookingId, warehouseId: a.warehouseId, receivedBy: input.receivedBy.trim(), receivedAt: input.receivedAt, operatorId: "USR-1", items, notes: input.notes, receiptNumber: `DEMO-KIT-${input.id}`, pilgrimName: a.pilgrimName, packageName: a.packageName, productType: a.productType, warehouseName: w.name, templateName: a.templateName };
  s.handovers.push(h);
  items.forEach(i => s.stockMovements.push({ id: `${input.id}-${i.itemId}`, itemId: i.itemId, type: "HANDOVER", quantity: i.quantity, warehouseId: a.warehouseId, referenceType: "HANDOVER", referenceId: h.id, createdAt: h.receivedAt, note: h.notes, operatorId: h.operatorId, itemSnapshot: { itemId: i.itemId, name: i.name, sku: i.sku, unit: i.unit, variant: i.variant } }));
  a.status = a.allocatedItems.every(i => remaining(s, a, i.itemId) === 0) ? "COMPLETED" : "PARTIAL";
  return h;
}
export function releaseAllocation(s: DemoState, allocationId: string) {
  const a = s.kitAllocations.find(a => a.id === allocationId);
  if (!a || !a.allocatedItems.some(i => remaining(s, a, i.itemId) > 0)) throw new Error("Tidak ada sisa reservasi yang dapat dirilis.");
  a.allocatedItems.forEach(i => { i.releasedQuantity += remaining(s, a, i.itemId); }); a.status = "RELEASED";
}
export function postReturn(s: DemoState, input: { id: string; handoverId: string; itemId: string; quantity: number; condition: "REUSABLE" | "DAMAGED"; createdAt: string; note: string }) {
  const h = s.handovers.find(h => h.id === input.handoverId), original = h?.items.find(i => i.itemId === input.itemId);
  positive(input.quantity); dated(input.createdAt);
  if (!h || !original || !input.note.trim() || !["REUSABLE", "DAMAGED"].includes(input.condition)) throw new Error("Pilih bukti/barang yang valid, kondisi dan alasan retur.");
  if (!input.id || s.stockMovements.some(m => m.id === input.id || m.id === `${input.id}-DISPOSE`)) throw new Error("Retur sudah diposting.");
  const returned = s.stockMovements.filter(m => m.type === "RETURN" && m.referenceId === h.id && m.itemId === input.itemId).reduce((n, m) => n + m.quantity, 0);
  if (returned + input.quantity > original.quantity) throw new Error("Retur melebihi jumlah yang pernah diserahkan.");
  const m: StockMovement = { id: input.id, itemId: input.itemId, type: "RETURN", quantity: input.quantity, warehouseId: h.warehouseId, referenceType: "HANDOVER_RETURN", referenceId: h.id, createdAt: input.createdAt, note: input.note, operatorId: "USR-1", condition: input.condition, itemSnapshot: { itemId: original.itemId, name: original.name, sku: original.sku, unit: original.unit, variant: original.variant } };
  s.stockMovements.push(m);
  if (input.condition === "DAMAGED") s.stockMovements.push({ ...m, id: `${input.id}-DISPOSE`, type: "ADJUSTMENT_OUT", referenceType: "DAMAGED_RETURN", referenceId: input.id, note: `Tidak layak pakai, dikeluarkan dari stok: ${input.note}` });
}

export function validateInventory(s: DemoState) {
  if (!s.warehouses.length || !s.warehouses.some(w => w.active) || s.warehouses.some(w => !w.name.trim() || !w.locationLabel.trim() || typeof w.active !== "boolean")) throw new Error("Gudang demo tidak valid.");
  for (const list of [s.inventory, s.warehouses, s.kitTemplates, s.kitAllocations, s.handovers, s.stockMovements]) if (!Array.isArray(list) || list.length > 10000 || list.some(i => !i.id) || new Set(list.map(i => i.id)).size !== list.length) throw new Error("ID inventory tidak valid atau ganda.");
  if (new Set(s.inventory.map(i => i.sku.toLowerCase())).size !== s.inventory.length) throw new Error("SKU ganda.");
  s.inventory.forEach(i => { nonnegative(i.minimumStock); if (!i.sku.trim() || !i.name.trim() || !i.unit.trim() || typeof i.active !== "boolean") throw new Error("Master barang tidak valid."); });
  s.stockMovements.forEach(m => {
    item(s, m.itemId); if (!s.warehouses.some(w => w.id === m.warehouseId) || !s.users.some(u => u.id === m.operatorId) || !Object.hasOwn(movementLabels, m.type)) throw new Error("Referensi pergerakan tidak valid.");
    positive(m.quantity); dated(m.createdAt);
    if (!m.itemSnapshot || m.itemSnapshot.itemId !== m.itemId || !m.itemSnapshot.name || !m.itemSnapshot.unit) throw new Error("Snapshot barang tidak lengkap.");
    if (m.type.startsWith("ADJUSTMENT") && !m.note.trim()) throw new Error("Koreksi wajib memiliki alasan.");
  });
  s.kitTemplates.forEach(t => { if (!t.items.length || !["UMRAH", "HAJJ_SPECIAL"].includes(t.productType) || new Set(t.items.map(i => i.itemId)).size !== t.items.length) throw new Error("Template tidak valid."); t.items.forEach(i => { item(s, i.itemId); positive(i.requiredQuantity); }); });
  const pairs = new Set<string>();
  s.kitAllocations.forEach(a => {
    const b = s.bookings.find(b => b.id === a.bookingId);
    if (!b || b.jamaahId !== a.pilgrimId || b.productType !== a.productType || a.packageId !== packageForBooking(s, b)?.id || a.departureId !== b.departureId || !s.jamaah.some(j => j.id === a.pilgrimId) || !s.kitTemplates.some(t => t.id === a.templateId) || !s.warehouses.some(w => w.id === a.warehouseId) || !a.allocatedItems.length || new Set(a.allocatedItems.map(i => i.itemId)).size !== a.allocatedItems.length) throw new Error("Relasi alokasi tidak valid.");
    const key = `${a.bookingId}:${a.templateId}`; if (pairs.has(key)) throw new Error("Duplikasi alokasi kit."); pairs.add(key);
    a.allocatedItems.forEach(i => { item(s, i.itemId); positive(i.quantity); nonnegative(i.releasedQuantity); if (remaining(s, a, i.itemId) < 0) throw new Error("Penyerahan/rilis melebihi alokasi."); });
    const status = a.allocatedItems.some(i => i.releasedQuantity > 0) ? "RELEASED" : a.allocatedItems.every(i => remaining(s, a, i.itemId) === 0) ? "COMPLETED" : s.handovers.some(h => h.allocationId === a.id) ? "PARTIAL" : "ALLOCATED";
    if (status === "RELEASED" && a.allocatedItems.some(i => remaining(s, a, i.itemId) > 0)) throw new Error("Alokasi yang ditutup masih memiliki reservasi.");
    if (a.status !== status) throw new Error("Status alokasi tidak sesuai ledger.");
  });
  s.handovers.forEach(h => {
    const a = s.kitAllocations.find(a => a.id === h.allocationId);
    if (!a || a.bookingId !== h.bookingId || a.pilgrimId !== h.pilgrimId || a.warehouseId !== h.warehouseId || a.productType !== h.productType || !s.users.some(u => u.id === h.operatorId) || !h.receivedBy.trim() || !h.items.length || new Set(h.items.map(i => i.itemId)).size !== h.items.length) throw new Error("Relasi serah terima tidak valid.");
    dated(h.receivedAt);
    h.items.forEach(i => { positive(i.quantity); const moves = s.stockMovements.filter(m => m.type === "HANDOVER" && m.referenceId === h.id && m.itemId === i.itemId); if (!a.allocatedItems.some(k => k.itemId === i.itemId) || moves.length !== 1 || moves[0].quantity !== i.quantity || moves[0].warehouseId !== h.warehouseId) throw new Error("Serah terima tidak cocok dengan pergerakan stok."); });
  });
  s.stockMovements.forEach(m => {
    if (m.type === "HANDOVER" && !s.handovers.some(h => h.id === m.referenceId && h.items.some(i => i.itemId === m.itemId))) throw new Error("Ledger serah terima tanpa bukti.");
    if (m.type === "RETURN") {
      const h = s.handovers.find(h => h.id === m.referenceId), original = h?.items.find(i => i.itemId === m.itemId);
      const total = s.stockMovements.filter(k => k.type === "RETURN" && k.referenceId === m.referenceId && k.itemId === m.itemId).reduce((n, k) => n + k.quantity, 0);
      if (!original || h!.warehouseId !== m.warehouseId || total > original.quantity || !["REUSABLE", "DAMAGED"].includes(m.condition ?? "")) throw new Error("Retur tidak sesuai penyerahan asal.");
      if (m.condition === "DAMAGED" && s.stockMovements.filter(k => k.type === "ADJUSTMENT_OUT" && k.referenceType === "DAMAGED_RETURN" && k.referenceId === m.id && k.quantity === m.quantity && k.warehouseId === m.warehouseId && k.itemId === m.itemId).length !== 1) throw new Error("Retur rusak harus dikeluarkan dari stok tepat satu kali.");
    }
    if (m.referenceType === "DAMAGED_RETURN" && !s.stockMovements.some(k => k.id === m.referenceId && k.type === "RETURN" && k.condition === "DAMAGED" && k.itemId === m.itemId && k.warehouseId === m.warehouseId && k.quantity === m.quantity)) throw new Error("Pengeluaran retur rusak tidak memiliki catatan asal yang sesuai.");
  });
  for (const w of s.warehouses) for (const i of s.inventory) { const b = stockBalance(s, i.id, w.id); if (![b.physical, b.reserved, b.available].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error(`Saldo stok ${i.name} tidak valid atau negatif.`); }
}
export function assertInventoryHistory(before: DemoState, after: DemoState) {
  for (const key of ["stockMovements", "handovers"] as const) if (after[key].length < before[key].length || before[key].some((v, i) => JSON.stringify(v) !== JSON.stringify(after[key][i]))) throw new Error("Catatan stok dan bukti yang sudah diposting tidak boleh diubah/dihapus.");
  before.kitAllocations.forEach(a => {
    const next = after.kitAllocations.find(k => k.id === a.id);
    const snapshot = (v: PilgrimKitAllocation) => ({ ...v, status: "", allocatedItems: v.allocatedItems.map(i => ({ ...i, releasedQuantity: 0 })) });
    if (!next || JSON.stringify(snapshot(a)) !== JSON.stringify(snapshot(next)) || a.allocatedItems.some(i => next.allocatedItems.find(k => k.itemId === i.itemId)!.releasedQuantity < i.releasedQuantity)) throw new Error("Snapshot alokasi historis tidak boleh ditulis ulang.");
  });
}
