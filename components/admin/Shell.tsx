"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Users, CalendarDays, Plane, Package, FileCheck2, BedDouble, Bus, Wallet, Receipt, TrendingUp, Handshake, Building2, Box, Send, Bell, ChartNoAxesCombined, Globe, Quote, ImageIcon, ShieldCheck, History, Settings, Search, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronRight, Plus, ListChecks, Contact, BookOpen, ArrowUpRight, LogOut, RotateCcw, Menu, X, CircleHelp, Repeat2, type LucideIcon } from "lucide-react";
import { moduleTitle } from "@/content/admin/navigation";
import { roles } from "@/content/admin/roles";
import { canAccessRoute, navigationFor } from "@/lib/admin/access";
import { logout } from "@/app/admin/actions";
import { useDemo } from "./Store";
import { Avatar, Confirm, Modal, Empty } from "./ui";
import { CreateForm, createPermission, type CreateKind } from "./CreateForm";

const icons: Record<string, LucideIcon> = { dashboard: LayoutDashboard, leads: Contact, booking: BookOpen, users: Users, package: Package, plane: Plane, list: ListChecks, file: FileCheck2, bed: BedDouble, calendar: CalendarDays, bus: Bus, wallet: Wallet, receipt: Receipt, expense: ArrowUpRight, commission: Handshake, handshake: Handshake, building: Building2, box: Box, send: Send, bell: Bell, chart: ChartNoAxesCombined, trend: TrendingUp, globe: Globe, quote: Quote, image: ImageIcon, shield: ShieldCheck, history: History, settings: Settings };

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const current = path.split("/")[2];
  const { state, reset, access, actor, can } = useDemo();
  const role = roles[access.role];
  const navigation = navigationFor(access.role);
  const firstName = actor.name.replace(/^(Ust\.|H\.|Hj\.)\s+/, "").split(" ")[0];
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(false);
  const [quick, setQuick] = useState(false);
  const [create, setCreate] = useState<CreateKind | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const creatable = (Object.keys(createPermission) as CreateKind[]).filter(kind => can(createPermission[kind]));
  useEffect(() => { const listener = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(v => !v); } if (e.key === "Escape") { setProfile(false); setMobile(false); setQuick(false); } }; window.addEventListener("keydown", listener); return () => window.removeEventListener("keydown", listener); }, []);
  const results = [
    ...state.jamaah.map(j => ({ name: j.name, sub: `Jamaah · ${j.id}`, href: `/admin/jamaah/${j.id}`, slug: "jamaah" })),
    ...state.hajjPackages.map(p => ({ name: p.name, sub: `Haji Khusus · ${p.id}`, href: `/admin/haji-khusus/${p.id}`, slug: "haji-khusus" })),
    ...state.packages.map(p => ({ name: p.name, sub: `Paket · ${p.id}`, href: `/admin/paket/${p.id}`, slug: "paket" })),
    ...state.bookings.flatMap(b => [{ name: b.id, sub: `Booking · ${state.jamaah.find(j => j.id === b.jamaahId)?.name}`, href: `/admin/booking/${b.id}`, slug: "booking" }, { name: `INV/${b.id}`, sub: `Invoice · ${state.jamaah.find(j => j.id === b.jamaahId)?.name}`, href: `/admin/invoice/${b.id}`, slug: "invoice" }]),
    ...state.departures.map(d => ({ name: d.id, sub: `Keberangkatan · ${d.date}`, href: `/admin/keberangkatan/${d.id}`, slug: "keberangkatan" })),
    ...state.agents.map(a => ({ name: a.name, sub: `Agen · ${a.id}`, href: `/admin/agen/${a.id}`, slug: "agen" })),
  ].filter(r => canAccessRoute(access.role, r.slug) && `${r.name} ${r.sub}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12);
  const navContent = <><Link href="/admin/dashboard" className="admin-brand" onClick={() => setMobile(false)}><Image src="/logo-mark.png" width={25} height={38} alt="" /><span>hasta<span className="brand-sub">TRAVEL WORKSPACE</span></span></Link><div className="workspace-select"><span className="workspace-icon">H</span><div><b>Hasta Travel</b><small>Akses demo · {role.shortLabel}</small></div><ChevronDown size={14} /></div><nav aria-label="Navigasi admin">{navigation.map(g => <section className="nav-group" key={g.group}><p>{g.group}</p>{g.items.map(([slug, label, icon]) => { const Icon = icons[icon]; return <Link key={slug} title={collapsed ? label : undefined} href={`/admin/${slug}`} aria-current={current === slug ? "page" : undefined} onClick={() => setMobile(false)}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{slug === "crm" && <small>{state.leads.filter(l => l.stage === "Lead Baru").length}</small>}</Link>; })}</section>)}</nav><div className="sidebar-bottom"><Link href="/admin/login?switch=1" className="switch-role-link" onClick={() => setMobile(false)}><Repeat2 size={16} /><span>Ganti akses demo</span></Link><Link href="/" target="_blank"><Globe size={16} /><span>Lihat website</span><ArrowUpRight size={14} /></Link><small>Powered by Kalsara Studio</small></div></>;
  return <div className={`admin-shell ${collapsed ? "collapsed" : ""}`}>
    <a className="admin-skip" href="#admin-content">Lewati navigasi</a>
    <aside className="admin-sidebar">{navContent}</aside>
    {mobile && <Modal title="Navigasi workspace" onClose={() => setMobile(false)}><div className="mobile-nav">{navContent}</div></Modal>}
    <div className="admin-workspace"><header className="admin-topbar"><button className="icon-button desktop-only" aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}</button><button className="icon-button mobile-only" aria-label="Buka navigasi" onClick={() => setMobile(true)}><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={13} /><b>{moduleTitle(current)}</b></div><button className="global-search" onClick={() => setSearch(true)}><Search size={16} /><span>Cari di workspace…</span><kbd>⌘ K</kbd></button><Link href="/admin/login?switch=1" className="role-pill" title="Akses demo tanpa kata sandi, bukan keamanan produksi. Klik untuk mengganti akses."><span className="role-pill-prefix">Akses demo · </span>{role.shortLabel}</Link>{canAccessRoute(access.role, "notifikasi") && <Link className="icon-button notification-button" href="/admin/notifikasi" aria-label={`${state.notifications.filter(n => !n.read).length} notifikasi belum dibaca`}><Bell size={19} />{state.notifications.some(n => !n.read) && <i />}</Link>}<div className="profile-wrap"><button className="profile-button" aria-expanded={profile} aria-label={`Menu profil ${firstName}`} onClick={() => setProfile(!profile)}><Avatar name={actor.name} /><div><b>{firstName}</b><small>{role.shortLabel}</small></div><ChevronDown size={14} /></button>{profile && <div className="admin-dropdown"><p className="dropdown-identity"><b>{actor.name}</b><small>{role.label} · {actor.id}</small></p><Link href="/admin/login?switch=1" onClick={() => setProfile(false)}><Repeat2 size={16} />Ganti akses demo</Link>{canAccessRoute(access.role, "settings") && <Link href="/admin/settings" onClick={() => setProfile(false)}><Settings size={16} />Pengaturan workspace</Link>}{can("demo.reset") && <button onClick={() => { setConfirmReset(true); setProfile(false); }}><RotateCcw size={16} />Reset data demo</button>}<form action={logout}><button><LogOut size={16} />Keluar</button></form></div>}</div></header>
      <main id="admin-content" className="admin-content"><div className="workspace-bar"><span><span className="live-dot" />Workspace operasional · {role.label}</span>{creatable.length > 0 && <div className="quick-wrap"><button className="admin-button primary" aria-expanded={quick} onClick={() => setQuick(!quick)}><Plus size={16} />Tambah<ChevronDown size={14} /></button>{quick && <div className="admin-dropdown">{creatable.map(k => <button key={k} onClick={() => { setQuick(false); setCreate(k); }}><Plus size={14} />{k === "Pembayaran" ? "Catat pembayaran" : `Tambah ${k.toLowerCase()}`}</button>)}</div>}</div>}</div>{children}<footer className="admin-footer"><span>Hasta Travel Workspace</span><span><CircleHelp size={13} /> Showcase oleh Kalsara Digital Studio · Akses demo, bukan keamanan produksi</span></footer></main>
    </div>
    {search && <Modal title="Cari di workspace" onClose={() => setSearch(false)}><label className="search-dialog-input"><Search size={20} /><input autoFocus value={query} placeholder="Nama jamaah, booking, paket, invoice…" onChange={e => setQuery(e.target.value)} aria-label="Pencarian global" /><button aria-label="Hapus pencarian" onClick={() => setQuery("")}><X size={15} /></button></label><div className="search-results">{results.map(r => <Link key={r.href} href={r.href} onClick={() => setSearch(false)}><Search size={16} /><span><b>{r.name}</b><small>{r.sub}</small></span><ChevronRight size={15} /></Link>)}{!results.length && <Empty />}</div></Modal>}
    {create && <CreateForm kind={create} onClose={() => setCreate(null)} />}
    {confirmReset && <Confirm title="Reset data demo?" text="Seluruh perubahan demo tersimpan di browser ini akan diganti dengan data awal. Tindakan ini tidak dapat dibatalkan." onClose={() => setConfirmReset(false)} onConfirm={reset} />}
  </div>;
}
