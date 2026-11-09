import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { enterAs } from "./helpers/session";
import { TEST_SESSION_SECRET } from "../playwright.config";
import { roleIds, roles, type UserRole } from "../content/admin/roles";
import { adminRoutes } from "../content/admin/navigation";
import { can, canAccessRoute, homeFor, navigationFor } from "../lib/admin/access";
import { readDemoSession, readLegacySession, signDemoSession, signSession } from "../lib/admin/session-token";
import { DEMO_STORAGE_KEY, decodeDemo, encodeDemo } from "../lib/admin/persistence";
import { CURRENT_DEMO_VERSION, migrateDemo } from "../lib/admin/migrations";
import { financialBalance } from "../lib/admin/model";
import { financialDocument } from "../lib/admin/financial-documents";
import { createSeed } from "../content/admin/seed";

const FIXTURE = readFileSync("tests/fixtures/demo-v2.json", "utf8");
const sidebar = (page: Page) => page.locator(".admin-sidebar");
const stored = (page: Page) => page.evaluate(key => localStorage.getItem(key), DEMO_STORAGE_KEY);

test("role matrix: homes, navigation, module access and sensitive actions", () => {
  expect(roleIds).toHaveLength(8);
  for (const r of roleIds) expect(homeFor(r)).toBe(roles[r].shell === "portal" ? `/portal/${{ AGENT: "agen", TOUR_LEADER: "tour-leader", PILGRIM: "jamaah" }[r as "AGENT"]}` : "/admin/dashboard");
  const slugs = (r: UserRole) => navigationFor(r).flatMap(g => g.items.map(([slug]) => slug));
  expect(slugs("SUPERADMIN").sort()).toEqual([...adminRoutes].sort());
  expect(slugs("FINANCE")).toEqual(expect.arrayContaining(["pembayaran", "invoice", "pengeluaran", "hpp", "komisi"]));
  expect(slugs("FINANCE")).not.toContain("rooming");
  expect(slugs("SALES_CS")).toEqual(expect.arrayContaining(["crm", "booking", "jamaah", "haji-khusus"]));
  expect(slugs("SALES_CS")).not.toEqual(expect.arrayContaining(["hpp"]));
  expect(slugs("OPERATIONS")).toEqual(expect.arrayContaining(["keberangkatan", "manifest", "dokumen", "rooming", "perlengkapan"]));
  expect(slugs("OPERATIONS")).not.toContain("pembayaran");
  for (const r of ["AGENT", "TOUR_LEADER", "PILGRIM"] as const) { expect(slugs(r)).toEqual([]); expect(canAccessRoute(r, "dashboard")).toBe(false); }
  expect(can("FINANCE", "payment.verify")).toBe(true);
  expect(can("SALES_CS", "payment.verify")).toBe(false);
  expect(can("SALES_CS", "payment.record")).toBe(true);
  expect(can("OWNER", "hpp.finalize")).toBe(true);
  expect(can("FINANCE", "hpp.finalize")).toBe(false);
  expect(can("FINANCE", "hpp:write")).toBe(true);
  expect(can("OWNER", "rooming:write")).toBe(false);
  expect(can("OWNER", "rooming:read")).toBe(true);
  expect(can("OPERATIONS", "document.verify")).toBe(true);
  expect(can("SALES_CS", "document.verify")).toBe(false);
  for (const r of roleIds) expect(can(r, "demo.reset")).toBe(r === "SUPERADMIN");
});

test("v2 session tokens: signature, expiry, tamper, invalid role and legacy compatibility", () => {
  const secret = "unit-test-secret-for-demo-sessions-000", now = Date.now();
  const token = signDemoSession({ role: "FINANCE", personaId: "USR-3", expires: now + 60000 }, secret);
  expect(readDemoSession(token, secret, now)).toEqual({ version: 2, role: "FINANCE", personaId: "USR-3", expires: now + 60000 });
  expect(readDemoSession(token, "another-secret-another-secret-0000", now)).toBeNull();
  expect(readDemoSession(token, secret, now + 60001)).toBeNull();
  expect(readDemoSession(token.replace("FINANCE", "OWNER"), secret, now)).toBeNull();
  expect(readDemoSession(token.replace("FINANCE", "ROOT"), secret, now)).toBeNull();
  expect(readDemoSession("garbage", secret, now)).toBeNull();
  expect(() => signDemoSession({ role: "FINANCE", personaId: "bad id!", expires: now }, secret)).toThrow();
  const legacy = signSession(now + 60000, secret);
  expect(readLegacySession(legacy, secret, now)).toMatchObject({ role: "SUPERADMIN", personaId: "USR-1", legacy: true });
  expect(readLegacySession(legacy, secret, now + 60001)).toBeNull();
});

