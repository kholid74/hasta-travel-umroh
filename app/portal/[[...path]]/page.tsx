import { redirect } from "next/navigation";
import { requireSession } from "@/lib/admin/auth";
import { homeFor } from "@/lib/admin/access";
import { portalSlug, roles } from "@/content/admin/roles";
import { PortalScreen } from "@/components/portal/PortalScreen";

export default async function PortalPage({ params }: { params: Promise<{ path?: string[] }> }) {
  // Checked per page: a portal role may only open its own portal.
  const session = await requireSession("portal");
  const { path = [] } = await params;
  const own = portalSlug[session.role];
  const section = path[1] ?? "";
  const known = (roles[session.role].portalTabs ?? []).some(t => t.id === section);
  if (path[0] !== own || path.length > 2 || !known) redirect(homeFor(session.role));
  return <PortalScreen key={section} section={section} />;
}
