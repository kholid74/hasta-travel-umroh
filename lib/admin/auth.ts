import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSession, validSession } from "./session-token";

// Development-only fallback; deployments share a stable secret across workers.
const localSecret = randomBytes(32).toString("hex");
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  return process.env.NODE_ENV === "production" ? null : localSecret;
}
const COOKIE = "hasta_admin_session";
export async function getSession() {
  const key = secret();
  const token = (await cookies()).get(COOKIE)?.value;
  return key && token && validSession(token, key) ? { name: "Ahmad", role: "Owner" } : null;
}
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
export async function createSession(remember: boolean) {
  const key = secret();
  if (!key) return false;
  const duration = (remember ? 30 * 24 : 8) * 3600;
  (await cookies()).set(COOKIE, signSession(Date.now() + duration * 1000, key), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/admin", ...(remember ? { maxAge: duration } : {}),
  });
  return true;
}
export async function deleteSession() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/admin", maxAge: 0 });
}
