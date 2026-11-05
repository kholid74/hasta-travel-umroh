import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createSeed } from "../content/admin/seed";
import { financialDocument, renderFinancialPDF as renderPDF } from "../lib/admin/financial-documents";
import { financialBalance, verifyPayment } from "../lib/admin/model";
import { decodeDemo, encodeDemo } from "../lib/admin/persistence";

async function renderFinancialPDF(model: ReturnType<typeof financialDocument>) {
  const [logo, regular, bold] = await Promise.all([readFile("public/logo-mark.png"), readFile("public/fonts/Lato-Regular.ttf"), readFile("public/fonts/Lato-Bold.ttf")]);
  return renderPDF(model, { logo, regular, bold });
}

async function inspect(bytes: Uint8Array) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true });
  const doc = await task.promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) { const page = await doc.getPage(i); expect(page.view[2]).toBeCloseTo(595.28, 1); text += (await page.getTextContent()).items.map(i => "str" in i ? i.str : "").join(" "); }
  const pages = doc.numPages; await task.destroy(); return { text, pages };
}

test("real PDF templates preserve both contracts, verified totals, pagination and state", async () => {
  const s = createSeed();
  await mkdir("test-results/m1-2", { recursive: true });
  for (const b of [s.bookings[0], s.bookings.find(b => b.productType === "HAJJ_SPECIAL")!]) {
    const before = encodeDemo(s);
    for (const kind of ["invoice", "receipt", "statement"] as const) {
      const p = s.payments.find(p => p.bookingId === b.id && p.status === "Terverifikasi")!;
      const model = financialDocument(s, b.id, kind, p.id);
      const bytes = await renderFinancialPDF(model), parsed = await inspect(bytes);
      expect(parsed.text).toContain(model.id);
      expect(parsed.text).toContain("DEMO");
      expect(parsed.text).toContain(b.productType === "HAJJ_SPECIAL" ? "Haji Khusus" : "Umrah");
      if (kind !== "receipt") expect(parsed.text).toContain(b.total.toLocaleString("id-ID"));
      await writeFile(`test-results/m1-2/${b.productType}-${kind}.pdf`, bytes);
    }
    expect(encodeDemo(s)).toBe(before);
  }
  const b = s.bookings[0];
  s.payments.push({ id: "PENDING", bookingId: b.id, amount: 1, date: b.date, method: "Demo", status: "Menunggu" });
  expect(() => financialDocument(s, b.id, "receipt", "PENDING")).toThrow(/terverifikasi/);
  verifyPayment(s, "PENDING");
  expect(s.payments.find(p => p.id === "PENDING")!.verifiedAt).toBeTruthy();
  expect(financialDocument(s, b.id, "statement").lines.join(" ")).toContain("PENDING");
  s.payments.find(p => p.id === "PENDING")!.status = "Dikembalikan";
  expect(() => financialDocument(s, b.id, "receipt", "PENDING")).toThrow();
  b.contractDescription = "Paket deskripsi panjang ".repeat(200);
  s.payments = s.payments.filter(p => p.bookingId !== b.id);
  for (let i = 0; i < 100; i++) s.payments.push({ id: `LONG-${i}`, bookingId: b.id, amount: 1, date: "2026-10-02", method: "Demo", status: "Terverifikasi" });
  const parsed = await inspect(await renderFinancialPDF(financialDocument(s, b.id, "statement")));
  expect(parsed.pages).toBeGreaterThan(3); expect(parsed.text).toContain("LONG-99");
  expect(parsed.text).toContain((b.total - 100).toLocaleString("id-ID"));
  expect(decodeDemo(encodeDemo(s)).bookings[0].contractDescription).toBe(b.contractDescription);
  const first = s.payments.find(p => p.id === "LONG-0")!;
  first.amount = b.total + 1;
  expect(() => financialDocument(s, b.id, "invoice")).toThrow(/konsisten/);
  first.amount = b.total - 99;
  expect(financialBalance(s, b).balance).toBe(BigInt(0));
});

test("financial previews download actual PDFs on desktop/mobile and survive refresh", async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/admin/login"); await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  for (const id of [createSeed().bookings[0].id, "BK-HAJ-1"]) {
    await page.goto(`/admin/booking/${id}`);
    await page.getByRole("button", { name: "Catat pembayaran", exact: true }).click();
    await page.getByRole("dialog").getByLabel("Nominal (Rp)").fill("1");
    await page.getByRole("dialog").getByRole("button", { name: "Simpan pembayaran", exact: true }).click();
    await page.getByRole("button", { name: "Verifikasi", exact: true }).click();
    const seed = createSeed(), booking = seed.bookings.find(b => b.id === id)!;
    const collected = financialBalance(seed, booking).collected + BigInt(1);
    await expect(page.locator(".invoice-total")).toContainText(collected.toLocaleString("id-ID"));
    for (const title of ["Invoice", "Kuitansi Pembayaran", "Statement of Account"]) {
      await page.getByRole("button", { name: `Pratinjau ${title}`, exact: true }).first().click();
      const dialog = page.getByRole("dialog"), link = dialog.getByRole("link", { name: `Unduh ${title} PDF` });
      await expect(link).toBeVisible();
      const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
      const path = await download.path(); const pdf = await inspect(new Uint8Array(await readFile(path!)));
      expect(pdf.text).toContain(id);
      if (title !== "Kuitansi Pembayaran") expect(pdf.text).toContain(collected.toLocaleString("id-ID"));
      await page.screenshot({ path: `test-results/m1-2/${id}-${title.replaceAll(" ", "-")}.png`, fullPage: true });
      await dialog.getByRole("button", { name: "Tutup dialog" }).click();
    }
    await page.reload();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Pratinjau Invoice", exact: true }).click();
    await expect(page.getByRole("link", { name: "Unduh Invoice PDF" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    await page.getByRole("dialog").getByRole("button", { name: "Tutup dialog" }).click();
    await page.getByRole("button", { name: "Batalkan booking", exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Ya, lanjutkan" }).click();
    await expect(page.getByRole("button", { name: "Pratinjau Kuitansi Pembayaran", exact: true }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "Pratinjau Invoice", exact: true })).toBeDisabled();
  }
  expect(errors).toEqual([]);
});
