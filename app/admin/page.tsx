import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/auth";
import { homeFor } from "@/lib/admin/access";
export default async function AdminPage() {
  const session = await getSession();
  redirect(session ? homeFor(session.role) : "/admin/login");
}
