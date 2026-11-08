import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/content/admin/roles";
import { homeFor, isPortalRole } from "./access";
import { readDemoSession, readLegacySession, signDemoSession, type DemoSession } from "./session-token";

// Development-only fallback; deployments share a stable secret across workers.
const localSecret = randomBytes(32).toString("hex");
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (value && value.length >= 32) return value;
  return process.env.NODE_ENV === "production" ? null : localSecret;
}

/** V2 cookie covers both /admin and /portal. */
export const SESSION_COOKIE = "hasta_demo_session";
/** Pre-M3.1 cookie (path /admin). Read for compatibility, always cleared on enter/logout. */
export const LEGACY_COOKIE = "hasta_admin_session";
const SESSION_HOURS = 8;
const base = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const });

export async function getSession(): Promise<DemoSession | null> {
  // Read cookies first so routes using the session always render dynamically.
  const jar = await cookies();
  const key = secret();
  if (!key) return null;
  const current = jar.get(SESSION_COOKIE)?.value;
  if (current) return readDemoSession(current, key);
  const legacy = jar.get(LEGACY_COOKIE)?.value;
  return legacy ? readLegacySession(legacy, key) : null;
}

/**
 * Page-level guard (layouts do not re-render on navigation, so pages call this too).
 * staff  → portal roles are sent to their portal home.
 * portal → staff roles are sent to the admin dashboard.
 */
export async function requireSession(scope?: "staff" | "portal") {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (scope === "staff" && isPortalRole(session.role)) redirect(homeFor(session.role));
  if (scope === "portal" && !isPortalRole(session.role)) redirect(homeFor(session.role));
  return session;
}

/** Must run inside a Server Function (cookies can't be set while rendering). */
export async function createSession(role: UserRole, personaId: string) {
  const key = secret();
  if (!key) return false;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signDemoSession({ role, personaId, expires: Date.now() + SESSION_HOURS * 3600 * 1000 }, key), { ...base(), path: "/" });
  jar.set(LEGACY_COOKIE, "", { ...base(), path: "/admin", maxAge: 0 });
  return true;
}
export async function deleteSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", { ...base(), path: "/", maxAge: 0 });
  jar.set(LEGACY_COOKIE, "", { ...base(), path: "/admin", maxAge: 0 });
}
