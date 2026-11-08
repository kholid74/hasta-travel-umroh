"use server";
import { redirect } from "next/navigation";
import { isRole, roles } from "@/content/admin/roles";
import { createSession, deleteSession } from "@/lib/admin/auth";
import { PERSONA_PATTERN } from "@/lib/admin/session-token";

/**
 * Demo gateway: enter a role without credentials. Demo access only — not production authentication.
 * Only the session cookie changes; browser demo data (localStorage) is never touched here.
 */
export async function enterDemo(_state: { error: string }, form: FormData) {
  const role = form.get("role");
  if (!isRole(role)) return { error: "Pilih salah satu akses demo yang tersedia." };
  const persona = String(form.get("persona") || roles[role].persona.defaultId);
  if (!PERSONA_PATTERN.test(persona)) return { error: "Persona demo tidak valid. Pilih ulang persona." };
  if (!await createSession(role, persona)) {
    return { error: "Sesi belum dikonfigurasi. Atur ADMIN_SESSION_SECRET minimal 32 karakter pada server." };
  }
  redirect(roles[role].home);
}
export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
