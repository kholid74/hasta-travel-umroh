import { test, expect } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createCanvas } from "@napi-rs/canvas";
import { createSeed } from "../content/admin/seed";
import { financialBalance, recordPayment, verifyPayment } from "../lib/admin/model";
import { financialDocument, renderFinancialPDF } from "../lib/admin/financial-documents";
import { DEMO_STORAGE_KEY, decodeDemo, encodeDemo } from "../lib/admin/persistence";
import { rupiahSingkat } from "../lib/format";

function fixture(product: "UMRAH" | "HAJJ_SPECIAL" = "UMRAH") {
  const state = createSeed(), booking = state.bookings.find(b => b.productType === product)!;
  if (product === "UMRAH") booking.total = 20000000;
  state.payments = state.payments.filter(p => p.bookingId !== booking.id);
  state.payments.push(
    { id: "CASH-002", bookingId: booking.id, date: "2026-01-10", amount: 5000000, method: "Tunai di kantor", reference: "KAS-DEMO-002", status: "Terverifikasi", verifiedAt: "2026-01-11T10:00:00Z" },
    { id: "PENDING-003", bookingId: booking.id, date: "2026-01-11", amount: 1000000, method: "Transfer bank", reference: "PENDING-REF", status: "Menunggu" },
    { id: "TRX-001", bookingId: booking.id, date: "2026-01-01", amount: 5000000, method: "Transfer bank", reference: "BANK-DEMO-001", status: "Terverifikasi", verifiedAt: "2026-01-02T10:00:00Z" },
    { id: "REFUND-004", bookingId: booking.id, date: "2026-01-12", amount: 2000000, method: "Tunai di kantor", status: "Dikembalikan" },
  );
  return { state, booking };
}

async function inspect(bytes: Uint8Array, save?: string) {
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const task = getDocument({ data: new Uint8Array(bytes) }), pdf = await task.promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    expect(page.view[2]).toBeCloseTo(595.28, 1); expect(page.view[3]).toBeCloseTo(841.89, 1);
    const content = await page.getTextContent();
    text += content.items.map(i => "str" in i ? i.str : "").join(" ");
    for (const item of content.items) if ("str" in item && item.str.trim()) {
      expect(item.transform[4]).toBeGreaterThanOrEqual(41);
      expect(item.transform[4] + item.width).toBeLessThanOrEqual(555);
      expect(item.transform[5]).toBeGreaterThan(20);
    }
    if (save) {
      const viewport = page.getViewport({ scale: 1.4 }), canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: canvas.getContext("2d") as unknown as CanvasRenderingContext2D, viewport }).promise;
      await writeFile(`${save}-${i}.png`, canvas.toBuffer("image/png"));
    }
  }
  const pages = pdf.numPages; await task.destroy(); return { text, pages };
}

test("all PDFs show chronological cash/transfer history while only verified installments reduce the contract", async () => {
  const [logo, regular, bold] = await Promise.all([readFile("public/logo-mark.png"), readFile("public/fonts/Lato-Regular.ttf"), readFile("public/fonts/Lato-Bold.ttf")]);
  await mkdir("docs/samples/payment-history", { recursive: true });
  for (const product of ["UMRAH", "HAJJ_SPECIAL"] as const) {
    const { state, booking } = fixture(product), before = encodeDemo(state), balance = financialBalance(state, booking);
    expect(balance.collected).toBe(BigInt(10000000)); expect(balance.balance).toBe(BigInt(booking.total - 10000000));
    expect(balance.history.map(p => p.id)).toEqual(["TRX-001", "CASH-002", "PENDING-003", "REFUND-004"]);
    for (const id of ["PENDING-003", "REFUND-004"]) expect(() => financialDocument(state, booking.id, "receipt", id)).toThrow(/terverifikasi/);
    for (const kind of ["invoice", "receipt", "statement"] as const) {
      const model = financialDocument(state, booking.id, kind, "TRX-001", "2026-11-05T00:00:00Z");
      expect(model.presentation.collected).toBe(balance.collected); expect(model.presentation.outstanding).toBe(balance.balance);
      if (kind === "receipt") expect(model.presentation.payments.map(p => p.id)).toEqual(["TRX-001"]);
      const bytes = await renderFinancialPDF(model, { logo, regular, bold });
      const path = `docs/samples/payment-history/${product}-${kind}`;
      const parsed = await inspect(bytes, product === "UMRAH" ? path : undefined);
      await writeFile(`${path}.pdf`, bytes);
      const history = parsed.text.slice(parsed.text.indexOf("Riwayat Pembayaran"));
      for (const value of ["TRX-001", "CASH-002", "PENDING-003", "REFUND-004", "Transfer bank", "Tunai di kantor", "Menunggu", "Dikembalikan", "BANK-DEMO-001", "KAS-DEMO-002", "1 Jan 2026", "10 Jan 2026", "2 Jan 2026", "11 Jan 2026"]) expect(history).toContain(value);
      expect(history.indexOf("TRX-001")).toBeLessThan(history.indexOf("CASH-002"));
      expect(parsed.text).toContain("10.000.000"); expect(parsed.text).toContain((booking.total - 10000000).toLocaleString("id-ID"));
      expect(parsed.text).toContain("Total Pembayaran Terverifikasi"); expect(parsed.text).toContain("DEMO");
      if (kind === "receipt") expect(parsed.text).toContain("Kuitansi ini mengakui satu transaksi");
    }
    expect(encodeDemo(state)).toBe(before);
    const pending = state.payments.find(p => p.id === "PENDING-003")!;
    pending.amount = booking.total - 10000000; verifyPayment(state, pending.id);
    expect(financialDocument(state, booking.id, "invoice").presentation.outstanding).toBe(BigInt(0));
    state.payments.find(p => p.id === "TRX-001")!.status = "Dikembalikan";
    expect(() => financialDocument(state, booking.id, "receipt", "TRX-001")).toThrow();
  }
  const { state, booking } = fixture();
  expect(() => recordPayment(state, booking.id, 1, "Transfer bank", "2026-02-30")).toThrow(/Tanggal/);
  expect(() => recordPayment(state, booking.id, 1, "", "2026-02-01")).toThrow(/metode/);
  expect(() => recordPayment(state, booking.id, 1, "Tunai di kantor", "2026-02-01", "x".repeat(121))).toThrow(/referensi/);
  for (let i = 0; i < 60; i++) state.payments.push({ id: `HISTORY-${String(i).padStart(3, "0")}`, bookingId: booking.id, date: "2026-02-01", amount: 1, method: "Transfer bank", status: "Menunggu", reference: "Referensi panjang ".repeat(8) });
  const long = await inspect(await renderFinancialPDF(financialDocument(state, booking.id, "receipt", "CASH-002"), { logo, regular, bold }));
  expect(long.pages).toBeGreaterThan(3); expect(long.text).toContain("HISTORY-059");
  expect(financialBalance(decodeDemo(encodeDemo(state)), booking).collected).toBe(BigInt(10000000));
});

