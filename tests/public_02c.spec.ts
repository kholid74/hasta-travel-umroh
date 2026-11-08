import { test, expect, type Page } from "@playwright/test";
import { packages } from "../content/packages";
import { statusKeberangkatan, tanggalPanjang } from "../lib/format";
import { saring, toRow, type Filter } from "../lib/katalog";

/** PUBLIC-02C: catalogue progressive disclosure, card differentiation, About, Haji mobile, disclosures. */

const decodeWa = (href: string) => decodeURIComponent(href.split("text=")[1] ?? "");
const TODAY = "2026-11-08";
const atToday = (page: Page) => page.clock.setFixedTime(new Date("2026-11-08T05:00:00Z"));
const rows = packages.map((p) => toRow(p, TODAY)).filter((r) => r.departures.length > 0);
const expected = (f: Partial<Filter>) => saring(rows, { sort: "tanggal", ...f });
const HALAMAN = 9;
const PUBLIC = ["/", "/paket-umroh", "/paket-umroh/umroh-ramah-lansia-12-hari", "/haji-khusus", "/jadwal-keberangkatan", "/faq", "/tentang", "/kontak"];

const cards = (page: Page) => page.locator("article[data-package-card]");
const visibleCards = (page: Page) => page.locator("article[data-package-card]:visible");
const phone = (page: Page) => page.setViewportSize({ width: 390, height: 844 });

test("catalogue on phones: 9 first, 'Muat lebih banyak' reveals the rest, announces it and moves focus", async ({ page }) => {
  await atToday(page);
  await phone(page);
  await page.goto("/paket-umroh");
  const total = expected({}).length;
  expect(total).toBeGreaterThan(HALAMAN);
  await expect(cards(page)).toHaveCount(total); // the full filtered list stays in the DOM
  await expect(visibleCards(page)).toHaveCount(HALAMAN);
  const status = page.locator("[data-muat-lebih] [data-terlihat]");
  await expect(status).toHaveText(`Menampilkan ${HALAMAN} dari ${total} paket`);
  const more = page.getByRole("button", { name: /Muat lebih banyak/ });
  await expect(more).toContainText(`(${Math.min(HALAMAN, total - HALAMAN)} lagi)`);
  await more.click();
  await expect(visibleCards(page)).toHaveCount(Math.min(total, HALAMAN * 2));
  await expect(page.locator("[data-pengumuman-muat]")).toHaveText(new RegExp(`Sekarang ${Math.min(total, HALAMAN * 2)} dari ${total} paket`));
  // Focus lands on the first newly shown package.
  const focused = await page.evaluate(() => document.activeElement?.closest("article")?.getAttribute("data-package-card"));
  expect(focused).toBe(await cards(page).nth(HALAMAN).getAttribute("data-package-card"));
  if (total <= HALAMAN * 2) await expect(more).toHaveCount(0);
});

test("catalogue on phones: a filter change resets to the first page of the filtered set; sort keeps it", async ({ page }) => {
  await atToday(page);
  await phone(page);
  await page.goto("/paket-umroh");
  await page.getByRole("button", { name: /Muat lebih banyak/ }).click();
  const total = expected({}).length;
  await expect(visibleCards(page)).toHaveCount(Math.min(total, HALAMAN * 2));

  // Sorting after disclosure keeps the opened cards, re-ordered by price.
  await page.getByRole("button", { name: /^Filter/ }).click();
  await page.locator("#f-sort").selectOption("harga-naik");
  await expect(page).toHaveURL(/sort=harga-naik/);
  await expect(visibleCards(page)).toHaveCount(Math.min(total, HALAMAN * 2));
  const prices = await visibleCards(page).locator("[data-harga-quad]").evaluateAll((els) => els.map((e) => Number(e.getAttribute("data-harga-quad"))));
  expect(prices).toEqual([...prices].sort((a, b) => a - b));

  // A new filter starts again at 9 and counts the filtered set, not the catalogue.
  await page.locator("#f-kota").selectOption("Jakarta");
  await expect(page).toHaveURL(/kota=Jakarta/);
  await expect(page).toHaveURL(/sort=harga-naik/);
  const n = expected({ kota: "Jakarta", sort: "harga-naik" }).length;
  await expect(cards(page)).toHaveCount(n);
  await expect(visibleCards(page)).toHaveCount(Math.min(n, HALAMAN));
  await expect(page.locator("[data-muat-lebih] [data-terlihat]")).toHaveText(`Menampilkan ${Math.min(n, HALAMAN)} dari ${n} paket`);
  await expect(page.locator("[data-jumlah-hasil]")).toHaveAttribute("data-jumlah-hasil", String(n));
});

