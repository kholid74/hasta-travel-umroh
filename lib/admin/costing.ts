import { hajjCostItems } from "@/content/admin/hajj";
import type { Costing, CostItem, CostPlan } from "@/content/admin/costing";
import type { DemoState } from "@/content/admin/types";
import { uid } from "./model";
import { hajjPrice, validDate } from "./hajj";

const ZERO = BigInt(0), ONE = BigInt(1), HUNDRED = BigInt(100);

// Decimal input stays text; multiplication and half-up rounding use integer arithmetic only.
export function decimal(value: string, places: number, label = "Nilai") {
  if (typeof value !== "string" || !new RegExp(`^\\d{1,15}(?:\\.\\d{1,${places}})?$`).test(value)) {
    throw new Error(`${label}: isi angka nonnegatif dengan maksimal ${places} desimal (gunakan titik).`);
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole + fraction.padEnd(places, "0"));
}
function rounded(n: bigint, d: bigint): bigint {
  if (d <= ZERO) throw new Error("Pembagi harus lebih dari nol.");
  return n < ZERO ? -rounded(-n, d) : (n + d / BigInt(2)) / d;
}
function count(value: number, allowZero: boolean) {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1) || value > 10000) {
    throw new Error(`Jumlah peserta harus bilangan bulat ${allowZero ? "0" : "1"}–10.000.`);
  }
  return BigInt(value);
}
export function itemBase(item: CostItem) {
  if (!item.id || !item.name.trim() || !item.category.trim() || !item.unit.trim()) throw new Error("Lengkapi nama, kategori, dan satuan biaya.");
  if (!["person", "group", "unit"].includes(item.type) || !["all", "paying", "foc"].includes(item.audience)) throw new Error("Tipe atau sasaran biaya tidak valid.");
  if (!["IDR", "SAR", "USD"].includes(item.currency)) throw new Error("Mata uang tidak valid.");
  const quantity = decimal(item.quantity, 3, "Kuantitas"), price = decimal(item.unitPrice, 2, "Harga satuan"), rate = decimal(item.exchangeRate, 6, "Kurs");
  if (quantity === ZERO || rate === ZERO) throw new Error("Kuantitas dan kurs harus lebih dari nol.");
  if (item.currency === "IDR" && rate !== BigInt(1000000)) throw new Error("Kurs IDR harus 1.");
  return rounded(quantity * price * rate, BigInt(1000000000));
}
export function calculateCosting(plan: CostPlan) {
  if (!validDate(plan.assumptionDate)) throw new Error("Isi tanggal asumsi kurs yang valid.");
  const paying = count(plan.payingCount, false), foc = count(plan.focCount, true);
  const selling = decimal(plan.sellingPrice, 2, "Harga jual"), discount = decimal(plan.discountPerPerson, 2, "Diskon per jamaah");
  if (selling <= ZERO || discount > selling) throw new Error("Harga jual harus positif; diskon tidak boleh melebihi harga jual.");
  if (!plan.items.length) throw new Error("Tambahkan minimal satu komponen biaya.");
  if (new Set(plan.items.map(i => i.id)).size !== plan.items.length) throw new Error("Komponen biaya memiliki ID ganda.");
  let fixed = ZERO, variable = ZERO;
  const lines = plan.items.map(item => {
    const base = itemBase(item);
    if (item.type !== "person") fixed += base;
    else {
      if (item.audience !== "foc") variable += base;
      if (item.audience !== "paying") fixed += base * foc;
    }
    const multiplier = item.type !== "person" ? ONE : item.audience === "all" ? paying + foc : item.audience === "foc" ? foc : paying;
    return { id: item.id, base, total: base * multiplier };
  });
  const total = fixed + variable * paying, netSelling = selling - discount, revenue = netSelling * paying;
  const profit = revenue - total, contribution = netSelling - variable;
  const breakEven = contribution > ZERO ? (fixed + contribution - ONE) / contribution : contribution === ZERO && fixed === ZERO ? ONE : null;
  return {
    lines, total, fixed, variable, selling, netSelling, revenue, profit,
    hpp: rounded(total, paying),
    margin: revenue > ZERO ? rounded(profit * BigInt(10000), revenue) : null,
    // Markup uses the advertised price before discount and unrounded HPP.
    markup: total > ZERO ? rounded((selling * paying - total) * BigInt(10000), total) : null,
    breakEven: breakEven === ZERO ? ONE : breakEven,
  };
}
export function costingMoney(value: bigint) {
  const abs = value < ZERO ? -value : value;
  return `${value < ZERO ? "−" : ""}Rp ${new Intl.NumberFormat("id-ID").format(abs / HUNDRED)},${String(abs % HUNDRED).padStart(2, "0")}`;
}
export function costingPercent(value: bigint | null) {
  if (value === null) return "Tidak terdefinisi";
  const abs = value < ZERO ? -value : value;
  return `${value < ZERO ? "−" : ""}${abs / HUNDRED},${String(abs % HUNDRED).padStart(2, "0")}%`;
}
export function latestCosting(state: DemoState, departureId: string) {
  return state.costings.filter(c => costingTargetId(c) === departureId).sort((a, b) => b.revision - a.revision)[0];
}
export const costingTargetId = (c: Costing) => c.productType === "HAJJ_SPECIAL" ? c.packageId : c.departureId;
export function costingTargets(state: DemoState) {
  return [
    ...state.departures.map(d => ({ id: d.id, packageId: d.packageId, capacity: d.capacity, date: d.date, year: Number(d.date.slice(0, 4)), productType: "UMRAH" as const, name: state.packages.find(p => p.id === d.packageId)?.name ?? d.id })),
    ...state.hajjPackages.map(p => ({ id: p.id, packageId: p.id, capacity: p.capacity, date: p.departureDate, year: p.departureYear, productType: "HAJJ_SPECIAL" as const, name: p.name })),
  ];
}
export type CostingTarget = ReturnType<typeof costingTargets>[number];
export function newCosting(state: DemoState, departureId: string) {
  const hajj = state.hajjPackages.find(p => p.id === departureId);
  const departure = state.departures.find(d => d.id === departureId);
  const product = state.packages.find(p => p.id === departure?.packageId);
  if (!hajj && (!departure || !product)) throw new Error("Pilih paket atau keberangkatan yang valid.");
  if (latestCosting(state, departureId)) throw new Error("Costing sudah tersedia; buka atau buat revisi dari costing tersebut.");
  const target = costingTargets(state).find(t => t.id === departureId)!;
  const template = state.costTemplates.find(t => t.packageId === target.packageId);
  const result: Costing = {
    id: uid("HPP"), departureId: hajj ? "" : departureId, revision: 1, status: "Draft", payingCount: Math.min(35, target.capacity), focCount: 0,
    productType: target.productType, packageId: target.packageId, packageName: target.name,
    departureYear: target.year, departureDate: target.date, assumptionDate: template?.assumptionDate ?? hajj?.assumptionDate ?? "2026-10-02",
    sellingPrice: String(hajj ? hajjPrice(hajj) : product!.price.quad), discountPerPerson: "0", notes: hajj?.planningNotes ?? "",
    items: structuredClone(template?.items ?? (hajj ? hajjCostItems(hajj.id) : [])),
  };
  state.costings.unshift(result);
  return result;
}
function draft(state: DemoState, id: string) {
  const costing = state.costings.find(c => c.id === id);
  if (!costing || costing.status !== "Draft" || latestCosting(state, costingTargetId(costing))?.id !== id) throw new Error("Costing final atau revisi lama terkunci. Buat revisi baru untuk mengubahnya.");
  return costing;
}
export function saveCosting(state: DemoState, id: string, plan: CostPlan, finalize = false) {
  const costing = draft(state, id);
  calculateCosting(plan);
  Object.assign(costing, structuredClone({ assumptionDate: plan.assumptionDate, payingCount: plan.payingCount, focCount: plan.focCount, sellingPrice: plan.sellingPrice, discountPerPerson: plan.discountPerPerson, items: plan.items, notes: plan.notes }));
  if (finalize) { costing.status = "Final"; costing.finalizedAt = new Date().toISOString(); }
}
export function reviseCosting(state: DemoState, id: string) {
  const previous = state.costings.find(c => c.id === id);
  if (!previous || previous.status !== "Final" || latestCosting(state, costingTargetId(previous))?.id !== id) throw new Error("Revisi hanya dapat dibuat dari costing final terbaru.");
  const target = costingTargets(state).find(t => t.id === costingTargetId(previous))!;
  const revision: Costing = { ...structuredClone(previous), id: uid("HPP"), revision: previous.revision + 1, status: "Draft", packageName: target.name, departureYear: target.year, departureDate: target.date };
  delete revision.finalizedAt;
  state.costings.unshift(revision);
  return revision;
}
export function saveCostTemplate(state: DemoState, id: string) {
  const costing = state.costings.find(c => c.id === id);
  if (!costing) throw new Error("Costing tidak ditemukan.");
  calculateCosting(costing);
  const template = { packageId: costing.packageId, assumptionDate: costing.assumptionDate, items: structuredClone(costing.items) };
  const index = state.costTemplates.findIndex(t => t.packageId === costing.packageId);
  if (index >= 0) state.costTemplates[index] = template;
  else state.costTemplates.push(template);
}
export function saveCostScenario(state: DemoState, costingId: string, name: string, plan: CostPlan) {
  if (!state.costings.some(c => c.id === costingId) || !name.trim()) throw new Error("Nama skenario dan costing wajib diisi.");
  calculateCosting(plan);
  state.costScenarios.unshift({ assumptionDate: plan.assumptionDate, payingCount: plan.payingCount, focCount: plan.focCount, sellingPrice: plan.sellingPrice, discountPerPerson: plan.discountPerPerson, items: structuredClone(plan.items), notes: plan.notes, id: uid("SCN"), costingId, name: name.trim() });
}
