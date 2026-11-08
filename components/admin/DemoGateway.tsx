"use client";
import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, ClipboardCheck, Crown, Flag, Handshake, Headset, Info, RotateCcw, ShieldCheck, Smartphone, UserRound, Wallet, type LucideIcon } from "lucide-react";
import { enterDemo } from "@/app/admin/actions";
import { roleIds, roles, type UserRole } from "@/content/admin/roles";
import type { DemoState } from "@/content/admin/types";
import { createSeed } from "@/content/admin/seed";
import { bookingFor, packageForBooking } from "@/lib/admin/model";
import { DEMO_STORAGE_KEY, decodeDemo, encodeDemo } from "@/lib/admin/persistence";
import { Confirm } from "./ui";

const icons: Record<UserRole, LucideIcon> = { SUPERADMIN: ShieldCheck, OWNER: Crown, SALES_CS: Headset, FINANCE: Wallet, OPERATIONS: ClipboardCheck, AGENT: Handshake, TOUR_LEADER: Flag, PILGRIM: UserRound };
type Option = { id: string; label: string; sub: string };

/** Persona choices are read from this browser's demo data (the server cannot see localStorage). */
function personaOptions(state: DemoState): Record<"agent" | "pilgrim" | "tourLeader" | "staff", Option[]> {
  return {
    agent: state.agents.map(a => ({ id: a.id, label: a.name, sub: `${a.city} · ${a.level}` })),
    pilgrim: state.jamaah.filter(j => bookingFor(state, j.id)).map(j => { const b = bookingFor(state, j.id)!; return { id: j.id, label: j.name, sub: `${packageForBooking(state, b)?.name ?? b.id} · ${b.id}` }; }),
    tourLeader: state.users.filter(u => u.roleId === "TOUR_LEADER" && u.active).map(u => ({ id: u.id, label: u.name, sub: "Tour leader" })),
    staff: state.users.map(u => ({ id: u.id, label: u.name, sub: u.id })),
  };
}
function loadState(): { state: DemoState; notice: string } {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return { state: stored ? decodeDemo(stored) : createSeed(), notice: "" };
  } catch {
    return { state: createSeed(), notice: "Data demo tersimpan tidak dapat dibaca. Persona di bawah memakai data awal; workspace akan meminta reset." };
  }
}

function EnterButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <button className="gateway-enter" disabled={pending} aria-busy={pending}>{pending ? "Menyiapkan akses…" : label}<ArrowRight size={16} aria-hidden="true" /></button>;
}

function RoleCard({ role, options, current, action }: { role: UserRole; options: Option[]; current: boolean; action: (form: FormData) => void }) {
  const def = roles[role], Icon = icons[role];
  const portal = def.shell === "portal";
  const fallback = options.find(o => o.id === def.persona.defaultId) ?? options[0];
  const [persona, setPersona] = useState(fallback?.id ?? def.persona.defaultId);
  const selected = options.find(o => o.id === persona) ?? fallback;
  const selectId = `persona-${role}`;
  return <form action={action} className={`gateway-card ${current ? "current" : ""}`} aria-label={`Akses ${def.label}`}>
    <input type="hidden" name="role" value={role} />
    <div className="gateway-card-head">
      <span className="gateway-icon"><Icon size={20} aria-hidden="true" /></span>
      <div><h3>{def.label}</h3>{current && <span className="admin-badge green"><span className="badge-dot" />Akses saat ini</span>}</div>
    </div>
    <p className="gateway-desc">{def.description}</p>
    <p className="gateway-dest">{portal && <Smartphone size={12} aria-hidden="true" />}{def.destination}</p>
    {portal && options.length > 1 ? <label className="gateway-persona" htmlFor={selectId}>{def.persona.kind === "pilgrim" ? "Masuk sebagai jamaah" : def.persona.kind === "agent" ? "Masuk sebagai agen" : "Masuk sebagai tour leader"}
      <select id={selectId} name="persona" value={selected?.id} onChange={e => setPersona(e.target.value)}>{options.map(o => <option key={o.id} value={o.id}>{o.label} ({o.id})</option>)}</select>
      {selected && <small className="gateway-persona-detail">{selected.sub}</small>}
    </label> : <><input type="hidden" name="persona" value={selected?.id ?? def.persona.defaultId} />{selected && <p className="gateway-persona-static">Persona: <b>{selected.label}</b></p>}</>}
    <EnterButton label={current ? `Lanjutkan sebagai ${def.shortLabel}` : `Masuk sebagai ${def.shortLabel}`} />
  </form>;
}

