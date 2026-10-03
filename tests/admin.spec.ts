import { test, expect, type Page } from "@playwright/test";
import { createSeed, newJamaah } from "../content/admin/seed";
import { adminRoutes, moduleTitle } from "../content/admin/navigation";
import { addBooking, assignRoom, autoAssign, convertLead, distribute, members, outstanding, paid, recordPayment, verifyPayment } from "../lib/admin/model";
import { signSession, validSession } from "../lib/admin/session-token";

test("model preserves relationships, capacity, payment and allocation invariants", () => {
  const s = createSeed();
  expect(s.jamaah).toHaveLength(48);
  expect(s.leads).toHaveLength(24);
  for (const d of s.departures) expect(members(s, d.id).length).toBeLessThanOrEqual(d.capacity);
  for (const b of s.bookings) { expect(s.jamaah.some(j => j.id === b.jamaahId)).toBeTruthy(); expect(paid(s, b.id)).toBeLessThanOrEqual(b.total); }
  const lead = s.leads[0], d = s.departures.find(d => d.packageId === lead.packageId)!;
  const b = convertLead(s, lead.id, d.id);
  expect(s.jamaah.find(j => j.id === b.jamaahId)?.name).toBe(lead.name);
  expect(lead.bookingId).toBe(b.id);
  expect(() => convertLead(s, lead.id, d.id)).toThrow();
  expect(() => recordPayment(s, b.id, -1, "Transfer")).toThrow();
  expect(() => recordPayment(s, b.id, b.total + 1, "Transfer")).toThrow();
  recordPayment(s, b.id, b.total, "Transfer");
  expect(outstanding(s, b)).toBe(b.total);
  expect(() => recordPayment(s, b.id, 1, "Transfer")).toThrow();
  verifyPayment(s, s.payments[0].id);
  expect(outstanding(s, b)).toBe(0);
  expect(lead.stage).toBe("Won");
  expect(() => verifyPayment(s, s.payments[0].id)).toThrow();
  const female = s.rooms.find(r => r.departureId === d.id && r.gender === "Perempuan")!;
  expect(() => assignRoom(s, b.jamaahId, female.id)).toThrow();
  autoAssign(s, d.id, "Makkah");
  const rooms = s.rooms.filter(r => r.departureId === d.id && r.hotel === "Makkah");
  const assigned = rooms.flatMap(r => r.jamaahIds);
  expect(new Set(assigned).size).toBe(assigned.length);
  rooms.forEach(r => expect(r.jamaahIds.length).toBeLessThanOrEqual(r.capacity));
  distribute(s, [b.jamaahId], "Koper Besar");
  distribute(s, [b.jamaahId], "Koper Besar");
  expect(s.jamaah.find(j => j.id === b.jamaahId)!.equipment.filter(i => i === "Koper Besar")).toHaveLength(1);
  s.inventory.find(i => i.name === "Mukena")!.stock = 0;
  expect(() => distribute(s, [b.jamaahId], "Mukena")).toThrow();
  s.jamaah.push(newJamaah("JMH-capacity", "Ilham Zain", "08000000123"));
  d.capacity = members(s, d.id).length;
  expect(() => addBooking(s, "JMH-capacity", d.id)).toThrow();
});

