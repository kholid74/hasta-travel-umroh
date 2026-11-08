"use client";
import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { createHajjSeed, hajjStatuses, hajjRegistrationStatuses, hajjPlanningStatuses, type HajjPackage } from "@/content/admin/hajj";
import { calculateCosting, costingMoney, costingPercent, latestCosting } from "@/lib/admin/costing";
import { hajjPrice, registerHajj, saveHajjPackage, updateHajjRegistration, validateHajjPackage } from "@/lib/admin/hajj";
import { bookingFor, dateLabel, outstanding, paid, uid } from "@/lib/admin/model";
import { rupiah } from "@/lib/format";
import { useDemo, useModuleAccess } from "./Store";
import { Badge, DataTable, Empty, Fields, Modal, PageHeader, Panel, Person, SelectFilter } from "./ui";

export default function Hajj({ id }: { id?: string }) {
  const { state, transact, resetVersion } = useDemo();
  const { writable, canOpen } = useModuleAccess();
  const [editing, setEditing] = useState<HajjPackage | null>(null);
  const [status, setStatus] = useState("");
  const [registering, setRegistering] = useState(false);
  const p = state.hajjPackages.find(p => p.id === id);
  const editor = editing && <HajjEditor key={`${editing.id}:${resetVersion}`} source={editing} onClose={() => setEditing(null)} onSave={value => {
    if (transact(s => saveHajjPackage(s, value), `Paket Haji ${value.name} disimpan; kontrak booking dan versi HPP lama tetap`, "Haji Khusus")) setEditing(null);
  }} />;
  if (id && !p) return <><Link href="/admin/haji-khusus" className="text-button">← Semua paket Haji</Link><Empty title="Paket Haji tidak ditemukan" text="Data mungkin telah direset. Buka daftar paket untuk melanjutkan." /></>;
  const notice = <p className="admin-notice section-gap">Seluruh data Haji Khusus adalah simulasi. Tahun rencana bukan kepastian keberangkatan. Dokumen, layanan dan tahapan pembayaran perlu validasi operasional; tidak terhubung ke sistem pemerintah.</p>;
  if (!p) return <>
    <PageHeader title="Haji Khusus" description="Kelola produk Haji, pendaftaran jamaah dan rencana biaya dalam satu alur." actions={writable ? <button className="admin-button primary" onClick={() => setEditing({ ...createHajjSeed()[0], id: uid("HAJ"), name: "", status: "Draft", capacity: 30 })}><Plus size={15} />Buat paket Haji</button> : undefined} />
    {notice}
    <div className="section-gap"><DataTable title="paket Haji" rows={state.hajjPackages.filter(p => !status || p.status === status)} filters={<SelectFilter label="Semua status paket" value={status} onChange={setStatus} options={hajjStatuses.map(v => ({ value: v, label: v }))} />} columns={[
      { label: "Paket", value: p => p.name, render: p => <Link href={`/admin/haji-khusus/${p.id}`} className="text-button">{p.name}<small>{p.id}</small></Link> },
      { label: "Tahun rencana", value: p => p.departureYear },
      { label: "Harga / jamaah", value: p => `${p.currency} ${p.sellingPrice}`, render: p => <>{p.currency} {Number(p.sellingPrice).toLocaleString("id-ID")}<small>{rupiah(hajjPrice(p))} · kurs asumsi</small></> },
      { label: "Pendaftaran / kapasitas", value: p => `${state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif").length} / ${p.capacity}` },
      { label: "Status paket", value: p => p.status, render: p => <Badge>{p.status}</Badge> },
      { label: "Kelola", value: p => p.id, render: p => <Link className="admin-button" href={`/admin/haji-khusus/${p.id}`}>Detail paket</Link> },
    ]} /></div>{editor}
  </>;
  const bookings = state.bookings.filter(b => b.hajjPackageId === p.id && b.status === "Aktif");
  const total = bookings.reduce((n, b) => n + b.total, 0), collected = bookings.reduce((n, b) => n + paid(state, b.id), 0);
  const costing = latestCosting(state, p.id);
  let estimate: ReturnType<typeof calculateCosting> | null = null;
  try { if (costing) estimate = calculateCosting(costing); } catch { /* Incomplete drafts remain editable in HPP. */ }
  const documentsReady = bookings.filter(b => p.requirements.every(r => state.jamaah.find(j => j.id === b.jamaahId)?.documents[r] === "Terverifikasi")).length;
  return <>
    <Link href="/admin/haji-khusus" className="text-button">← Semua paket Haji</Link>
    <PageHeader title={p.name} description={`${p.id} · Haji Khusus · Rencana ${p.departureYear}`} actions={<><Badge>{p.status}</Badge>{writable && <button className="admin-button" onClick={() => setEditing(structuredClone(p))}><Pencil size={14} />Edit paket Haji</button>}</>} />
    {notice}
    <div className="two-columns section-gap">
      <Panel title="Ringkasan paket"><Fields data={{ "Tahun rencana": p.departureYear, "Tanggal rencana": p.departureDate ? dateLabel(p.departureDate) : "Belum ditetapkan", Kapasitas: `${bookings.length} terdaftar / ${p.capacity}`, "Harga penawaran / jamaah": `${p.currency} ${Number(p.sellingPrice).toLocaleString("id-ID")}`, "Setara IDR / jamaah": rupiah(hajjPrice(p)), "Asumsi kurs": `1 ${p.currency} = Rp ${Number(p.exchangeRate).toLocaleString("id-ID")} · ${dateLabel(p.assumptionDate)}` }} /><div className="panel-body"><h3>Fasilitas paket</h3><ul className="hajj-list">{p.inclusions.map(i => <li key={i}>{i}</li>)}</ul></div></Panel>
      <Panel title="Ringkasan keuangan" subtitle="Bersumber dari booking dan pembayaran bersama"><Fields data={{ "Nilai booking aktif": rupiah(total), "Dana terverifikasi": rupiah(collected), "Sisa tagihan": rupiah(bookings.reduce((n, b) => n + outstanding(state, b), 0)), "HPP skenario / jamaah": estimate ? costingMoney(estimate.hpp) : "Belum dihitung", "Estimasi margin skenario": estimate ? costingPercent(estimate.margin) : "Belum dihitung", "Versi HPP": costing ? `Revisi ${costing.revision} · ${costing.status}` : "Belum dibuat" }} /><div className="panel-body">{canOpen("hpp") && <Link href={`/admin/hpp/${p.id}`} className="admin-button primary">Buka HPP Haji Khusus →</Link>}<p className="muted section-gap">Skenario HPP memakai peserta dan harga rencana sendiri. Angka tersebut bukan laba akuntansi final atau realisasi booking. Harga kontrak booking lama tetap saat penawaran paket berubah.</p></div></Panel>
    </div>
    <Panel title="Pendaftaran dan kesiapan operasional" className="section-gap"><Fields data={{ "Jamaah aktif": bookings.length, "Pendaftaran dikonfirmasi": bookings.filter(b => b.hajjRegistration === "Dikonfirmasi").length, "Dokumen sesuai konfigurasi": `${documentsReady} / ${bookings.length}`, "Perencanaan siap ditinjau / selesai": bookings.filter(b => ["Siap ditinjau", "Selesai"].includes(b.hajjPlanning ?? "")).length, "Dokumen yang ditinjau": p.requirements.join(", "), "Catatan rencana": p.planningNotes }} /><div className="panel-body"><p className="muted">Kesiapan ini mengikuti konfigurasi demo; tidak menyatakan kelayakan hukum, alokasi resmi atau izin keberangkatan.</p></div></Panel>
    <Panel title="Tahapan pembayaran rencana" subtitle="Konfigurasi komersial demo; bukan ketentuan setoran resmi" className="section-gap"><div className="panel-body stack">{p.milestones.map((m, i) => <p key={`${i}-${m.name}`}><b>{m.name} · {m.percent}%</b><br /><span className="muted">Contoh pada harga penawaran saat ini: {rupiah(Math.round(hajjPrice(p) * m.percent / 100))} / jamaah</span></p>)}</div></Panel>
    <div className="section-gap"><DataTable title="pendaftaran Haji" rows={bookings} actions={writable ? <button className="admin-button primary" disabled={p.status !== "Open" || bookings.length >= p.capacity} title={p.status !== "Open" ? "Paket harus berstatus Open untuk menerima pendaftaran." : bookings.length >= p.capacity ? "Kapasitas paket sudah penuh." : undefined} onClick={() => setRegistering(true)}><Plus size={14} />Daftarkan jamaah</button> : undefined} columns={[
      { label: "Jamaah", value: b => state.jamaah.find(j => j.id === b.jamaahId)?.name ?? "", render: b => <Person name={state.jamaah.find(j => j.id === b.jamaahId)!.name} sub={b.id} href={`/admin/jamaah/${b.jamaahId}`} /> },
      { label: "Pendaftaran", value: b => b.hajjRegistration ?? "", render: b => !writable ? <Badge>{b.hajjRegistration}</Badge> : <select aria-label={`Pendaftaran ${b.id}`} value={b.hajjRegistration} onChange={e => transact(s => updateHajjRegistration(s, b.id, e.target.value, b.hajjPlanning!), `Status pendaftaran ${b.id} diperbarui`, "Haji Khusus")}>{hajjRegistrationStatuses.map(v => <option key={v}>{v}</option>)}</select> },
      { label: "Perencanaan", value: b => b.hajjPlanning ?? "", render: b => !writable ? <Badge>{b.hajjPlanning}</Badge> : <select aria-label={`Perencanaan ${b.id}`} value={b.hajjPlanning} onChange={e => transact(s => updateHajjRegistration(s, b.id, b.hajjRegistration!, e.target.value), `Rencana ${b.id} diperbarui`, "Haji Khusus")}>{hajjPlanningStatuses.map(v => <option key={v}>{v}</option>)}</select> },
      { label: "Nilai kontrak", value: b => b.total, render: b => rupiah(b.total) }, { label: "Terbayar", value: b => paid(state, b.id), render: b => rupiah(paid(state, b.id)) },
      { label: "Booking", value: b => b.id, render: b => <Link className="text-button" href={`/admin/booking/${b.id}`}>Buka booking →</Link> },
    ]} /></div>
    <Panel title="Rincian biaya skenario HPP" className="section-gap"><div className="panel-body stack">{costing && estimate ? <>{costing.items.map(i => <div key={i.id} className="flex-between"><span>{i.name}<small className="muted costing-note">{i.currency} {i.unitPrice} · kurs {i.exchangeRate}</small></span><b>{costingMoney(estimate!.lines.find(l => l.id === i.id)!.total)}</b></div>)}<div className="flex-between"><b>Total skenario · {costing.payingCount} berbayar + {costing.focCount} FOC</b><b>{costingMoney(estimate.total)}</b></div><p className="muted">Asumsi {dateLabel(costing.assumptionDate)}. Komisi, kontingensi dan biaya operasional tercakup dalam total.</p></> : <p className="muted">Belum ada skenario biaya yang lengkap. Buka HPP untuk mulai menghitung.</p>}</div></Panel>
    {registering && <Modal title="Daftarkan jamaah Haji" onClose={() => setRegistering(false)}><form className="admin-form" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); if (transact(s => { registerHajj(s, p.id, String(f.get("jamaah"))); }, "Pendaftaran Haji dan booking demo dibuat", "Haji Khusus")) setRegistering(false); }}><label>Jamaah tanpa booking aktif<select name="jamaah" required defaultValue=""><option value="" disabled>Pilih jamaah</option>{state.jamaah.filter(j => !bookingFor(state, j.id)).map(j => <option key={j.id} value={j.id}>{j.name}</option>)}</select></label><p className="muted">Tambahkan identitas di modul Jamaah bila belum tersedia. Nilai kontrak {rupiah(hajjPrice(p))}, disimpan dengan kurs {p.exchangeRate} per {dateLabel(p.assumptionDate)}. Jatuh tempo belum ditetapkan.</p><button className="admin-button primary">Simpan pendaftaran</button></form></Modal>}
    {editor}
  </>;
}