test("booking and pilgrim pages share installment rows, verification, totals, real PDF downloads and persistence", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("/admin/login"); await page.getByRole("button", { name: "Masuk ke workspace" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  const state = createSeed(), booking = state.bookings[0]; booking.total = 20000000;
  state.payments = state.payments.filter(p => p.bookingId !== booking.id);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: DEMO_STORAGE_KEY, value: encodeDemo(state) });
  await page.goto(`/admin/booking/${booking.id}`);
  for (const installment of [{ method: "Transfer bank", date: "2026-10-01", ref: "BANK-UI-001" }, { method: "Tunai di kantor", date: "2026-10-10", ref: "CASH-UI-002" }]) {
    await page.getByRole("button", { name: "Catat pembayaran", exact: true }).click();
    const form = page.getByRole("dialog");
    await form.getByLabel("Nominal (Rp)").fill("5000000"); await form.getByRole("combobox", { name: "Metode", exact: true }).selectOption(installment.method);
    await form.getByLabel("Tanggal transaksi", { exact: true }).fill(installment.date);
    await form.getByLabel("Referensi pembayaran (opsional)").fill(installment.ref);
    await form.getByRole("button", { name: "Simpan pembayaran", exact: true }).click();
    const row = page.getByRole("row").filter({ hasText: installment.ref });
    await expect(row).toContainText("Menunggu");
    await expect(row.getByRole("button", { name: "Pratinjau Kuitansi Pembayaran", exact: true })).toBeDisabled();
    await row.getByRole("button", { name: "Verifikasi", exact: true }).click();
    await expect(row).toContainText("Terverifikasi");
  }
  const panel = page.locator("#booking-payments");
  await expect(panel).toContainText("Total Pembayaran Terverifikasi"); await expect(panel).toContainText("10.000.000");
  for (const title of ["Invoice", "Kuitansi Pembayaran", "Statement of Account"]) {
    await page.getByRole("button", { name: `Pratinjau ${title}`, exact: true }).first().click();
    const modal = page.getByRole("dialog"), link = modal.getByRole("link", { name: `Unduh ${title} PDF` });
    await expect(link).toBeVisible();
    const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
    const result = await inspect(new Uint8Array(await readFile((await download.path())!)));
    for (const text of ["BANK-UI-001", "CASH-UI-002", "1 Okt 2026", "10 Okt 2026", "10.000.000"]) expect(result.text).toContain(text);
    await modal.getByRole("button", { name: "Tutup dialog" }).click();
  }
  await mkdir("test-results/payment-history", { recursive: true });
  await panel.scrollIntoViewIfNeeded(); await page.screenshot({ path: "test-results/payment-history/booking.png", fullPage: true });
  await page.goto(`/admin/jamaah/${booking.jamaahId}`); await page.getByRole("button", { name: "Pembayaran", exact: true }).click();
  for (const ref of ["BANK-UI-001", "CASH-UI-002"]) await expect(page.getByRole("row").filter({ hasText: ref })).toContainText("5.000.000");
  await expect(page.getByRole("row").filter({ hasText: "CASH-UI-002" })).toContainText("Tunai di kantor");
  await page.screenshot({ path: "test-results/payment-history/pilgrim.png", fullPage: true });
  await page.reload(); await page.getByRole("button", { name: "Pembayaran", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("columnheader", { name: /Metode/ })).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "test-results/payment-history/pilgrim-mobile.png", fullPage: true });
  const restored = decodeDemo(await page.evaluate(key => localStorage.getItem(key)!, DEMO_STORAGE_KEY));
  expect(financialBalance(restored, restored.bookings[0]).collected).toBe(BigInt(10000000));
  await page.goto("/admin/dashboard");
  const monthly = restored.bookings.filter(b => b.status === "Aktif").flatMap(b => financialBalance(restored, b).payments).filter(p => p.date.startsWith("2026-10")).reduce((n, p) => n + BigInt(p.amount), BigInt(0));
  await expect(page.locator(".admin-stat").filter({ hasText: "Penerimaan bulan ini" })).toContainText(rupiahSingkat(Number(monthly)));
});
