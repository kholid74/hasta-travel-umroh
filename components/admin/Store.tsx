"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, X, CircleAlert } from "lucide-react";
import type { DemoState } from "@/content/admin/types";
import { roles, type Permission, type UserRole } from "@/content/admin/roles";
import { createSeed } from "@/content/admin/seed";
import { uid } from "@/lib/admin/model";
import { can } from "@/lib/admin/access";
import { DEMO_STORAGE_KEY, decodeDemo, encodeDemo } from "@/lib/admin/persistence";

import { assertInventoryHistory, validateInventory } from "@/lib/admin/inventory";

/** Session data passed from the server layout. Demo access only — not production authorisation. */
export type DemoAccess = { role: UserRole; personaId: string };
export type Actor = { id: string; name: string; role: UserRole; found: boolean };
type Store = {
  state: DemoState; resetVersion: number; access: DemoAccess; actor: Actor;
  can: (permission: Permission) => boolean;
  transact: (fn: (draft: DemoState) => void, message: string, module?: string, permission?: Permission) => boolean;
  notify: (message: string, error?: boolean) => void; reset: () => void;
};
const Context = createContext<Store | null>(null);

/** Resolve the display name of the current persona from demo data (staff, agent or pilgrim). */
export function resolveActor(state: DemoState, access: DemoAccess): Actor {
  const kind = roles[access.role].persona.kind;
  const record = kind === "agent" ? state.agents.find(a => a.id === access.personaId)
    : kind === "pilgrim" ? state.jamaah.find(j => j.id === access.personaId)
    : state.users.find(u => u.id === access.personaId);
  return { id: access.personaId, name: record?.name ?? roles[access.role].label, role: access.role, found: Boolean(record) };
}

export function DemoProvider({ children, access = { role: "SUPERADMIN", personaId: "USR-1" } }: { children: React.ReactNode; access?: DemoAccess }) {
  const [state, setState] = useState(createSeed);
  const [resetVersion, setResetVersion] = useState(0);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const current = useRef(state);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const actor = resolveActor(state, access);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_STORAGE_KEY);
      if (stored) {
        const restored = decodeDemo(stored);
        current.current = restored;
        // Restore browser-only state before mounting forms with local draft state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(restored);
      }
    } catch (error) { setStorageError(error instanceof Error ? error.message : "Penyimpanan browser tidak tersedia."); }
    setReady(true);
  }, []);
  useEffect(() => { if (toast) toastRef.current?.showPopover(); }, [toast]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function notify(message: string, error = false) {
    clearTimeout(timer.current);
    setToast({ message, error });
    timer.current = setTimeout(() => setToast(null), 5000);
  }
  const allowed = (permission: Permission) => can(access.role, permission);
  function transact(fn: (draft: DemoState) => void, message: string, module = "Operasional", permission?: Permission) {
    // Default rule: a mutation needs write access to the module currently on screen.
    const slug = pathname.startsWith("/admin/") ? pathname.split("/")[2] : "";
    const needed: Permission = permission ?? `${slug}:write`;
    if (!allowed(needed)) {
      notify(`Akses demo ${roles[access.role].label} tidak mencakup tindakan ini. Gunakan "Ganti akses demo" untuk mencoba peran lain.`, true);
      return false;
    }
    try {
      const next = structuredClone(current.current);
      fn(next);
      assertInventoryHistory(current.current, next);
      validateInventory(next);
      next.activities.unshift({ id: uid("ACT"), date: new Date().toISOString(), user: resolveActor(next, access).name, module, action: message });
      try { localStorage.setItem(DEMO_STORAGE_KEY, encodeDemo(next)); }
      catch { throw new Error("Perubahan belum disimpan: penyimpanan browser penuh atau diblokir. Izinkan penyimpanan, lalu coba lagi."); }
      current.current = next;
      setState(next);
      notify(message);
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : "Perubahan tidak dapat disimpan.", true); return false; }
  }
  function reset() {
    try {
      const seed = createSeed(); localStorage.setItem(DEMO_STORAGE_KEY, encodeDemo(seed));
      current.current = seed; setState(seed); setStorageError(""); setResetVersion(v => v + 1); notify("Data demo dikembalikan ke kondisi awal.");
    } catch { notify("Reset belum tersimpan: izinkan penyimpanan browser atau kosongkan ruang, lalu coba lagi.", true); }
  }
  return <Context.Provider value={{ state, resetVersion, access, actor, can: allowed, transact, notify, reset }}>{!ready ? <p className="admin-notice" role="status">Memuat data demo tersimpan…</p> : storageError ? <div className="panel-body stack"><p role="alert" className="form-error">{storageError}</p><button className="admin-button" onClick={() => { if (window.confirm("Hapus perubahan demo tersimpan dan kembali ke data awal?")) reset(); }}>Reset data demo</button></div> : children}{toast && <div ref={toastRef} popover="manual" className={`admin-toast ${toast.error ? "error" : ""}`} role={toast.error ? "alert" : "status"}>{toast.error ? <CircleAlert size={20} /> : <CheckCircle2 size={20} />}<span>{toast.message}</span><button aria-label="Tutup notifikasi" onClick={() => setToast(null)}><X size={16} /></button></div>}</Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error("DemoProvider diperlukan"); return value; }

/**
 * UI affordances for the module on screen (M3.1-R): `writable` hides or disables mutation controls,
 * `canOpen` hides cross-links to modules the role cannot open. This is presentation only — every
 * mutation is still enforced centrally by `transact` (and is not a security boundary).
 */
export function useModuleAccess() {
  const { can } = useDemo();
  const slug = usePathname().split("/")[2] ?? "";
  return { writable: can(`${slug}:write`), canOpen: (module: string) => can(`${module}:read`), can };
}
