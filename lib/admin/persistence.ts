import type { DemoState } from "@/content/admin/types";
import { isRole } from "@/content/admin/roles";
import { createSeed } from "@/content/admin/seed";
import { validateHajjPackage, validDate } from "./hajj";
import { calculateCosting, costingTargetId, itemBase } from "./costing";

import { validateInventory } from "./inventory";
import { CURRENT_DEMO_VERSION, migrateDemo } from "./migrations";

export const DEMO_STORAGE_KEY = "hasta-workspace-m1.1";
export function encodeDemo(state: DemoState) { return JSON.stringify({ version: CURRENT_DEMO_VERSION, state }); }

function sameShape(value: unknown, sample: unknown): boolean {
  if (Array.isArray(sample)) return Array.isArray(value) && value.length <= 10000 && (!sample.length || value.every(v => sameShape(v, sample[0])));
  if (sample !== null && typeof sample === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value) && Object.entries(sample).every(([key, v]) => Object.hasOwn(value, key) && sameShape((value as Record<string, unknown>)[key], v));
  }
  return typeof value === typeof sample && (typeof value !== "number" || Number.isFinite(value));
}
export function decodeDemo(raw: string): DemoState {
  try {
    if (raw.length > 10000000) throw new Error();
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object" || !("version" in data) || !Number.isInteger(data.version) || Number(data.version) < 1 || Number(data.version) > CURRENT_DEMO_VERSION || !("state" in data) ) throw new Error();
    const state = data.state as DemoState;
    if (state?.settings && typeof state.settings === "object" && !Object.hasOwn(state.settings, "accountHolder")) state.settings.accountHolder = "";
    migrateDemo(Number(data.version), state as unknown as Record<string, unknown>);
    if (!sameShape(state, createSeed())) throw new Error();
    validateInventory(state);
    if (new Set(state.users.map(u => u.id)).size !== state.users.length || state.users.some(u => !isRole(u.roleId))) throw new Error();
    for (const list of [state.packages, state.hajjPackages, state.departures, state.jamaah, state.bookings, state.payments, state.costings, state.agents]) {
      if (new Set(list.map(v => v.id)).size !== list.length) throw new Error();
    }
    if (new Set(state.agents.map(a => a.code.toUpperCase())).size !== state.agents.length) throw new Error();
    for (const a of state.agents) if (a.parentId && !state.agents.some(p => p.id === a.parentId)) throw new Error();
    for (const p of state.hajjPackages) validateHajjPackage(p, state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif").length);
    for (const b of state.bookings) {
      if (!state.jamaah.some(j => j.id === b.jamaahId) || !Number.isSafeInteger(b.total) || b.total <= 0 || !["Aktif", "Batal"].includes(b.status)) throw new Error();
      if (b.productType === "HAJJ_SPECIAL" ? !state.hajjPackages.some(p => p.id === b.hajjPackageId) : b.productType !== "UMRAH" || !state.departures.some(d => d.id === b.departureId)) throw new Error();
    }
    for (const p of state.payments) if (!state.bookings.some(b => b.id === p.bookingId) || !Number.isSafeInteger(p.amount) || p.amount <= 0 || !["Menunggu", "Terverifikasi", "Dikembalikan"].includes(p.status)) throw new Error();
    for (const plan of [...state.costings, ...state.costScenarios, ...state.costTemplates]) {
      if (!validDate(plan.assumptionDate) || !Array.isArray(plan.items)) throw new Error();
      plan.items.forEach(itemBase);
    }
    for (const c of state.costings) {
      if (!["Draft", "Final"].includes(c.status) || !Number.isSafeInteger(c.revision) || c.revision < 1 || (c.productType === "HAJJ_SPECIAL" ? !state.hajjPackages.some(p => p.id === c.packageId) : c.productType !== "UMRAH" || !state.departures.some(d => d.id === c.departureId))) throw new Error();
      if (c.items.length || c.status === "Final") calculateCosting(c);
    }
    if (new Set(state.costings.map(c => `${costingTargetId(c)}:${c.revision}`)).size !== state.costings.length) throw new Error();
    for (const c of state.costScenarios) {
      if (typeof c.id !== "string" || typeof c.name !== "string" || !c.name.trim() || !state.costings.some(v => v.id === c.costingId)) throw new Error();
      calculateCosting(c);
    }
    return state;
  } catch { throw new Error("Data demo tersimpan tidak dapat dibaca atau versinya tidak didukung. Reset data demo untuk kembali ke contoh awal."); }
}
