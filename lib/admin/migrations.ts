import type { DemoState } from "@/content/admin/types";
import { initializeInventory } from "@/content/admin/inventory";
import { personaUsers, roleIdFromLabel } from "@/content/admin/roles";

/**
 * Ordered, deterministic, idempotent storage migrations. Each step upgrades a state of
 * version N to N+1 in place and runs BEFORE the shape check in decodeDemo, so adding
 * fields to the seed never forces users to reset their saved demo.
 */
export const CURRENT_DEMO_VERSION = 3;

type Draft = Record<string, unknown> & Partial<DemoState>;
const steps: Record<number, (state: Draft) => void> = {
  // v1 → v2 (M2): legacy stock/equipment arrays become the inventory ledger.
  1: state => { Object.assign(state, initializeInventory(state as unknown as Parameters<typeof initializeInventory>[0])); },
  // v2 → v3 (M3.1): staff gain a demo role id; demo personas for Owner, Operations and Tour Leader.
  // No business records (bookings, payments, HPP, Hajj, inventory, agents, activities) are touched.
  2: state => {
    const users = (state.users ?? []) as (DemoState["users"][number] & { roleId?: string })[];
    for (const u of users) {
      if (u.id === "USR-1") {
        u.roleId = "SUPERADMIN";
        if (u.role === "Owner") u.role = "Super Admin"; // the demo account always had full access
      } else if (typeof u.roleId !== "string") u.roleId = roleIdFromLabel(u.role);
    }
    for (const persona of personaUsers) {
      if (!users.some(u => u.id === persona.id || u.email.toLowerCase() === persona.email)) users.push({ ...persona });
    }
    state.users = users as DemoState["users"];
  },
};

export function migrateDemo(version: number, state: Draft) {
  if (!Number.isInteger(version) || version < 1 || version > CURRENT_DEMO_VERSION) throw new Error("Versi data demo tidak didukung.");
  for (let v = version; v < CURRENT_DEMO_VERSION; v++) steps[v](state);
  return state as DemoState;
}
