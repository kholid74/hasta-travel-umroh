import { PDFDocument, rgb, type PDFFont, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { financialDocument } from "./financial-documents";
import { documentMoney } from "./financial-documents";
import type { ItemSnapshot } from "@/content/admin/inventory";

export type FinancialPDFAssets = { logo: Uint8Array; regular: Uint8Array; bold: Uint8Array };
type FinancialModel = ReturnType<typeof financialDocument>;
export type HandoverPDFModel = { id: string; kind: "handover"; title: string; presentation: Pick<FinancialModel["presentation"], "customer" | "phone" | "bookingId" | "product" | "description" | "legacyDescription" | "issued" | "generated" | "due" | "status" | "assumptions" | "instructions"> & { recipient: string; receivedAt: string; operator: string; warehouse: string; notes: string; items: ItemSnapshot[] } };
async function browserAssets(): Promise<FinancialPDFAssets> {
  const read = async (path: string) => {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Logo atau font PDF tidak dapat dimuat. Muat ulang lalu coba lagi.");
    return new Uint8Array(await response.arrayBuffer());
  };
  const [logo, regular, bold] = await Promise.all([read("/logo-mark.png"), read("/fonts/Lato-Regular.ttf"), read("/fonts/Lato-Bold.ttf")]);
  return { logo, regular, bold };
}

export async function renderFinancialPDF(model: FinancialModel | HandoverPDFModel, assets?: FinancialPDFAssets) {
  const source = assets ?? await browserAssets();
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const regular = await pdf.embedFont(source.regular, { subset: true }), bold = await pdf.embedFont(source.bold, { subset: true });
  const logo = await pdf.embedPng(source.logo);
  const ink = rgb(.08, .22, .17), gold = rgb(.69, .47, .16), pale = rgb(.95, .97, .95);
  const muted = rgb(.33, .40, .36), line = rgb(.84, .88, .85), white = rgb(1, 1, 1);
  const d = model.presentation, width = 511.28, left = 42, bottom = 736;
  const characters = new Set(regular.getCharacterSet());
  let page = pdf.addPage([595.28, 841.89]), y = 0;
  const rect = (x: number, top: number, w: number, h: number, color: RGB) => page.drawRectangle({ x, y: 841.89 - top - h, width: w, height: h, color });
  function text(value: string, x: number, top: number, size = 10, font = regular, color = ink) {
    const clean = value.replace(/[\r\n\t]/g, " ");
    if ([...clean].some(c => !characters.has(c.codePointAt(0)!))) throw new Error("Font PDF belum mendukung sebagian karakter pada data. Gunakan karakter Latin atau lengkapi font terlebih dahulu.");
    page.drawText(clean, { x, y: 841.89 - top - size, size, font, color });
  }
  const rule = (top: number, x = left, w = width) => rect(x, top, w, .6, line);
  function wrap(value: string, w: number, size = 10, font: PDFFont = regular): string[] {
    const result: string[] = [];
    let current = "";
    for (const word of value.replace(/[\r\n\t]/g, " ").split(/\s+/)) {
      if (current && font.widthOfTextAtSize(`${current} ${word}`, size) > w) { result.push(current); current = ""; }
      for (const char of (current ? ` ${word}` : word)) {
        if (current && font.widthOfTextAtSize(current + char, size) > w) { result.push(current); current = ""; }
        current += char;
      }
    }
    if (current) result.push(current);
    return result.length ? result : [""];
  }
  function header() {
    rect(0, 0, 595.28, 96, ink);
    page.drawImage(logo, { x: left, y: 841.89 - 77, width: 34, height: 52 });
    text("hasta", 91, 20, 29, bold, white);
    text("TRAVEL WORKSPACE", 93, 59, 8, regular, rgb(.91, .77, .49));
    const title = model.kind === "receipt" ? "Payment Receipt" : model.title;
    const size = model.kind === "statement" ? 20 : 24;
    text(title, 553.28 - bold.widthOfTextAtSize(title, size), 25, size, bold, white);
    text("DOKUMEN DEMO", 553.28 - regular.widthOfTextAtSize("DOKUMEN DEMO", 8), 61, 8, regular, rgb(.91, .77, .49));
    rect(left, 95, width, 2, gold); y = 116;
  }
  function next() { page = pdf.addPage([595.28, 841.89]); header(); }
  function ensure(h: number) { if (y + h > bottom) next(); }
  function paragraph(value: string, size = 9, color = muted) {
    for (const row of wrap(value, width, size)) { ensure(size + 6); text(row, left, y, size, regular, color); y += size + 5; }
    y += 5;
  }
  function heading(value: string) { ensure(46); text(value, left, y, 12, bold); y += 21; }
  function amount(value: bigint, x: number, top: number, w: number, size = 14, color = ink) {
    const label = documentMoney(value);
    while (bold.widthOfTextAtSize(label, size) > w && size > 8) size -= .5;
    text(label, x + w - bold.widthOfTextAtSize(label, size), top, size, bold, color);
  }
  function badge(label: string, top: number) {
    const w = bold.widthOfTextAtSize(label, 8) + 22;
    rect(left + width - w, top, w, 21, pale);
    text(label, left + width - w + 11, top + 5, 8, bold);
  }
  function metadata() {
    text(model.id, left, y, 10, bold); badge(model.kind === "receipt" ? "Terverifikasi · DEMO" : d.status, y - 3); y += 20;
    paragraph(`Dibuat ${d.generated}${model.kind === "invoice" ? `  |  Tanggal invoice ${d.issued}${d.due ? `  |  Jatuh tempo ${d.due}` : ""}` : ""}`, 8);
    ensure(120);
    if (model.kind === "invoice") {
      const bank = model.presentation.bank;
      if ([bank.name, bank.account, bank.holder].some(value => value.length > 120)) throw new Error("Informasi rekening maksimal 120 karakter per field. Perbarui Settings Pembayaran.");
      const start = y;
      text("Diterbitkan oleh", left, start, 9, regular, muted);
      text("Hasta Travel", left, start + 15, 14, bold);
      text("Penerbit demo fiktif", left, start + 35, 8, regular, muted);
      text("Ditagihkan kepada", left, start + 48, 9, regular, muted);
      let customerTop = start + 62;
      const names = wrap(d.customer, 243, 14, bold);
      for (const row of names.slice(0, 3)) { text(row, left, customerTop, 14, bold); customerTop += 19; }
      for (const row of wrap(d.phone, 243, 9)) { text(row, left, customerTop + 4, 9, regular, muted); customerTop += 13; }
      text("Rekening perusahaan · DEMO", 310, start, 9, bold);
      let bankTop = start + 17;
      for (const value of [bank.name || "Nama bank belum diisi", bank.account ? `No. ${bank.account}` : "Nomor rekening belum diisi", bank.holder ? `a.n. ${bank.holder}` : "Nama pemilik rekening belum diisi", "Simulasi · jangan transfer dana"]) {
        for (const row of wrap(value, 243, 9)) { text(row, 310, bankTop, 9, regular, muted); bankTop += 13; }
      }
      y = Math.max(customerTop, bankTop) + 10; rule(y); y += 10;
      if (names.length > 3) paragraph("Nama jamaah (lanjutan): " + names.slice(3).join(" "), 10, ink);
      return;
    }
    const start = y; text("Diterbitkan oleh", left, start, 9, regular, muted);
    text("Hasta Travel", left, start + 19, 14, bold);
    text("Penerbit demo fiktif", left, start + 42, 9, regular, muted);
    text("Pemilik akun / jamaah", 310, start, 9, regular, muted);
    let t = start + 19;
    const names = wrap(d.customer, 243, 14, bold);
    for (const row of names.slice(0, 3)) { text(row, 310, t, 14, bold); t += 19; }
    for (const row of wrap(d.phone, 243, 9)) { text(row, 310, t + 4, 9, regular, muted); t += 13; }
    y = Math.max(start + 58, t + 22); rule(y); y += 15;
    if (names.length > 3) paragraph("Nama jamaah (lanjutan): " + names.slice(3).join(" "), 10, ink);
  }
  function packagePanel() {
    const rows = wrap(d.description, width - 32, 12, bold);
    let offset = 0;
    while (offset < rows.length) {
      ensure(81);
      const count = Math.max(1, Math.min(rows.length - offset, Math.floor((bottom - y - 55) / 17)));
      const h = 36 + count * 17;
      rect(left, y, width, h, pale);
      text(`${d.product}  ·  Booking ${d.bookingId}${offset ? "  ·  lanjutan" : ""}`, left + 16, y + 12, 8, bold, muted);
      rows.slice(offset, offset + count).forEach((row, i) => text(row, left + 16, y + 28 + i * 17, 12, bold));
      y += h + (model.kind === "invoice" ? 6 : 14); offset += count;
      if (offset < rows.length) next();
    }
  }
  function table(title: string, labels: string[], widths: number[], rows: string[][], moneyColumn = -1, reserveEnd = 0) {
    const tableHeader = (continuation = false) => {
      heading(title + (continuation ? " · lanjutan" : ""));
      rect(left, y, width, 22, ink);
      let x = left;
      labels.forEach((label, i) => { text(label, i === moneyColumn ? x + widths[i] - 10 - bold.widthOfTextAtSize(label, 8) : x + 10, y + 6, 8, bold, white); x += widths[i]; });
      y += 22;
    };
    ensure(90); tableHeader();
    if (!rows.length) { rect(left, y, width, 35, pale); text("Belum ada pembayaran tercatat.", left + 10, y + 12, 9, regular, muted); y += 49; return; }
    rows.forEach((row, rowIndex) => {
      const cells = row.map((value, i) => value.split("\n").flatMap(v => wrap(v, widths[i] - 20, 9)));
      const length = Math.max(...cells.map(c => c.length));
      let offset = 0;
      while (offset < length) {
        const tailHeight = (length - offset) * 13 + 14 + reserveEnd + 14;
        if (reserveEnd && rowIndex === rows.length - 1 && tailHeight <= bottom - 159 && y + tailHeight > bottom) { next(); tableHeader(true); }
        if (bottom - y < 33) { next(); tableHeader(true); }
        const count = Math.max(1, Math.min(length - offset, Math.floor((bottom - y - 18) / 13)));
        const height = count * 13 + 14;
        rect(left, y, width, height, rowIndex % 2 ? white : pale);
        let x = left;
        cells.forEach((cell, i) => {
          cell.slice(offset, offset + count).forEach((value, n) => text(value, i === moneyColumn ? x + widths[i] - 10 - regular.widthOfTextAtSize(value, 9) : x + 10, y + 8 + n * 13, 9));
          x += widths[i];
        });
        y += height; rule(y); offset += count;
        if (offset < length) { next(); tableHeader(true); }
      }
    });
    y += 14;
  }
  function summary(d: FinancialModel["presentation"]) {
    ensure(model.kind === "invoice" ? 98 : 113); rect(left, y, width, 98, ink);
    text("Total Harga Paket", left + 18, y + 11, 8, regular, white);
    text(documentMoney(d.contract), left + 18, y + 25, 14, bold, white);
    text("Total Pembayaran Terverifikasi", left + 18, y + 53, 8, regular, white);
    text(documentMoney(d.collected), left + 18, y + 67, 14, bold, white);
    rect(left + 305, y + 18, .6, 68, rgb(.35, .48, .40));
    text("Sisa Tagihan", left + 324, y + 17, 9, regular, rgb(.91, .77, .49));
    amount(d.outstanding, left + 324, y + 40, width - 342, 22, rgb(1, .87, .60));
    y += 113;
  }
  function paymentHistory(d: FinancialModel["presentation"]) {
    table("Riwayat Pembayaran", ["Tanggal", "Metode", "Referensi", "Nominal (IDR)", "Status"], model.kind === "invoice" ? [82, 93, 101, 114, width - 390] : [82, 93, 117, 114, width - 406],
      d.history.map(p => [p.date, p.method, p.id + (p.reference ? "\n" + p.reference : ""), documentMoney(p.amount), p.status + (p.verified ? "\nVerifikasi: " + p.verified : p.status === "Terverifikasi" ? "\nTanggal verifikasi tidak tercatat" : "")]), 3, model.kind === "invoice" ? 98 : 0);
    if (model.kind !== "invoice") paragraph("Hanya pembayaran Terverifikasi mengurangi tagihan. Menunggu dan Dikembalikan tidak dihitung dalam total pembayaran terverifikasi.", 8);
  }
  header(); metadata();
  if (model.kind === "handover") {
    const d = model.presentation;
    packagePanel();
    table("Detail penyerahan", ["Tanggal / gudang", "Penerima / operator demo"], [255, width - 255], [[`${d.receivedAt}\n${d.warehouse}`, `${d.recipient}\nOperator: ${d.operator}`]]);
    table("Perlengkapan yang diserahkan", ["Barang", "SKU / varian", "Jumlah", "Satuan"], [223, 143, 65, width - 431], d.items.map(i => [i.name, `${i.sku}\n${i.variant}`, String(i.quantity), i.unit]), 2);
    if (d.notes) paragraph(d.notes, 9);
    ensure(82);
    text("Penerima", left, y, 10, bold); text("Petugas", left + 300, y, 10, bold);
    rule(y + 42, left, 190); rule(y + 42, left + 300, 190);
    text("Ruang pengakuan kosong · DEMO", left, y + 48, 8, regular, muted);
    y += 80;
  } else if (model.kind === "receipt") {
    const d = model.presentation;
    const payment = d.payments[0];
    ensure(119); rect(left, y, width, 101, ink);
    text("Jumlah diterima", left + 20, y + 15, 10, regular, rgb(.91, .77, .49));
    text(documentMoney(payment.amount), left + 20, y + 36, 32, bold, white);
    text("PEMBAYARAN TERVERIFIKASI · SIMULASI", left + 20, y + 80, 8, regular, white);
    y += 121; packagePanel();
    table("Detail transaksi", ["Keterangan", "Data pembayaran"], [158, width - 158], [
      ["Referensi transaksi", payment.id], ["Tanggal transaksi", payment.date], ["Tanggal verifikasi", payment.verified],
      ["Metode pembayaran", payment.method], ...(payment.reference ? [["Referensi pembayaran", payment.reference]] : []),
      ["Status pembayaran", "Terverifikasi · DEMO"],
    ]);
    paragraph("Kuitansi ini mengakui satu transaksi pada detail di atas. Riwayat berikut adalah informasi saldo booking saat penerbitan, bukan tambahan pembayaran yang diakui oleh kuitansi ini.", 8);
    paymentHistory(d); summary(d);
  } else {
    const d = model.presentation;
    if (model.kind === "statement") summary(d);
    packagePanel();
    if (model.kind === "invoice") {
      table("Rincian tagihan", ["Deskripsi", "Jumlah", "Nilai kontrak"], [width - 195, 65, 130], [[d.description, "1 paket", documentMoney(d.contract)]], 2);
    }
    paymentHistory(d);
    if (model.kind === "invoice") summary(d);
    else { ensure(45); text("Sisa tagihan", left, y + 5, 12, bold); amount(d.outstanding, left + 280, y, width - 280, 21); y += 44; }
  }
  if (model.kind !== "invoice") {
    heading("Catatan dokumen");
    paragraph(d.assumptions, 8);
    if (d.legacyDescription) paragraph("Nama paket memakai metadata saat ini; arsip nama kontrak lama tidak tersedia. Nilai kontrak tetap mengikuti booking tersimpan.", 8);
  }
  pdf.getPages().forEach((p, i, all) => {
    page = p;
    if (model.kind === "invoice") text("Hanya pembayaran Terverifikasi mengurangi tagihan. Menunggu dan Dikembalikan tidak dihitung.", left, 751, 7, regular, muted);
    rule(765);
    text("DEMO", left, 778, 8, bold, gold);
    text(model.kind === "handover" ? "Bukti perlengkapan simulasi. Ruang pengakuan bukan tanda tangan yang ditangkap atau diverifikasi." : "Bukan faktur pajak atau bukti pembayaran riil. Tidak menyatakan kepatuhan pajak.", left + 40, 778, 7, regular, muted);
    text("Snapshot saat penerbitan. Periksa status terbaru di workspace.", left, 794, 7, regular, muted);
    const counter = `${i + 1} / ${all.length}`;
    text(counter, left + width - bold.widthOfTextAtSize(counter, 8), 807, 8, bold, muted);
    text(model.id, left, 807, 7, regular, muted);
  });
  pdf.setTitle(`${model.title} ${model.id}`);
  return pdf.save();
}
