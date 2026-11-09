"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Copy, GitFork, Plus, ShieldCheck } from "lucide-react";
import { useDemo } from "./Store";
import { Badge, DataTable, Empty, Fields, Modal, PageHeader, Panel, Person, Progress, Stat, Tabs } from "./ui";
import { rupiah, rupiahSingkat } from "@/lib/format";
import { dateLabel, uid } from "@/lib/admin/model";
import type { Agent } from "@/content/admin/types";
import {
  allDescendantsOf,
  canMoveAgent,
  computeCareerProgress,
  DEFAULT_CAREER_LEVELS,
  downlinesOf,
  generateAgentCode,
  levelLabelFromId,
  lockCareerPeriod,
  moveAgent,
} from "@/content/admin/career";
import { DEMO_TODAY } from "@/content/admin/seed";

export default function AgentManagement({ id }: { id?: string }) {
  const { state, transact, can, actor } = useDemo();
  const [tab, setTab] = useState("Daftar");
  const [detailTab, setDetailTab] = useState("Profil");
  const [createModal, setCreateModal] = useState(false);
  const [moveModalAgentId, setMoveModalAgentId] = useState<string | null>(null);
  const [editModalAgentId, setEditModalAgentId] = useState<string | null>(null);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Filters for agent list
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const agent = state.agents.find(a => a.id === id);

  const agentBookings = (agentId: string) =>
    state.bookings.filter(b => b.status === "Aktif" && (b.attribution?.agentId === agentId || (!b.attribution && state.jamaah.find(j => j.id === b.jamaahId)?.agentId === agentId)));

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // --- DETAIL VIEW: /admin/agen/[id] ---
  if (id) {
    if (!agent) return <Empty title="Mitra tidak ditemukan" text="Data agen ini tidak tersedia atau sudah dihapus." />;

    const upline = agent.parentId ? state.agents.find(a => a.id === agent.parentId) : undefined;
    const directDownlines = downlinesOf(state, agent.id);
    const allDesc = allDescendantsOf(state, agent.id);
    const pilgrims = state.jamaah.filter(j => j.agentId === agent.id);
    const bookings = agentBookings(agent.id);
    const progress = computeCareerProgress(state, agent.id, "2026-Q4");
    const snapshots = (state.careerSnapshots ?? []).filter(s => s.agentId === agent.id);
    const hierarchyEvents = (state.agentHierarchyEvents ?? []).filter(e => e.agentId === agent.id);

    return (
      <>
        <PageHeader
          title={agent.name}
          description={`${agent.id} · ${agent.code} · ${agent.level} · ${agent.city}`}
          actions={
            can("agen:write") ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button className="admin-button" onClick={() => setEditModalAgentId(agent.id)}>
                  Edit data mitra
                </button>
                <button className="admin-button primary" onClick={() => setMoveModalAgentId(agent.id)}>
                  <GitFork size={14} /> Pindahkan upline
                </button>
              </div>
            ) : undefined
          }
        />

        <Tabs
          items={["Profil", "Jaringan", "Jamaah", "Booking", "Karier", "Aktivitas"]}
          value={detailTab}
          onChange={setDetailTab}
        />

        {detailTab === "Profil" && (
          <div style={{ display: "grid", gap: 16 }}>
            <Panel title="Profil & Keagenan">
              <Fields
                data={{
                  Nama: agent.name,
                  "ID Mitra": agent.id,
                  "Kode Referral": (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <strong>{agent.code}</strong>
                      <button
                        className="text-button"
                        onClick={() => copyCode(agent.code)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode ? "Disalin" : "Salin"}
                      </button>
                    </span>
                  ),
                  "Status Akun": <Badge>{agent.accountStatus}</Badge>,
                  "Level Karier": <Badge>{agent.level}</Badge>,
                  "Upline Pembina": upline ? (
                    <Person name={upline.name} sub={`${upline.id} · ${upline.code}`} href={`/admin/agen/${upline.id}`} />
                  ) : (
                    "Root (Tanpa Upline)"
                  ),
                  "Tanggal Bergabung": dateLabel(agent.joinedAt),
                  Telepon: agent.phone,
                  Email: agent.email || "-",
                  Kota: agent.city,
                  "Komisi Dasar": rupiah(agent.commission),
                }}
              />
            </Panel>
          </div>
        )}

        {detailTab === "Jaringan" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div className="admin-stats">
              <Stat label="Mitra langsung" value={directDownlines.length} detail="Downline tier 1" />
              <Stat label="Total jaringan" value={allDesc.length} detail="Seluruh turunan jaringan" />
            </div>
            <Panel title="Mitra Langsung (Downline Tier 1)">
              {directDownlines.length === 0 ? (
                <div style={{ padding: 18 }}><p className="muted">Belum ada mitra langsung di bawah agen ini.</p></div>
              ) : (
                <DataTable
                  title="mitra langsung"
                  rows={directDownlines}
                  columns={[
                    {
                      label: "Mitra",
                      value: d => d.name,
                      render: d => <Person name={d.name} sub={`${d.id} · ${d.code}`} href={`/admin/agen/${d.id}`} />,
                    },
                    { label: "Level", value: d => d.level, render: d => <Badge>{d.level}</Badge> },
                    { label: "Kota", value: d => d.city },
                    { label: "Telepon", value: d => d.phone },
                    { label: "Booking aktif", value: d => agentBookings(d.id).length },
                  ]}
                />
              )}
            </Panel>
          </div>
        )}

        {detailTab === "Jamaah" && (
          <DataTable
            title="jamaah agen"
            rows={pilgrims}
            columns={[
              {
                label: "Jamaah",
                value: j => j.name,
                render: j => <Person name={j.name} sub={j.id} href={`/admin/jamaah/${j.id}`} />,
              },
              { label: "Telepon", value: j => j.phone },
              { label: "Kota", value: j => j.city },
              {
                label: "Booking",
                value: j => {
                  const b = state.bookings.find(b => b.jamaahId === j.id && b.status === "Aktif");
                  return b ? b.id : "Tidak ada";
                },
                render: j => {
                  const b = state.bookings.find(b => b.jamaahId === j.id && b.status === "Aktif");
                  return b ? <Link className="text-button" href={`/admin/booking/${b.id}`}>{b.id}</Link> : "-";
                },
              },
            ]}
          />
        )}

        {detailTab === "Booking" && (
          <DataTable
            title="booking agen"
            rows={bookings}
            columns={[
              {
                label: "Booking",
                value: b => b.id,
                render: b => <Link className="text-button" href={`/admin/booking/${b.id}`}>{b.id}</Link>,
              },
              { label: "Keberangkatan", value: b => b.departureId || "Haji Khusus" },
              { label: "Total", value: b => b.total, render: b => rupiah(b.total) },
              {
                label: "Status Atribusi",
                value: b => b.attribution?.lockedAt ? "Terkunci" : "Terbuka",
                render: b =>
                  b.attribution?.lockedAt ? (
                    <Badge>{`Terkunci · ${dateLabel(b.attribution.lockedAt)}`}</Badge>
                  ) : (
                    <Badge>Menunggu pembayaran</Badge>
                  ),
              },
              {
                label: "Sumber Atribusi",
                value: b => b.attribution?.source ?? "MANUAL",
              },
            ]}
          />
        )}

        {detailTab === "Karier" && (
          <div style={{ display: "grid", gap: 16 }}>
            <Panel title="Evaluasi Karier Berjalan · 2026-Q4" subtitle="Dihitung dari pendaftaran dan pelunasan kuartal ini">
              <div className="admin-stats">
                <Stat label="Jamaah pribadi" value={progress.metrics.personalPilgrims} detail={`Omset ${rupiahSingkat(progress.metrics.personalValue)}`} />
                <Stat label="Jamaah tim" value={progress.metrics.teamPilgrims} detail={`Omset ${rupiahSingkat(progress.metrics.teamValue)}`} />
                <Stat label="Mitra aktif" value={progress.metrics.activeDirects} detail="Downline langsung berpenjualan" />
                <Stat label="Kualifikasi level" value={levelLabelFromId(progress.qualifiesForLevelId)} detail={`Level saat ini: ${agent.level}`} />
              </div>

              {progress.nextLevel && (
                <div style={{ padding: 18, borderTop: "1px solid var(--a-line)" }}>
                  <h3 style={{ fontSize: 14, marginBottom: 8 }}>Target Level Berikutnya: {progress.nextLevel.levelName}</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {progress.nextLevel.gaps.map(g => (
                      <div key={g.metric} style={{ display: "grid", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span>{g.label}</span>
                          <b>
                            {g.current} / {g.required} {g.met ? "✓ Memenuhi" : ""}
                          </b>
                        </div>
                        <Progress value={Math.min(100, Math.round((g.current / g.required) * 100))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Riwayat Snapshot Periode (Terkunci)">
              {snapshots.length === 0 ? (
                <div style={{ padding: 18 }}><p className="muted">Belum ada periode yang dikunci untuk mitra ini.</p></div>
              ) : (
                <DataTable
                  title="riwayat snapshot"
                  rows={snapshots}
                  columns={[
                    { label: "Periode", value: s => s.periodId },
                    { label: "Level Sebelum", value: s => levelLabelFromId(s.levelBeforeId) },
                    { label: "Level Akhir", value: s => levelLabelFromId(s.levelAfterId) },
                    { label: "Jamaah Pribadi", value: s => s.metrics.personalPilgrims },
                    { label: "Jamaah Tim", value: s => s.metrics.teamPilgrims },
                    { label: "Tanggal Kunci", value: s => dateLabel(s.lockedAt) },
                    { label: "Status", value: s => s.status, render: s => <Badge>{s.status}</Badge> },
                  ]}
                />
              )}
            </Panel>
          </div>
        )}

        {detailTab === "Aktivitas" && (
          <div style={{ display: "grid", gap: 16 }}>
            <Panel title="Riwayat Perpindahan Upline / Hierarki">
              {hierarchyEvents.length === 0 ? (
                <div style={{ padding: 18 }}><p className="muted">Belum ada catatan perpindahan hierarki.</p></div>
              ) : (
                <DataTable
                  title="audit hierarki"
                  rows={hierarchyEvents}
                  columns={[
                    { label: "Tanggal", value: e => dateLabel(e.effectiveDate) },
                    {
                      label: "Dari Upline",
                      value: e => e.fromParentId,
                      render: e => {
                        const from = state.agents.find(a => a.id === e.fromParentId);
                        return from ? `${from.name} (${from.code})` : "Root";
                      },
                    },
                    {
                      label: "Ke Upline",
                      value: e => e.toParentId,
                      render: e => {
                        const to = state.agents.find(a => a.id === e.toParentId);
                        return to ? `${to.name} (${to.code})` : "Root";
                      },
                    },
                    { label: "Alasan", value: e => e.reason },
                    { label: "Oleh", value: e => e.actorId },
                  ]}
                />
              )}
            </Panel>
          </div>
        )}

        {moveModalAgentId && (
          <MoveModal
            agentId={moveModalAgentId}
            onClose={() => setMoveModalAgentId(null)}
          />
        )}

        {editModalAgentId && (
          <EditModal
            agentId={editModalAgentId}
            onClose={() => setEditModalAgentId(null)}
          />
        )}
      </>
    );
  }

  // --- OVERVIEW: /admin/agen ---
  const filteredAgents = state.agents.filter(a => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.code.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !levelFilter || a.levelId === levelFilter || a.level === levelFilter;
    const matchStatus = !statusFilter || a.accountStatus === statusFilter;
    return matchSearch && matchLevel && matchStatus;
  });

  const roots = state.agents.filter(a => !a.parentId);

  const handleLockPeriod = (periodId = "2026-Q4") => {
    try {
      transact(
        s => {
          lockCareerPeriod(s, periodId, actor.id);
        },
        `Evaluasi karier periode ${periodId} berhasil dikunci`,
        "Karier",
        "demo.reset", // accessible to Superadmin or Owner
      );
      setLockNotice(`Periode ${periodId} berhasil dikunci. Snapshot kinerja disimpan secara permanen.`);
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal mengunci periode.");
    }
  };

  const isQ4Locked = (state.careerSnapshots ?? []).some(s => s.periodId === "2026-Q4");

  return (
    <>
      <PageHeader
        title="Mitra & Keagenan"
        description="Jaringan kemitraan, hierarki pembinaan, jenjang karier, dan kualifikasi mitra."
        actions={
          can("agen:write") ? (
            <button className="admin-button primary" onClick={() => setCreateModal(true)}>
              <Plus size={14} /> Tambah mitra
            </button>
          ) : undefined
        }
      />

      <Tabs items={["Daftar", "Jaringan", "Level karier", "Analitik"]} value={tab} onChange={setTab} />

      {tab === "Daftar" && (
        <>
          <div className="admin-stats">
            <Stat label="Mitra terdaftar" value={state.agents.length} detail="Total seluruh jaringan" />
            <Stat label="Mitra aktif" value={state.agents.filter(a => a.accountStatus === "ACTIVE").length} detail="Status akun aktif" />
            <Stat label="Koordinator" value={state.agents.filter(a => a.levelId === "CL-3" || a.levelId === "CL-4").length} detail="Pembina jaringan" />
            <Stat label="Jamaah binaan" value={state.jamaah.filter(j => j.agentId).length} detail="Terhubung ke agen" />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <input
              type="text"
              placeholder="Cari nama, kode, atau kota..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ minWidth: 220, padding: "8px 12px", border: "1px solid var(--a-line)", borderRadius: 8 }}
            />
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid var(--a-line)", borderRadius: 8 }}
            >
              <option value="">Semua level</option>
              {DEFAULT_CAREER_LEVELS.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid var(--a-line)", borderRadius: 8 }}
            >
              <option value="">Semua status akun</option>
              <option value="ACTIVE">Aktif</option>
              <option value="SUSPENDED">Ditangguhkan</option>
              <option value="INACTIVE">Nonaktif</option>
            </select>
          </div>

          <DataTable
            title="mitra"
            rows={filteredAgents}
            columns={[
              {
                label: "Mitra",
                value: a => a.name,
                render: a => <Person name={a.name} sub={`${a.id} · ${a.code}`} href={`/admin/agen/${a.id}`} />,
              },
              {
                label: "Level",
                value: a => a.level,
                render: a => <Badge>{a.level}</Badge>,
              },
              {
                label: "Upline",
                value: a => a.parentId,
                render: a => {
                  const up = state.agents.find(p => p.id === a.parentId);
                  return up ? <Link className="text-button" href={`/admin/agen/${up.id}`}>{up.name}</Link> : <span className="muted">Root</span>;
                },
              },
              { label: "Kota", value: a => a.city },
              { label: "Telepon", value: a => a.phone },
              {
                label: "Booking aktif",
                value: a => agentBookings(a.id).length,
              },
              {
                label: "Total omset",
                value: a => agentBookings(a.id).reduce((sum, b) => sum + b.total, 0),
                render: a => rupiah(agentBookings(a.id).reduce((sum, b) => sum + b.total, 0)),
              },
              {
                label: "Status",
                value: a => a.accountStatus,
                render: a => <Badge>{a.accountStatus}</Badge>,
              },
              {
                label: "Aksi",
                value: a => a.id,
                render: a => (
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link className="text-button" href={`/admin/agen/${a.id}`}>
                      Detail →
                    </Link>
                    {can("agen:write") && (
                      <button className="text-button" onClick={() => setMoveModalAgentId(a.id)}>
                        Pindah
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </>
      )}

      {tab === "Jaringan" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Panel title="Pohon Struktur Jaringan" subtitle="Hierarki pembinaan mitra Hasta Travel (maksimal 4 level kedalaman)">
            <div style={{ padding: 18 }}>
              {roots.map(root => (
                <TreeNode
                  key={root.id}
                  agent={root}
                  depth={1}
                  onMove={id => setMoveModalAgentId(id)}
                  canWrite={can("agen:write")}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Audit Perpindahan Jaringan" subtitle="Catatan perubahan posisi upline dengan alasan dan penanggung jawab">
            {(state.agentHierarchyEvents ?? []).length === 0 ? (
              <div style={{ padding: 18 }}><p className="muted">Belum ada riwayat perpindahan jaringan.</p></div>
            ) : (
              <DataTable
                title="riwayat perpindahan"
                rows={state.agentHierarchyEvents ?? []}
                columns={[
                  { label: "Tanggal", value: e => dateLabel(e.effectiveDate) },
                  {
                    label: "Mitra",
                    value: e => e.agentId,
                    render: e => {
                      const a = state.agents.find(a => a.id === e.agentId);
                      return a ? <Link className="text-button" href={`/admin/agen/${a.id}`}>{a.name} ({a.code})</Link> : e.agentId;
                    },
                  },
                  {
                    label: "Dari Upline",
                    value: e => e.fromParentId,
                    render: e => {
                      const from = state.agents.find(a => a.id === e.fromParentId);
                      return from ? `${from.name} (${from.code})` : "Root";
                    },
                  },
                  {
                    label: "Ke Upline",
                    value: e => e.toParentId,
                    render: e => {
                      const to = state.agents.find(a => a.id === e.toParentId);
                      return to ? `${to.name} (${to.code})` : "Root";
                    },
                  },
                  { label: "Alasan", value: e => e.reason },
                  { label: "Oleh", value: e => e.actorId },
                ]}
              />
            )}
          </Panel>
        </div>
      )}

      {tab === "Level karier" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Panel title="Jenjang Karier Mitra Hasta" subtitle="Kenaikan peringkat berdasarkan pencapaian jamaah riil (bebas skema piramida)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, padding: 18 }}>
              {DEFAULT_CAREER_LEVELS.map(lvl => (
                <div key={lvl.id} style={{ border: "1px solid var(--a-line)", borderRadius: 8, padding: 16, background: "#fafbfc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{lvl.name}</h3>
                    <Badge>{`Rank ${lvl.rank}`}</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 12 }}>{lvl.description}</p>
                  <div style={{ fontSize: 12, borderTop: "1px solid var(--a-line)", paddingTop: 8 }}>
                    <b>Syarat Kualifikasi (per Kuartal):</b>
                    {lvl.requirements.length === 0 ? (
                      <p className="muted" style={{ marginTop: 4 }}>Tanpa syarat minimum (level awal).</p>
                    ) : (
                      <ul style={{ paddingLeft: 18, marginTop: 4 }}>
                        {lvl.requirements.map(r => (
                          <li key={r.metric}>
                            {r.metric === "PERSONAL_PILGRIMS" && `≥ ${r.min} Jamaah pribadi`}
                            {r.metric === "TEAM_PILGRIMS" && `≥ ${r.min} Jamaah tim`}
                            {r.metric === "ACTIVE_DIRECTS" && `≥ ${r.min} Mitra langsung aktif`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Aturan & Kebijakan Evaluasi" subtitle="Parameter evaluasi periode kuartalan">
            <Fields
              data={{
                "Periode Evaluasi": "Kuartal (3 bulan: Q1, Q2, Q3, Q4)",
                "Peristiwa Kualifikasi": "Pelunasan Penuh (Booking Lunas / Outstanding = Rp 0)",
                "Batas Kedalaman Tim": "Maksimal 3 level turunan dihitung dalam metrik tim",
                "Kebijakan Demosi": "Tidak ada demosi otomatis di tengah periode berjalan",
                "Kepatuhan Hukum": "Berbasis penjualan paket jamaah riil, bukan rekrutmen member (UU Perdagangan No. 7/2014 Pasal 9)",
              }}
            />
            <p className="admin-notice" style={{ margin: 18 }}>
              Contoh konfigurasi demo — sesuaikan dengan kebijakan resmi biro perjalanan.
            </p>
          </Panel>

          <Panel title="Kunci Evaluasi Kuartal (Period Lock)" subtitle="Membekukan capaian kuartal berjalan dan memproses promosi level">
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }}>Periode Berjalan: 2026-Q4 (Okt – Des 2026)</h4>
                  <p style={{ fontSize: 13, color: "var(--a-muted)" }}>
                    {isQ4Locked
                      ? "Periode ini sudah dikunci. Snapshot riwayat kinerja tersimpan permanen."
                      : "Mengunci periode akan mengevaluasi seluruh mitra dan menaikkan level bagi yang memenuhi kualifikasi."}
                  </p>
                </div>
                <div>
                  {isQ4Locked ? (
                    <Badge>TERKUNCI</Badge>
                  ) : (
                    <button
                      className="admin-button primary"
                      onClick={() => handleLockPeriod("2026-Q4")}
                    >
                      <ShieldCheck size={14} /> Kunci Periode 2026-Q4 (Simulasi)
                    </button>
                  )}
                </div>
              </div>
              {lockNotice && (
                <div style={{ marginTop: 12, padding: 10, background: "#edf7ed", border: "1px solid #b7e1cd", borderRadius: 8, fontSize: 13, color: "#137333" }}>
                  {lockNotice}
                </div>
              )}
            </div>
          </Panel>
        </div>
      )}

      {tab === "Analitik" && (
        <div style={{ display: "grid", gap: 16 }}>
          <Panel title="Peringkat & Kinerja Mitra · Kuartal 4 (2026-Q4)" subtitle="Leaderboard pencapaian jamaah dan omset penjualan kuartal ini">
            <DataTable
              title="leaderboard mitra"
              rows={state.agents
                .map(a => ({
                  id: a.id,
                  agent: a,
                  prog: computeCareerProgress(state, a.id, "2026-Q4"),
                }))
                .sort((a, b) => b.prog.metrics.personalPilgrims - a.prog.metrics.personalPilgrims || b.prog.metrics.teamPilgrims - a.prog.metrics.teamPilgrims)
                .map((item, idx) => ({ ...item, rank: idx + 1 }))}
              columns={[
                {
                  label: "Peringkat",
                  value: r => r.rank,
                  render: r => <b>#{r.rank}</b>,
                },
                {
                  label: "Mitra",
                  value: r => r.agent.name,
                  render: r => <Person name={r.agent.name} sub={`${r.agent.id} · ${r.agent.code}`} href={`/admin/agen/${r.agent.id}`} />,
                },
                {
                  label: "Level Saat Ini",
                  value: r => r.agent.level,
                  render: r => <Badge>{r.agent.level}</Badge>,
                },
                {
                  label: "Jamaah Pribadi",
                  value: r => r.prog.metrics.personalPilgrims,
                },
                {
                  label: "Omset Pribadi",
                  value: r => r.prog.metrics.personalValue,
                  render: r => rupiah(r.prog.metrics.personalValue),
                },
                {
                  label: "Jamaah Tim",
                  value: r => r.prog.metrics.teamPilgrims,
                },
                {
                  label: "Mitra Aktif",
                  value: r => r.prog.metrics.activeDirects,
                },
                {
                  label: "Kualifikasi Level",
                  value: r => levelLabelFromId(r.prog.qualifiesForLevelId),
                  render: r => {
                    const qualLabel = levelLabelFromId(r.prog.qualifiesForLevelId);
                    const isPromoted = qualLabel !== r.agent.level;
                    return (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Badge>{qualLabel}</Badge>
                        {isPromoted && <small style={{ color: "#137333", fontWeight: 700 }}>↑ Siap Promosi</small>}
                      </span>
                    );
                  },
                },
              ]}
            />
          </Panel>
        </div>
      )}

      {createModal && <CreateModal onClose={() => setCreateModal(false)} />}
      {moveModalAgentId && (
        <MoveModal
          agentId={moveModalAgentId}
          onClose={() => setMoveModalAgentId(null)}
        />
      )}
      {editModalAgentId && (
        <EditModal
          agentId={editModalAgentId}
          onClose={() => setEditModalAgentId(null)}
        />
      )}
    </>
  );
}

// Tree Node recursive component
function TreeNode({
  agent,
  depth,
  onMove,
  canWrite,
}: {
  agent: { id: string; name: string; code: string; level: string; levelId: string; city: string };
  depth: number;
  onMove: (id: string) => void;
  canWrite: boolean;
}) {
  const { state } = useDemo();
  const [open, setOpen] = useState(true);
  const children = downlinesOf(state, agent.id);
  const totalDesc = allDescendantsOf(state, agent.id);

  return (
    <div style={{ marginLeft: depth > 1 ? 24 : 0, marginTop: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: depth === 1 ? "#fff" : "#fbfcf9",
          border: "1px solid var(--a-line)",
          borderRadius: 8,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          {children.length > 0 ? (
            <button
              onClick={() => setOpen(!open)}
              className="icon-button"
              style={{ width: 24, height: 24, display: "grid", placeItems: "center" }}
              aria-label={open ? "Tutup cabang" : "Buka cabang"}
            >
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span style={{ width: 24 }} />
          )}
          <Person name={agent.name} sub={`${agent.id} · ${agent.code}`} href={`/admin/agen/${agent.id}`} />
          <Badge>{agent.level}</Badge>
          <span style={{ fontSize: 12, color: "var(--a-muted)" }}>
            {agent.city} · {children.length} langsung · {totalDesc.length} total
          </span>
        </div>
        {canWrite && (
          <button className="text-button" onClick={() => onMove(agent.id)}>
            Pindah upline
          </button>
        )}
      </div>

      {open && children.length > 0 && (
        <div style={{ borderLeft: "2px dashed var(--a-line)", marginLeft: 12 }}>
          {children.map(child => (
            <TreeNode
              key={child.id}
              agent={child}
              depth={depth + 1}
              onMove={onMove}
              canWrite={canWrite}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const { state, transact } = useDemo();
  return (
    <Modal title="Tambah Mitra Baru" onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name")).trim();
          const phone = String(f.get("phone")).trim();
          const email = String(f.get("email")).trim();
          const city = String(f.get("city")).trim();
          const levelId = String(f.get("levelId"));
          const parentId = String(f.get("parentId"));
          const commission = Number(f.get("commission")) || 1000000;

          const newId = uid("AGT");
          const code = generateAgentCode(name, newId);
          const levelName = levelLabelFromId(levelId);

          if (
            transact(
              s => {
                s.agents.push({
                  id: newId,
                  name,
                  phone,
                  city,
                  level: levelName,
                  levelId,
                  code,
                  parentId,
                  joinedAt: DEMO_TODAY,
                  accountStatus: "ACTIVE",
                  commission,
                  status: "Menunggu",
                  email: email || `${name.toLowerCase().replace(/[^a-z]/g, "")}@mitra.example`,
                });
              },
              `Mitra ${name} (${code}) ditambahkan`,
              "Agen",
              "agen:write",
            )
          ) {
            onClose();
          }
        }}
      >
        <label>
          Nama Lengkap
          <input name="name" required minLength={3} placeholder="Nama mitra baru" />
        </label>
        <div className="form-grid">
          <label>
            Nomor Telepon / WhatsApp
            <input name="phone" type="tel" required pattern="[+0-9\s\-]{8,18}" placeholder="08xxxxxxxxxx" />
          </label>
          <label>
            Email
            <input name="email" type="email" placeholder="mitra@example.com" />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Kota
            <input name="city" required defaultValue="Jakarta" />
          </label>
          <label>
            Level Karier Awal
            <select name="levelId" defaultValue="CL-1">
              {DEFAULT_CAREER_LEVELS.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.id})</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Upline Pembina
          <select name="parentId" defaultValue="">
            <option value="">Tanpa upline (Root / Tingkat 1)</option>
            {state.agents.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.code} · {a.level})</option>
            ))}
          </select>
        </label>
        <label>
          Tarif Komisi Dasar per Jamaah (Rp)
          <input name="commission" type="number" required min={0} step={1} defaultValue={1000000} />
        </label>
        <div className="modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="admin-button primary">Simpan Mitra</button>
        </div>
      </form>
    </Modal>
  );
}

function MoveModal({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const { state, transact, actor } = useDemo();
  const agent = state.agents.find(a => a.id === agentId);
  const [targetParentId, setTargetParentId] = useState(agent?.parentId ?? "");
  const [reason, setReason] = useState("");

  if (!agent) return null;

  const validation = canMoveAgent(state, agent.id, targetParentId);

  return (
    <Modal title={`Pindahkan Struktur Upline: ${agent.name}`} onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          if (!validation.ok) return;

          if (
            transact(
              s => {
                moveAgent(s, agent.id, targetParentId, reason, actor.id);
              },
              `Posisi hierarki ${agent.name} dipindahkan`,
              "Agen",
              "agen:write",
            )
          ) {
            onClose();
          }
        }}
      >
        <p style={{ fontSize: 13, color: "var(--a-muted)", marginBottom: 12 }}>
          Mengubah posisi pembina bagi mitra <strong>{agent.name}</strong> ({agent.code}). Booking yang telah terkunci
          akan tetap mempertahankan snapshot upline historisnya.
        </p>

        <label>
          Upline Pembina Baru
          <select
            value={targetParentId}
            onChange={e => setTargetParentId(e.target.value)}
          >
            <option value="">Tanpa Upline (Pindah ke Root)</option>
            {state.agents
              .filter(a => a.id !== agent.id)
              .map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.code} · {a.level})
                </option>
              ))}
          </select>
        </label>

        {!validation.ok && (
          <div style={{ padding: 10, background: "#fdeded", border: "1px solid #f5c2c2", borderRadius: 8, fontSize: 13, color: "#c5221f" }}>
            {validation.error}
          </div>
        )}

        <label>
          Alasan Perpindahan (Audit Event)
          <textarea
            required
            rows={3}
            placeholder="Contoh: Penyesuaian wilayah operasional atau pembinaan tim"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </label>

        <div className="modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="admin-button primary" disabled={!validation.ok || !reason.trim()}>
            Simpan Perpindahan
          </button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const { state, transact } = useDemo();
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) return null;

  return (
    <Modal title={`Edit Mitra: ${agent.name}`} onClose={onClose}>
      <form
        className="admin-form"
        onSubmit={e => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const name = String(f.get("name")).trim();
          const phone = String(f.get("phone")).trim();
          const email = String(f.get("email")).trim();
          const city = String(f.get("city")).trim();
          const accountStatus = String(f.get("accountStatus")) as Agent["accountStatus"];

          if (
            transact(
              s => {
                const a = s.agents.find(a => a.id === agentId)!;
                a.name = name;
                a.phone = phone;
                a.email = email;
                a.city = city;
                a.accountStatus = accountStatus;
              },
              `Data mitra ${agent.name} diperbarui`,
              "Agen",
              "agen:write",
            )
          ) {
            onClose();
          }
        }}
      >
        <label>
          Nama Lengkap
          <input name="name" required minLength={3} defaultValue={agent.name} />
        </label>
        <div className="form-grid">
          <label>
            Telepon
            <input name="phone" type="tel" required defaultValue={agent.phone} />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={agent.email ?? ""} />
          </label>
        </div>
        <div className="form-grid">
          <label>
            Kota
            <input name="city" required defaultValue={agent.city} />
          </label>
          <label>
            Status Akun
            <select name="accountStatus" defaultValue={agent.accountStatus}>
              <option value="ACTIVE">ACTIVE (Aktif)</option>
              <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
              <option value="INACTIVE">INACTIVE (Nonaktif)</option>
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="admin-button" onClick={onClose}>Batal</button>
          <button type="submit" className="admin-button primary">Simpan Perubahan</button>
        </div>
      </form>
    </Modal>
  );
}
