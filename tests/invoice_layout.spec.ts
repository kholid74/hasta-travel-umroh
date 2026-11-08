import { test, expect } from "@playwright/test";
import { enterAs } from "./helpers/session";
import { readFile } from "node:fs/promises";
import { saveArtifact } from "./helpers/artifacts";
import { createCanvas } from "@napi-rs/canvas";
import { createSeed } from "../content/admin/seed";
import { financialDocument, renderFinancialPDF } from "../lib/admin/financial-documents";
import { financialBalance } from "../lib/admin/model";
import { decodeDemo, encodeDemo, DEMO_STORAGE_KEY } from "../lib/admin/persistence";

test("invoice bank placement, notes removal and intact summaries paginate 4, 10 and 25 records", async ({}, testInfo) => {
  test.setTimeout(180000);
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const [logo, regular, bold] = await Promise.all([readFile("public/logo-mark.png"), readFile("public/fonts/Lato-Regular.ttf"), readFile("public/fonts/Lato-Bold.ttf")]);
  const assets = { logo, regular, bold }, results = [];
  for (const product of ["UMRAH", "HAJJ_SPECIAL"] as const) for (const count of [4, 10, 25]) {
    const state = createSeed(), booking = state.bookings.find(b => b.productType === product)!;
    if (product === "UMRAH") booking.total = 20000000;
    booking.contractDescription = product === "UMRAH" ? "Umroh Reguler 9 Hari" : "Haji Khusus Amanah — Demo";
    state.settings.bank = "Bank Contoh DEMO"; state.settings.account = "0000 0000 0000"; state.settings.accountHolder = "PT HASTA CONTOH DEMO";
    state.payments = state.payments.filter(p => p.bookingId !== booking.id);
    for (let i = 1; i <= count; i++) {
      const date = `2026-10-${String(i).padStart(2, "0")}`;
      const status = (["Terverifikasi", "Terverifikasi", "Menunggu", "Dikembalikan"] as const)[(i - 1) % 4];
      state.payments.push({ id: `CICIL-${String(i).padStart(2, "0")}`, bookingId: booking.id, amount: count === 4 ? 5000000 : 500000, date, method: i % 2 ? "Transfer bank" : "Tunai di kantor", reference: `REF-DEMO-${i}`, status, ...(status === "Terverifikasi" ? { verifiedAt: date + "T10:00:00Z" } : {}) });
    }
    const before = encodeDemo(state), balance = financialBalance(state, booking);
    const model = financialDocument(state, booking.id, "invoice", undefined, "2026-11-05T00:00:00Z");
    const bytes = await renderFinancialPDF(model, assets);
    const task = getDocument({ data: new Uint8Array(bytes) }), pdf = await task.promise;
    const pages: string[] = [], summaryPages: number[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i), content = await page.getTextContent();
      expect(page.view[2]).toBeCloseTo(595.28, 1); expect(page.view[3]).toBeCloseTo(841.89, 1);
      const items = content.items.filter(i => "str" in i), text = items.map(i => i.str).join(" "); pages.push(text);
      expect(text).not.toContain("Catatan dokumen"); expect(text).not.toContain("Asumsi kontrak");
      expect(text).toContain("DEMO"); expect(text).toContain("Hanya pembayaran Terverifikasi");
      if (text.includes("CICIL-")) { expect(text).toContain("Riwayat Pembayaran"); expect(text).toContain("Nominal (IDR)"); }
      if (text.includes("Total Harga Paket")) {
        summaryPages.push(i);
        for (const label of ["Total Pembayaran Terverifikasi", "Sisa Tagihan", balance.contract.toLocaleString("id-ID"), balance.collected.toLocaleString("id-ID"), balance.balance.toLocaleString("id-ID")]) expect(text).toContain(label);
        expect(text.indexOf("Total Harga Paket")).toBeGreaterThan(text.lastIndexOf(`CICIL-${String(count).padStart(2, "0")}`));
        const summary = items.find(v => v.str === "Total Harga Paket")!, lastRow = items.find(v => v.str === `CICIL-${String(count).padStart(2, "0")}`)!;
        expect(lastRow).toBeTruthy(); expect(lastRow.transform[5]).toBeGreaterThan(summary.transform[5]);
      }
      if (i === 1) {
        const bank = items.find(v => v.str === state.settings.bank)!, holder = items.find(v => v.str.includes(state.settings.accountHolder))!;
        expect(bank.transform[4]).toBeGreaterThanOrEqual(310); expect(bank.transform[5]).toBeGreaterThan(600);
        expect(holder.transform[4]).toBeGreaterThanOrEqual(310); expect(text).toContain(state.settings.account);
      }
      for (const item of items) if (item.str.trim()) { expect(item.transform[4]).toBeGreaterThanOrEqual(41); expect(item.transform[4] + item.width).toBeLessThanOrEqual(555); expect(item.transform[5]).toBeGreaterThan(20); }
      if (product === "UMRAH") {
        const viewport = page.getViewport({ scale: 1.4 }), canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
        await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: canvas.getContext("2d") as unknown as CanvasRenderingContext2D, viewport }).promise;
        await saveArtifact(testInfo, `invoice-layout/${product}-${count}-${i}.png`, canvas.toBuffer("image/png"), { sample: true });
      }
    }
    expect(summaryPages).toEqual([pdf.numPages]);
    for (let i = 1; i <= count; i++) expect(pages.join(" ")).toContain(`CICIL-${String(i).padStart(2, "0")}`);
    expect(pages.join(" ")).toContain("Menunggu"); expect(pages.join(" ")).toContain("Dikembalikan");
    if (count === 4) expect(pdf.numPages).toBe(1);
    if (count > 4) expect(pdf.numPages).toBeGreaterThan(1);
    results.push({ product, records: count, pages: pdf.numPages, verified: balance.collected.toString(), outstanding: balance.balance.toString() });
    await saveArtifact(testInfo, `invoice-layout/${product}-${count}.pdf`, bytes, { sample: true }); await task.destroy();
    expect(encodeDemo(state)).toBe(before);
  }
  await saveArtifact(testInfo, "invoice-layout/pagination.json", JSON.stringify(results, null, 2) + "\n", { sample: true });

  const state = createSeed(), booking = state.bookings[0];
  delete state.settings.accountHolder;
  const restored = decodeDemo(encodeDemo(state)); expect(restored.settings.accountHolder).toBe("");
  const missing = getDocument({ data: await renderFinancialPDF(financialDocument(restored, booking.id, "invoice"), assets) }), missingPDF = await missing.promise;
  expect((await (await missingPDF.getPage(1)).getTextContent()).items.map(i => "str" in i ? i.str : "").join(" ")).toContain("Nama pemilik rekening belum diisi");
  await missing.destroy();
  for (const kind of ["receipt", "statement"] as const) {
    const payment = state.payments.find(p => p.bookingId === booking.id && p.status === "Terverifikasi")!;
    const task = getDocument({ data: await renderFinancialPDF(financialDocument(state, booking.id, kind, payment.id), assets) }), doc = await task.promise;
    let text = ""; for (let i = 1; i <= doc.numPages; i++) text += (await (await doc.getPage(i)).getTextContent()).items.map(i => "str" in i ? i.str : "").join(" ");
    expect(text).toContain("Catatan dokumen"); expect(text).not.toContain("Rekening perusahaan"); await task.destroy();
  }
});

