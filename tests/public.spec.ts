import { test, expect, type Page } from "@playwright/test";
import { businessToday, isOpenForRegistration, openDepartures, unavailableReason } from "../lib/departures";
import { linkWa, pesanWa, WA_DEMO_NOTE } from "../lib/whatsapp";

const ROUTES = ["/", "/paket-umroh", "/paket-umroh/umroh-ramah-lansia-12-hari", "/haji-khusus", "/jadwal-keberangkatan", "/faq", "/tentang", "/kontak"];
// PUBLIC-02B: visible labels say "Umrah"; the /paket-umroh route is unchanged for compatibility.
const NAV = ["Paket Umrah", "Haji Khusus", "Jadwal", "FAQ", "Tentang", "Kontak"];
const decodeWa = (href: string) => decodeURIComponent(href.split("text=")[1] ?? "");
const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
// Jakarta = UTC+7. Fixing the browser clock makes date boundaries deterministic.
const atJakarta = (page: Page, isoUtc: string) => page.clock.setFixedTime(new Date(isoUtc));

test("business date: Jakarta day boundary, departure-day cutoff and unavailable reasons", () => {
  expect(businessToday(new Date("2026-11-10T16:59:59Z"))).toBe("2026-11-10");
  expect(businessToday(new Date("2026-11-10T17:00:00Z"))).toBe("2026-11-11");
  expect(isOpenForRegistration("2026-11-11", "2026-11-11")).toBe(false);
  expect(isOpenForRegistration("2026-11-12", "2026-11-11")).toBe(true);
  expect(openDepartures([{ date: "2026-12-01" }, { date: "2026-11-01" }], "2026-11-11").map(d => d.date)).toEqual(["2026-12-01"]);
  expect(unavailableReason("2026-11-01", [{ date: "2026-11-01" }], "2026-11-11")).toBe("past");
  expect(unavailableReason("2030-01-01", [{ date: "2026-11-01" }], "2026-11-11")).toBe("unknown");
});

test("WhatsApp messages: operator vs studio audiences, Haji wording and URL encoding", () => {
  const operator = [pesanWa({ kind: "umum" }), pesanWa({ kind: "paket", namaPaket: "Umroh Uji", tanggal: "2027-03-10", kota: "Jakarta" }), pesanWa({ kind: "haji", namaPaket: "Haji Khusus Reguler", kategori: "khusus" }), pesanWa({ kind: "haji", namaPaket: "Haji Mujamalah", kategori: "mujamalah" }), pesanWa({ kind: "badal" })];
  for (const m of operator) {
    expect(m.startsWith("Assalamu'alaikum")).toBe(true);
    expect(m).toContain("bukan biro perjalanan umroh/haji");
    expect(m).not.toContain("Halo Kalsara");
  }
  expect(operator[1]).toContain("Umroh Uji keberangkatan 10 Maret 2027 dari Jakarta");
  expect(operator[2]).toContain("masa tunggu");
  expect(operator[3]).not.toContain("masa tunggu");
  expect(operator[3]).not.toContain("Haji Khusus");
  expect(pesanWa({ kind: "studio" })).toMatch(/^Halo Kalsara Digital Studio/);
  const href = linkWa({ kind: "paket", namaPaket: "Umroh & Plus", tanggal: "2027-03-10", kota: "Jakarta" });
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
  expect(href).toContain("%26");
  expect(href).toContain("%0A");
  expect(decodeWa(href)).toBe(pesanWa({ kind: "paket", namaPaket: "Umroh & Plus", tanggal: "2027-03-10", kota: "Jakarta" }));
  expect(WA_DEMO_NOTE).toContain("bukan ke biro perjalanan");
});

test("public routes respond and never overflow horizontally at 390, 768 and 1440 px", async ({ page, request }) => {
  test.setTimeout(240000);
  for (const path of ROUTES) expect((await request.get(path)).status(), path).toBe(200);
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ROUTES) {
      await page.goto(path);
      expect(await noOverflow(page), `${path} @${width}`).toBe(true);
    }
  }
});

test("mobile menu: every destination, active route, Escape and focus return, gateway entry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/haji-khusus");
  const button = page.getByRole("button", { name: "Menu", exact: true });
  await expect(button).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Navigasi utama", exact: true })).toBeHidden();
  await button.click();
  const dialog = page.getByRole("dialog", { name: "Menu situs" });
  await expect(dialog).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  for (const label of NAV) {
    const link = dialog.getByRole("link", { name: new RegExp(`^${label}`) });
    await expect(link).toBeVisible();
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(dialog.getByRole("link", { name: /^Haji Khusus/ })).toHaveAttribute("aria-current", "page");
  expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  // Navigate through the menu.
  await button.click();
  await dialog.getByRole("link", { name: /^FAQ/ }).click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(dialog).toBeHidden();
  // Close button + gateway entry labelled as demo access.
  await button.click();
  await dialog.getByRole("button", { name: "Tutup" }).click();
  await expect(dialog).toBeHidden();
  await button.click();
  await expect(dialog).toContainText("bukan login sungguhan");
  await dialog.getByRole("link", { name: "Coba workspace demo" }).click();
  await expect(page.getByRole("heading", { name: "Pilih Akses Demo" })).toBeVisible();
});

