import { test, expect, type Page } from "@playwright/test";
import { packages } from "../content/packages";
import { hajiPackages } from "../content/haji";
import { openDepartures } from "../lib/departures";
import { hargaKeberangkatan, statusKeberangkatan, tanggalPanjang } from "../lib/format";
import { saring, toRow, type Filter } from "../lib/katalog";

/** PUBLIC-02B: catalogue, package detail, Haji, schedule, contact, terminology and the mobile sticky action. */

const decodeWa = (href: string) => decodeURIComponent(href.split("text=")[1] ?? "");
// 8 Nov 2026 12:00 WIB (UTC+7). Server HTML is rebuilt hourly; the browser re-checks with this clock.
const TODAY = "2026-11-08";
const atToday = (page: Page) => page.clock.setFixedTime(new Date("2026-11-08T05:00:00Z"));
const rows = packages.map((p) => toRow(p, TODAY)).filter((r) => r.departures.length > 0);
const expectedCards = (f: Partial<Filter>) => saring(rows, { sort: "tanggal", ...f });

test("catalogue: filter combinations come from the URL, match the data and survive reload", async ({ page }) => {
  await atToday(page);
  const filter = { tipe: "umroh-reguler" as const, kota: "Jakarta", durasi: 12 };
  const expected = expectedCards(filter);
  expect(expected.length).toBeGreaterThan(0);
  await page.goto("/paket-umroh?tipe=umroh-reguler&kota=Jakarta&durasi=12");
  await expect(page.locator("#f-kota")).toHaveValue("Jakarta");
  await expect(page.locator("#f-durasi")).toHaveValue("12");
  await expect(page.getByRole("button", { name: "Reguler", exact: true })).toHaveAttribute("aria-pressed", "true");
  const cards = page.locator("article[data-package-card]");
  await expect(cards).toHaveCount(expected.length);
  expect(await cards.evaluateAll((els) => els.map((e) => e.getAttribute("data-package-card")))).toEqual(expected.map((h) => h.row.slug));
  for (const text of await cards.allInnerTexts()) {
    expect(text).toContain("dari Jakarta");
    expect(text).toMatch(/Umrah Reguler · 12 hari/);
  }
  // Removing one active-filter chip updates the list and the URL.
  await page.getByRole("list", { name: "Filter aktif" }).getByRole("button", { name: /Dari Jakarta/ }).click();
  await expect(page).not.toHaveURL(/kota=/);
  await expect(page).toHaveURL(/tipe=umroh-reguler/);
  await expect(cards).toHaveCount(expectedCards({ tipe: "umroh-reguler", durasi: 12 }).length);
  // Sorting is written to the URL and orders by the departure's own quad price.
  await page.locator("#f-sort").selectOption("harga-naik");
  await expect(page).toHaveURL(/sort=harga-naik/);
  const prices = (await cards.locator("[data-harga-quad]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-harga-quad")))));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));
  await page.reload();
  await expect(page.locator("#f-sort")).toHaveValue("harga-naik");
  await expect(page.locator("#f-kota")).toHaveValue("");
});

test("catalogue: an impossible combination shows a useful empty state with a working reset", async ({ page }) => {
  await atToday(page);
  const f = { tipe: "umroh-plus" as const, maks: 30e6 };
  test.skip(expectedCards(f).length > 0, "fixtures contain a Plus package under 30 jt");
  await page.goto("/paket-umroh?tipe=umroh-plus&maks=30000000");
  const empty = page.locator("[data-katalog-kosong]");
  await expect(empty).toContainText("Belum ada paket untuk kombinasi ini");
  await expect(empty.getByRole("link", { name: "Lihat jadwal keberangkatan" })).toHaveAttribute("href", "/jadwal-keberangkatan");
  await empty.getByRole("button", { name: "Hapus semua filter" }).click();
  await expect(page).toHaveURL(/\/paket-umroh$/);
  await expect(page.locator("article[data-package-card]")).toHaveCount(rows.length);
});

