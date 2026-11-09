import type { Agent, Booking, DemoState } from "./types";
import { DEMO_TODAY } from "./seed";
import { outstanding } from "@/lib/admin/model";

export type CareerMetric =
  | "PERSONAL_PILGRIMS"
  | "PERSONAL_VALUE"
  | "TEAM_PILGRIMS"
  | "TEAM_VALUE"
  | "ACTIVE_DIRECTS";

export const CAREER_METRIC_LABELS: Record<CareerMetric, string> = {
  PERSONAL_PILGRIMS: "Jamaah pribadi",
  PERSONAL_VALUE: "Omset pribadi",
  TEAM_PILGRIMS: "Jamaah tim",
  TEAM_VALUE: "Omset tim",
  ACTIVE_DIRECTS: "Mitra langsung aktif",
};

export type CareerLevel = {
  id: string; // e.g. "CL-1"
  name: string; // "Agent", "Senior Agent", "Coordinator", "Regional Coordinator"
  rank: number; // 1..n
  requirements: { metric: CareerMetric; min: number }[];
  periodsRequired: number;
  active: boolean;
  description: string;
};

export type CareerRuleSet = {
  id: string;
  version: number;
  effectiveFrom: string;
  period: "MONTH" | "QUARTER";
  qualifyingEvent: "FIRST_PAYMENT_VERIFIED" | "FULLY_PAID" | "DEPARTED";
  teamDepth: number; // downline levels counted in TEAM_* (fixture: 3)
  activeDirectWindowPeriods: number;
  demotion: "NEVER" | "AFTER_MISSED_PERIODS";
  missedPeriodsBeforeDemotion?: number;
  lateCancellation: "ADJUST_NEXT_PERIOD" | "IGNORE_LOCKED";
  levels: CareerLevel[];
};

export type CareerMetrics = {
  personalPilgrims: number;
  personalValue: number;
  teamPilgrims: number;
  teamValue: number;
  activeDirects: number;
  adjustments: { bookingId: string; reason: string; pilgrims: number; value: number }[];
};

export type CareerProgressGap = {
  metric: CareerMetric;
  label: string;
  current: number;
  required: number;
  met: boolean;
};

export type CareerProgress = {
  agentId: string;
  periodId: string; // e.g. "2026-Q4"
  metrics: CareerMetrics;
  currentLevelId: string;
  qualifiesForLevelId: string;
  nextLevel?: {
    levelId: string;
    levelName: string;
    gaps: CareerProgressGap[];
  };
};

export type CareerSnapshot = CareerProgress & {
  id: string;
  ruleSetId: string;
  ruleSetVersion: number;
  levelBeforeId: string;
  levelAfterId: string;
  bookingIds: string[];
  status: "LOCKED";
  lockedAt: string;
  lockedBy: string;
};

export type AgentHierarchyEvent = {
  id: string;
  agentId: string;
  fromParentId: string;
  toParentId: string;
  effectiveDate: string;
  reason: string;
  actorId: string;
  createdAt: string;
};

export type AttributionSource = "REFERRAL_CODE" | "LEAD" | "MANUAL" | "MIGRATED";

export type BookingAttribution = {
  agentId: string; // "" = direct sale
  source: AttributionSource;
  code: string; // referral code used
  attributedAt: string; // date YYYY-MM-DD
  attributedBy: string; // staff or persona id
  lockedAt: string; // set when first payment is verified ("" when unlocked)
  uplineSnapshot: string[]; // ancestor agent ids at lock time, nearest first
  levelSnapshot: string; // agent levelId at lock time ("" when unlocked)
};

