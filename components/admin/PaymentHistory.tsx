"use client";
import type { ReactNode } from "react";
import { useDemo } from "./Store";
import { Badge, DataTable, Empty, Fields, Panel } from "./ui";
import { dateLabel, financialBalance, paymentStatus, verifyPayment } from "@/lib/admin/model";
import { documentMoney } from "@/lib/admin/financial-documents";
import FinancialDocuments from "./FinancialDocuments";

export default function PaymentHistory({ bookingId, action }: { bookingId: string; action?: ReactNode }) {
  const { state, transact, can } = useDemo();
  const booking = state.bookings.find(b => b.id === bookingId);
  if (!booking) return <Empty title="Booking tidak ditemukan" />;
  const balance = financialBalance(state, booking);
  return <Panel title="Riwayat pembayaran" action={action}>
    <Fields data={{ "Total Harga Paket": documentMoney(balance.contract), "Total Pembayaran Terverifikasi": documentMoney(balance.collected), "Sisa Tagihan": documentMoney(balance.balance), Status: <Badge>{paymentStatus(state, booking)}</Badge> }} />
    <p className="admin-notice">Hanya pembayaran Terverifikasi mengurangi tagihan. Menunggu dan Dikembalikan tidak dihitung.{booking.status === "Batal" ? " Booking dibatalkan; sisa tagihan ditutup sesuai status booking." : ""}</p>
    {balance.balance < BigInt(0) && <p role="alert" className="form-error">Pembayaran melebihi kontrak. Tinjau transaksi; penerbitan PDF diblokir.</p>}
    <DataTable title="transaksi" rows={balance.history} columns={[
      { label: "Referensi", value: p => `${p.id} ${p.reference || ""}`, render: p => <>{p.id}{p.reference && <small>{p.reference}</small>}</> },
      { label: "Tanggal transaksi", value: p => p.date, render: p => dateLabel(p.date) },
      { label: "Metode", value: p => p.method },
      { label: "Nominal", value: p => p.amount, render: p => documentMoney(BigInt(p.amount)) },
      { label: "Status verifikasi", value: p => p.status, render: p => <><Badge>{p.status}</Badge>{p.verifiedAt && <small>Verifikasi: {dateLabel(p.verifiedAt)}</small>}</> },
      { label: "Aksi", value: p => p.status, render: p => <>{p.status === "Menunggu" && can("payment.verify") && <button className="admin-button" disabled={booking.status !== "Aktif"} onClick={() => transact(s => verifyPayment(s, p.id), `Pembayaran ${p.id} terverifikasi`, "Pembayaran", "payment.verify")}>Verifikasi</button>}<FinancialDocuments bookingId={booking.id} paymentId={p.id} /></> },
    ]} />
  </Panel>;
}