export function DemoGateway({ current }: { current: { role: UserRole; personaId: string } | null }) {
  const [state, action] = useActionState(enterDemo, { error: "" });
  const [data, setData] = useState<{ state: DemoState; notice: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");
  // Read browser-only demo data after mount; the server render shows the cards without persona lists.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setData(loadState()); }, []);
  const options = data ? personaOptions(data.state) : null;
  const optionsFor = (role: UserRole): Option[] => { const kind = roles[role].persona.kind; return options ? options[kind].filter(o => kind !== "staff" || o.id === roles[role].persona.defaultId) : []; };
  function resetData() {
    try {
      const seed = createSeed();
      localStorage.setItem(DEMO_STORAGE_KEY, encodeDemo(seed));
      setData({ state: seed, notice: "" });
      setMessage("Data demo dikembalikan ke kondisi awal. Akses peran tidak berubah.");
    } catch { setMessage("Reset belum tersimpan: izinkan penyimpanan browser, lalu coba lagi."); }
  }
  const currentDef = current ? roles[current.role] : null;
  return <main className="gateway" data-ready={data ? "true" : "false"}>
    <section className="gateway-story">
      <div className="gateway-story-inner">
      <Link className="admin-brand" href="/"><Image src="/logo-mark.png" width={30} height={46} alt="" /><span>hasta<span className="brand-sub">TRAVEL & UMRAH</span></span></Link>
      <div>
        <span className="eyebrow">HASTA WORKSPACE · DEMO</span>
        <h1>Satu perjalanan,<br />dilihat dari setiap peran.</h1>
        <p>Pilih peran untuk menjelajahi workspace tanpa kata sandi. Semua peran memakai data demo yang sama di browser ini, sehingga perubahan dari satu peran terlihat oleh peran lain.</p>
        <ol className="gateway-steps"><li><span>01</span><b>Pilih peran</b>Tim kantor atau portal ponsel.</li><li><span>02</span><b>Jelajahi tugasnya</b>Menu dan tindakan mengikuti peran.</li><li><span>03</span><b>Ganti kapan saja</b>Data demo tetap sama.</li></ol>
      </div>
      <small>Sebuah karya Kalsara Digital Studio · 2026</small>
      </div>
    </section>
    <section className="gateway-panel" aria-labelledby="gateway-title"><div className="gateway-panel-inner">
      <div className="gateway-head">
        <span className="admin-badge amber"><span className="badge-dot" />Akses demo · bukan keamanan produksi</span>
        <h2 id="gateway-title">Pilih Akses Demo</h2>
        <p className="muted">Klik satu peran untuk masuk. Tidak ada akun atau kata sandi; pilihan peran hanya mengatur tampilan dan tindakan demo.</p>
        {currentDef && current && <p className="admin-notice gateway-current" role="status">Saat ini Anda masuk sebagai <b>{currentDef.label}</b> ({current.personaId}). Pilih peran lain untuk berganti — data demo tidak berubah.</p>}
        {state.error && <p role="alert" className="form-error">{state.error}</p>}
        {data?.notice && <p role="alert" className="admin-notice warning">{data.notice}</p>}
        {message && <p role="status" className="admin-notice">{message}</p>}
      </div>
      <h3 className="gateway-group">Tim kantor</h3>
      <div className="gateway-grid gateway-grid--staff">{roleIds.filter(r => roles[r].shell === "admin").map(r => <RoleCard key={`${r}:${data ? "ready" : "ssr"}`} role={r} options={optionsFor(r)} current={current?.role === r} action={action} />)}</div>
      <h3 className="gateway-group">Portal ponsel</h3>
      <div className="gateway-grid">{roleIds.filter(r => roles[r].shell === "portal").map(r => <RoleCard key={`${r}:${data ? "ready" : "ssr"}`} role={r} options={optionsFor(r)} current={current?.role === r} action={action} />)}</div>
      <div className="gateway-foot">
        <p className="gateway-disclaimer"><Info size={16} aria-hidden="true" /><span><b>Data demo.</b> Seluruh nama, transaksi, dan dokumen bersifat fiktif dan tersimpan di browser ini, dengan periode simulasi Oktober 2026. Mengganti peran tidak mengubah atau menghapus data.</span></p>
        <div className="admin-actions">
          <Link href="/" className="admin-button">← Kembali ke Website</Link>
          <button type="button" className="admin-button" onClick={() => setConfirmReset(true)}><RotateCcw size={14} aria-hidden="true" />Reset data demo</button>
        </div>
      </div>
    </div></section>
    {confirmReset && <Confirm title="Reset data demo?" text="Seluruh perubahan demo yang tersimpan di browser ini akan diganti dengan data awal. Akses peran Anda tidak berubah. Tindakan ini tidak dapat dibatalkan." onClose={() => setConfirmReset(false)} onConfirm={resetData} />}
  </main>;
}
