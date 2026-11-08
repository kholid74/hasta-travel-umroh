import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/auth";
import { canAccessRoute } from "@/lib/admin/access";
import { adminRoutes } from "@/content/admin/navigation";
import { AdminScreen } from "@/components/admin/AdminScreen";
import { AccessDenied } from "@/components/admin/AccessDenied";

const DETAIL_ROUTES = ["jamaah", "paket", "booking", "invoice", "keberangkatan", "agen", "hpp", "haji-khusus"];

export default async function AdminModulePage({ params }: { params: Promise<{ path: string[] }> }) {
  // Checked per page: layouts do not re-render on client navigation.
  const session = await requireSession("staff");
  const { path } = await params;
  if (!adminRoutes.includes(path[0]) || path.length > 2 || (path.length === 2 && !DETAIL_ROUTES.includes(path[0]))) notFound();
  if (!canAccessRoute(session.role, path[0])) return <AccessDenied role={session.role} slug={path[0]} />;
  return <AdminScreen key={path.join("/")} module={path[0]} id={path[1]} />;
}
