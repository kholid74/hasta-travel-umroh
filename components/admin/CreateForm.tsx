"use client";
import { useState } from "react";
import { useDemo } from "./Store";
import { Modal } from "./ui";
import { addBooking, recordPayment, uid } from "@/lib/admin/model";
import { DEMO_TODAY, newJamaah } from "@/content/admin/seed";
import type { Booking } from "@/content/admin/types";

export type CreateKind = "Jamaah" | "Booking" | "Lead" | "Paket" | "Pembayaran" | "Pengeluaran";
export function CreateForm({ kind, onClose, bookingId = "" }: { kind: CreateKind; onClose: () => void; bookingId?: string }) {
  const { state, transact } = useDemo();
  const [error, setError] = useState("");
  const title = kind === "Pembayaran" ? "Catat pembayaran" : kind === "Paket" ? "Buat paket" : `Tambah ${kind.toLowerCase()}`;
  return <Modal title={title} onClose={onClose}><form className="admin-form" onSubmit={e => {
    e.preventDefault(); const f = new FormData(e.currentTarget); const text = (key: string) => String(f.get(key) ?? "").trim();
    const ok = transact(s => {
      if (kind === "Jamaah" || kind === "Lead") {
        if (text("name").length < 3 || !/^[+\d\s-]{8,18}$/.test(text("phone"))) throw new Error("Isi nama minimal 3 karakter dan nomor telepon yang valid.");
        if (kind === "Jamaah") { const j = newJamaah(uid("JMH"), text("name"), text("phone"), text("gender") as "Laki-laki" | "Perempuan"); j.city = text("city"); s.jamaah.unshift(j); }
        else s.leads.unshift({ id: uid("LD"), name: text("name"), phone: text("phone"), packageId: text("package"), source: text("source"), sales: text("sales"), stage: "Lead Baru", lastContact: DEMO_TODAY, followUp: text("followUp"), notes: text("notes") ? [text("notes")] : [] });
      }
      if (kind === "Booking") addBooking(s, text("jamaah"), text("departure"), text("room") as Booking["roomType"]);
      if (kind === "Pembayaran") recordPayment(s, text("booking"), Number(text("amount")), text("method"));
      if (kind === "Pengeluaran") {
        const amount = Number(text("amount"));
        if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Nominal harus bilangan positif.");
        s.expenses.unshift({ id: uid("EXP"), departureId: text("departure"), category: text("category"), vendor: text("vendor"), amount, date: text("date"), status: "Menunggu" });
      }
      if (kind === "Paket") {
        const template = s.packages.find(p => p.id === text("template"))!;
        const price = Number(text("amount"));
        if (!Number.isSafeInteger(price) || price <= 0) throw new Error("Harga paket harus lebih dari nol.");
        const id = uid("PKT");
        s.packages.unshift({ ...structuredClone(template), id, slug: id.toLowerCase(), name: text("name"), duration: Number(text("duration")), price: { quad: price, triple: price + 2000000, double: price + 5000000 }, status: "Draft", featured: false });
      }
    }, `${title} berhasil disimpan`, kind);
    if (ok) onClose(); else setError("Belum tersimpan. Periksa rincian kesalahan pada notifikasi.");
  }}>
    {["Jamaah", "Lead", "Paket"].includes(kind) && <label>Nama {kind.toLowerCase()}<input name="name" required minLength={3} maxLength={100} placeholder={kind === "Paket" ? "Umrah Reguler 9 Hari" : "Nama lengkap"} /></label>}
    {["Jamaah", "Lead"].includes(kind) && <label>Nomor telepon / WhatsApp<input name="phone" type="tel" required pattern="[+0-9\s\-]{8,18}" placeholder="08xxxxxxxxxx" /></label>}
    {kind === "Jamaah" && <div className="form-grid"><label>Jenis kelamin<select name="gender"><option>Laki-laki</option><option>Perempuan</option></select></label><label>Kota<input name="city" defaultValue="Jakarta" required /></label></div>}
    {kind === "Lead" && <><label>Paket diminati<select name="package">{state.packages.filter(p => p.status === "Terbit").map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="form-grid"><label>Sumber<select name="source">{["Website", "WhatsApp", "Instagram", "Referral", "Agen", "Walk-in", "Meta Ads"].map(v => <option key={v}>{v}</option>)}</select></label><label>Sales<select name="sales">{["Rina Amelia", "Dimas Pratama", "Nadia Putri"].map(v => <option key={v}>{v}</option>)}</select></label></div><label>Follow-up berikutnya<input name="followUp" type="date" defaultValue="2026-10-03" required /></label><label>Catatan<textarea name="notes" rows={3} /></label></>}
    {kind === "Booking" && <><label>Jamaah<select name="jamaah" required defaultValue=""><option value="" disabled>Pilih jamaah tanpa booking aktif</option>{state.jamaah.filter(j => !state.bookings.some(b => b.jamaahId === j.id && b.status === "Aktif")).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}</select></label><label>Tipe kamar<select name="room"><option>Quad</option><option>Triple</option><option>Double</option></select></label></>}
    {["Booking", "Pengeluaran"].includes(kind) && <label>Keberangkatan<select name="departure" required>{state.departures.filter(d => kind === "Pengeluaran" || d.status === "Persiapan").map(d => <option key={d.id} value={d.id}>{d.id} · {state.packages.find(p => p.id === d.packageId)?.name}</option>)}</select></label>}
    {kind === "Pembayaran" && <><label>Invoice / Booking<select name="booking" defaultValue={bookingId || state.bookings[0]?.id}>{state.bookings.filter(b => b.status === "Aktif").map(b => <option key={b.id} value={b.id}>{b.id} · {state.jamaah.find(j => j.id === b.jamaahId)?.name}</option>)}</select></label><label>Metode<select name="method"><option>Transfer bank</option><option>Tunai di kantor</option></select></label><p className="admin-notice">Pencatatan simulasi. Dana tidak ditransfer. Pembayaran masuk antrean verifikasi.</p></>}
    {kind === "Paket" && <><label>Salin itinerary dan hotel dari<select name="template">{state.packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Durasi (hari)<input name="duration" type="number" min={1} max={60} defaultValue={9} required /></label></>}
    {["Pembayaran", "Pengeluaran", "Paket"].includes(kind) && <label>{kind === "Paket" ? "Harga quad (Rp)" : "Nominal (Rp)"}<input name="amount" type="number" min={1} max={100000000000} step={1} required placeholder="10000000" /></label>}
    {kind === "Pengeluaran" && <><label>Kategori<select name="category">{["Tiket pesawat", "Hotel", "Visa", "Transportasi", "Katering", "Pembimbing", "Handling", "Perlengkapan", "Marketing", "Lainnya"].map(v => <option key={v}>{v}</option>)}</select></label><label>Supplier / vendor<input name="vendor" required /></label><label>Tanggal<input name="date" type="date" defaultValue={DEMO_TODAY} required /></label></>}
    {error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="admin-button" onClick={onClose}>Batal</button><button className="admin-button primary">Simpan {kind.toLowerCase()}</button></div>
  </form></Modal>;
}
