"use client";
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, Check, Copy, Info, LogOut, Plus, Repeat2, UserRound } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { roles, type UserRole } from "@/content/admin/roles";
import { useDemo } from "@/components/admin/Store";
import { Badge, Fields, Modal, Progress, SimulationDate } from "@/components/admin/ui";
import { bookingFor, dateLabel, outstanding, packageForBooking, paymentStatus, uid } from "@/lib/admin/model";
import { rupiah, rupiahSingkat } from "@/lib/format";
import {
  allDescendantsOf,
  computeCareerProgress,
  DEFAULT_CAREER_LEVELS,
  downlinesOf,
  levelLabelFromId,
  maskPhone,
} from "@/content/admin/career";
import { DEMO_TODAY } from "@/content/admin/seed";

/** Planned portal features and the roadmap milestone that delivers them. Shown honestly as "segera hadir". */
const upcoming: Record<UserRole, Record<string, { title: string; text: string; milestone: string }>> = {
  AGENT: {
    komisi: { title: "Komisi & payout", text: "Riwayat komisi per booking, persetujuan, dan bukti payout simulasi.", milestone: "M3.3" },
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
  return (
    <section className="portal-card portal-soon" aria-labelledby="soon-title">
      <span className="portal-soon-icon"><CalendarClock size={22} aria-hidden="true" /></span>
      <span className="admin-badge neutral"><span className="badge-dot" />Segera hadir · {milestone}</span>
      <h1 id="soon-title">{title}</h1>
      <p>{text}</p>
      <p className="muted">Fitur ini dijadwalkan pada milestone {milestone}. Belum ada data yang ditampilkan agar demo tidak menampilkan angka buatan.</p>
    </section>
  );
}

function More() {
  const { access, actor } = useDemo();
  const role = roles[access.role];
  return (
    <>
      <section className="portal-card">
        <h1>Akun demo</h1>
        <Fields data={{ Peran: role.label, Persona: actor.name, ID: actor.id }} />
      </section>
      {access.role === "AGENT" && (
        <section className="portal-card">
          <h2>Modul dalam pengembangan</h2>
          <p className="muted" style={{ fontSize: 13 }}>
            Pencatatan komisi, payout, dan riwayat rekening mitra sedang disiapkan untuk rilis pada milestone berikutnya.
          </p>
          <Link className="text-button" href="/portal/agen/komisi">Lihat status komisi (M3.3) →</Link>
        </section>
      )}
      <section className="portal-card portal-actions">
        <Link className="admin-button primary" href="/admin/login?switch=1"><Repeat2 size={16} aria-hidden="true" />Ganti akses demo</Link>
        <form action={logout}><button className="admin-button"><LogOut size={16} aria-hidden="true" />Keluar</button></form>
      </section>
      <p className="admin-notice">
        <Info size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />
        Akses demo tanpa kata sandi, bukan keamanan produksi. Data fiktif tersimpan di browser ini.
      </p>
    </>
  );
}

// --- AGENT SCREENS ---

function AgentHome() {
  const { state, access } = useDemo();
  const [copied, setCopied] = useState<string | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const agent = state.agents.find(a => a.id === access.personaId)!;
  const pilgrims = state.jamaah.filter(j => j.agentId === agent.id);
  const bookings = state.bookings.filter(b => b.status === "Aktif" && pilgrims.some(j => j.id === b.jamaahId));
  const progress = computeCareerProgress(state, agent.id, "2026-Q4");

  const referralLink = `https://hasta-travel-umroh.vercel.app/paket-umroh?ref=${agent.code}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <section className="portal-hero">
        <span className="eyebrow">PORTAL MITRA</span>
        <h1>Assalamu&apos;alaikum, {agent.name.split(" ")[0]}</h1>
        <p>{agent.id} · {agent.code} · {agent.level} · {agent.city}</p>
        <SimulationDate className="on-dark" />
      </section>

      {/* Referral & Share Card */}
      <section className="portal-card">
        <h2>Kode Referral & Tautan Berbagi</h2>
        <p className="muted" style={{ fontSize: 13 }}>
          Bagikan tautan ini ke calon jamaah. Pendaftaran dan konsultasi otomatis terhubung ke akun Anda.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f6f4", padding: "10px 14px", borderRadius: 8 }}>
            <div>
              <small style={{ color: "var(--a-muted)", display: "block", fontSize: 11 }}>Kode Referral Pribadi</small>
              <strong style={{ fontSize: 16, color: "#16291e" }}>{agent.code}</strong>
            </div>
            <button
              className="text-button"
              onClick={() => copyToClipboard(agent.code, "code")}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              {copied === "code" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "code" ? "Tersalin" : "Salin kode"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f5f6f4", padding: "10px 14px", borderRadius: 8 }}>
            <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
              <small style={{ color: "var(--a-muted)", display: "block", fontSize: 11 }}>Tautan Katalog Publik</small>
              <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }}>
                {referralLink}
              </span>
            </div>
            <button
              className="text-button"
              onClick={() => copyToClipboard(referralLink, "link")}
              style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
            >
              {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
              {copied === "link" ? "Tersalin" : "Salin link"}
            </button>
          </div>
        </div>
        <button
          className="admin-button"
          onClick={() => setShowLeadModal(true)}
          style={{ width: "100%", marginTop: 4 }}
        >
          <Plus size={14} /> Ajukan calon jamaah baru
        </button>
      </section>

      {/* Stats */}
      <div className="portal-stats">
        <div>
          <strong>{pilgrims.length}</strong>
          <small>Jamaah terhubung</small>
        </div>
        <div>
          <strong>{bookings.length}</strong>
          <small>Booking aktif</small>
        </div>
      </div>

      {/* Career Progress Card */}
      <section className="portal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Progres Karier Kuartal Ini (2026-Q4)</h2>
          <Badge>{agent.level}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#f9faf8", padding: 12, borderRadius: 8 }}>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Jamaah Pribadi</small>
            <strong style={{ fontSize: 18, display: "block", color: "#16291e" }}>{progress.metrics.personalPilgrims}</strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>{rupiahSingkat(progress.metrics.personalValue)}</small>
          </div>
          <div style={{ background: "#f9faf8", padding: 12, borderRadius: 8 }}>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Jamaah Tim</small>
            <strong style={{ fontSize: 18, display: "block", color: "#16291e" }}>{progress.metrics.teamPilgrims}</strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>{rupiahSingkat(progress.metrics.teamValue)}</small>
          </div>
        </div>

        {progress.nextLevel && (
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Syarat Level: {progress.nextLevel.levelName}</div>
            {progress.nextLevel.gaps.map(g => (
              <div key={g.metric} style={{ display: "grid", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span>{g.label}</span>
                  <b>{g.current} / {g.required} {g.met ? "✓" : ""}</b>
                </div>
                <Progress value={Math.min(100, Math.round((g.current / g.required) * 100))} />
              </div>
            ))}
          </div>
        )}

        <Link className="text-button" href="/portal/agen/karier" style={{ marginTop: 6 }}>
          Buka rincian jenjang karier →
        </Link>
      </section>

      {showLeadModal && <SubmitLeadModal agent={agent} onClose={() => setShowLeadModal(false)} />}
    </>
  );
}

function AgentJamaah() {
  const { state, access } = useDemo();
  const agent = state.agents.find(a => a.id === access.personaId)!;
  const pilgrims = state.jamaah.filter(j => j.agentId === agent.id);

  return (
    <>
      <section className="portal-hero">
        <span className="eyebrow">PORTAL MITRA</span>
        <h1>Jamaah Binaan</h1>
        <p>{pilgrims.length} jamaah terhubung dengan akun Anda</p>
      </section>

      <p className="admin-notice" style={{ fontSize: 12 }}>
        <Info size={13} aria-hidden="true" style={{ display: "inline", marginRight: 6 }} />
        Nomor telepon disamarkan (PII masking) untuk perlindungan data pribadi. Hubungi tim biro bila perlu kontak langsung.
      </p>

      {pilgrims.length === 0 ? (
        <section className="portal-card">
          <p className="muted">Belum ada jamaah yang terhubung ke kode referral Anda.</p>
          <Link className="admin-button primary" href="/portal/agen">Bagikan kode referral</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {pilgrims.map(j => {
            const b = bookingFor(state, j.id);
            const d = state.departures.find(d => d.id === b?.departureId);
            const pkg = b ? packageForBooking(state, b) : undefined;
            return (
              <section key={j.id} className="portal-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ fontSize: 16 }}>{j.name}</h2>
                    <p style={{ fontSize: 12, color: "var(--a-muted)" }}>
                      {maskPhone(j.phone)} · {j.city}
                    </p>
                  </div>
                  {b && <Badge>{paymentStatus(state, b)}</Badge>}
                </div>

                {b ? (
                  <div style={{ fontSize: 13, display: "grid", gap: 4, background: "#f8f9f7", padding: 12, borderRadius: 8 }}>
                    <div><b>Paket:</b> {pkg?.name ?? "Umrah"}</div>
                    <div><b>Keberangkatan:</b> {d ? dateLabel(d.date) : "Haji Khusus (Menunggu Kuota)"}</div>
                    <div><b>Tagihan:</b> {rupiah(b.total)}</div>
                    <div><b>Sisa Tagihan:</b> {rupiah(outstanding(state, b))}</div>
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: 12 }}>Belum memiliki booking aktif.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function AgentTim() {
  const { state, access } = useDemo();
  const agent = state.agents.find(a => a.id === access.personaId)!;
  const upline = agent.parentId ? state.agents.find(a => a.id === agent.parentId) : undefined;
  const directDownlines = downlinesOf(state, agent.id);
  const totalNetwork = allDescendantsOf(state, agent.id);

  return (
    <>
      <section className="portal-hero">
        <span className="eyebrow">PORTAL MITRA</span>
        <h1>Jaringan Tim</h1>
        <p>Struktur pembinaan mitra dan performa jaringan</p>
      </section>

      {/* Upline Card */}
      <section className="portal-card">
        <h2>Pembina Anda (Upline)</h2>
        {upline ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <strong style={{ fontSize: 15 }}>{upline.name}</strong>
              <p style={{ fontSize: 12, color: "var(--a-muted)" }}>{upline.code} · {upline.city}</p>
            </div>
            <Badge>{upline.level}</Badge>
          </div>
        ) : (
          <p className="muted" style={{ fontSize: 13 }}>Akun Anda adalah Root (langsung di bawah manajemen Hasta Travel).</p>
        )}
      </section>

      {/* Network Stats */}
      <div className="portal-stats">
        <div>
          <strong>{directDownlines.length}</strong>
          <small>Mitra langsung</small>
        </div>
        <div>
          <strong>{totalNetwork.length}</strong>
          <small>Total jaringan</small>
        </div>
      </div>

      {/* Direct Team List */}
      <section className="portal-card">
        <h2>Mitra Langsung di Bawah Anda</h2>
        {directDownlines.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Belum ada mitra langsung yang terdaftar di bawah Anda. Ajak mitra baru untuk bergabung dan berkembang bersama.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {directDownlines.map(d => {
              const pilgrims = state.jamaah.filter(j => j.agentId === d.id);
              return (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9f7", padding: "10px 14px", borderRadius: 8 }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{d.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--a-muted)" }}>
                      {d.code} · {d.city} · {pilgrims.length} jamaah
                    </div>
                  </div>
                  <Badge>{d.level}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function AgentKarier() {
  const { state, access } = useDemo();
  const agent = state.agents.find(a => a.id === access.personaId)!;
  const progress = computeCareerProgress(state, agent.id, "2026-Q4");
  const snapshots = (state.careerSnapshots ?? []).filter(s => s.agentId === agent.id);

  return (
    <>
      <section className="portal-hero">
        <span className="eyebrow">PORTAL MITRA</span>
        <h1>Jenjang Karier</h1>
        <p>Tingkatan level dan evaluasi capaian kuartalan</p>
      </section>

      <section className="portal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Level Karier Anda</small>
            <h2 style={{ fontSize: 20 }}>{agent.level}</h2>
          </div>
          <Badge>{`Kualifikasi: ${levelLabelFromId(progress.qualifiesForLevelId)}`}</Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <div style={{ background: "#f9faf8", padding: 12, borderRadius: 8 }}>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Jamaah Pribadi</small>
            <strong style={{ fontSize: 18, display: "block" }}>{progress.metrics.personalPilgrims}</strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>{rupiahSingkat(progress.metrics.personalValue)}</small>
          </div>
          <div style={{ background: "#f9faf8", padding: 12, borderRadius: 8 }}>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>Jamaah Tim</small>
            <strong style={{ fontSize: 18, display: "block" }}>{progress.metrics.teamPilgrims}</strong>
            <small style={{ color: "var(--a-muted)", fontSize: 11 }}>{rupiahSingkat(progress.metrics.teamValue)}</small>
          </div>
        </div>

        {progress.nextLevel && (
          <div style={{ marginTop: 14, display: "grid", gap: 10, borderTop: "1px solid var(--a-line)", paddingTop: 14 }}>
            <h3 style={{ fontSize: 14 }}>Target Level Berikutnya: {progress.nextLevel.levelName}</h3>
            {progress.nextLevel.gaps.map(g => (
              <div key={g.metric} style={{ display: "grid", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span>{g.label}</span>
                  <b>{g.current} / {g.required} {g.met ? "✓ Memenuhi" : ""}</b>
                </div>
                <Progress value={Math.min(100, Math.round((g.current / g.required) * 100))} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Levels Overview */}
      <section className="portal-card">
        <h2>Tingkatan Level Hasta Travel</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {DEFAULT_CAREER_LEVELS.map(lvl => (
            <div key={lvl.id} style={{ padding: 12, background: lvl.id === agent.levelId ? "#f3f8f1" : "#fafbfc", border: "1px solid var(--a-line)", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b>{lvl.name}</b>
                {lvl.id === agent.levelId && <Badge>Posisi Anda</Badge>}
              </div>
              <p style={{ fontSize: 12, color: "var(--a-muted)", margin: "4px 0 8px" }}>{lvl.description}</p>
              <div style={{ fontSize: 11 }}>
                <b>Syarat:</b> {lvl.requirements.length === 0 ? "Level awal" : lvl.requirements.map(r => `${r.min} ${r.metric === "PERSONAL_PILGRIMS" ? "jamaah pribadi" : r.metric === "TEAM_PILGRIMS" ? "jamaah tim" : "mitra aktif"}`).join(" · ")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* History Snapshots */}
      {snapshots.length > 0 && (
        <section className="portal-card">
          <h2>Riwayat Evaluasi Terkunci</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {snapshots.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8f9f7", padding: "10px 12px", borderRadius: 8, fontSize: 12 }}>
                <div>
                  <strong>{s.periodId}</strong>
                  <div style={{ color: "var(--a-muted)" }}>
                    {s.metrics.personalPilgrims} jamaah pribadi · {s.metrics.teamPilgrims} tim
                  </div>
                </div>
                <Badge>{levelLabelFromId(s.levelAfterId)}</Badge>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function SubmitLeadModal({ agent, onClose }: { agent: { id: string; code: string; name: string }; onClose: () => void }) {
  const { state, transact } = useDemo();
  return (
    <Modal title="Ajukan Calon Jamaah" onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name")).trim();
          const phone = String(f.get("phone")).trim();
          const packageId = String(f.get("packageId"));
          const notes = String(f.get("notes")).trim();

          if (
            transact(
              s => {
                s.leads.unshift({
                  id: uid("LD"),
                  name,
                  phone,
                  packageId,
                  source: "Agen",
                  sales: "Rina Amelia",
                  stage: "Lead Baru",
                  lastContact: DEMO_TODAY,
                  followUp: "2026-10-05",
                  notes: notes ? [`Diajukan oleh mitra ${agent.name} (${agent.code}): ${notes}`] : [`Diajukan oleh mitra ${agent.name} (${agent.code})`],
                  agentId: agent.id,
                  referralCode: agent.code,
                });
              },
              `Calon jamaah ${name} diajukan oleh mitra ${agent.name}`,
              "CRM",
              "lead.create",
            )
          ) {
            onClose();
          }
        }}
      >
        <label>
          Nama Calon Jamaah
          <input name="name" required minLength={3} placeholder="Nama lengkap calon jamaah" />
        </label>
        <label>
          Nomor Telepon / WhatsApp
          <input name="phone" type="tel" required pattern="[+0-9\s\-]{8,18}" placeholder="08xxxxxxxxxx" />
        </label>
        <label>
          Paket Diminati
          <select name="packageId" defaultValue={state.packages[0]?.id}>
            {state.packages.filter(p => p.status === "Terbit").map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
        <label>
          Catatan Kebutuhan
          <textarea name="notes" rows={3} placeholder="Contoh: Rencana berangkat bersama 3 anggota keluarga bulan depan." />
        </label>
        <div className="modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="admin-button primary">Ajukan Sekarang</button>
        </div>
      </form>
    </Modal>
  );
}

function Home() {
  const { state, access, actor } = useDemo();
  if (access.role === "AGENT") {
    return <AgentHome />;
  }
  if (access.role === "PILGRIM") {
    const j = state.jamaah.find(j => j.id === access.personaId)!;
    const b = bookingFor(state, j.id);
    const d = state.departures.find(d => d.id === b?.departureId);
    return (
      <>
        <section className="portal-hero">
          <span className="eyebrow">PORTAL JAMAAH</span>
          <h1>Assalamu&apos;alaikum, {j.name.split(" ")[0]}</h1>
          <p>{j.id}</p>
          <SimulationDate className="on-dark" />
        </section>
        {b ? (
          <section className="portal-card">
            <h2>Pendaftaran Anda</h2>
            <Fields
              data={{
                Booking: b.id,
                Paket: packageForBooking(state, b)?.name,
                Keberangkatan: b.productType === "HAJJ_SPECIAL" ? "Rencana Haji Khusus — tanggal mengikuti kuota" : d ? dateLabel(d.date) : "Belum dijadwalkan",
                "Status pembayaran": <Badge>{paymentStatus(state, b)}</Badge>,
                "Sisa tagihan": rupiah(outstanding(state, b)),
              }}
            />
          </section>
        ) : (
          <section className="portal-card">
            <h2>Belum ada pendaftaran aktif</h2>
            <p className="muted">Hubungi tim Hasta Travel untuk mendaftar.</p>
          </section>
        )}
        <section className="portal-card">
          <h2>Yang sedang disiapkan</h2>
          <ul className="portal-list">
            {Object.values(upcoming.PILGRIM).map(f => (
              <li key={f.title}>
                <b>{f.title}</b>
                <span>{f.text}</span>
                <Badge>{`Segera · ${f.milestone}`}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </>
    );
  }
  return (
    <>
      <section className="portal-hero">
        <span className="eyebrow">PORTAL TOUR LEADER</span>
        <h1>Assalamu&apos;alaikum, {actor.name.replace(/^Ust\.\s+/, "").split(" ")[0]}</h1>
        <p>{actor.id}</p>
        <SimulationDate className="on-dark" />
      </section>
      <section className="portal-card">
        <h2>Belum ada penugasan keberangkatan</h2>
        <p className="muted">
          Penugasan tour leader ke rombongan dibuat oleh tim Operasional mulai milestone M4.2. Saat ini nama tour leader di modul Keberangkatan masih berupa teks dan belum terhubung ke akun ini.
        </p>
      </section>
      <section className="portal-card">
        <h2>Yang sedang disiapkan</h2>
        <ul className="portal-list">
          {Object.values(upcoming.TOUR_LEADER).map(f => (
            <li key={f.title}>
              <b>{f.title}</b>
              <span>{f.text}</span>
              <Badge>{`Segera · ${f.milestone}`}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function PortalScreen({ section }: { section: string }) {
  const { access, actor } = useDemo();
  if (section === "lainnya") return <More />;
  if (!actor.found) {
    return (
      <section className="portal-card portal-soon">
        <span className="portal-soon-icon"><UserRound size={22} aria-hidden="true" /></span>
        <h1>Persona demo tidak ditemukan</h1>
        <p>Data {actor.id} tidak ada di browser ini, misalnya karena data demo direset atau diubah. Pilih ulang persona di halaman akses demo.</p>
        <Link className="admin-button primary" href="/admin/login?switch=1">Pilih ulang persona</Link>
      </section>
    );
  }
  if (access.role === "AGENT") {
    if (section === "jamaah") return <AgentJamaah />;
    if (section === "tim") return <AgentTim />;
    if (section === "karier") return <AgentKarier />;
    if (section === "komisi") return <ComingSoon {...upcoming.AGENT.komisi} />;
  }
  if (section) {
    const f = upcoming[access.role]?.[section];
    return f ? <ComingSoon {...f} /> : null;
  }
  return <Home />;
}
