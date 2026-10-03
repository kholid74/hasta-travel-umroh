"use client";
import Link from "next/link";
import { useState } from "react";
import { Users, UserCheck, Plane, Wallet, Receipt, Contact, ArrowUpRight, ArrowRight, ChevronRight, CalendarDays, FileWarning, Clock3, PackageCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useDemo } from "./Store";
import { Badge, PageHeader, Panel, Progress, Stat } from "./ui";
import { bookingFor, dateLabel, documentPercent, members, outstanding, paid, paymentStatus, readiness, validPassport } from "@/lib/admin/model";
import { rupiah, rupiahSingkat } from "@/lib/format";
import { DEMO_TODAY } from "@/content/admin/seed";

export default function Dashboard() {
  const { state } = useDemo();
  const [period, setPeriod] = useState("2026-10");
  const active = state.bookings.filter(b => b.status === "Aktif");
  const collected = state.payments.filter(p => p.status === "Terverifikasi" && p.date.startsWith(period)).reduce((n, p) => n + p.amount, 0);
  const debt = active.reduce((n, b) => n + outstanding(state, b), 0);
  const upcoming = state.departures.filter(d => d.status === "Persiapan" && d.date >= DEMO_TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const periodDepartures = upcoming.filter(d => d.date.startsWith(period));
  const documentNeeds = state.jamaah.filter(j => documentPercent(j) < 100);
  const expiring = state.jamaah.filter(j => { const b = bookingFor(state, j.id); const d = state.departures.find(d => d.id === b?.departureId); return d && !validPassport(j, d.date); });
  const payments = ["Lunas", "DP", "Cicilan", "Belum bayar"].map(status => ({ status, count: active.filter(b => paymentStatus(state, b) === status).length }));
  const chart = Array.from({ length: 4 }, (_, i) => {
    const from = i * 8 + 1, to = Math.min(from + 7, 31);
    const ps = state.payments.filter(p => p.date.startsWith(period) && Number(p.date.slice(8)) >= from && Number(p.date.slice(8)) <= to);
    return { name: `${from}–${to}`, Terverifikasi: ps.filter(p => p.status === "Terverifikasi").reduce((n, p) => n + p.amount, 0) / 1e6, Menunggu: ps.filter(p => p.status === "Menunggu").reduce((n, p) => n + p.amount, 0) / 1e6 };
  });
  const stages = [
    ["Lead baru", state.leads.filter(l => l.stage === "Lead Baru").length, "crm"],
    ["Booking", active.length, "booking"],
    ["Dokumen lengkap", state.jamaah.filter(j => documentPercent(j) === 100).length, "dokumen"],
    ["Lunas", payments[0].count, "pembayaran"],
    ["Visa disetujui", state.jamaah.filter(j => j.visa === "Disetujui").length, "dokumen"],
    ["Manasik", new Set(state.manasik.flatMap(e => e.attendees)).size, "manasik"],
  ];
  const progress = ["Paspor", "Vaksin", "Foto"].map(n => ({ label: n, value: Math.round(state.jamaah.filter(j => j.documents[n] === "Terverifikasi").length / Math.max(1, state.jamaah.length) * 100) }));
  const pendingPayments = state.payments.filter(p => p.status === "Menunggu").length;
  return <>
    <PageHeader title="Selamat pagi, Ahmad" description="Berikut ringkasan operasional Hasta Travel hari ini." actions={<><span className="muted" style={{ fontSize: 10 }}><CalendarDays size={12} style={{ display: "inline", marginRight: 5 }} />{dateLabel(DEMO_TODAY)}</span><select aria-label="Periode dashboard" value={period} onChange={e => setPeriod(e.target.value)}><option value="2026-10">Oktober 2026</option><option value="2026-09">September 2026</option><option value="2026-11">November 2026</option></select></>} />
    <div className="admin-stats six">
      <Stat label="Total jamaah" value={state.jamaah.length} detail="Seluruh jamaah terdaftar" icon={<Users />} />
      <Stat label="Jamaah aktif" value={new Set(active.map(b => b.jamaahId)).size} detail="Dalam persiapan perjalanan" icon={<UserCheck />} />
      <Stat label="Keberangkatan" value={periodDepartures.length} detail="Terjadwal pada bulan dipilih" icon={<Plane />} />
      <Stat label="Penerimaan bulan ini" value={rupiahSingkat(collected)} detail="Pembayaran terverifikasi" icon={<Wallet />} />
      <Stat label="Belum lunas" value={rupiahSingkat(debt)} detail={`${active.filter(b => outstanding(state, b) > 0).length} invoice perlu ditindaklanjuti`} icon={<Receipt />} />
      <Stat label="Lead baru" value={state.leads.filter(l => l.stage === "Lead Baru").length} detail={`${state.leads.length} lead dalam pipeline`} icon={<Contact />} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Arus penerimaan" subtitle="Pembayaran masuk per minggu · dalam juta rupiah" action={<Link href="/admin/laporan" className="text-button">Lihat laporan <ArrowUpRight size={12} style={{ display: "inline" }} /></Link>}>
        <div className="chart-summary"><div><strong>{rupiah(collected)}</strong><small>Total terverifikasi pada periode dipilih</small></div><Badge>Cashflow</Badge></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart} barGap={5} margin={{ top: 15, right: 15, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9eddf" /><XAxis dataKey="name" tick={{ fontSize: 10, fill: "#879177" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 10, fill: "#879177" }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => `${Number(value).toLocaleString("id-ID")} jt`} contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #e5e8df" }} /><Bar isAnimationActive={false} dataKey="Terverifikasi" fill="#526f45" radius={[3, 3, 0, 0]} maxBarSize={35} /><Bar isAnimationActive={false} dataKey="Menunggu" fill="#e8bb65" radius={[3, 3, 0, 0]} maxBarSize={35} /></BarChart></ResponsiveContainer></div>
        <div className="chart-legend"><span><i style={{ background: "#526f45" }} />Terverifikasi</span><span><i style={{ background: "#e8bb65" }} />Menunggu verifikasi</span></div>
      </Panel>
      <Panel title="Perlu perhatian" subtitle="Prioritas tim untuk hari ini" action={<span className="admin-badge amber">4 agenda</span>}><div className="alert-list">
        {[{ icon: FileWarning, title: `${expiring.length} paspor perlu ditinjau`, sub: "Belum tersedia atau masa berlaku singkat", href: "dokumen" }, { icon: Receipt, title: `${pendingPayments} pembayaran menunggu`, sub: "Periksa bukti dan verifikasi pembayaran", href: "pembayaran" }, { icon: Clock3, title: `${documentNeeds.length} dokumen jamaah belum lengkap`, sub: "Minta kelengkapan sebelum proses visa", href: "dokumen" }, { icon: PackageCheck, title: "Persiapkan keberangkatan terdekat", sub: `${upcoming[0]?.id} · ${dateLabel(upcoming[0]?.date ?? "")}`, href: `keberangkatan/${upcoming[0]?.id}` }].map(a => <Link key={a.title} href={`/admin/${a.href}`}><span className="alert-icon"><a.icon size={16} /></span><span style={{ flex: 1 }}><b>{a.title}</b><small>{a.sub}</small></span><ChevronRight size={14} /></Link>)}
      </div><div className="panel-body"><Link className="admin-button" href="/admin/notifikasi" style={{ width: "100%" }}>Buka pusat notifikasi<ArrowRight size={14} /></Link></div></Panel>
    </div>
    <Panel title="Perjalanan operasional" subtitle="Lihat posisi jamaah di setiap tahap persiapan — hitungan antar tahap dapat tumpang tindih." action={<Link href="/admin/manifest" className="text-button">Buka manifest →</Link>}><div className="journey">{stages.map(([label, value, href], i) => <div key={label} style={{ display: "contents" }}><Link href={`/admin/${href}`}><strong>{value}</strong><small>{label}</small></Link>{i < stages.length - 1 && <ChevronRight size={16} />}</div>)}</div></Panel>
    <div className="dashboard-grid section-gap">
      <Panel title="Keberangkatan mendatang" subtitle="Pantau kesiapan setiap rombongan" action={<Link href="/admin/keberangkatan" className="text-button">Lihat semua →</Link>}><div className="table-scroll"><table><thead><tr><th>Tanggal / paket</th><th>Penerbangan</th><th>Jamaah</th><th>Kesiapan</th><th /></tr></thead><tbody>{upcoming.slice(0, 5).map(d => <tr key={d.id}><td><b>{dateLabel(d.date)}</b><small>{state.packages.find(p => p.id === d.packageId)?.name}</small></td><td>{d.flight}<small>{d.origin} → JED</small></td><td>{members(state, d.id).length} <span className="muted">/ {d.capacity}</span></td><td><div style={{ minWidth: 70 }}><small style={{ marginBottom: 5 }}>{readiness(state, d.id).percent}%</small><Progress value={readiness(state, d.id).percent} /></div></td><td><Link href={`/admin/manifest?departure=${d.id}`} className="text-button">Manifest →</Link></td></tr>)}</tbody></table></div></Panel>
      <Panel title="Kesiapan dokumen" subtitle="Kelengkapan seluruh jamaah terdaftar"><div className="readiness-list">{[...progress.slice(0, 1), { label: "Visa disetujui", value: Math.round(state.jamaah.filter(j => j.visa === "Disetujui").length / Math.max(1, state.jamaah.length) * 100) }, ...progress.slice(1)].map(p => <Progress key={p.label} label={p.label} value={p.value} />)}<Link href="/admin/dokumen" className="text-button">Tinjau dokumen jamaah →</Link></div></Panel>
    </div>
    <div className="two-columns"><Panel title="Ringkasan pembayaran" subtitle="Status invoice seluruh booking aktif"><div className="payment-split">{payments.map(p => <div key={p.status}><strong>{p.count}</strong><small>{p.status}</small></div>)}</div><div className="panel-body"><Progress value={Math.round(active.reduce((n, b) => n + paid(state, b.id), 0) / Math.max(1, active.reduce((n, b) => n + b.total, 0)) * 100)} label="Dana terkumpul dari nilai booking" /></div></Panel><Panel title="Aktivitas terbaru" action={<Link href="/admin/aktivitas" className="text-button">Semua aktivitas →</Link>}><ul className="activity-list">{state.activities.slice(0, 3).map(a => <li key={a.id}><span className="activity-dot" /><div><p>{a.action}</p><small>{a.user} · {dateLabel(a.date)}</small></div></li>)}</ul></Panel></div>
  </>;
}