test("signed session rejects forgery, expiry and invalid formats", () => {
  const secret = "test-secret-for-signed-session-only";
  const now = Date.now(), token = signSession(now + 60000, secret);
  expect(validSession(token, secret, now)).toBeTruthy();
  expect(validSession(token, "different-secret", now)).toBeFalsy();
  expect(validSession(token, secret, now + 60001)).toBeFalsy();
  expect(validSession(token + "a", secret, now)).toBeFalsy();
  expect(validSession("invalid", secret, now)).toBeFalsy();
});

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Selamat pagi, Ahmad" })).toBeVisible();
}
async function navigate(page: Page, slug: string) {
  await page.locator(".admin-sidebar").getByRole("link", { name: moduleTitle(slug), exact: slug !== "crm" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/${slug}$`));
  await expect(page.locator("#admin-content h1")).toBeVisible();
}

test("login protection, every sidebar route, public routes and responsive shell", async ({ page, request }) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/admin/jamaah");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Kata sandi", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page.locator(".form-error")).toContainText("tidak sesuai");
  await page.getByLabel("Kata sandi", { exact: true }).fill("HastaDemo2026!");
  await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Selamat pagi, Ahmad" })).toBeVisible();
  await page.screenshot({ path: "test-results/dashboard-desktop.png", fullPage: true });
  for (const slug of adminRoutes.filter(s => s !== "dashboard")) await navigate(page, slug);
  await navigate(page, "jamaah");
  await page.getByRole("textbox", { name: "Cari jamaah", exact: true }).fill("Ahmad Fauzi");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("link", { name: /Ahmad Fauzi JMH/ }).click();
  await expect(page.getByRole("heading", { name: "Ahmad Fauzi", exact: true })).toBeVisible();
  for (const tab of ["Paspor", "Dokumen", "Visa", "Booking", "Pembayaran", "Kamar", "Keluarga / Grup", "Aktivitas", "Data pribadi"]) await page.locator(".admin-tabs").getByRole("button", { name: tab, exact: true }).click();
  await page.keyboard.press("Control+k");
  await page.getByRole("textbox", { name: "Pencarian global" }).fill("Ahmad");
  await expect(page.getByRole("dialog").getByRole("link", { name: /Ahmad Fauzi Jamaah/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await navigate(page, "rooming");
  await page.screenshot({ path: "test-results/rooming-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Buka navigasi" })).toBeVisible();
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Selamat pagi, Ahmad" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/dashboard-mobile.png", fullPage: true });
  for (const path of ["/", "/paket-umroh", "/paket-umroh/umroh-reguler-9-hari", "/haji-khusus", "/jadwal-keberangkatan", "/tentang", "/kontak", "/faq"]) { const response = await request.get(path); expect(response.status(), path).toBe(200); }
  await page.getByRole("button", { name: "Menu profil Ahmad" }).click();
  await page.getByRole("button", { name: "Keluar", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin\/login$/);
  expect(errors).toEqual([]);
});

test("admin guide covers every module and its journey works on desktop and mobile", async ({ page }) => {
  await login(page);
  await navigate(page, "panduan");
  const featureLinks = page.locator(".guide-feature a");
  expect(await featureLinks.evaluateAll(links => links.map(link => link.getAttribute("href")).sort())).toEqual(adminRoutes.filter(slug => slug !== "panduan").map(slug => `/admin/${slug}`).sort());
  await expect(page.locator(".guide-stage")).toHaveCount(6);
  await page.getByRole("link", { name: "Coba satu perjalanan demo" }).click();
  await expect(page).toHaveURL(/#coba-demo$/);
  await expect(page.getByRole("heading", { name: "Ikuti satu jamaah dari awal" })).toBeInViewport();
  await page.locator(".guide-demo-steps").getByRole("link", { name: "Buka CRM / Leads" }).click();
  await expect(page).toHaveURL(/\/admin\/crm$/);
  await navigate(page, "panduan");
  await page.screenshot({ path: "test-results/guide-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole("navigation", { name: "Tahapan perjalanan admin" }).getByRole("link", { name: /Lengkapi persiapan/ }).click();
  await expect(page.getByRole("heading", { name: "Pastikan setiap jamaah siap berangkat" })).toBeInViewport();
  await page.getByRole("button", { name: "Buka navigasi" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Panduan Admin", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await page.screenshot({ path: "test-results/guide-mobile.png", fullPage: true });
});

test("lead converts to booking, payment verifies, and inventory follows shared state", async ({ page }) => {
  await login(page);
  await navigate(page, "crm");
  await page.getByRole("button", { name: /Salman Al Farisi/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Keberangkatan", exact: true }).selectOption({ index: 1 });
  await dialog.getByRole("button", { name: "Konversi ke booking" }).click();
  await expect(page.getByRole("status")).toContainText("dikonversi");
  await navigate(page, "booking");
  await page.getByRole("textbox", { name: "Cari booking" }).fill("Salman");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.locator("tbody tr td").first().getByRole("link").click();
  await page.getByRole("button", { name: "Catat pembayaran" }).click();
  await page.getByRole("dialog").getByLabel("Nominal (Rp)").fill("10000000");
  await page.getByRole("button", { name: "Simpan pembayaran" }).click();
  await expect(page.locator("tbody").last()).toContainText("Menunggu");
  await page.getByRole("button", { name: "Verifikasi", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("terverifikasi");
  await expect(page.locator(".invoice-sheet")).toContainText("Rp 10.000.000");
  await navigate(page, "perlengkapan");
  const table = page.locator(".admin-panel").filter({ has: page.getByRole("heading", { name: "Distribusi perlengkapan" }) });
  await table.getByRole("textbox").fill("Salman");
  await table.locator("tbody input[type=checkbox]").check();
  await table.getByRole("button", { name: "Tandai dibagikan" }).click();
  await expect(table.locator("tbody")).toContainText("Diterima");
  await navigate(page, "aktivitas");
  await expect(page.locator("tbody")).toContainText("Koper Besar dibagikan");
});

test("documents, rooming, manasik, CMS and broadcast actions update the demo", async ({ page }) => {
  await login(page);
  await navigate(page, "dokumen");
  await page.getByRole("button", { name: "Tinjau dokumen" }).first().click();
  await page.getByLabel("Unggah Paspor", { exact: true }).setInputFiles({ name: "paspor-demo.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\nDemo passport") });
  await page.getByRole("button", { name: "Verifikasi Paspor", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("terverifikasi");
  await page.getByRole("button", { name: "Tutup dialog" }).click();
  await navigate(page, "rooming");
  await page.getByRole("button", { name: "Auto Assign" }).click();
  await expect(page.getByRole("status")).toContainText("Alokasi otomatis");
  await navigate(page, "manasik");
  await page.getByRole("button", { name: "Manasik #2", exact: false }).click();
  await page.locator("tbody").getByRole("button", { name: "Check-in", exact: true }).first().click();
  await expect(page.getByRole("status")).toContainText("Presensi");
  await navigate(page, "artikel");
  await page.getByRole("button", { name: "Terbitkan", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("diterbitkan");
  await navigate(page, "broadcast");
  await page.getByRole("button", { name: "Pratinjau broadcast" }).click();
  await page.getByRole("button", { name: "Simulasikan pengiriman" }).click();
  await expect(page.getByRole("status")).toContainText("Tidak ada pesan dikirim");
  await expect(page.locator("tbody")).toContainText("Pengingat pembayaran");
  await navigate(page, "manifest");
  await page.getByRole("button", { name: "Persiapan SISKOPATUH" }).click();
  await expect(page.getByRole("dialog")).toContainText("Tidak terhubung ke API pemerintah");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Ekspor data persiapan" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.xml$/);
});
