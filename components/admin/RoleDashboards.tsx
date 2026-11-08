"use client";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleCheck, Clock3, Contact, FileWarning, PackageCheck, Plane, Receipt, Scale, Users, Wallet } from "lucide-react";
import { leadStages } from "@/content/admin/types";
import { DEMO_TODAY } from "@/content/admin/seed";
import { roles } from "@/content/admin/roles";
import { bookingFor, dateLabel, documentPercent, members, outstanding, packageForBooking, paid, paymentStatus, readiness, validPassport } from "@/lib/admin/model";
import { calculateCosting, costingMoney, costingPercent, costingTargets, latestCosting } from "@/lib/admin/costing";
import { kitReady } from "@/lib/admin/inventory";
import { rupiah, rupiahSingkat } from "@/lib/format";
import { useDemo } from "./Store";
import { Badge, PageHeader, Panel, Person, Progress, SimulationDate, Stat } from "./ui";

/**
 * Role-specific dashboards (M3.1). Every figure is derived from existing demo data and
 * selectors; nothing here is a hard-coded KPI. Superadmin keeps the original Dashboard.
 */
function useCommon() {
  const { state, actor, access } = useDemo();
  const active = state.bookings.filter(b => b.status === "Aktif");
  const month = DEMO_TODAY.slice(0, 7);
  const upcoming = state.departures.filter(d => d.status === "Persiapan" && d.date >= DEMO_TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const firstName = actor.name.replace(/^(Ust\.|H\.|Hj\.)\s+/, "").split(" ")[0];
  return { state, actor, access, active, month, upcoming, firstName, role: roles[access.role] };
}
const Header = ({ title, description }: { title: string; description: string }) => <PageHeader title={title} description={description} actions={<SimulationDate />} />;
const QueueLink = ({ href, icon: Icon, title, sub }: { href: string; icon: typeof Receipt; title: string; sub: string }) => <Link href={href}><span className="alert-icon"><Icon size={16} /></span><span style={{ flex: 1 }}><b>{title}</b><small>{sub}</small></span><ArrowRight size={14} /></Link>;

export function OwnerDashboard() {
  const { state, active, upcoming, firstName } = useCommon();
  const contract = active.reduce((n, b) => n + b.total, 0), collected = active.reduce((n, b) => n + paid(state, b.id), 0);
  const pending = state.payments.filter(p => p.status === "Menunggu");
  const costings = costingTargets(state).map(t => ({ t, c: latestCosting(state, t.id) })).filter(x => x.c).map(({ t, c }) => {
    try { const r = calculateCosting(c!); return { t, c: c!, profit: r.profit, margin: r.margin }; } catch { return { t, c: c!, profit: null, margin: null }; }
  });
  const drafts = costings.filter(x => x.c.status === "Draft").length;
  const agentsPending = state.agents.filter(a => a.status === "Menunggu").length;
  return <>
    <Header title={`Ringkasan eksekutif, ${firstName}`} description="Posisi penjualan, kas, dan kesiapan perjalanan dari data demo yang sama dengan seluruh tim." />
    <div className="admin-stats six">
      <Stat label="Nilai booking aktif" value={rupiahSingkat(contract)} detail={`${active.length} booking aktif`} icon={<Receipt />} />
      <Stat label="Dana terverifikasi" value={rupiahSingkat(collected)} detail="Pembayaran terverifikasi" icon={<CircleCheck />} />
      <Stat label="Piutang jamaah" value={rupiahSingkat(contract - collected)} detail={`${active.filter(b => outstanding(state, b) > 0).length} invoice belum lunas`} icon={<Wallet />} />
      <Stat label="Menunggu verifikasi" value={pending.length} detail={rupiahSingkat(pending.reduce((n, p) => n + p.amount, 0))} icon={<Clock3 />} />
      <Stat label="Keberangkatan persiapan" value={upcoming.length} detail="Rombongan Umrah terjadwal" icon={<Plane />} />
      <Stat label="HPP masih draft" value={drafts} detail={`dari ${costings.length} costing aktif`} icon={<Scale />} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Kesiapan keberangkatan" subtitle="Dihitung dari pembayaran, dokumen, visa, kamar, manasik, dan perlengkapan" action={<Link href="/admin/keberangkatan" className="text-button">Semua →</Link>}>
        <div className="table-scroll"><table><thead><tr><th>Keberangkatan</th><th>Jamaah</th><th>Kesiapan</th></tr></thead><tbody>{upcoming.slice(0, 6).map(d => <tr key={d.id}><td><Link className="text-button" href={`/admin/keberangkatan/${d.id}`}>{d.id}</Link><small>{dateLabel(d.date)}</small></td><td>{members(state, d.id).length} / {d.capacity}</td><td style={{ minWidth: 120 }}><Progress value={readiness(state, d.id).percent} label={`${readiness(state, d.id).percent}%`} /></td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Perlu keputusan" subtitle="Antrean yang menunggu peran lain atau persetujuan Anda">
        <div className="alert-list">
          <QueueLink href="/admin/pembayaran" icon={Clock3} title={`${pending.length} pembayaran menunggu verifikasi`} sub="Diverifikasi oleh Finance" />
          <QueueLink href="/admin/hpp" icon={Scale} title={`${drafts} costing HPP belum final`} sub="Finalisasi oleh Owner atau Superadmin" />
          <QueueLink href="/admin/komisi" icon={Users} title={`${agentsPending} agen dengan komisi menunggu`} sub="Model komisi saat ini (estimasi per jamaah)" />
        </div>
      </Panel>
    </div>
    <Panel title="Estimasi laba per costing terakhir" subtitle="Dari HPP & Kalkulasi Paket — estimasi skenario, bukan laporan akuntansi" action={<Link href="/admin/hpp" className="text-button">Buka HPP →</Link>}>
      <div className="table-scroll"><table><thead><tr><th>Paket / keberangkatan</th><th>Status</th><th>Estimasi laba</th><th>Margin</th></tr></thead><tbody>{costings.map(({ t, c, profit, margin }) => <tr key={c.id}><td><Link className="text-button" href={`/admin/hpp/${t.id}`}>{t.name}</Link><small>{t.id}</small></td><td><Badge>{c.status === "Final" ? `Final · rev ${c.revision}` : `Draft · rev ${c.revision}`}</Badge></td><td>{profit === null ? "Belum lengkap" : costingMoney(profit)}</td><td>{costingPercent(margin)}</td></tr>)}</tbody></table></div>
    </Panel>
  </>;
}

export function SalesDashboard() {
  const { state, active, month, firstName } = useCommon();
  const open = state.leads.filter(l => !["Booking", "Won", "Lost"].includes(l.stage));
  const due = open.filter(l => l.followUp && l.followUp <= DEMO_TODAY).sort((a, b) => a.followUp.localeCompare(b.followUp));
  const upcomingFollow = open.filter(l => l.followUp > DEMO_TODAY).sort((a, b) => a.followUp.localeCompare(b.followUp));
  const converted = state.leads.filter(l => l.bookingId).length;
  const recent = [...state.bookings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const unpaid = active.filter(b => ["Belum bayar", "DP"].includes(paymentStatus(state, b)));
  const docsMissing = active.filter(b => { const j = state.jamaah.find(j => j.id === b.jamaahId); return j && documentPercent(j) < 100; }).length;
  return <>
    <Header title={`Halo ${firstName}, siap menindaklanjuti?`} description="Lead, follow-up, dan pendaftaran yang sedang berjalan." />
    <div className="admin-stats">
      <Stat label="Lead baru" value={state.leads.filter(l => l.stage === "Lead Baru").length} detail={`${state.leads.length} lead di pipeline`} icon={<Contact />} />
      <Stat label="Follow-up jatuh tempo" value={due.length} detail="Tanggal follow-up hari ini atau lewat" icon={<Clock3 />} />
      <Stat label="Lead menjadi booking" value={`${Math.round(converted / Math.max(1, state.leads.length) * 100)}%`} detail={`${converted} dari ${state.leads.length} lead`} icon={<CircleCheck />} />
      <Stat label="Booking bulan ini" value={state.bookings.filter(b => b.date.startsWith(month)).length} detail={`Tanggal booking ${month}`} icon={<Receipt />} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Follow-up prioritas" subtitle={due.length ? "Jatuh tempo lebih dulu" : "Tidak ada yang jatuh tempo; berikut jadwal terdekat"} action={<Link href="/admin/crm" className="text-button">Buka CRM →</Link>}>
        <div className="table-scroll"><table><thead><tr><th>Lead</th><th>Tahap</th><th>Follow-up</th></tr></thead><tbody>{(due.length ? due : upcomingFollow).slice(0, 6).map(l => <tr key={l.id}><td><b>{l.name}</b><small>{l.source} · {l.sales}</small></td><td><Badge>{l.stage}</Badge></td><td>{dateLabel(l.followUp)}</td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Pipeline lead" subtitle="Jumlah lead per tahap">
        <div className="panel-body stack">{leadStages.map(s => { const n = state.leads.filter(l => l.stage === s).length; return <Progress key={s} label={`${s} · ${n}`} value={Math.round(n / Math.max(1, state.leads.length) * 100)} />; })}</div>
      </Panel>
    </div>
    <div className="dashboard-grid section-gap">
      <Panel title="Booking terbaru" action={<Link href="/admin/booking" className="text-button">Semua booking →</Link>}>
        <div className="table-scroll"><table><thead><tr><th>Booking</th><th>Paket</th><th>Pembayaran</th></tr></thead><tbody>{recent.map(b => { const j = state.jamaah.find(j => j.id === b.jamaahId); return <tr key={b.id}><td><Link className="text-button" href={`/admin/booking/${b.id}`}>{b.id}</Link><small>{j?.name}</small></td><td>{packageForBooking(state, b)?.name}</td><td><Badge>{paymentStatus(state, b)}</Badge></td></tr>; })}</tbody></table></div>
      </Panel>
      <Panel title="Perlu dibantu" subtitle="Jamaah dengan booking aktif">
        <div className="alert-list">
          <QueueLink href="/admin/booking" icon={Wallet} title={`${unpaid.length} booking belum bayar / baru DP`} sub="Ingatkan jadwal pembayaran" />
          <QueueLink href="/admin/dokumen" icon={FileWarning} title={`${docsMissing} jamaah dokumennya belum lengkap`} sub="Bantu unggah; verifikasi oleh Operasional" />
          <QueueLink href="/admin/haji-khusus" icon={Users} title={`${active.filter(b => b.productType === "HAJJ_SPECIAL").length} pendaftaran Haji Khusus aktif`} sub="Pendaftaran dan konsultasi Haji" />
        </div>
      </Panel>
    </div>
  </>;
}

export function FinanceDashboard() {
  const { state, active, month, firstName } = useCommon();
  const pending = state.payments.filter(p => p.status === "Menunggu").sort((a, b) => a.date.localeCompare(b.date));
  const received = state.payments.filter(p => p.status === "Terverifikasi" && p.date.startsWith(month));
  const receivable = active.reduce((n, b) => n + outstanding(state, b), 0);
  const overdue = active.filter(b => paymentStatus(state, b) === "Jatuh tempo");
  const unpaidExpenses = state.expenses.filter(e => e.status === "Menunggu");
  const largest = [...active].filter(b => outstanding(state, b) > 0).sort((a, b) => outstanding(state, b) - outstanding(state, a)).slice(0, 6);
  return <>
    <Header title={`Keuangan hari ini, ${firstName}`} description="Verifikasi pembayaran, piutang jamaah, dan dokumen keuangan." />
    <div className="admin-stats six">
      <Stat label="Menunggu verifikasi" value={pending.length} detail={rupiahSingkat(pending.reduce((n, p) => n + p.amount, 0))} icon={<Clock3 />} />
      <Stat label="Diterima bulan ini" value={rupiahSingkat(received.reduce((n, p) => n + p.amount, 0))} detail={`${received.length} transaksi terverifikasi`} icon={<CircleCheck />} />
      <Stat label="Piutang jamaah" value={rupiahSingkat(receivable)} detail={`${active.filter(b => outstanding(state, b) > 0).length} invoice`} icon={<Wallet />} />
      <Stat label="Lewat jatuh tempo" value={overdue.length} detail="Invoice dengan status jatuh tempo" icon={<FileWarning />} />
      <Stat label="Pengeluaran belum dibayar" value={rupiahSingkat(unpaidExpenses.reduce((n, e) => n + e.amount, 0))} detail={`${unpaidExpenses.length} tagihan vendor`} icon={<Receipt />} />
      <Stat label="Refund simulasi" value={rupiahSingkat(state.payments.filter(p => p.status === "Dikembalikan").reduce((n, p) => n + p.amount, 0))} detail="Pembayaran berstatus dikembalikan" icon={<Scale />} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Antrean verifikasi" subtitle="Tertua lebih dulu" action={<Link href="/admin/pembayaran" className="text-button">Buka pembayaran →</Link>}>
        <div className="table-scroll"><table><thead><tr><th>Invoice</th><th>Tanggal</th><th>Nominal</th></tr></thead><tbody>{pending.slice(0, 6).map(p => { const b = state.bookings.find(b => b.id === p.bookingId); const j = state.jamaah.find(j => j.id === b?.jamaahId); return <tr key={p.id}><td><Link className="text-button" href={`/admin/invoice/${p.bookingId}`}>INV/{p.bookingId}</Link><small>{j?.name} · {p.method}</small></td><td>{dateLabel(p.date)}</td><td>{rupiah(p.amount)}</td></tr>; })}</tbody></table>{!pending.length && <p className="admin-notice">Tidak ada pembayaran yang menunggu verifikasi.</p>}</div>
      </Panel>
      <Panel title="Piutang terbesar" subtitle="Sisa tagihan booking aktif" action={<Link href="/admin/invoice" className="text-button">Semua invoice →</Link>}>
        <div className="panel-body stack">{largest.map(b => { const j = state.jamaah.find(j => j.id === b.jamaahId)!; return <div className="flex-between" key={b.id}><Person name={j.name} sub={`${b.id} · ${paymentStatus(state, b)}`} href={`/admin/invoice/${b.id}`} /><b>{rupiah(outstanding(state, b))}</b></div>; })}</div>
      </Panel>
    </div>
    <Panel title="Dokumen keuangan" subtitle="PDF dibuat dari data yang sama: invoice & statement per booking aktif, kuitansi per pembayaran terverifikasi">
      <div className="payment-split"><div><strong>{active.length}</strong><small>Invoice & statement tersedia</small></div><div><strong>{state.payments.filter(p => p.status === "Terverifikasi" && active.some(b => b.id === p.bookingId)).length}</strong><small>Kuitansi tersedia</small></div><div><strong>{state.bookings.filter(b => b.status === "Batal").length}</strong><small>Booking batal (tanpa dokumen)</small></div></div>
    </Panel>
  </>;
}

export function OperationsDashboard() {
  const { state, active, upcoming, firstName } = useCommon();
  const toVerify = state.jamaah.filter(j => Object.values(j.documents).includes("Diunggah") && bookingFor(state, j.id));
  const passports = state.jamaah.filter(j => { const b = bookingFor(state, j.id); const d = state.departures.find(d => d.id === b?.departureId); return d && !validPassport(j, d.date); });
  const visaInProcess = state.jamaah.filter(j => ["Diajukan", "Diproses"].includes(j.visa) && bookingFor(state, j.id)?.productType === "UMRAH");
  const kitsOpen = active.filter(b => !kitReady(state, b.id));
  const next = upcoming[0];
  const nextReady = next ? readiness(state, next.id) : null;
  const events = state.manasik.filter(e => e.date >= DEMO_TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  return <>
    <Header title={`Operasional hari ini, ${firstName}`} description="Kesiapan rombongan, dokumen & visa, manifest, dan perlengkapan jamaah." />
    <div className="admin-stats six">
      <Stat label="Keberangkatan persiapan" value={upcoming.length} detail={next ? `Terdekat ${dateLabel(next.date)}` : "Belum ada jadwal"} icon={<Plane />} />
      <Stat label="Dokumen perlu verifikasi" value={toVerify.length} detail="Jamaah dengan unggahan baru" icon={<FileWarning />} />
      <Stat label="Paspor perlu ditinjau" value={passports.length} detail="Kosong / masa berlaku singkat" icon={<FileWarning />} />
      <Stat label="Visa dalam proses" value={visaInProcess.length} detail="Diajukan atau diproses" icon={<Clock3 />} />
      <Stat label="Kit belum lengkap" value={kitsOpen.length} detail="Booking aktif tanpa serah terima lengkap" icon={<PackageCheck />} />
      <Stat label="Kegiatan mendatang" value={events.length} detail="Manasik & briefing" icon={<CalendarDays />} />
    </div>
    <div className="dashboard-grid">
      <Panel title="Kesiapan per rombongan" action={<Link href="/admin/manifest" className="text-button">Manifest →</Link>}>
        <div className="table-scroll"><table><thead><tr><th>Keberangkatan</th><th>Jamaah</th><th>Kesiapan</th><th /></tr></thead><tbody>{upcoming.map(d => <tr key={d.id}><td><Link className="text-button" href={`/admin/keberangkatan/${d.id}`}>{d.id}</Link><small>{dateLabel(d.date)}</small></td><td>{members(state, d.id).length} / {d.capacity}</td><td style={{ minWidth: 120 }}><Progress value={readiness(state, d.id).percent} label={`${readiness(state, d.id).percent}%`} /></td><td><Link className="text-button" href={`/admin/manifest?departure=${d.id}`}>Manifest</Link></td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title={next ? `Rincian kesiapan ${next.id}` : "Rincian kesiapan"} subtitle="Rombongan terdekat">
        <div className="panel-body stack">{nextReady ? Object.entries(nextReady.checks).map(([k, v]) => <Progress key={k} label={k} value={v} />) : <p className="muted">Belum ada keberangkatan dalam persiapan.</p>}</div>
      </Panel>
    </div>
    <div className="dashboard-grid section-gap">
      <Panel title="Antrean kerja" subtitle="Langsung ke modul terkait">
        <div className="alert-list">
          <QueueLink href="/admin/dokumen" icon={FileWarning} title={`${toVerify.length} jamaah menunggu verifikasi dokumen`} sub="Periksa unggahan dan setujui atau tolak" />
          <QueueLink href="/admin/perlengkapan" icon={PackageCheck} title={`${kitsOpen.length} booking belum menerima kit lengkap`} sub="Alokasi dan serah terima perlengkapan" />
          <QueueLink href="/admin/rooming" icon={Users} title="Atur rooming list" sub={next ? `${members(state, next.id).length} jamaah pada ${next.id}` : "Pilih keberangkatan"} />
        </div>
      </Panel>
      <Panel title="Manasik & briefing mendatang" action={<Link href="/admin/manasik" className="text-button">Manasik →</Link>}>
        <ul className="activity-list">{events.map(e => <li key={e.id}><span className="activity-dot" /><div><p>{e.name} · {e.departureId}</p><small>{dateLabel(e.date)} · {e.time} · {e.location}</small></div></li>)}</ul>{!events.length && <p className="admin-notice">Belum ada kegiatan terjadwal.</p>}
      </Panel>
    </div>
  </>;
}