/** Default career levels fixture (Data Contracts §13). */
export const DEFAULT_CAREER_LEVELS: readonly CareerLevel[] = [
  {
    id: "CL-1",
    name: "Agent",
    rank: 1,
    requirements: [],
    periodsRequired: 1,
    active: true,
    description: "Mitra pemula dengan pencatatan jamaah langsung.",
  },
  {
    id: "CL-2",
    name: "Senior Agent",
    rank: 2,
    requirements: [{ metric: "PERSONAL_PILGRIMS", min: 5 }],
    periodsRequired: 1,
    active: true,
    description: "Mitra berpengalaman dengan minimal 5 jamaah lunas per kuartal.",
  },
  {
    id: "CL-3",
    name: "Coordinator",
    rank: 3,
    requirements: [
      { metric: "PERSONAL_PILGRIMS", min: 8 },
      { metric: "TEAM_PILGRIMS", min: 15 },
      { metric: "ACTIVE_DIRECTS", min: 2 },
    ],
    periodsRequired: 1,
    active: true,
    description: "Koordinator pembina dengan minimal 8 jamaah pribadi, 15 tim, dan 2 mitra aktif.",
  },
  {
    id: "CL-4",
    name: "Regional Coordinator",
    rank: 4,
    requirements: [
      { metric: "PERSONAL_PILGRIMS", min: 10 },
      { metric: "TEAM_PILGRIMS", min: 40 },
      { metric: "ACTIVE_DIRECTS", min: 4 },
    ],
    periodsRequired: 1,
    active: true,
    description: "Koordinator wilayah pembina jaringan luas dengan kontribusi berkesinambungan.",
  },
];

export function createDefaultCareerRuleSet(): CareerRuleSet {
  return {
    id: "CRS-2026-DEFAULT",
    version: 1,
    effectiveFrom: "2026-01-01",
    period: "QUARTER",
    qualifyingEvent: "FULLY_PAID",
    teamDepth: 3,
    activeDirectWindowPeriods: 1,
    demotion: "NEVER",
    lateCancellation: "ADJUST_NEXT_PERIOD",
    levels: DEFAULT_CAREER_LEVELS.map(l => ({ ...l })),
  };
}

export function levelIdFromLabel(label: string): string {
  const norm = label.trim().toLowerCase();
  if (norm.includes("regional")) return "CL-4";
  if (norm.includes("coordinator")) return "CL-3";
  if (norm.includes("senior")) return "CL-2";
  return "CL-1";
}

export function levelLabelFromId(id: string, levels: readonly CareerLevel[] = DEFAULT_CAREER_LEVELS): string {
  const found = levels.find(l => l.id === id);
  return found?.name ?? "Agent";
}

export function generateAgentCode(name: string, id: string): string {
  const initials = name
    .replace(/^H\.\s+/i, "")
    .replace(/^Hj\.\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0] ?? "")
    .join("")
    .toUpperCase();
  const digits = id.replace(/\D/g, "").slice(-2).padStart(2, "0");
  return `HASTA-${initials || "AG"}${digits}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.trim();
  if (digits.length <= 6) return digits;
  const start = digits.slice(0, 4);
  const end = digits.slice(-4);
  return `${start}-****-${end}`;
}

export function periodIdForDate(dateStr: string, periodType: "MONTH" | "QUARTER" = "QUARTER"): string {
  const clean = dateStr.slice(0, 10);
  const year = clean.slice(0, 4) || "2026";
  const month = parseInt(clean.slice(5, 7) || "10", 10);
  if (periodType === "MONTH") {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
  const quarter = Math.ceil(month / 3);
  return `${year}-Q${quarter}`;
}

export function periodDateRange(periodId: string): { start: string; end: string } {
  if (periodId.includes("-Q")) {
    const [year, qStr] = periodId.split("-Q");
    const q = parseInt(qStr, 10);
    const startMonth = String((q - 1) * 3 + 1).padStart(2, "0");
    const endMonth = String(q * 3).padStart(2, "0");
    const lastDays: Record<string, string> = { "03": "31", "06": "30", "09": "30", "12": "31" };
    return {
      start: `${year}-${startMonth}-01`,
      end: `${year}-${endMonth}-${lastDays[endMonth] ?? "30"}`,
    };
  }
  const [year, month] = periodId.split("-");
  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-31`,
  };
}

export function demoNow(): string {
  const now = new Date();
  const time = now.toISOString().slice(11); // HH:mm:ss.sssZ
  return `${DEMO_TODAY}T${time}`;
}

/** Ancestors of an agent: nearest upline first. Guarded against cycles. */
export function ancestorsOf(state: { agents: Agent[] }, agentId: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  let current = state.agents.find(a => a.id === agentId);
  while (current && current.parentId && !visited.has(current.parentId)) {
    visited.add(current.parentId);
    result.push(current.parentId);
    current = state.agents.find(a => a.id === current?.parentId);
  }
  return result;
}