test("desktop and tablet navigation keep branding; desktop marks the active page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/paket-umroh");
  const nav = page.getByRole("navigation", { name: "Navigasi utama", exact: true });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Paket Umrah" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeHidden();
  await expect(page.getByRole("link", { name: "Workspace demo", exact: true })).toHaveAttribute("href", "/admin/login");
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible();
  await expect(page.locator('header a[data-wa-source="header"]')).toBeVisible();
});

test("WhatsApp CTAs: operator messages carry context and the demo disclosure; studio CTA lives only in the demo area", async ({ page }) => {
  await page.goto("/");
  const operator = page.locator('a[href*="wa.me"][data-wa-audience="operator"]');
  expect(await operator.count()).toBeGreaterThan(2);
  for (const href of await operator.evaluateAll(els => els.map(e => e.getAttribute("href")!))) {
    expect(decodeWa(href)).toContain("Assalamu'alaikum");
    expect(decodeWa(href)).toContain("kontak demonstrasi Kalsara Digital Studio");
  }
  const studio = page.locator('a[href*="wa.me"][data-wa-audience="studio"]');
  await expect(studio).toHaveCount(1);
  await expect(page.locator('[data-area="demo-showcase"] a[data-wa-audience="studio"]')).toHaveCount(1);
  expect(decodeWa((await studio.getAttribute("href"))!)).toMatch(/^Halo Kalsara/);
  await expect(page.getByText("Demo: pesan dikirim ke nomor demonstrasi Kalsara Digital Studio").filter({ visible: true }).first()).toBeVisible();
  // Haji page: header consult button switches to a Haji Khusus message.
  await page.goto("/haji-khusus");
  expect(decodeWa((await page.locator('header a[data-wa-source="header"]').getAttribute("href"))!)).toContain("masa tunggu");
});

test("mobile sticky CTAs never stack: one generic bar on listings, only the date-aware bar on detail", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/paket-umroh");
  await expect(page.locator("[data-sticky-cta]:visible")).toHaveCount(1);
  await expect(page.locator('[data-sticky-cta="umum"]')).toBeVisible();
  await page.goto("/paket-umroh/umroh-ramah-lansia-12-hari");
  await expect(page.locator("[data-sticky-cta]:visible")).toHaveCount(1);
  await expect(page.locator('[data-sticky-cta="detail"]')).toBeVisible();
});

test("package detail keeps the selected departure in the URL, the WhatsApp text and after reload", async ({ page }) => {
  await page.goto("/paket-umroh/umroh-ramah-lansia-12-hari");
  const chips = page.locator('section[aria-labelledby="pilih-tanggal"] button');
  await expect(chips.first()).toBeVisible();
  await chips.nth(1).click();
  const label = (await chips.nth(1).innerText()).split(/\n| · /)[0];
  await expect(page).toHaveURL(/\?d=\d{4}-\d{2}-\d{2}$/);
  expect(decodeWa((await page.locator('a[data-wa-source="detail"]').getAttribute("href"))!)).toContain(`keberangkatan ${label}`);
  await page.reload();
  await expect(chips.nth(1)).toHaveAttribute("aria-pressed", "true");
});

test("stale and unknown ?d= links show an unavailable-date state with alternatives", async ({ page }) => {
  await atJakarta(page, "2026-11-08T05:00:00Z");
  await page.goto("/paket-umroh/umroh-reguler-9-hari?d=2026-10-07");
  const notice = page.locator('[data-state="tanggal-tidak-tersedia"]');
  await expect(notice).toContainText("Keberangkatan 7 Oktober 2026 sudah lewat");
  await expect(notice.getByRole("link", { name: "lihat jadwal semua paket" })).toBeVisible();
  await expect(page).not.toHaveURL(/d=2026-10-07/);
  const wa = decodeWa((await page.locator('a[data-wa-source="detail"]').getAttribute("href"))!);
  expect(wa).not.toContain("7 Oktober 2026");
  await expect(page.locator('section[aria-labelledby="pilih-tanggal"] button', { hasText: "7 Oktober 2026" })).toHaveCount(0);
  await page.goto("/paket-umroh/umroh-reguler-9-hari?d=2030-01-01");
  await expect(notice).toContainText("tidak ada dalam jadwal paket ini");
});

