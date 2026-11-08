import { test, expect, type Page } from "@playwright/test";
import { packages } from "../content/packages";
import { openDepartures } from "../lib/departures";
import { WA_DEMO_NOTE } from "../lib/whatsapp";

/** PUBLIC-02A homepage: quick finder, CTAs, Haji entry, disclosures and mobile layout. */

const decodeWa = (href: string) => decodeURIComponent(href.split("text=")[1] ?? "");
// Jakarta = UTC+7. 8 Nov 2026 12:00 WIB.
const TODAY = "2026-11-08";
const atToday = (page: Page) => page.clock.setFixedTime(new Date("2026-11-08T05:00:00Z"));
const finder = (page: Page) => page.locator("[data-quick-finder]");
/** Wait until React has hydrated the finder and re-checked the date in the browser. */
const ready = (page: Page) => expect(page.locator('[data-quick-finder][data-hydrated="true"]')).toBeVisible();

test("quick finder narrows by month and city and hands the same filters to the catalogue URL", async ({ page }) => {
  await atToday(page);
  await page.goto("/");
  await ready(page);
  const f = finder(page);
  const kota = f.getByLabel("Kota keberangkatan");
  const bulan = f.getByLabel("Bulan");
  // Pick a city/month pair that really exists in the open fixtures.
  const open = packages.flatMap((p) => openDepartures(p.departures, TODAY));
  const target = open.find((d) => d.departureCity !== "Jakarta") ?? open[0];
  const ym = target.date.slice(0, 7);
  await kota.selectOption(target.departureCity);
  await bulan.selectOption(ym);
  const expected = open.filter((d) => d.departureCity === target.departureCity && d.date.startsWith(ym)).length;
  await expect(f.locator("[data-finder-count]")).toHaveText(`${expected} keberangkatan`);
  const results = f.locator("[data-finder-result]");
  await expect(results.first()).toBeVisible();
  for (const href of await results.evaluateAll((els) => els.map((e) => e.getAttribute("href")!))) {
    expect(href).toMatch(new RegExp(`^/paket-umroh/[a-z0-9-]+\\?d=${ym}-\\d{2}$`));
  }
  for (const text of await results.allInnerTexts()) expect(text).toContain(target.departureCity);

  await f.getByRole("button", { name: /paket di katalog/ }).click();
  await expect(page).toHaveURL(new RegExp(`/paket-umroh\\?bulan=${ym}&kota=${encodeURIComponent(target.departureCity)}$`));
  await expect(page.locator("#f-kota")).toHaveValue(target.departureCity);
  await expect(page.locator("#f-bulan")).toHaveValue(ym);
  for (const text of await page.locator("article").allInnerTexts()) expect(text).toContain(target.departureCity);
});

test("quick finder never offers past departures and shows a useful empty state", async ({ page }) => {
  // 1 Mar 2027 WIB: everything up to and including 1 Mar is closed.
  await page.clock.setFixedTime(new Date("2027-03-01T05:00:00Z"));
  await page.goto("/");
  await ready(page);
  const f = finder(page);
  const bulan = f.getByLabel("Bulan").locator("option");
  await expect(bulan.and(page.locator('[value^="2026-"], [value="2027-01"], [value="2027-02"]'))).toHaveCount(0);
  await expect(bulan.and(page.locator('[value^="2027-"]')).first()).toBeAttached();
  await expect(f.locator("[data-finder-result]").first()).toBeVisible();
  await expect(f.locator("[data-finder-result]").filter({ hasText: /2026|Januari 2027|Februari 2027|\b1 Maret 2027/ })).toHaveCount(0);

  // Find a month/type combination with no open departure and check the empty state.
  await atToday(page);
  await page.goto("/");
  await ready(page);
  const open = packages.map((p) => ({ type: p.type, deps: openDepartures(p.departures, TODAY) }));
  const allMonths = [...new Set(open.flatMap((p) => p.deps.map((d) => d.date.slice(0, 7))))];
  const types = ["umroh-reguler", "umroh-plus", "umroh-ramadhan"] as const;
  const empty = allMonths.flatMap((m) => types.map((t) => ({ m, t }))).find(({ m, t }) => !open.some((p) => p.type === t && p.deps.some((d) => d.date.startsWith(m))));
  test.skip(!empty, "fixtures have every month/type combination");
  await finder(page).getByLabel("Bulan").selectOption(empty!.m);
  await finder(page).getByLabel("Jenis paket").selectOption(empty!.t);
  await expect(finder(page).locator("[data-finder-empty]")).toContainText("Belum ada keberangkatan");
  await expect(finder(page).getByRole("button", { name: "Tidak ada hasil" })).toBeDisabled();
  await expect(finder(page).getByRole("link", { name: "Lihat semua jadwal" })).toHaveAttribute("href", "/jadwal-keberangkatan");
  await finder(page).getByRole("button", { name: "Hapus pilihan" }).click();
  await expect(finder(page).locator("[data-finder-result]").first()).toBeVisible();
});

