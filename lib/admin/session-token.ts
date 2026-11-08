import { createHmac, timingSafeEqual } from "node:crypto";
import { isRole, type UserRole } from "@/content/admin/roles";

/** Demo session decoded from the signed cookie. Never stored in DemoState. */
export type DemoSession = { version: 2; role: UserRole; personaId: string; expires: number; legacy?: true };

const MAX_AGE_MS = 30 * 86400000;
const hmac = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("hex");
const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
export const PERSONA_PATTERN = /^[A-Za-z0-9-]{1,48}$/;

// Legacy (pre-M3.1) token: single demo owner account. Still accepted and mapped to Superadmin.
export function signSession(expires: number, secret: string) {
  const payload = `hasta-demo-owner.${expires}`;
  return `${payload}.${hmac(payload, secret)}`;
}
export function validSession(token: string, secret: string, now = Date.now()) {
  if (!/^hasta-demo-owner\.\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const expires = Number(token.split(".")[1]);
  if (expires <= now || expires > now + MAX_AGE_MS) return false;
  return same(token, signSession(expires, secret));
}

// V2 token: hasta-demo.v2.<ROLE>.<personaId>.<expires>.<hmac>
export function signDemoSession(session: { role: UserRole; personaId: string; expires: number }, secret: string) {
  if (!isRole(session.role) || !PERSONA_PATTERN.test(session.personaId) || !Number.isSafeInteger(session.expires)) throw new Error("Sesi demo tidak valid.");
  const payload = `hasta-demo.v2.${session.role}.${session.personaId}.${session.expires}`;
  return `${payload}.${hmac(payload, secret)}`;
}
export function readDemoSession(token: string, secret: string, now = Date.now()): DemoSession | null {
  const match = /^hasta-demo\.v2\.([A-Z_]+)\.([A-Za-z0-9-]{1,48})\.(\d{13})\.([a-f0-9]{64})$/.exec(token);
  if (!match || !isRole(match[1])) return null;
  const expires = Number(match[3]);
  if (expires <= now || expires > now + MAX_AGE_MS) return null;
  if (!same(token, signDemoSession({ role: match[1], personaId: match[2], expires }, secret))) return null;
  return { version: 2, role: match[1], personaId: match[2], expires };
}
/** Legacy owner token → Superadmin persona USR-1 (full access, as before M3.1). */
export function readLegacySession(token: string, secret: string, now = Date.now()): DemoSession | null {
  return validSession(token, secret, now) ? { version: 2, role: "SUPERADMIN", personaId: "USR-1", expires: Number(token.split(".")[1]), legacy: true } : null;
}