test("prices agree between catalogue card, detail table, desktop summary and mobile sticky bar", async ({ page }) => {
  await atToday(page);
  await page.goto("/paket-umroh");
  const card = page.locator("article[data-package-card]").first();
  const slug = (await card.getAttribute("data-package-card"))!;
  const cardQuad = Number(await card.locator("[data-harga-quad]").getAttribute("data-harga-quad"));
  const paket = packages.find((p) => p.slug === slug)!;
  const dep = openDepartures(paket.departures, TODAY)[0];
  expect(cardQuad).toBe(hargaKeberangkatan(paket, dep).quad);
  await card.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`/paket-umroh/${slug}\\?d=${dep.date}$`));
  const harga = hargaKeberangkatan(paket, dep);
  for (const k of ["quad", "triple", "double"] as const) {
    await expect(page.locator(`[data-tabel-harga] [data-harga="${k}"]`)).toHaveAttribute("data-nilai", String(harga[k]));
  }
  await expect(page.locator("[data-ringkasan-harga]")).toHaveAttribute("data-ringkasan-harga", String(harga.quad));
  await expect(page.locator("[data-sticky-harga]")).toHaveAttribute("data-sticky-harga", String(harga.quad));
});

test("detail: sold-out date stays explorable, is labelled honestly and offers open alternatives", async ({ page }) => {
  await atToday(page);
  const kandidat = packages
    .map((p) => ({ p, d: openDepartures(p.departures, TODAY).find((d) => statusKeberangkatan(d.seatsAvailable) === "sold-out") }))
    .find((x) => x.d);
  test.skip(!kandidat, "no open sold-out departure in the fixtures");
  const { p, d } = kandidat!;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/paket-umroh/${p.slug}?d=${d!.date}`);
  const notice = page.locator('[data-state="tanggal-penuh"]');
  await expect(notice).toContainText(`Keberangkatan ${tanggalPanjang(d!.date)} sudah penuh`);
  await expect(page.locator("[data-ringkasan]")).toContainText("Penuh");
  await expect(page.locator('a[data-wa-source="detail"]')).toHaveText(/Tanya tanggal lain/);
  const alternatives = notice.getByRole("button");
  if (await alternatives.count()) {
    await alternatives.first().click();
    await expect(page).not.toHaveURL(new RegExp(`d=${d!.date}`));
    await expect(notice).toHaveCount(0);
    await expect(page.locator('a[data-wa-source="detail"]')).toHaveText(/Konsultasi paket ini/);
  }
});

test("detail: itinerary stages keep every day, open by keyboard, and the WhatsApp text follows the date", async ({ page }) => {
  await atToday(page);
  const paket = packages.find((p) => p.slug === "umroh-keluarga-14-hari")!;
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/paket-umroh/${paket.slug}`);
  const stages = page.locator("[data-itinerary] details[data-tahap]");
  await expect(stages).toHaveCount(3);
  await expect(stages.first()).toHaveAttribute("open", "");
  await expect(stages.nth(1)).not.toHaveAttribute("open", "");
  await expect(page.locator("[data-itinerary] [data-hari]")).toHaveCount(paket.itinerary.length);
  for (const day of paket.itinerary) await expect(page.locator(`[data-itinerary] [data-hari="${day.day}"]`)).toContainText(day.title);
  await stages.nth(1).locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(stages.nth(1)).toHaveAttribute("open", "");

  const chips = page.locator('section[aria-labelledby="pilih-tanggal"] button[aria-pressed]');
  const open = openDepartures(paket.departures, TODAY);
  await expect(chips).toHaveCount(open.length);
  const target = open[open.length - 1];
  await chips.last().focus();
  await page.keyboard.press("Enter");
  await expect(chips.last()).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(new RegExp(`\\?d=${target.date}$`));
  for (const source of ["detail", "sticky-mobile", "detail-penutup"]) {
    const msg = decodeWa((await page.locator(`a[data-wa-source="${source}"]`).getAttribute("href"))!);
    expect(msg, source).toContain(`${paket.name} keberangkatan ${tanggalPanjang(target.date)} dari ${target.departureCity}`);
  }
});

