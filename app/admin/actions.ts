"use server";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/admin/auth";

export async function login(_state: { error: string }, form: FormData) {
  if (form.get("email") !== "demo@hasta.example" || form.get("password") !== "HastaDemo2026!") {
    return { error: "Email atau kata sandi tidak sesuai. Gunakan akun demo di bawah." };
  }
  if (!await createSession(form.get("remember") === "on")) {
    return { error: "Sesi belum dikonfigurasi. Atur ADMIN_SESSION_SECRET minimal 32 karakter pada server." };
  }
  redirect("/admin/dashboard");
}
export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
