import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/auth";
export default async function AdminPage() {
  redirect(await getSession() ? "/admin/dashboard" : "/admin/login");
}