test("catalogue: URL state is restored on phones and desktop shows every match without a load-more", async ({ page }) => {
  await atToday(page);
  const f = { tipe: "umroh-reguler" as const, sort: "harga-turun" as const };
  const n = expected(f).length;
  await phone(page);
  await page.goto("/paket-umroh?tipe=umroh-reguler&sort=harga-turun");
  await expect(page.locator("#f-sort")).toHaveValue("harga-turun");
  await expect(cards(page)).toHaveCount(n);
  await expect(visibleCards(page)).toHaveCount(Math.min(n, HALAMAN));
  expect(await cards(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-package-card")))).toEqual(saring(rows, f).map((h) => h.row.slug));
  await page.reload();
  await expect(page.locator("#f-sort")).toHaveValue("harga-turun");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(visibleCards(page)).toHaveCount(n);
  await expect(page.getByRole("button", { name: /Muat lebih banyak/ })).toBeHidden();
});

test("catalogue: sold-out matches stay explorable after loading more, with honest status", async ({ page }) => {
  await atToday(page);
  await phone(page);
  const hasil = expected({});
  const iPenuh = hasil.findIndex((h) => statusKeberangkatan(h.keberangkatan.seatsAvailable) === "sold-out");
  test.skip(iPenuh < 0, "no sold-out nearest date in the fixtures");
  await page.goto("/paket-umroh");
  const card = page.locator(`article[data-package-card="${hasil[iPenuh].row.slug}"]`);
  if (iPenuh >= HALAMAN) {
    await expect(card).toBeHidden();
    await page.getByRole("button", { name: /Muat lebih banyak/ }).click();
  }
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute("data-penuh", "true");
  await expect(card).toContainText("Tanggal ini penuh");
  await expect(card).toContainText("Penuh");
  await card.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`\\?d=${hasil[iPenuh].keberangkatan.date}$`));
  await expect(page.locator('[data-state="tanggal-penuh"]')).toBeVisible();
});

test("package cards differ by verified data: no repeated destination photo, service tags without unverifiable claims", async ({ page }) => {
  await atToday(page);
  await page.goto("/paket-umroh");
  const katalog = cards(page);
  await expect(katalog.first()).toBeVisible();
  await expect(page.locator("article[data-package-card] img")).toHaveCount(0);
  for (const card of (await katalog.all()).slice(0, 6)) {
    const slug = (await card.getAttribute("data-package-card"))!;
    const p = packages.find((x) => x.slug === slug)!;
    await expect(card).toContainText(`${p.makkahHotel.distanceMeters} m`);
    await expect(card).toContainText(`${p.duration} hari`);
  }
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/Termurah|Paling banyak dipilih/);
  await expect(page.getByRole("list", { name: "Keunggulan layanan" }).first()).toBeVisible();
  // The homepage keeps its approved photo cards.
  await page.goto("/");
  await expect(page.locator("[data-departure-card] img")).toHaveCount(3);
});

test("package detail keeps the selected date when reached from a card beyond the first mobile page", async ({ page }) => {
  await atToday(page);
  await phone(page);
  await page.goto("/paket-umroh");
  await page.getByRole("button", { name: /Muat lebih banyak/ }).click();
  const target = cards(page).nth(HALAMAN);
  const href = (await target.getByRole("link").getAttribute("href"))!;
  const date = href.split("?d=")[1];
  await target.getByRole("link").click();
  await expect(page).toHaveURL(new RegExp(`\\?d=${date}$`));
  await expect(page.locator('section[aria-labelledby="pilih-tanggal"] button[aria-pressed="true"]')).toContainText(tanggalPanjang(date));
  await expect(page.locator('[data-sticky-cta="detail"]')).toBeVisible();
});

test("FAQ by keyboard: topic links jump to their group and accordions open and close", async ({ page }) => {
  await page.goto("/faq");
  const topik = page.getByRole("navigation", { name: "Topik pertanyaan" }).getByRole("link", { name: /Pembayaran/ });
  await topik.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#topik-pembayaran$/);
  await expect(page.getByRole("heading", { name: "Pembayaran", level: 2 })).toBeInViewport();
  const item = page.locator('section[aria-labelledby="topik-pembayaran"] details').first();
  await item.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("open", "");
  await page.keyboard.press("Space");
  await expect(item).not.toHaveAttribute("open", "");
});