test("Haji Khusus and Mujamalah stay separate, with qualified waiting times and no guarantees", async ({ page }) => {
  await page.goto("/haji-khusus");
  const khusus = page.locator('[data-haji-kategori="khusus"]');
  await expect(khusus).toHaveCount(hajiPackages.filter((p) => p.kategori === "khusus").length);
  for (const card of await khusus.all()) {
    await expect(card).not.toContainText("Mujamalah");
    await expect(card).toContainText(/± \d+ tahun\*/);
    expect(decodeWa((await card.locator('a[href*="wa.me"]').getAttribute("href"))!)).toContain("masa tunggu");
  }
  await expect(page.getByText("Tidak ada travel yang bisa menjanjikan tahun keberangkatan")).toBeVisible();
  const mujamalah = page.locator('section[aria-labelledby="haji-mujamalah"]');
  await expect(mujamalah.getByRole("heading", { level: 2 })).toHaveText("Haji Mujamalah — jalur terpisah");
  await expect(mujamalah.locator('[data-haji-kategori="mujamalah"]')).toHaveCount(1);
  await expect(page.locator('section[aria-labelledby="program-haji-khusus"] [data-haji-kategori="mujamalah"]')).toHaveCount(0);
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/visa (dijamin|pasti)|pasti berangkat|dijamin berangkat|garansi/i);
});

