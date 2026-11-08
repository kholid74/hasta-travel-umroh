"use client";
import Link from "next/link";
import { CalendarClock, Info, LogOut, Repeat2, UserRound } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { roles, type UserRole } from "@/content/admin/roles";
import { useDemo } from "@/components/admin/Store";
import { Badge, Fields, SimulationDate } from "@/components/admin/ui";
import { bookingFor, dateLabel, outstanding, packageForBooking, paymentStatus } from "@/lib/admin/model";
import { rupiah } from "@/lib/format";

/** Planned portal features and the roadmap milestone that delivers them. Shown honestly as "segera hadir". */
const upcoming: Record<UserRole, Record<string, { title: string; text: string; milestone: string }>> = {
  AGENT: {
    jamaah: { title: "Jamaah binaan", text: "Daftar jamaah dan booking yang tercatat atas nama Anda, dengan status pembayaran.", milestone: "M3.2" },
    komisi: { title: "Komisi & payout", text: "Riwayat komisi per booking, persetujuan, dan bukti payout simulasi.", milestone: "M3.3" },
    tim: { title: "Jaringan & level karier", text: "Struktur tim, level, dan progres kualifikasi per periode.", milestone: "M3.2" },
  },
  TOUR_LEADER: {
    rombongan: { title: "Rombongan", text: "Manifest ringkas, kamar, dan bus untuk keberangkatan yang ditugaskan kepada Anda.", milestone: "M4.2" },
    presensi: { title: "Presensi", text: "Presensi bandara, bus, dan kegiatan langsung dari ponsel.", milestone: "M4.2" },
    insiden: { title: "Laporan insiden", text: "Catat dan pantau kejadian di lapangan bersama tim operasional.", milestone: "M4.2" },
  },
  PILGRIM: {
    pembayaran: { title: "Pembayaran & invoice", text: "Riwayat cicilan, invoice, kuitansi, dan statement PDF.", milestone: "M5.1" },
    dokumen: { title: "Dokumen", text: "Checklist dokumen dan unggah berkas (simulasi) untuk diverifikasi tim.", milestone: "M5.1" },
    perjalanan: { title: "Perjalanan", text: "Linimasa manasik, penerbangan, itinerary, dan perlengkapan.", milestone: "M5.1" },
  },
  SUPERADMIN: {}, OWNER: {}, SALES_CS: {}, FINANCE: {}, OPERATIONS: {},
};

function ComingSoon({ title, text, milestone }: { title: string; text: string; milestone: string }) {
  return <section className="portal-card portal-soon" aria-labelledby="soon-title">
    <span className="portal-soon-icon"><CalendarClock size={22} aria-hidden="true" /></span>
    <span className="admin-badge neutral"><span className="badge-dot" />Segera hadir · {milestone}</span>
    <h1 id="soon-title">{title}</h1>
    <p>{text}</p>
    <p className="muted">Fitur ini dijadwalkan pada milestone {milestone}. Belum ada data yang ditampilkan agar demo tidak menampilkan angka buatan.</p>
  </section>;
}

function More() {
  const { access, actor } = useDemo();
  const role = roles[access.role];
  return <>
    <section className="portal-card"><h1>Akun demo</h1><Fields data={{ Peran: role.label, Persona: actor.name, ID: actor.id }} /></section>
    <section className="portal-card portal-actions">
      <Link className="admin-button primary" href="/admin/login?switch=1"><Repeat2 size={16} aria-hidden="true" />Ganti akses demo</Link>
      <form action={logout}><button className="admin-button"><LogOut size={16} aria-hidden="true" />Keluar</button></form>
    </section>
    <p className="admin-notice"><Info size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />Akses demo tanpa kata sandi, bukan keamanan produksi. Data fiktif tersimpan di browser ini.</p>
  </>;
}

