import { notFound } from "next/navigation";
import { requireSession } from "@/lib/admin/auth";
import { adminRoutes } from "@/content/admin/navigation";
import { AdminScreen } from "@/components/admin/AdminScreen";

export default async function AdminModulePage({ params }: { params: Promise<{ path: string[] }> }) {
  await requireSession();
  const { path } = await params;
  if (!adminRoutes.includes(path[0]) || path.length > 2 || (path.length === 2 && !["jamaah", "paket", "booking", "invoice", "keberangkatan", "agen"].includes(path[0]))) notFound();
  return <AdminScreen key={path.join("/")} module={path[0]} id={path[1]} />;
}