test("payment settings save account holder, persist it and feed the actual invoice preview", async ({ page }) => {
  await enterAs(page);
  await page.goto("/admin/settings"); await page.getByRole("button", { name: "Pembayaran", exact: true }).click();
  await page.getByLabel("Nama bank (demo)", { exact: true }).fill("Bank Config DEMO");
  await page.getByLabel("Nomor rekening (demo)", { exact: true }).fill("0000 5555 0000");
  await page.getByLabel("Nama pemilik rekening (demo)", { exact: true }).fill("HASTA PEMILIK DEMO");
  await page.getByRole("button", { name: "Simpan pengaturan", exact: true }).click();
  await page.reload(); await page.getByRole("button", { name: "Pembayaran", exact: true }).click();
  await expect(page.getByLabel("Nama pemilik rekening (demo)", { exact: true })).toHaveValue("HASTA PEMILIK DEMO");
  const state = decodeDemo(await page.evaluate(key => localStorage.getItem(key)!, DEMO_STORAGE_KEY));
  expect(financialDocument(state, state.bookings[0].id, "invoice").presentation.bank.holder).toBe("HASTA PEMILIK DEMO");
  await page.goto(`/admin/invoice/${state.bookings[0].id}`); await page.getByRole("button", { name: "Pratinjau Invoice", exact: true }).click();
  const link = page.getByRole("link", { name: "Unduh Invoice PDF", exact: true }); await expect(link).toBeVisible();
  const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
  const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs"), task = getDocument({ data: new Uint8Array(await readFile((await download.path())!)) }), doc = await task.promise;
  const text = (await (await doc.getPage(1)).getTextContent()).items.map(i => "str" in i ? i.str : "").join(" ");
  for (const value of ["Bank Config DEMO", "0000 5555 0000", "HASTA PEMILIK DEMO"]) expect(text).toContain(value);
  expect(text).not.toContain("Catatan dokumen"); await task.destroy();
});