test("demo disclosure hierarchy: one short note per page, contextual WhatsApp notes, full panel in the footer", async ({ page }) => {
  for (const path of PUBLIC) {
    await page.goto(path);
    const main = page.locator("main");
    await expect(main.locator('[data-demo-note="umum"]'), path).toHaveCount(1);
    const text = await main.innerText();
    expect(text, path).not.toMatch(/testimoni/i);
    expect(text, path).not.toMatch(/berizin resmi|izin resmi kami|terdaftar resmi|bersertifikat/i);
    await expect(page.locator('[data-area="demo-showcase"]'), path).toContainText("bukan biro perjalanan");
  }
  for (const path of ["/", "/paket-umroh", "/tentang"]) {
    await page.goto(path);
    await expect(page.locator('main [data-demo-note="umum"]'), path).toContainText(/operator fiktif|data travel fiktif/);
  }
  for (const path of ["/tentang", "/kontak", "/haji-khusus"]) {
    await page.goto(path);
    await expect(page.locator("#legalitas"), path).toContainText("contoh fiktif");
  }
});

test("WhatsApp audiences stay separate on every public page", async ({ page }) => {
  for (const path of PUBLIC) {
    await page.goto(path);
    const links = page.locator('a[href*="wa.me"]');
    const all = await links.evaluateAll((els) => els.map((e) => ({ aud: e.getAttribute("data-wa-audience"), href: e.getAttribute("href")!, demo: !!e.closest('[data-area="demo-showcase"]') })));
    expect(all.length, path).toBeGreaterThan(0);
    for (const l of all) {
      const msg = decodeWa(l.href);
      if (l.aud === "studio") {
        expect(l.demo, `${path}: studio link outside the demo panel`).toBe(true);
        expect(msg).toMatch(/^Halo Kalsara Digital Studio/);
      } else {
        expect(l.aud, path).toBe("operator");
        expect(msg, path).toMatch(/^Assalamu'alaikum/);
        expect(msg, path).toContain("kontak demonstrasi Kalsara Digital Studio");
      }
    }
    expect(all.filter((l) => l.aud === "studio")).toHaveLength(1);
  }
});

test("About reads as an operator profile without invented history, numbers or certifications", async ({ page }) => {
  await page.goto("/tentang");
  for (const h of ["Cara kami menyiapkan perjalanan", "Pendampingan selama di Tanah Suci", "Komitmen yang bisa Anda periksa", "Profil operator"]) {
    await expect(page.getByRole("heading", { name: h, level: 2 })).toBeVisible();
  }
  await expect(page.locator("[data-profil-operator]")).toContainText("operator fiktif");
  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/berdiri sejak|tahun pengalaman|ribuan jamaah|terpercaya|testimoni|bersertifikat|pendiri/i);
  expect(text).not.toMatch(/situs ini menampilkan|fitur situs/i);
  await expect(page.locator("#legalitas")).toBeVisible();
  await expect(page.getByRole("link", { name: "Tentang Haji Khusus" })).toHaveAttribute("href", "/haji-khusus");
});

test("Haji Khusus on 360 px: comparable programmes, price and deposit first, details expandable, Mujamalah separate", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 760 });
  await page.goto("/haji-khusus");
  const tabel = page.locator("[data-haji-banding]");
  await expect(tabel).toBeVisible();
  await expect(tabel.locator("thead th[scope=col]")).toHaveCount(3);
  for (const label of ["Biaya per orang", "Setoran awal", "Perkiraan masa tunggu"]) await expect(tabel.getByRole("rowheader", { name: label })).toBeVisible();
  await expect(tabel).toContainText("tahun*");
  await expect(page.getByText("Tidak ada travel yang bisa menjanjikan tahun keberangkatan")).toBeVisible();
  const rincian = page.locator("[data-haji-rincian]").first();
  await expect(rincian).not.toHaveAttribute("open", "");
  await rincian.locator("summary").click();
  await expect(rincian).toContainText("Soal kuota");
  await page.getByRole("navigation", { name: "Di halaman ini" }).getByRole("link", { name: "Mujamalah" }).click();
  await expect(page.getByRole("heading", { name: "Haji Mujamalah — jalur terpisah" })).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(tabel).toBeHidden();
});

test("responsive QA: no overflow at 360/390/768/1440, and the load-more button is never under the sticky bar", async ({ page }) => {
  test.setTimeout(240000);
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    for (const path of [...PUBLIC, "/paket-umroh?kota=Jakarta&sort=harga-naik"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${path} @${width}`).toBe(true);
    }
  }
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto("/paket-umroh");
  const more = page.getByRole("button", { name: /Muat lebih banyak/ });
  await more.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const bar = page.locator("[data-sticky-cta]");
  if ((await bar.getAttribute("data-state")) === "tampil") {
    const [a, b] = [await more.boundingBox(), await bar.boundingBox()];
    expect(a!.y + a!.height).toBeLessThanOrEqual(b!.y + 1);
  }
  await more.click(); // clickable, i.e. not intercepted by a fixed element
  await expect(visibleCards(page)).toHaveCount(Math.min(expected({}).length, HALAMAN * 2));
});
