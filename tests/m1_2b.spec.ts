import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { saveArtifact } from "./helpers/artifacts";
import { createCanvas } from "@napi-rs/canvas";
import { createSeed } from "../content/admin/seed";
import { financialDocument, renderFinancialPDF } from "../lib/admin/financial-documents";

test("branded PDFs embed logo/fonts and paginate tables without losing financial content", async ({}, testInfo) => {
  const { getDocument, OPS } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const [logo, regular, bold] = await Promise.all([readFile("public/logo-mark.png"), readFile("public/fonts/Lato-Regular.ttf"), readFile("public/fonts/Lato-Bold.ttf")]);
  const assets = { logo, regular, bold }, state = createSeed();
  for (const booking of [state.bookings[0], state.bookings.find(b => b.productType === "HAJJ_SPECIAL")!]) {
    const payment = state.payments.find(p => p.bookingId === booking.id && p.status === "Terverifikasi")!;
    for (const kind of ["invoice", "receipt", "statement"] as const) {
      const model = financialDocument(state, booking.id, kind, payment.id, "2026-11-03T00:00:00Z");
      const bytes = await renderFinancialPDF(model, assets);
      const task = getDocument({ data: new Uint8Array(bytes) }), document = await task.promise;
      const page = await document.getPage(1), content = await page.getTextContent();
      expect(content.items.map(i => "str" in i ? i.str : "").join(" ")).toContain(model.id);
      expect((await page.getOperatorList()).fnArray).toContain(OPS.paintImageXObject);
      // Receipt now includes booking history and totals in addition to its own transaction.
      expect(document.numPages).toBeLessThanOrEqual(kind === "receipt" ? 2 : 1);
      const viewport = page.getViewport({ scale: 1.6 }), canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
      await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: canvas.getContext("2d") as unknown as CanvasRenderingContext2D, viewport }).promise;
      const filename = `m1_2b/${booking.productType}-${kind}`;
      await saveArtifact(testInfo, `${filename}.pdf`, bytes, { sample: true }); await saveArtifact(testInfo, `${filename}.png`, canvas.toBuffer("image/png"), { sample: true });
      await task.destroy();
    }
  }
  const booking = state.bookings[0];
  booking.contractDescription = "Perjalanan keluarga dengan deskripsi sangat panjang ".repeat(200);
  state.payments = state.payments.filter(p => p.bookingId !== booking.id);
  for (let i = 0; i < 100; i++) state.payments.push({ id: `VISUAL-${String(i).padStart(3, "0")}`, bookingId: booking.id, date: "2026-10-02", amount: 1, method: "Transfer demo", status: "Terverifikasi" });
  for (const kind of ["invoice", "statement"] as const) {
    const model = financialDocument(state, booking.id, kind);
    const task = getDocument({ data: await renderFinancialPDF(model, assets) }), document = await task.promise;
    let text = "", tablePages = 0;
    for (let i = 1; i <= document.numPages; i++) {
      const page = await document.getPage(i), content = await page.getTextContent();
      const pageText = content.items.map(v => "str" in v ? v.str : "").join(" ");
      text += pageText;
      expect(pageText).toContain("DEMO");
      if (pageText.includes("VISUAL-")) { tablePages++; expect(pageText).toContain("Nominal (IDR)"); }
      for (const item of content.items) if ("str" in item && item.str.trim()) {
        expect(item.transform[4]).toBeGreaterThanOrEqual(41);
        expect(item.transform[4] + item.width).toBeLessThanOrEqual(555);
        expect(item.transform[5]).toBeGreaterThan(20);
      }
    }
    expect(tablePages).toBeGreaterThan(1); expect(text).toContain("VISUAL-099");
    expect(text).toContain((booking.total - 100).toLocaleString("id-ID"));
    await task.destroy();
  }
});
