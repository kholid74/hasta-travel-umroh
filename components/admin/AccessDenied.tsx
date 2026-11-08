import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { moduleTitle } from "@/content/admin/navigation";
import { roles, type UserRole } from "@/content/admin/roles";

/** Shown (HTTP 200) when the demo role may not open a module. Demo access rule, not production security. */
export function AccessDenied({ role, slug }: { role: UserRole; slug: string }) {
  const definition = roles[role];
  return <section className="access-denied" aria-labelledby="access-denied-title">
    <span className="access-denied-icon"><ShieldAlert size={26} aria-hidden="true" /></span>
    <span className="eyebrow">AKSES DEMO · {definition.label.toUpperCase()}</span>
    <h1 id="access-denied-title">Modul {moduleTitle(slug)} tidak termasuk akses ini</h1>
    <p>Peran {definition.label} di demo ini berfokus pada: {definition.description.charAt(0).toLowerCase() + definition.description.slice(1)} Ganti akses demo untuk melihat modul ini dari sudut pandang peran lain. Data demo Anda tetap tersimpan.</p>
    <div className="admin-actions">
      <Link className="admin-button primary" href={definition.home}>Kembali ke dashboard</Link>
      <Link className="admin-button" href="/admin/login?switch=1">Ganti akses demo</Link>
    </div>
  </section>;
}