export function downlinesOf(state: { agents: Agent[] }, agentId: string): Agent[] {
  return state.agents.filter(a => a.parentId === agentId);
}

export function allDescendantsOf(state: { agents: Agent[] }, agentId: string, maxDepth = 4): { agent: Agent; depth: number }[] {
  const list: { agent: Agent; depth: number }[] = [];
  const queue: { id: string; depth: number }[] = [{ id: agentId, depth: 0 }];
  const visited = new Set<string>([agentId]);

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;
    if (depth >= maxDepth) continue;
    const children = state.agents.filter(a => a.parentId === id && !visited.has(a.id));
    for (const child of children) {
      visited.add(child.id);
      list.push({ agent: child, depth: depth + 1 });
      queue.push({ id: child.id, depth: depth + 1 });
    }
  }
  return list;
}

export function treeHeight(state: { agents: Agent[] }, agentId: string): number {
  const children = state.agents.filter(a => a.parentId === agentId);
  if (!children.length) return 0;
  return 1 + Math.max(...children.map(c => treeHeight(state, c.id)));
}

export function canMoveAgent(
  state: { agents: Agent[] },
  agentId: string,
  newParentId: string,
  maxAllowedDepth = 4,
): { ok: boolean; error?: string } {
  if (agentId === newParentId) {
    return { ok: false, error: "Mitra tidak dapat menjadi upline bagi dirinya sendiri." };
  }
  if (!newParentId) {
    // Moving to root is always allowed
    return { ok: true };
  }
  const target = state.agents.find(a => a.id === newParentId);
  if (!target) {
    return { ok: false, error: "Upline tujuan tidak ditemukan." };
  }
  const ancestorsOfTarget = ancestorsOf(state, newParentId);
  if (ancestorsOfTarget.includes(agentId)) {
    return { ok: false, error: "Perpindahan dibatalkan: akan menimbulkan siklus dalam hierarki jaringan." };
  }
  // Target depth + 1 + subtree height of agentId must not exceed maxAllowedDepth
  const newParentDepth = ancestorsOfTarget.length + 1;
  const agentSubtreeHeight = treeHeight(state, agentId);
  if (newParentDepth + agentSubtreeHeight > maxAllowedDepth) {
    return {
      ok: false,
      error: `Perpindahan dibatalkan: kedalaman jaringan (${newParentDepth + agentSubtreeHeight} level) melebihi batas maksimal (${maxAllowedDepth} level).`,
    };
  }
  return { ok: true };
}

export function moveAgent(
  state: DemoState,
  agentId: string,
  newParentId: string,
  reason: string,
  actorId: string,
): void {
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) throw new Error("Mitra tidak ditemukan.");
  const check = canMoveAgent(state, agentId, newParentId);
  if (!check.ok) throw new Error(check.error);

  const fromParentId = agent.parentId || "";
  const event: AgentHierarchyEvent = {
    id: `AHE-${crypto.randomUUID().slice(0, 8)}`,
    agentId,
    fromParentId,
    toParentId: newParentId,
    effectiveDate: DEMO_TODAY,
    reason: reason.trim() || "Penyesuaian struktur jaringan",
    actorId,
    createdAt: demoNow(),
  };

  state.agentHierarchyEvents ??= [];
  state.agentHierarchyEvents.unshift(event);
  agent.parentId = newParentId;
}

export function isBookingQualifying(
  state: DemoState,
  booking: Booking,
  qualifyingEvent: "FIRST_PAYMENT_VERIFIED" | "FULLY_PAID" | "DEPARTED" = "FULLY_PAID",
): { qualifying: boolean; date: string } {
  if (booking.status !== "Aktif") return { qualifying: false, date: "" };
  if (qualifyingEvent === "FULLY_PAID") {
    if (outstanding(state, booking) !== 0) return { qualifying: false, date: "" };
    // Find last verified payment date
    const verified = state.payments
      .filter(p => p.bookingId === booking.id && p.status === "Terverifikasi")
      .sort((a, b) => b.date.localeCompare(a.date));
    const qualifyingDate = verified[0]?.date || booking.date;
    return { qualifying: true, date: qualifyingDate };
  }
  if (qualifyingEvent === "FIRST_PAYMENT_VERIFIED") {
    const verified = state.payments
      .filter(p => p.bookingId === booking.id && p.status === "Terverifikasi")
      .sort((a, b) => a.date.localeCompare(b.date));
    if (!verified.length) return { qualifying: false, date: "" };
    return { qualifying: true, date: verified[0].date };
  }
  return { qualifying: true, date: booking.date };
}