test("schedule: month, city and type filters live in the URL and every row keeps its date for the detail page", async ({ page }) => {
  await atToday(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/jadwal-keberangkatan?kota=Surabaya");
  await expect(page.locator("#j-kota")).toHaveValue("Surabaya");
  const expected = packages.flatMap((p) => openDepartures(p.departures, TODAY).filter((d) => d.departureCity === "Surabaya"));
  const rowsLoc = page.locator("[data-jadwal-baris]");
  await expect(rowsLoc).toHaveCount(expected.length);
  for (const t of await rowsLoc.allInnerTexts()) expect(t).toContain("dari Surabaya");
  await page.locator("#j-tipe").selectOption("umroh-plus");
  await expect(page).toHaveURL(/tipe=umroh-plus/);
  await expect(page).toHaveURL(/kota=Surabaya/);
  const plusSurabaya = packages.filter((p) => p.type === "umroh-plus").flatMap((p) => openDepartures(p.departures, TODAY).filter((d) => d.departureCity === "Surabaya"));
  if (plusSurabaya.length === 0) {
    await expect(page.locator("[data-jadwal-kosong]")).toBeVisible();
    await page.getByRole("button", { name: "Hapus pilihan" }).last().click();
    await expect(page).toHaveURL(/\/jadwal-keberangkatan$/);
  } else {
    await expect(rowsLoc).toHaveCount(plusSurabaya.length);
  }
  await page.goto("/jadwal-keberangkatan");
  const first = rowsLoc.first();
  const href = (await first.getAttribute("href"))!;
  const date = href.split("?d=")[1];
  await first.click();
  await expect(page).toHaveURL(new RegExp(`\\?d=${date}$`));
  await expect(page.locator('section[aria-labelledby="pilih-tanggal"] button[aria-pressed="true"]')).toContainText(tanggalPanjang(date));
});

test("contact: Umrah, Haji Khusus and other enquiries each send their own operator message; studio stays in the demo panel", async ({ page }) => {
  await page.goto("/kontak");
  const expected: Record<string, RegExp> = {
    umrah: /konsultasi paket Umrah/,
    haji: /masa tunggu, setoran awal/,
    badal: /Badal Umrah/,
    lainnya: /saya ingin bertanya:/,
  };
  for (const [id, re] of Object.entries(expected)) {
    const card = page.locator(`[data-kontak-jalur="${id}"]`);
    const link = card.locator('a[href*="wa.me"]');
    await expect(link).toHaveAttribute("data-wa-audience", "operator");
    const msg = decodeWa((await link.getAttribute("href"))!);
    expect(msg, id).toMatch(re);
    expect(msg).toContain("kontak demonstrasi Kalsara Digital Studio");
    await card.locator("summary").click();
    await expect(card.locator("details p")).toHaveText(msg.split("\n\n[")[0].replace(/\s+$/, ""), { useInnerText: true });
  }
  await expect(page.locator('main [data-wa-audience="studio"]')).toHaveCount(0);
  await expect(page.locator('[data-area="demo-showcase"] [data-wa-audience="studio"]')).toHaveCount(1);
});

test("terminology: visible labels say Umrah and Penuh; no 'Sold Out' or 'seat' wording on public pages", async ({ page }) => {
  for (const path of ["/paket-umroh", "/jadwal-keberangkatan", "/paket-umroh/umroh-dekat-haram-9-hari", "/tentang"]) {
    await page.goto(path);
    const text = await page.locator("main").innerText();
    expect(text, path).not.toMatch(/Sold Out|sold out|\bseat\b/i);
  }
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Navigasi utama", exact: true }).getByRole("link", { name: "Paket Umrah" })).toHaveAttribute("href", "/paket-umroh");
});

test("mobile sticky action: one bar, hidden over page CTAs and the footer, no spacer, and focus stays clear of it", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto("/jadwal-keberangkatan");
  expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toContain("viewport-fit=cover");
  const bar = page.locator("[data-sticky-cta]");
  await expect(bar).toHaveCount(1);
  await expect(bar).toHaveAttribute("data-state", "tampil");
  // Keyboard focus on a row below the fold scrolls it into view above the bar, not under it.
  const row = page.locator("[data-jadwal-baris]").nth(6);
  await row.focus();
  await page.waitForTimeout(300);
  const [rowBox, barBox] = [await row.boundingBox(), await bar.boundingBox()];
  expect(rowBox!.y + rowBox!.height).toBeLessThanOrEqual(barBox!.y + 1);
  // At the page end the footer is visible, the bar steps aside and is not focusable.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(bar).toHaveAttribute("data-state", "tersembunyi");
  await expect(bar).toHaveAttribute("inert", "");
  const gap = await page.evaluate(() => document.documentElement.scrollHeight - (document.querySelector("footer")!.getBoundingClientRect().bottom + window.scrollY));
  expect(Math.abs(gap)).toBeLessThan(2); // no spacer element below the footer

  // Package detail: the date-aware bar is the only sticky action and steps aside for the closing band.
  await page.goto("/paket-umroh/umroh-ramah-lansia-12-hari");
  await expect(page.locator("[data-sticky-cta]")).toHaveCount(1);
  await expect(page.locator('[data-sticky-cta="detail"]')).toHaveAttribute("data-state", "tampil");
  await page.locator('section[aria-labelledby="penutup-detail"]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sticky-cta="detail"]')).toHaveAttribute("data-state", "tersembunyi");
  // Opening a long accordion keeps the page usable: the bar never covers the last open day once scrolled to.
  await page.locator("[data-itinerary] details").nth(1).locator("summary").click();
  const lastDay = page.locator("[data-itinerary] details").nth(1).locator("[data-hari]").last();
  await lastDay.scrollIntoViewIfNeeded();
  const sticky = page.locator('[data-sticky-cta="detail"]');
  if ((await sticky.getAttribute("data-state")) === "tampil") {
    const [a, b] = [await lastDay.boundingBox(), await sticky.boundingBox()];
    expect(a!.y).toBeLessThan(b!.y);
  }
});

test("homepage sticky bar waits until the hero actions scroll away", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const bar = page.locator("[data-sticky-cta]");
  await expect(bar).toHaveAttribute("data-state", "tersembunyi");
  await page.evaluate(() => window.scrollTo(0, 1600));
  await expect(bar).toHaveAttribute("data-state", "tampil");
});

test("no horizontal overflow on the refined pages with filters applied", async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/paket-umroh?tipe=umroh-plus&sort=harga-naik", "/jadwal-keberangkatan?kota=Jakarta", "/paket-umroh/umroh-plus-turki-14-hari", "/haji-khusus", "/kontak", "/faq", "/tentang"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} @${width}`).toBe(true);
    }
  }
});
