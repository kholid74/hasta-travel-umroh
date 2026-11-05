import type { DemoState } from "@/content/admin/types";
import { productLabels } from "@/content/admin/types";
import { dateLabel, financialBalance, packageForBooking } from "./model";
export { renderFinancialPDF } from "./financial-pdf";

export type DocumentKind = "invoice" | "receipt" | "statement";
export const documentTitles = { invoice: "Invoice", receipt: "Kuitansi Pembayaran", statement: "Statement of Account" };
export const documentMoney = (n: bigint) => `Rp ${n.toLocaleString("id-ID")}`;
export function financialDocument(state: DemoState, bookingId: string, kind: DocumentKind, paymentId?: string, generated = new Date().toISOString()) {
  const b = state.bookings.find(b => b.id === bookingId);
  if (!b || b.status !== "Aktif") throw new Error("Dokumen tersedia hanya untuk booking aktif.");
  const j = state.jamaah.find(j => j.id === b.jamaahId), product = packageForBooking(state, b);
  if (!j || !product) throw new Error("Identitas atau asosiasi paket tidak lengkap.");
  const balance = financialBalance(state, b, true);
  const payment = state.payments.find(p => p.id === paymentId && p.bookingId === b.id);
  if (kind === "receipt" && (!payment || payment.status !== "Terverifikasi")) throw new Error("Kuitansi hanya tersedia untuk pembayaran terverifikasi yang belum dikembalikan.");
  const id = `DEMO-${{ invoice: "INV", receipt: "RCT", statement: "SOA" }[kind]}-${kind === "receipt" ? payment!.id : b.id}`;
  const identity = ["Hasta Travel | Penerbit demo fiktif", `Nomor: ${id}`, `Dibuat: ${dateLabel(generated)}`, `Jamaah: ${j.name}`, `Kontak: ${j.phone}`, `Booking: ${b.id}`, `Produk: ${productLabels[b.productType]}`, `Paket: ${b.contractDescription || product.name}`];
  if (!b.contractDescription) identity.push("Nama paket: metadata saat ini; arsip nama kontrak lama tidak tersedia.");
  const assumptions = b.priceAssumption ? [`Asumsi kontrak: ${b.priceAssumption.currency} ${b.priceAssumption.amount}; kurs IDR ${b.priceAssumption.exchangeRate} per ${dateLabel(b.priceAssumption.date)}. Nilai IDR mengikuti snapshot booking.`] : ["Mata uang kontrak: IDR. Tidak ada asumsi valuta asing tercatat."];
  const payments = balance.payments;
  const paymentLines = (p: typeof payments[number]) => [`${p.id} | ${documentMoney(BigInt(p.amount))} | ${p.method}`, `Tanggal transaksi: ${dateLabel(p.date)} | Verifikasi: ${p.verifiedAt ? dateLabel(p.verifiedAt) : "tanggal tidak tercatat"} | ${p.status}`, ...(p.reference ? [`Referensi pembayaran: ${p.reference}`] : [])];
  const historyLines = ["Riwayat Pembayaran", ...(balance.history.length ? balance.history.flatMap(paymentLines) : ["Belum ada pembayaran tercatat."])];
  const summary = [`Total Harga Paket: ${documentMoney(balance.contract)}`, `Total Pembayaran Terverifikasi: ${documentMoney(balance.collected)}`, `Sisa Tagihan: ${documentMoney(balance.balance)}`];
  const templates: Record<DocumentKind, string[]> = {
    invoice: [`Tanggal invoice: ${dateLabel(b.date)}`, ...(b.due ? [`Jatuh tempo: ${dateLabel(b.due)}`] : []), "RINCIAN TAGIHAN", `1 paket / 1 jamaah: ${documentMoney(balance.contract)}`],
    receipt: payment ? ["PEMBAYARAN DITERIMA - SIMULASI", ...paymentLines(payment), `Booking terkait: ${b.id}`, ...assumptions] : [],
    statement: [`Tanggal laporan: ${dateLabel(generated)}`, ...assumptions],
  };
  return { id, kind, title: documentTitles[kind], presentation: {
    customer: j.name, phone: j.phone, bookingId: b.id, product: productLabels[b.productType],
    description: b.contractDescription || product.name, legacyDescription: !b.contractDescription,
    issued: dateLabel(b.date), generated: dateLabel(generated), due: b.due ? dateLabel(b.due) : "",
    contract: balance.contract, collected: balance.collected, outstanding: balance.balance,
    status: balance.balance === BigInt(0) ? "Lunas" : balance.collected > BigInt(0) ? "Dibayar sebagian" : "Belum dibayar",
    payments: (kind === "receipt" ? [payment!] : payments).map(p => ({ id: p.id, amount: BigInt(p.amount), date: dateLabel(p.date), method: p.method, verified: p.verifiedAt ? dateLabel(p.verifiedAt) : "Tanggal tidak tercatat", reference: p.reference || "" })),
    history: balance.history.map(p => ({ id: p.id, amount: BigInt(p.amount), date: dateLabel(p.date), method: p.method, status: p.status, verified: p.verifiedAt ? dateLabel(p.verifiedAt) : "", reference: p.reference || "" })),
    assumptions: assumptions.join(" "),
    instructions: state.settings.bank && state.settings.account ? state.settings.bank + " / " + state.settings.account : "",
    bank: { name: state.settings.bank?.trim() || "", account: state.settings.account?.trim() || "", holder: state.settings.accountHolder?.trim() || "" },
  }, lines: [...identity, ...templates[kind], ...historyLines, ...summary, "DEMO - bukan faktur pajak atau bukti pembayaran riil. Tidak menyatakan kepatuhan pajak.", "Hanya pembayaran Terverifikasi mengurangi tagihan. Menunggu dan Dikembalikan tidak dihitung. Riwayat adalah snapshot saat penerbitan; periksa status terbaru di workspace."] };
}