test("frozen v2 workspace migrates to current version without touching business records", () => {
  const before = JSON.parse(FIXTURE);
  expect(before.version).toBe(2);
  const state = decodeDemo(FIXTURE);
  // bookings are excluded because migration v4 backfills the new `attribution` field;
  // agents are excluded because migration v4 backfills code/levelId/parentId/joinedAt/accountStatus/email;
  // leads are excluded because migration v4 backfills agentId/referralCode;
  // their integrity is verified below via spot-checks and financialBalance().
  const preserved = ["jamaah", "payments", "costings", "costTemplates", "costScenarios", "hajjPackages", "packages", "departures", "inventory", "warehouses", "stockMovements", "kitTemplates", "kitAllocations", "handovers", "activities", "rooms", "expenses", "manasik", "settings", "permissions"] as const;
  for (const key of preserved) expect(state[key], key).toEqual(before.state[key]);
  // Spot checks on the records the fixture deliberately exercised.
  expect(state.costings.find(c => c.status === "Final")?.finalizedAt).toBe("2026-10-02T05:00:00.000Z");
  expect(state.bookings.find(b => b.id === "BK-HAJ-FIXTURE")?.productType).toBe("HAJJ_SPECIAL");
  expect(state.handovers.some(h => h.id === "HO-FIXTURE")).toBe(true);
  expect(state.payments.find(p => p.reference === "KAS-FIXTURE-01")?.status).toBe("Terverifikasi");
  expect(state.bookings.find(b => b.id === "BK-2026010")?.status).toBe("Batal");
  expect(state.activities[0].user).toBe("Ahmad"); // old records are not rewritten
  for (const b of state.bookings) expect(financialBalance(state, b)).toEqual(financialBalance(before.state, b));
  const open = state.bookings.find(b => b.status === "Aktif")!;
  expect(financialDocument(state, open.id, "invoice", undefined, "2026-10-02").presentation.contract).toBe(BigInt(open.total));
  // Staff: role ids + three new personas, nothing else.
  expect(state.users.map(u => [u.id, u.roleId])).toEqual([["USR-1", "SUPERADMIN"], ["USR-2", "SALES_CS"], ["USR-3", "FINANCE"], ["USR-4", "OWNER"], ["USR-5", "OPERATIONS"], ["USR-6", "TOUR_LEADER"]]);
  expect(state.users[0].role).toBe("Super Admin");
  // Re-encode at current version; decoding again and re-running the step are no-ops.
  const encoded = encodeDemo(state);
  expect(JSON.parse(encoded).version).toBe(CURRENT_DEMO_VERSION);
  expect(decodeDemo(encoded)).toEqual(state);
  expect(migrateDemo(2, structuredClone(state) as unknown as Record<string, unknown>).users).toEqual(state.users);
  // A fresh seed is already current-version-shaped.
  expect(decodeDemo(encodeDemo(createSeed())).users).toHaveLength(6);
});

test("all eight roles enter without credentials and land on their own home", async ({ page }) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  const headings: Record<UserRole, RegExp> = {
    SUPERADMIN: /^Selamat pagi, Ahmad$/, OWNER: /^Ringkasan eksekutif, Zainal$/, SALES_CS: /^Halo Rina/, FINANCE: /^Keuangan hari ini, Fajar$/,
    OPERATIONS: /^Operasional hari ini, Wulan$/, AGENT: /^Assalamu'alaikum, Ahmad$/, TOUR_LEADER: /^Assalamu'alaikum, Harun$/, PILGRIM: /^Assalamu'alaikum, Nur$/,
  };
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Pilih Akses Demo" })).toBeVisible();
  await expect(page.locator(".gateway-card")).toHaveCount(8);
  for (const role of roleIds) {
    await enterAs(page, role);
    await expect(page.getByRole("heading", { level: 1, name: headings[role] })).toBeVisible();
    await expect(page.locator(".role-pill")).toContainText(roles[role].shell === "portal" ? "Demo" : roles[role].shortLabel);
  }
  expect(errors).toEqual([]);
});