export function computeCareerProgress(
  state: DemoState,
  agentId: string,
  periodId = "2026-Q4",
  ruleSet?: CareerRuleSet,
): CareerProgress {
  const rs = ruleSet ?? state.careerRuleSets?.[0] ?? createDefaultCareerRuleSet();
  const agent = state.agents.find(a => a.id === agentId);
  const currentLevelId = agent?.levelId || "CL-1";

  const { start, end } = periodDateRange(periodId);
  const qualifyingType = rs.qualifyingEvent;

  // Personal qualifying bookings
  const personalBookings: Booking[] = [];
  for (const b of state.bookings) {
    if (b.status !== "Aktif") continue;
    const isAttributed = b.attribution?.agentId === agentId || (!b.attribution && state.jamaah.find(j => j.id === b.jamaahId)?.agentId === agentId);
    if (!isAttributed) continue;
    const { qualifying, date } = isBookingQualifying(state, b, qualifyingType);
    if (qualifying && (periodId === "ALL" || (date >= start && date <= end))) {
      personalBookings.push(b);
    }
  }

  // Downlines up to teamDepth
  const downlineList = allDescendantsOf(state, agentId, rs.teamDepth);
  const downlineIds = new Set(downlineList.map(d => d.agent.id));

  // Team qualifying bookings (downlines only, excluding personal)
  const teamBookings: Booking[] = [];
  for (const b of state.bookings) {
    if (b.status !== "Aktif") continue;
    const bookingAgentId = b.attribution?.agentId || state.jamaah.find(j => j.id === b.jamaahId)?.agentId;
    if (!bookingAgentId || bookingAgentId === agentId || !downlineIds.has(bookingAgentId)) continue;
    const { qualifying, date } = isBookingQualifying(state, b, qualifyingType);
    if (qualifying && (periodId === "ALL" || (date >= start && date <= end))) {
      teamBookings.push(b);
    }
  }

  // Active directs: direct children (parentId === agentId) with ≥ 1 qualifying booking in this period
  const directChildren = state.agents.filter(a => a.parentId === agentId);
  let activeDirects = 0;
  for (const direct of directChildren) {
    const hasQualifying = state.bookings.some(b => {
      if (b.status !== "Aktif") return false;
      const bAgentId = b.attribution?.agentId || state.jamaah.find(j => j.id === b.jamaahId)?.agentId;
      if (bAgentId !== direct.id) return false;
      const { qualifying, date } = isBookingQualifying(state, b, qualifyingType);
      return qualifying && (periodId === "ALL" || (date >= start && date <= end));
    });
    if (hasQualifying) activeDirects++;
  }

  const metrics: CareerMetrics = {
    personalPilgrims: personalBookings.length,
    personalValue: personalBookings.reduce((sum, b) => sum + b.total, 0),
    teamPilgrims: teamBookings.length,
    teamValue: teamBookings.reduce((sum, b) => sum + b.total, 0),
    activeDirects,
    adjustments: [],
  };

  // Determine qualifiesForLevelId (check from highest rank down)
  const sortedLevels = [...rs.levels].sort((a, b) => b.rank - a.rank);
  let qualifiesForLevelId = "CL-1";

  for (const level of sortedLevels) {
    let metAll = true;
    for (const req of level.requirements) {
      if (req.metric === "PERSONAL_PILGRIMS" && metrics.personalPilgrims < req.min) metAll = false;
      if (req.metric === "PERSONAL_VALUE" && metrics.personalValue < req.min) metAll = false;
      if (req.metric === "TEAM_PILGRIMS" && metrics.teamPilgrims < req.min) metAll = false;
      if (req.metric === "TEAM_VALUE" && metrics.teamValue < req.min) metAll = false;
      if (req.metric === "ACTIVE_DIRECTS" && metrics.activeDirects < req.min) metAll = false;
      if (!metAll) break;
    }
    if (metAll) {
      qualifiesForLevelId = level.id;
      break;
    }
  }

  // Find next level
  const currentRank = rs.levels.find(l => l.id === currentLevelId)?.rank ?? 1;
  const nextLvl = [...rs.levels].sort((a, b) => a.rank - b.rank).find(l => l.rank > currentRank);

  let nextLevel: CareerProgress["nextLevel"] | undefined = undefined;
  if (nextLvl) {
    const gaps: CareerProgressGap[] = nextLvl.requirements.map(req => {
      let currentVal = 0;
      if (req.metric === "PERSONAL_PILGRIMS") currentVal = metrics.personalPilgrims;
      if (req.metric === "PERSONAL_VALUE") currentVal = metrics.personalValue;
      if (req.metric === "TEAM_PILGRIMS") currentVal = metrics.teamPilgrims;
      if (req.metric === "TEAM_VALUE") currentVal = metrics.teamValue;
      if (req.metric === "ACTIVE_DIRECTS") currentVal = metrics.activeDirects;
      return {
        metric: req.metric,
        label: CAREER_METRIC_LABELS[req.metric],
        current: currentVal,
        required: req.min,
        met: currentVal >= req.min,
      };
    });
    nextLevel = {
      levelId: nextLvl.id,
      levelName: nextLvl.name,
      gaps,
    };
  }

  return {
    agentId,
    periodId,
    metrics,
    currentLevelId,
    qualifiesForLevelId,
    nextLevel,
  };
}

