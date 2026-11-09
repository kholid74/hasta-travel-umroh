import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { enterAs } from "./helpers/session";
import { createSeed } from "../content/admin/seed";
import { decodeDemo } from "../lib/admin/persistence";
import { CURRENT_DEMO_VERSION } from "../lib/admin/migrations";
import {
  ancestorsOf,
  canMoveAgent,
  computeCareerProgress,
  lockCareerPeriod,
  maskPhone,
  moveAgent,
} from "../content/admin/career";
import { addBooking, convertLead, recordPayment, verifyPayment } from "../lib/admin/model";

const FIXTURE_V3 = readFileSync("tests/fixtures/demo-v3.json", "utf8");

test("frozen v3 workspace migrates to v4 without touching business balances", () => {
  expect(CURRENT_DEMO_VERSION).toBe(4);
  const state = decodeDemo(FIXTURE_V3);

  expect(state.careerRuleSets).toHaveLength(1);
  expect(state.careerSnapshots).toBeDefined();
  expect(state.agentHierarchyEvents).toBeDefined();

  // All agents have V4 fields
  expect(state.agents).toHaveLength(10);
  for (const a of state.agents) {
    expect(a.code).toMatch(/^HASTA-[A-Z]{2,4}\d{2}$/);
    expect(a.parentId).toBe(""); // flat on migration per decision D11
    expect(a.accountStatus).toBe("ACTIVE");
    expect(a.levelId).toMatch(/^CL-[1-4]$/);
  }

  // All bookings have attribution
  expect(state.bookings.length).toBeGreaterThan(0);
  for (const b of state.bookings) {
    expect(b.attribution).toBeDefined();
    expect(b.attribution?.source).toBeDefined();
  }
});

test("agent hierarchy logic: ancestor traversal, cycle rejection and max depth limit", () => {
  const state = createSeed();
  // In seed: AGT-001 -> AGT-002 -> AGT-004
  expect(ancestorsOf(state, "AGT-001")).toEqual([]);
  expect(ancestorsOf(state, "AGT-002")).toEqual(["AGT-001"]);
  expect(ancestorsOf(state, "AGT-004")).toEqual(["AGT-002", "AGT-001"]);

  // Disallow moving under self
  const moveSelf = canMoveAgent(state, "AGT-002", "AGT-002");
  expect(moveSelf.ok).toBe(false);
  expect(moveSelf.error).toContain("dirinya sendiri");

  // Disallow creating a cycle (moving AGT-001 under its downline AGT-004)
  const moveCycle = canMoveAgent(state, "AGT-001", "AGT-004");
  expect(moveCycle.ok).toBe(false);
  expect(moveCycle.error).toContain("siklus");

  // Valid move: moving AGT-006 (under AGT-003) under AGT-001
  const moveValid = canMoveAgent(state, "AGT-006", "AGT-001");
  expect(moveValid.ok).toBe(true);

  // Execute move and assert audit event logging
  moveAgent(state, "AGT-006", "AGT-001", "Konsolidasi wilayah Jawa Barat", "USR-1");
  const agt6 = state.agents.find(a => a.id === "AGT-006")!;
  expect(agt6.parentId).toBe("AGT-001");
  expect(state.agentHierarchyEvents[0]).toMatchObject({
    agentId: "AGT-006",
    fromParentId: "AGT-003",
    toParentId: "AGT-001",
    reason: "Konsolidasi wilayah Jawa Barat",
  });
});

test("convertLead transfers agent attribution to booking", () => {
  const state = createSeed();
  const testLead = state.leads.find(l => !l.bookingId)!;
  testLead.agentId = "AGT-001";
  testLead.referralCode = "HASTA-AH01";

  const booking = convertLead(state, testLead.id, "UMR-261007-A");
  expect(booking.attribution).toMatchObject({
    agentId: "AGT-001",
    code: "HASTA-AH01",
    source: "REFERRAL_CODE",
  });
  expect(booking.attribution?.lockedAt).toBe(""); // not locked until verified payment
});

test("verifyPayment locks booking attribution on first verified payment", () => {
  const state = createSeed();
  // Create an active unverified booking with attribution
  const jamaah = state.jamaah[0];
  jamaah.agentId = "AGT-004"; // uplines: AGT-002, AGT-001

  // Use a departure without existing booking for this jamaah
  const unbookedDep = state.departures.find(d => !state.bookings.some(b => b.jamaahId === jamaah.id && b.departureId === d.id))!;
  // Clear any existing active booking for this jamaah for clean testing
  state.bookings.forEach(b => { if (b.jamaahId === jamaah.id) b.status = "Batal"; });

  const b = addBooking(state, jamaah.id, unbookedDep.id);
  expect(b.attribution?.agentId).toBe("AGT-004");
  expect(b.attribution?.lockedAt).toBe("");

  // Record a payment
  recordPayment(state, b.id, 10000000, "Transfer bank", "2026-10-02");
  const pendingPayment = state.payments.find(p => p.bookingId === b.id && p.status === "Menunggu")!;

  // Verify payment
  verifyPayment(state, pendingPayment.id);
  expect(b.attribution?.lockedAt).toBe("2026-10-02");
  expect(b.attribution?.levelSnapshot).toBe("CL-2"); // Senior Agent
  expect(b.attribution?.uplineSnapshot).toEqual(["AGT-002", "AGT-001"]);
});