test("departure day is closed at Jakarta midnight on detail, catalogue, homepage and schedule", async ({ page }) => {
  // 9 Feb 2027 23:59 WIB → 10 Feb still open.
  await atJakarta(page, "2027-02-09T16:59:00Z");
  await page.goto("/paket-umroh/umroh-ramah-lansia-12-hari");
  const chips = page.locator('section[aria-labelledby="pilih-tanggal"] button');
  await expect(chips.filter({ hasText: "10 Februari 2027" })).toHaveCount(1);
  // 10 Feb 2027 00:01 WIB → departure day, closed.
  await page.clock.setFixedTime(new Date("2027-02-09T17:01:00Z"));
  await page.reload();
  await expect(chips.first()).toBeVisible();
  await expect(chips.filter({ hasText: "10 Februari 2027" })).toHaveCount(0);
  // Catalogue, homepage and schedule hide everything up to 1 Mar 2027 (WIB).
  await page.clock.setFixedTime(new Date("2027-03-01T05:00:00Z"));
  for (const [path, selector] of [["/paket-umroh", "article"], ["/", "[data-departure-card], [data-upcoming-row], [data-finder-result]"]]) {
    await page.goto(path);
    const cards = page.locator(selector);
    await expect(cards.first()).toBeVisible();
    // Retrying assertion: the server HTML may be older; the browser re-checks the date after hydration.
    await expect(cards.filter({ hasText: /2026|Januari 2027|Februari 2027|1 Maret 2027/ }), path).toHaveCount(0);
  }
  await page.goto("/paket-umroh");
  await expect(page.locator("#f-bulan option", { hasText: "Februari 2027" })).toHaveCount(0);
  await page.goto("/jadwal-keberangkatan");
  await expect(page.getByRole("heading", { name: /^Maret 2027/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Februari 2027/ })).toHaveCount(0);
});

test("catalogue filters still sync with the URL", async ({ page }) => {
  await page.goto("/paket-umroh");
  await page.getByRole("button", { name: "Plus", exact: true }).click();
  await expect(page).toHaveURL(/tipe=umroh-plus/);
  const cards = page.locator("article");
  await expect(cards.first()).toBeVisible();
  for (const text of await cards.allInnerTexts()) expect(text).toMatch(/Umrah Plus · \d+ hari/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Plus", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("Haji page separates Haji Khusus from Mujamalah without contradictory waiting-time wording", async ({ page }) => {
  await page.goto("/haji-khusus");
  await expect(page.getByText("Tanpa antre")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Haji Mujamalah — jalur terpisah" })).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: "Contoh tampilan" })).toBeVisible();
  for (const card of await page.locator('[data-haji-kategori="khusus"] a[href*="wa.me"]').all()) expect(decodeWa((await card.getAttribute("href"))!)).toContain("masa tunggu");
  const mujamalah = decodeWa((await page.locator('[data-haji-kategori="mujamalah"] a[href*="wa.me"]').getAttribute("href"))!);
  expect(mujamalah).not.toContain("masa tunggu");
  expect(mujamalah).not.toContain("Haji Khusus Haji");
  await expect(page.locator('[data-haji-kategori="mujamalah"]')).not.toContainText("Perkiraan masa tunggu");
});

test("licence and requirement claims are qualified; no dead verification link", async ({ page }) => {
  for (const path of ["/", "/tentang", "/kontak", "/haji-khusus", "/paket-umroh/umroh-ramah-lansia-12-hari"]) {
    await page.goto(path);
    await expect(page.locator('a[href*="simpu"], a[href*="kemenag"]'), path).toHaveCount(0);
    await expect(page.getByText(/contoh fiktif/).first(), path).toBeVisible();
  }
  await page.goto("/paket-umroh/umroh-ramah-lansia-12-hari");
  await expect(page.locator("#syarat").locator("..")).toContainText("Contoh persyaratan");
  await expect(page.getByText(/Surat mahram/)).toHaveCount(0);
  await expect(page.getByText(/minimal 8 bulan/)).toHaveCount(0);
});

test("branded Indonesian 404 with recovery links and a real 404 status", async ({ page, request }) => {
  for (const path of ["/halaman-tidak-ada", "/paket-umroh/paket-tidak-ada"]) {
    expect((await request.get(path)).status(), path).toBe(404);
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Halaman ini tidak tersedia" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: /Lihat paket Umrah/ })).toHaveAttribute("href", "/paket-umroh");
    await expect(page.locator("main").getByRole("link", { name: "Kembali ke beranda" })).toHaveAttribute("href", "/");
    await expect(page.locator("footer")).toHaveCount(1); // header/footer exactly once, whatever not-found boundary is used
    await expect(page.locator("body > header, header.border-b")).toHaveCount(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/halaman-tidak-ada");
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible();
  expect(await noOverflow(page)).toBe(true);
});
