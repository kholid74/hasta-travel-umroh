import type { DemoState } from "@/content/admin/types";
import { initializeInventory } from "@/content/admin/inventory";
import { personaUsers, roleIdFromLabel } from "@/content/admin/roles";
import { createDefaultCareerRuleSet, generateAgentCode, levelIdFromLabel } from "@/content/admin/career";

/**
 * Ordered, deterministic, idempotent storage migrations. Each step upgrades a state of
 * version N to N+1 in place and runs BEFORE the shape check in decodeDemo, so adding
 * fields to the seed never forces users to reset their saved demo.
 */
export const CURRENT_DEMO_VERSION = 4;

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
  // v3 → v4 (M3.2): Agent Career Foundation.
  // Agents gain code, parentId (flat on migration per D11), joinedAt, accountStatus, levelId, email.
  // Bookings gain attribution (backfilled from jamaah.agentId, lockedAt = first verified payment date).
  // Leads gain agentId, referralCode.
  // DemoState gains careerRuleSets, careerSnapshots, agentHierarchyEvents.
  3: state => {
    state.careerRuleSets ??= [createDefaultCareerRuleSet()];
    state.careerSnapshots ??= [];
    state.agentHierarchyEvents ??= [];

    const agents = (state.agents ?? []) as (DemoState["agents"][number] & {
      code?: string; parentId?: string; joinedAt?: string;
      accountStatus?: string; levelId?: string; email?: string;
    })[];
    for (const a of agents) {
      if (typeof a.code !== "string" || !a.code) a.code = generateAgentCode(a.name, a.id);
      if (typeof a.parentId !== "string") a.parentId = ""; // flat on migration per decision D11
      if (typeof a.joinedAt !== "string" || !a.joinedAt) a.joinedAt = "2026-01-15";
      if (typeof a.accountStatus !== "string" || !a.accountStatus) a.accountStatus = "ACTIVE";
      if (typeof a.levelId !== "string" || !a.levelId) a.levelId = levelIdFromLabel(a.level);
      if (typeof a.email !== "string") a.email = `${a.name.toLowerCase().replace(/[^a-z]/g, "")}@mitra.example`;
    }
    state.agents = agents as DemoState["agents"];

    const payments = (state.payments ?? []) as DemoState["payments"];
    const jamaah = (state.jamaah ?? []) as DemoState["jamaah"];
    const bookings = (state.bookings ?? []) as (DemoState["bookings"][number] & {
      attribution?: DemoState["bookings"][number]["attribution"];
    })[];

    for (const b of bookings) {
      if (!b.attribution) {
        const j = jamaah.find(j => j.id === b.jamaahId);
        const agent = j?.agentId ? agents.find(a => a.id === j.agentId) : undefined;
        const verified = payments
          .filter(p => p.bookingId === b.id && p.status === "Terverifikasi")
          .sort((x, y) => x.date.localeCompare(y.date));
        const lockedAt = verified.length > 0 && agent ? verified[0].date : "";
        b.attribution = {
          agentId: agent ? agent.id : "",
          source: agent ? "MIGRATED" : "MANUAL",
          code: agent ? agent.code : "",
          attributedAt: b.date,
          attributedBy: "USR-2",
          lockedAt,
          uplineSnapshot: [],
          levelSnapshot: lockedAt && agent ? agent.levelId : "",
        };
      }
    }
    state.bookings = bookings as DemoState["bookings"];

    const leads = (state.leads ?? []) as (DemoState["leads"][number] & {
      agentId?: string; referralCode?: string;
    })[];
    for (const l of leads) {
      if (typeof l.agentId !== "string") l.agentId = "";
      if (typeof l.referralCode !== "string") l.referralCode = "";
    }
    state.leads = leads as DemoState["leads"];
  },
};

export function migrateDemo(version: number, state: Draft) {
  if (!Number.isInteger(version) || version < 1 || version > CURRENT_DEMO_VERSION) throw new Error("Versi data demo tidak didukung.");
  for (let v = version; v < CURRENT_DEMO_VERSION; v++) steps[v](state);
  return state as DemoState;
}