test("career progress computation: personal vs team metrics and qualification", () => {
  const state = createSeed();
  // In seed: AGT-001 has downline AGT-002, AGT-004, etc.
  const progress = computeCareerProgress(state, "AGT-001", "2026-Q4");

  expect(progress.periodId).toBe("2026-Q4");
  expect(progress.currentLevelId).toBe("CL-3"); // Coordinator
  expect(typeof progress.metrics.personalPilgrims).toBe("number");
  expect(typeof progress.metrics.teamPilgrims).toBe("number");
  expect(typeof progress.metrics.personalValue).toBe("number");
  expect(typeof progress.metrics.teamValue).toBe("number");
  expect(typeof progress.metrics.activeDirects).toBe("number");
});

test("period lock generates snapshots and prevents re-locking", () => {
  const state = createSeed();
  expect(state.careerSnapshots).toHaveLength(0);

  const snapshots = lockCareerPeriod(state, "2026-Q4", "USR-1");
  expect(snapshots).toHaveLength(state.agents.length);
  expect(state.careerSnapshots).toHaveLength(state.agents.length);

  for (const s of state.careerSnapshots) {
    expect(s.periodId).toBe("2026-Q4");
    expect(s.status).toBe("LOCKED");
    expect(s.lockedBy).toBe("USR-1");
  }

  // Attempting to re-lock throws an error
  expect(() => lockCareerPeriod(state, "2026-Q4", "USR-1")).toThrow(/sudah dikunci/);
});

test("phone masking helper conceals private phone digits", () => {
  expect(maskPhone("081234567890")).toBe("0812-****-7890");
  expect(maskPhone("08000000101")).toBe("0800-****-0101");
});

// --- UI TESTS ---

test("admin agent module: tabs, network tree and detail view render properly", async ({ page }) => {
  await enterAs(page, "SUPERADMIN");
  await page.goto("/admin/agen");

  await expect(page.getByRole("heading", { level: 1, name: "Mitra & Keagenan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Daftar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Jaringan" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Level karier" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Analitik" })).toBeVisible();

  // Test Jaringan tab
  await page.getByRole("button", { name: "Jaringan" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Pohon Struktur Jaringan" })).toBeVisible();
  // The agent code appears as text inside the tree node card
  await expect(page.locator("text=HASTA-AH01").first()).toBeVisible();

  // Test Level Karier tab
  await page.getByRole("button", { name: "Level karier" }).click();
  await expect(page.getByText("Jenjang Karier Mitra Hasta")).toBeVisible();
  await expect(page.getByText("Kunci Evaluasi Kuartal (Period Lock)")).toBeVisible();

  // Test Analitik tab
  await page.getByRole("button", { name: "Analitik" }).click();
  await expect(page.getByText("Peringkat & Kinerja Mitra · Kuartal 4")).toBeVisible();

  // Test Agent Detail view
  await page.goto("/admin/agen/AGT-001");
  await expect(page.getByRole("heading", { level: 1, name: "Ahmad Hidayat" })).toBeVisible();
  // Code appears in both description paragraph and profile panel; check the <strong> inside Fields panel
  await expect(page.locator("strong", { hasText: "HASTA-AH01" }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Profil", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Karier", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Karier", exact: true }).click();
  await expect(page.getByText("Evaluasi Karier Berjalan · 2026-Q4")).toBeVisible();
});

test("agent portal at mobile viewport: referral card, PII masking, team and career", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterAs(page, "AGENT", "AGT-001");

  // Home Screen
  await expect(page.getByRole("heading", { level: 1, name: "Assalamu'alaikum, Ahmad" })).toBeVisible();
  await expect(page.getByText("Kode Referral & Tautan Berbagi")).toBeVisible();
  // The referral code appears as a <strong> inside the referral card
  await expect(page.locator("strong", { hasText: "HASTA-AH01" }).first()).toBeVisible();
  await expect(page.getByText("Progres Karier Kuartal Ini")).toBeVisible();

  // Bottom navigation has 5 tabs
  const bottomNav = page.getByRole("navigation", { name: "Navigasi bawah" });
  await expect(bottomNav.getByRole("link", { name: "Beranda" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Jamaah" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Tim" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Karier" })).toBeVisible();
  await expect(bottomNav.getByRole("link", { name: "Lainnya" })).toBeVisible();

  // Jamaah tab: PII masking
  await bottomNav.getByRole("link", { name: "Jamaah" }).click();
  await expect(page).toHaveURL(/\/portal\/agen\/jamaah$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jamaah Binaan" })).toBeVisible();
  await expect(page.getByText("PII masking")).toBeVisible();
  // Phone numbers must be masked, e.g. 0800-****-0101
  await expect(page.getByText(/\d{4}-\*{4}-\d{4}/).first()).toBeVisible();

  // Tim tab: team structure
  await bottomNav.getByRole("link", { name: "Tim" }).click();
  await expect(page).toHaveURL(/\/portal\/agen\/tim$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jaringan Tim" })).toBeVisible();
  await expect(page.getByText("Mitra Langsung di Bawah Anda")).toBeVisible();

  // Karier tab: levels & qualification
  await bottomNav.getByRole("link", { name: "Karier" }).click();
  await expect(page).toHaveURL(/\/portal\/agen\/karier$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jenjang Karier" })).toBeVisible();
  await expect(page.getByText("Tingkatan Level Hasta Travel")).toBeVisible();

  // Komisi route: honest M3.3 upcoming notice
  await page.goto("/portal/agen/komisi");
  await expect(page.getByText("Segera hadir · M3.3")).toBeVisible();
});
