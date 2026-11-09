"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, Award, CircleCheck, FileText, Home, Menu, Network, Plane, Repeat2, Users, Wallet, type LucideIcon } from "lucide-react";
import { portalSlug, roles } from "@/content/admin/roles";
import { useDemo } from "@/components/admin/Store";

const icons: Record<string, LucideIcon> = { home: Home, users: Users, wallet: Wallet, network: Network, menu: Menu, check: CircleCheck, alert: AlertTriangle, file: FileText, plane: Plane, award: Award };

/** Mobile-first shell for Agent, Tour Leader and Pilgrim portals (M3.1 foundation). */
export function PortalShell({ children }: { children: React.ReactNode }) {
  const { access, actor } = useDemo();
  const role = roles[access.role];
  const base = `/portal/${portalSlug[access.role]}`;
  const path = usePathname();
  const tabs = (role.portalTabs ?? []).map(t => ({ ...t, href: t.id ? `${base}/${t.id}` : base, Icon: icons[t.icon] ?? Home }));
  const active = (href: string) => path === href;
  const nav = (className: string, label: string) => <nav className={className} aria-label={label}>{tabs.map(t => <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}><t.Icon size={20} strokeWidth={1.8} aria-hidden="true" /><span>{t.label}</span></Link>)}</nav>;
  return <div className="portal-shell">
    <a className="admin-skip" href="#portal-content">Lewati navigasi</a>
    <header className="portal-topbar">
      <Link href={base} className="portal-brand"><Image src="/logo-mark.png" width={22} height={34} alt="" /><span><b>{role.label}</b><small>{actor.name}</small></span></Link>
      {nav("portal-topnav", "Navigasi portal")}
      <Link href="/admin/login?switch=1" className="role-pill portal-pill" title="Akses demo tanpa kata sandi, bukan keamanan produksi.">Demo · <Repeat2 size={13} aria-hidden="true" /> Ganti</Link>
    </header>
    <main id="portal-content" className="portal-content">{children}</main>
    {nav("portal-bottomnav", "Navigasi bawah")}
  </div>;
}