export function lockCareerPeriod(
  state: DemoState,
  periodId: string,
  actorId: string,
  ruleSetId = "CRS-2026-DEFAULT",
): CareerSnapshot[] {
  state.careerSnapshots ??= [];
  if (state.careerSnapshots.some(s => s.periodId === periodId)) {
    throw new Error(`Evaluasi periode ${periodId} sudah dikunci sebelumnya.`);
  }

  const rs = state.careerRuleSets?.find(r => r.id === ruleSetId) ?? createDefaultCareerRuleSet();
  const createdSnapshots: CareerSnapshot[] = [];

  for (const agent of state.agents) {
    const progress = computeCareerProgress(state, agent.id, periodId, rs);
    const oldLevelId = agent.levelId || "CL-1";
    let newLevelId = oldLevelId;

    // Evaluate promotion (never demote per decision D7)
    const oldRank = rs.levels.find(l => l.id === oldLevelId)?.rank ?? 1;
    const qualifyRank = rs.levels.find(l => l.id === progress.qualifiesForLevelId)?.rank ?? 1;
    if (qualifyRank > oldRank) {
      newLevelId = progress.qualifiesForLevelId;
      agent.levelId = newLevelId;
      agent.level = levelLabelFromId(newLevelId, rs.levels);
    }

    // Collect qualifying booking ids
    const { start, end } = periodDateRange(periodId);
    const qualifyingBookingIds = state.bookings
      .filter(b => {
        if (b.status !== "Aktif") return false;
        const bAgentId = b.attribution?.agentId || state.jamaah.find(j => j.id === b.jamaahId)?.agentId;
        if (bAgentId !== agent.id) return false;
        const { qualifying, date } = isBookingQualifying(state, b, rs.qualifyingEvent);
        return qualifying && date >= start && date <= end;
      })
      .map(b => b.id);

    const snapshot: CareerSnapshot = {
      ...progress,
      id: `CS-${periodId}-${agent.id}`,
      ruleSetId: rs.id,
      ruleSetVersion: rs.version,
      levelBeforeId: oldLevelId,
      levelAfterId: newLevelId,
      bookingIds: qualifyingBookingIds,
      status: "LOCKED",
      lockedAt: demoNow(),
      lockedBy: actorId,
    };

    createdSnapshots.push(snapshot);
  }

  state.careerSnapshots.unshift(...createdSnapshots);
  return createdSnapshots;
}