test("homepage CTAs: Umrah catalogue first, operator WhatsApp second, distinct Haji Khusus path", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('section[aria-labelledby="hero-judul"]');
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Perjalanan Dimulai dari Sebuah Niat.");
  await expect(hero.getByRole("link", { name: "Lihat Paket Umrah" })).toHaveAttribute("href", "/paket-umroh");
  const heroWa = hero.locator('a[data-wa-source="hero"]');
  await expect(heroWa).toHaveText(/Konsultasi via WhatsApp/);
  await expect(heroWa).toHaveAttribute("data-wa-audience", "operator");
  await expect(hero.getByRole("link", { name: "Tentang demo ini" })).toHaveAttribute("href", "#tentang-demo");

  const haji = page.locator('section[aria-labelledby="haji-judul"]');
  await expect(haji.getByRole("link", { name: "Pelajari Haji Khusus" })).toHaveAttribute("href", "/haji-khusus");
  await expect(haji.locator("[data-haji-khusus-list]")).not.toContainText("Mujamalah");
  await expect(haji.locator("[data-haji-khusus-list] li")).toHaveCount(2);
  await expect(haji.getByRole("link", { name: "halaman Haji" })).toHaveAttribute("href", "/haji-khusus#haji-mujamalah");
  expect(decodeWa((await haji.locator('a[href*="wa.me"]').getAttribute("href"))!)).toContain("masa tunggu");

  // Featured cards link to a concrete open date and show all three room prices.
  const cards = page.locator("[data-departure-card]");
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    await expect(card.getByRole("link")).toHaveAttribute("href", /^\/paket-umroh\/[a-z0-9-]+\?d=\d{4}-\d{2}-\d{2}$/);
    // Quad price is the headline; triple and double are listed beneath it.
    for (const k of ["kamar ber-4", "Kamar ber-3", "ber-2"]) await expect(card).toContainText(k);
    await expect(card.getByRole("img")).toHaveCount(1);
    await expect(card).toContainText(/\d+\s*m/);
  }
});

test("no fabricated claims; the demo disclosure is stated once, not under every section", async ({ page }) => {
  await page.goto("/");
  const main = page.locator("main");
  const text = await main.innerText();
  expect(text).not.toContain("S. R., Bekasi");
  expect(text).not.toMatch(/\b(terbaik|termurah|terpercaya|dijamin|garansi|100%)\b/i);
  expect(text).not.toMatch(/testimoni/i);
  await expect(main.getByText(WA_DEMO_NOTE)).toHaveCount(1);
  await expect(main.getByText(/Angka contoh pada situs demo/)).toBeVisible();
  // Studio (Kalsara) contact stays out of the homepage body.
  await expect(main.locator('[data-wa-audience="studio"]')).toHaveCount(0);
  await expect(page.locator('[data-area="demo-showcase"] [data-wa-audience="studio"]')).toHaveCount(1);
});

test("mobile homepage: hero CTAs in the first screen, comfortable tap targets, one sticky bar, no overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const primary = page.getByRole("link", { name: "Lihat Paket Umrah" });
  const box = (await primary.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  for (const el of [primary, page.locator('a[data-wa-source="hero"]'), ...(await finder(page).locator("select").all())]) {
    expect((await el.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.locator("[data-sticky-cta]:visible")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  // The FAQ disclosures work by keyboard.
  const summary = page.locator('section[aria-labelledby="faq-judul"] summary').first();
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('section[aria-labelledby="faq-judul"] details').first()).toHaveAttribute("open", "");
});

test("every homepage photo is self-hosted and credited with author and licence", async ({ page }) => {
  await page.goto("/");
  const sources = await page.locator("main img").evaluateAll((imgs) => imgs.map((i) => decodeURIComponent((i as HTMLImageElement).currentSrc || (i as HTMLImageElement).src)));
  expect(sources.length).toBeGreaterThan(5);
  for (const src of sources) expect(src, src).toMatch(/\/foto\/[a-z-]+\.jpg/); // served via next/image from /public/foto, never a remote URL
  const files = [...new Set(sources.map((s) => s.match(/\/foto\/([a-z-]+\.jpg)/)![1]))];
  const credits = page.locator("[data-photo-credits]");
  const creditLinks = await credits.locator('a[href^="https://commons.wikimedia.org/wiki/File:"]').count();
  expect(creditLinks).toBeGreaterThanOrEqual(files.length);
  await expect(credits.locator('a[href*="creativecommons.org"]')).toHaveCount(creditLinks);
});

test("hotel distances: phones show 3 nearest per city, larger screens 5, and every hotel stays reachable", async ({ page }) => {
  const section = page.locator('section[aria-labelledby="hotel-judul"]');
  for (const [width, nearest] of [[390, 3], [1440, 5]] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const cards = section.locator("[data-hotel-city]");
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      const rows = card.locator("li:visible a");
      await expect(rows).toHaveCount(nearest);
      const summary = card.locator("summary:visible");
      if (await summary.count()) {
        const more = Number((await summary.innerText()).match(/^(\d+)/)![1]);
        await summary.click();
        await expect(rows).toHaveCount(nearest + more);
      }
    }
  }
});
