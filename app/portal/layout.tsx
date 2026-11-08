import type { Metadata } from "next";
import "../admin/admin.css";
import { requireSession } from "@/lib/admin/auth";
import { DemoProvider } from "@/components/admin/Store";
import { PortalShell } from "@/components/portal/PortalShell";

export const metadata: Metadata = { title: "Portal · Hasta Travel", robots: { index: false, follow: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("portal");
  return <div className="admin-app portal-app">
    <DemoProvider key={`${session.role}:${session.personaId}`} access={{ role: session.role, personaId: session.personaId }}><PortalShell>{children}</PortalShell></DemoProvider>
  </div>;
}