function HajjEditor({ source, onSave, onClose }: { source: HajjPackage; onSave: (p: HajjPackage) => void; onClose: () => void }) {
  const [p, setP] = useState(source);
  const [error, setError] = useState("");
  const patch = (v: Partial<HajjPackage>) => { setP(p => ({ ...p, ...v })); setError(""); };
  return <Modal title={source.name ? "Edit paket Haji Khusus" : "Buat paket Haji Khusus"} onClose={onClose} wide><form className="admin-form" onSubmit={e => {
    e.preventDefault();
    try { const value = { ...p, name: p.name.trim(), inclusions: p.inclusions.map(v => v.trim()).filter(Boolean), requirements: p.requirements.map(v => v.trim()).filter(Boolean) }; validateHajjPackage(value); onSave(value); }
    catch (error) { setError(error instanceof Error ? error.message : "Periksa isian paket."); }
  }}>
    <p className="admin-notice">Paket simulasi. Seluruh persyaratan dan tahapan di bawah dapat disesuaikan setelah validasi operasional.</p>
    <div className="form-grid">
      <label>Nama paket Haji<input required minLength={3} maxLength={120} value={p.name} onChange={e => patch({ name: e.target.value })} /></label>
      <label>Status paket<select value={p.status} onChange={e => patch({ status: e.target.value as HajjPackage["status"] })}>{hajjStatuses.map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Tahun rencana keberangkatan<input required type="number" min={2026} max={2100} value={Number.isNaN(p.departureYear) ? "" : p.departureYear} onChange={e => patch({ departureYear: e.target.valueAsNumber })} /></label>
      <label>Tanggal rencana (opsional)<input type="date" value={p.departureDate} onChange={e => patch({ departureDate: e.target.value })} /></label>
      <label>Kapasitas jamaah<input required type="number" min={1} max={10000} value={Number.isNaN(p.capacity) ? "" : p.capacity} onChange={e => patch({ capacity: e.target.valueAsNumber })} /></label>
      <label>Mata uang paket<select value={p.currency} onChange={e => patch({ currency: e.target.value as HajjPackage["currency"], exchangeRate: e.target.value === "IDR" ? "1" : "" })}>{["IDR", "USD", "SAR"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Harga jual dalam mata uang paket<input required type="number" min="0.01" step="0.01" value={p.sellingPrice} onChange={e => patch({ sellingPrice: e.target.value })} /></label>
      <label>Kurs IDR per 1 mata uang paket<input required readOnly={p.currency === "IDR"} type="number" min="0.000001" step="0.000001" value={p.exchangeRate} onChange={e => patch({ exchangeRate: e.target.value })} /></label>
      <label>Tanggal asumsi kurs paket<input required type="date" value={p.assumptionDate} onChange={e => patch({ assumptionDate: e.target.value })} /></label>
    </div>
    <label>Fasilitas (satu per baris)<textarea required rows={3} value={p.inclusions.join("\n")} onChange={e => patch({ inclusions: e.target.value.split("\n") })} /></label>
    <label>Dokumen yang ditinjau (satu per baris)<textarea required rows={3} value={p.requirements.join("\n")} onChange={e => patch({ requirements: e.target.value.split("\n") })} /></label>
    <fieldset className="hajj-milestones"><legend>Tahapan pembayaran — total harus 100%</legend>{p.milestones.map((m, i) => <div className="hajj-milestone" key={i}>
      <label>Nama tahap {i + 1}<input required value={m.name} onChange={e => patch({ milestones: p.milestones.map((v, n) => n === i ? { ...v, name: e.target.value } : v) })} /></label>
      <label>Persentase tahap {i + 1}<input required type="number" min={1} max={100} value={Number.isNaN(m.percent) ? "" : m.percent} onChange={e => patch({ milestones: p.milestones.map((v, n) => n === i ? { ...v, percent: e.target.valueAsNumber } : v) })} /></label>
      <button type="button" className="text-button" disabled={p.milestones.length === 1} onClick={() => patch({ milestones: p.milestones.filter((_, n) => n !== i) })}>Hapus tahap {i + 1}</button>
    </div>)}<button type="button" className="admin-button" onClick={() => patch({ milestones: [...p.milestones, { name: "", percent: 1 }] })}>Tambah tahap</button></fieldset>
    <label>Catatan perencanaan<textarea rows={3} value={p.planningNotes} onChange={e => patch({ planningNotes: e.target.value })} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="modal-actions"><button type="button" className="admin-button" onClick={onClose}>Batal</button><button className="admin-button primary">Simpan paket Haji</button></div>
  </form></Modal>;
}