test("navigation permissions, AccessDenied, read-only modules and deep links", async ({ page }) => {
  test.setTimeout(240000);
  await enterAs(page, "FINANCE");
  await expect(sidebar(page).getByRole("link", { name: "Pembayaran", exact: true })).toBeVisible();
  await expect(sidebar(page).getByRole("link", { name: "Rooming List", exact: true })).toHaveCount(0);
  await page.goto("/admin/rooming");
  await expect(page.getByRole("heading", { name: /Modul Rooming List tidak termasuk akses ini/ })).toBeVisible();
  await page.goto("/admin/invoice/BK-2026001");
  await expect(page.getByRole("heading", { name: "INV/BK-2026001" })).toBeVisible();
  await page.goto("/admin/pembayaran"); await page.getByRole("button", { name: "Verifikasi pembayaran", exact: true }).click(); await page.getByRole("combobox", { name: "Semua status transaksi" }).selectOption("Menunggu");
  await expect(page.getByRole("button", { name: "Verifikasi", exact: true }).first()).toBeVisible();

  await enterAs(page, "SALES_CS");
  await page.goto("/admin/pembayaran"); await page.getByRole("button", { name: "Verifikasi pembayaran", exact: true }).click(); await page.getByRole("combobox", { name: "Semua status transaksi" }).selectOption("Menunggu");
  await expect(page.getByRole("button", { name: "Verifikasi", exact: true })).toHaveCount(0);
  await expect(page.locator("tbody")).toContainText("Menunggu Finance");
  await page.goto("/admin/hpp");
  await expect(page.getByRole("heading", { name: /tidak termasuk akses ini/ })).toBeVisible();
  await page.goto("/portal/jamaah");
  await expect(page).toHaveURL(/\/admin\/dashboard$/);

  await enterAs(page, "OWNER");
  await page.goto("/admin/rooming");
  await expect(page.getByRole("note")).toContainText("Mode lihat saja");
  await page.goto("/admin/hpp/UMR-261007-A");
  await expect(page.getByRole("button", { name: "Finalisasi costing", exact: true })).toBeVisible();

  await enterAs(page, "PILGRIM");
  await page.goto("/admin/jamaah");
  await expect(page).toHaveURL(/\/portal\/jamaah$/);
  await page.goto("/portal/agen");
  await expect(page).toHaveURL(/\/portal\/jamaah$/);

  await enterAs(page, "SUPERADMIN");
  for (const [url, heading] of [["/admin/haji-khusus/HAJ-2028-A", /Haji Khusus Amanah 2028/], ["/admin/keberangkatan/UMR-261007-A", /UMR-261007-A/], ["/admin/agen/AGT-001", /Ahmad Hidayat/]] as const) {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1, name: heading }).first()).toBeVisible();
  }
  await page.goto("/admin/manifest?departure=UMR-261007-A");
  await expect(page.getByRole("heading", { name: "Manifest jamaah" })).toBeVisible();
  await page.goto("/admin/rooming");
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("invalid, expired and legacy sessions; logout clears both cookies", async ({ page, context, baseURL }) => {
  const url = new URL(baseURL!);
  const cookie = (name: string, value: string, path = "/") => ({ name, value, domain: url.hostname, path, httpOnly: true, sameSite: "Lax" as const });
  await context.addCookies([cookie("hasta_demo_session", "garbage")]);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  // Expired/legacy cookies need the server's signing secret; skip when reusing a server with another secret.
  await context.clearCookies();
  await context.addCookies([cookie("hasta_demo_session", signDemoSession({ role: "FINANCE", personaId: "USR-3", expires: Date.now() + 3600000 }, TEST_SESSION_SECRET))]);
  await page.goto("/admin/dashboard");
  test.skip(page.url().endsWith("/admin/login"), "Running dev server uses a different ADMIN_SESSION_SECRET.");
  await expect(page.getByRole("heading", { name: /Keuangan hari ini/ })).toBeVisible();
  await context.clearCookies();
  await context.addCookies([cookie("hasta_demo_session", signDemoSession({ role: "FINANCE", personaId: "USR-3", expires: Date.now() - 1000 }, TEST_SESSION_SECRET))]);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await context.clearCookies();
  await context.addCookies([cookie("hasta_admin_session", signSession(Date.now() + 3600000, TEST_SESSION_SECRET), "/admin")]);
  await page.goto("/admin/dashboard");
  await expect(page.getByRole("heading", { name: "Selamat pagi, Ahmad" })).toBeVisible();
  await enterAs(page, "OPERATIONS");
  const names = async () => (await context.cookies()).filter(c => c.value).map(c => c.name);
  expect(await names()).toEqual(["hasta_demo_session"]);
  await page.getByRole("button", { name: /Menu profil/ }).click();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(await names()).toEqual([]);
  await page.goto("/portal/jamaah");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("role switching keeps demo data, replaces navigation and records the acting persona", async ({ page }) => {
  test.setTimeout(240000);
  await enterAs(page, "SALES_CS");
  await page.goto("/admin/crm");
  await page.getByRole("button", { name: "Tambah lead", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nama lead").fill("Lead Ganti Peran Demo");
  await dialog.getByLabel("Nomor telepon / WhatsApp").fill("08000009911");
  await dialog.getByRole("button", { name: "Simpan lead", exact: true }).click();
  await expect(page.locator(".admin-toast")).toContainText("berhasil disimpan");
  const afterLead = await stored(page);
  expect(JSON.parse(afterLead!).state.activities[0].user).toBe("Rina Amelia");

  await page.getByRole("button", { name: /Menu profil/ }).click();
  await page.locator(".admin-dropdown").getByRole("link", { name: "Ganti akses demo", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saat ini Anda masuk sebagai" })).toContainText("Sales & Customer Service");
  await enterAs(page, "FINANCE");
  expect(await stored(page)).toBe(afterLead); // switching itself writes nothing
  await expect(sidebar(page).getByRole("link", { name: /CRM/ })).toHaveCount(0);
  await page.goto("/admin/crm");
  await expect(page.getByRole("heading", { name: /tidak termasuk akses ini/ })).toBeVisible();
  await page.goto("/admin/pembayaran"); await page.getByRole("button", { name: "Verifikasi pembayaran", exact: true }).click(); await page.getByRole("combobox", { name: "Semua status transaksi" }).selectOption("Menunggu");
  await page.getByRole("button", { name: "Verifikasi", exact: true }).first().click();
  await expect(page.locator(".admin-toast")).toContainText("terverifikasi");
  const activities = JSON.parse((await stored(page))!).state.activities;
  expect(activities.slice(0, 2).map((a: { user: string }) => a.user)).toEqual(["Fajar Hidayat", "Rina Amelia"]);

  await enterAs(page, "SUPERADMIN");
  await page.goto("/admin/crm");
  await page.getByRole("button", { name: "Tabel", exact: true }).click();
  await page.getByRole("textbox", { name: "Cari lead", exact: true }).first().fill("Ganti Peran");
  await expect(page.locator("tbody")).toContainText("Lead Ganti Peran Demo");
});

test("saved v2 workspace opens after the upgrade and is re-saved at current version only on change", async ({ page }) => {
  await page.goto("/admin/login");
  await page.evaluate(([key, raw]) => localStorage.setItem(key, raw), [DEMO_STORAGE_KEY, FIXTURE]);
  await enterAs(page, "SUPERADMIN");
  await expect(page.getByRole("heading", { name: "Selamat pagi, Ahmad" })).toBeVisible();
  await page.goto("/admin/invoice/BK-HAJ-FIXTURE");
  await expect(page.getByRole("heading", { name: "INV/BK-HAJ-FIXTURE" })).toBeVisible();
  // After load the workspace is not yet re-persisted (read-only page load) — version stays at v2
  expect(JSON.parse((await stored(page))!).version).toBe(2);
  await page.goto("/admin/notifikasi");
  await page.getByRole("button", { name: "Tandai semua dibaca" }).click();
  const saved = JSON.parse((await stored(page))!);
  // After a mutation the workspace is saved at the CURRENT_DEMO_VERSION (v4 since M3.2)
  expect(saved.version).toBe(CURRENT_DEMO_VERSION);
  expect(saved.state.users.map((u: { roleId: string }) => u.roleId)).toContain("TOUR_LEADER");
  expect(saved.state.handovers.some((h: { id: string }) => h.id === "HO-FIXTURE")).toBe(true);
});

test("persona selection and mobile-first portal shells", async ({ page }, testInfo) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 390, height: 844 });
  await enterAs(page, "PILGRIM", "JMH-10283");
  await expect(page.getByRole("heading", { level: 1, name: "Assalamu'alaikum, Budi" })).toBeVisible();
  const bottom = page.getByRole("navigation", { name: "Navigasi bawah" });
  await expect(bottom).toBeVisible();
  await expect(bottom.getByRole("link")).toHaveCount(5);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const box = await bottom.getByRole("link").first().boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await bottom.getByRole("link", { name: "Pembayaran" }).click();
  await expect(page).toHaveURL(/\/portal\/jamaah\/pembayaran$/);
  await expect(page.getByText("Segera hadir · M5.1")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("m3_1-portal-mobile.png") });
  await bottom.getByRole("link", { name: "Lainnya" }).click();
  await expect(page.locator(".portal-card").first()).toContainText("Budi Santoso");
  await page.getByRole("link", { name: "Ganti akses demo" }).click();
  await enterAs(page, "AGENT", "AGT-002");
  await expect(page.getByRole("heading", { level: 1, name: "Assalamu'alaikum, Fitria" })).toBeVisible();
  await enterAs(page, "TOUR_LEADER");
  await expect(page.getByRole("heading", { name: "Belum ada penugasan keberangkatan" })).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByRole("navigation", { name: "Navigasi bawah" })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Navigasi portal" })).toBeVisible();
});

test("refresh keeps the session; gateway reset needs confirmation and keeps the role", async ({ page }) => {
  await enterAs(page, "FINANCE");
  await page.reload();
  await expect(page.getByRole("heading", { name: /Keuangan hari ini/ })).toBeVisible();
  await page.goto("/admin/pengeluaran");
  await page.getByRole("button", { name: "Tandai dibayar" }).first().click();
  const changed = await stored(page);
  await page.goto("/admin/login?switch=1");
  await page.getByRole("button", { name: "Reset data demo" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  expect(await stored(page)).toBe(changed);
  await page.getByRole("button", { name: "Reset data demo" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Ya, lanjutkan" }).click();
  await expect(page.getByRole("status").filter({ hasText: "dikembalikan" })).toBeVisible();
  expect(JSON.parse((await stored(page))!).state).toEqual(JSON.parse(encodeDemo(createSeed())).state);
  await expect(page.getByRole("status").filter({ hasText: "Saat ini Anda masuk sebagai" })).toContainText("Finance");
});

test("M3.1-R: read-only roles see no mutation controls while search, filters, details and export remain", async ({ page }) => {
  test.setTimeout(240000);
  const absent = async (names: string[]) => { for (const name of names) await expect(page.getByRole("button", { name, exact: true }), name).toHaveCount(0); };
  await enterAs(page, "OWNER");
  await page.goto("/admin/rooming");
  await expect(page.getByRole("note")).toContainText("Mode lihat saja");
  await absent(["Tambah kamar", "Auto Assign", "Atur"]);
  await expect(page.locator(".room-slot.filled button")).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Pilih keberangkatan" })).toBeVisible();
  await page.goto("/admin/keberangkatan/UMR-261007-A");
  await absent(["Tandai berangkat"]);
  await expect(page.locator(".checklist-row input[type=checkbox]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Lihat kamar" })).toBeVisible();
  await page.goto("/admin/perlengkapan");
  await absent(["Catat stok masuk / koreksi"]);
  await page.goto("/admin/booking");
  await absent(["Tambah booking"]);
  await expect(page.getByRole("button", { name: "Ekspor Excel" })).toBeVisible();
  await page.goto("/admin/users");
  await absent(["Tambah pengguna", "Nonaktifkan"]);

  await enterAs(page, "FINANCE");
  await page.goto("/admin/jamaah");
  await absent(["Tambah jamaah", "Impor JSON", "Unduh format impor"]);
  await page.getByRole("textbox", { name: "Cari jamaah", exact: true }).fill("Ahmad Fauzi");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.goto("/admin/jamaah/JMH-10281");
  await absent(["Edit data"]);
  await page.goto("/admin/settings");
  await absent(["Simpan pengaturan", "Reset data demo"]);
  await expect(page.locator(".readonly-fieldset")).toHaveAttribute("disabled", "");

  await enterAs(page, "OPERATIONS");
  await page.goto("/admin/hpp/UMR-261007-A");
  await absent(["Simpan draft", "Finalisasi costing", "Tambah komponen", "Jadikan template paket"]);
  await page.goto("/admin/jamaah/JMH-10281");
  await page.locator(".admin-tabs").getByRole("button", { name: "Pembayaran", exact: true }).click();
  await expect(page.getByRole("link", { name: "Buka invoice →" })).toHaveCount(0); // Operations cannot open Invoice

  await enterAs(page, "SALES_CS");
  await page.goto("/admin/paket/p01");
  await absent(["Edit paket", "Duplikat"]);

  await enterAs(page, "SUPERADMIN");
  await page.goto("/admin/rooming");
  await expect(page.getByRole("button", { name: "Auto Assign" })).toBeVisible();
  await expect(page.getByRole("note")).toHaveCount(0);
});

test("M3.1-R: dashboards label the simulated business period separately from the visitor's date", async ({ page }) => {
  for (const role of ["SUPERADMIN", "OWNER", "FINANCE"] as const) {
    await enterAs(page, role);
    const label = page.locator(".simulation-date").first();
    await expect(label).toContainText("Periode simulasi");
    await expect(label).toContainText("2 Okt 2026");
    await expect(label).toContainText("Tanggal Anda:");
  }
});
