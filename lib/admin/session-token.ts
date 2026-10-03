import { createHmac, timingSafeEqual } from "node:crypto";

export function signSession(expires: number, secret: string) {
  const payload = `hasta-demo-owner.${expires}`;
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
export function validSession(token: string, secret: string, now = Date.now()) {
  if (!/^hasta-demo-owner\.\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const expires = Number(token.split(".")[1]);
  if (expires <= now || expires > now + 30 * 86400000) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(signSession(expires, secret)));
}