function Home() {
  const { state, access, actor } = useDemo();
  if (access.role === "AGENT") {
    const agent = state.agents.find(a => a.id === access.personaId)!;
    const pilgrims = state.jamaah.filter(j => j.agentId === agent.id);
    const bookings = state.bookings.filter(b => b.status === "Aktif" && pilgrims.some(j => j.id === b.jamaahId));
    return <>
      <section className="portal-hero"><span className="eyebrow">PORTAL MITRA</span><h1>Assalamu&apos;alaikum, {agent.name.split(" ")[0]}</h1><p>{agent.id} · {agent.city} · {agent.level}</p><SimulationDate className="on-dark" /></section>
      <div className="portal-stats"><div><strong>{pilgrims.length}</strong><small>Jamaah terhubung</small></div><div><strong>{bookings.length}</strong><small>Booking aktif</small></div></div>
      <section className="portal-card"><h2>Yang sedang disiapkan</h2><ul className="portal-list">{Object.values(upcoming.AGENT).map(f => <li key={f.title}><b>{f.title}</b><span>{f.text}</span><Badge>{`Segera · ${f.milestone}`}</Badge></li>)}<li><b>Kode referral & tautan berbagi</b><span>Kode pribadi untuk mencatat jamaah yang Anda bantu.</span><Badge>Segera · M3.2</Badge></li></ul></section>
    </>;
  }
  if (access.role === "PILGRIM") {
    const j = state.jamaah.find(j => j.id === access.personaId)!;
    const b = bookingFor(state, j.id);
    const d = state.departures.find(d => d.id === b?.departureId);
    return <>
      <section className="portal-hero"><span className="eyebrow">PORTAL JAMAAH</span><h1>Assalamu&apos;alaikum, {j.name.split(" ")[0]}</h1><p>{j.id}</p><SimulationDate className="on-dark" /></section>
      {b ? <section className="portal-card"><h2>Pendaftaran Anda</h2><Fields data={{ Booking: b.id, Paket: packageForBooking(state, b)?.name, Keberangkatan: b.productType === "HAJJ_SPECIAL" ? "Rencana Haji Khusus — tanggal mengikuti kuota" : d ? dateLabel(d.date) : "Belum dijadwalkan", "Status pembayaran": <Badge>{paymentStatus(state, b)}</Badge>, "Sisa tagihan": rupiah(outstanding(state, b)) }} /></section>
        : <section className="portal-card"><h2>Belum ada pendaftaran aktif</h2><p className="muted">Hubungi tim Hasta Travel untuk mendaftar.</p></section>}
      <section className="portal-card"><h2>Yang sedang disiapkan</h2><ul className="portal-list">{Object.values(upcoming.PILGRIM).map(f => <li key={f.title}><b>{f.title}</b><span>{f.text}</span><Badge>{`Segera · ${f.milestone}`}</Badge></li>)}</ul></section>
    </>;
  }
  return <>
    <section className="portal-hero"><span className="eyebrow">PORTAL TOUR LEADER</span><h1>Assalamu&apos;alaikum, {actor.name.replace(/^Ust\.\s+/, "").split(" ")[0]}</h1><p>{actor.id}</p><SimulationDate className="on-dark" /></section>
    <section className="portal-card"><h2>Belum ada penugasan keberangkatan</h2><p className="muted">Penugasan tour leader ke rombongan dibuat oleh tim Operasional mulai milestone M4.2. Saat ini nama tour leader di modul Keberangkatan masih berupa teks dan belum terhubung ke akun ini.</p></section>
    <section className="portal-card"><h2>Yang sedang disiapkan</h2><ul className="portal-list">{Object.values(upcoming.TOUR_LEADER).map(f => <li key={f.title}><b>{f.title}</b><span>{f.text}</span><Badge>{`Segera · ${f.milestone}`}</Badge></li>)}</ul></section>
  </>;
}

export function PortalScreen({ section }: { section: string }) {
  const { access, actor } = useDemo();
  if (section === "lainnya") return <More />;
  if (!actor.found) return <section className="portal-card portal-soon"><span className="portal-soon-icon"><UserRound size={22} aria-hidden="true" /></span><h1>Persona demo tidak ditemukan</h1><p>Data {actor.id} tidak ada di browser ini, misalnya karena data demo direset atau diubah. Pilih ulang persona di halaman akses demo.</p><Link className="admin-button primary" href="/admin/login?switch=1">Pilih ulang persona</Link></section>;
  if (section) { const f = upcoming[access.role][section]; return f ? <ComingSoon {...f} /> : null; }
  return <Home />;
}
