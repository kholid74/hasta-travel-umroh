"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, X, CircleAlert } from "lucide-react";
import type { DemoState } from "@/content/admin/types";
import { createSeed } from "@/content/admin/seed";
import { uid } from "@/lib/admin/model";

type Store = { state: DemoState; transact: (fn: (draft: DemoState) => void, message: string, module?: string) => boolean; notify: (message: string, error?: boolean) => void; reset: () => void };
const Context = createContext<Store | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(createSeed);
  const current = useRef(state);
  const [toast, setToast] = useState<{ message: string; error: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (toast) toastRef.current?.showPopover(); }, [toast]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function notify(message: string, error = false) {
    clearTimeout(timer.current);
    setToast({ message, error });
    timer.current = setTimeout(() => setToast(null), 5000);
  }
  function transact(fn: (draft: DemoState) => void, message: string, module = "Operasional") {
    try {
      const next = structuredClone(current.current);
      fn(next);
      next.activities.unshift({ id: uid("ACT"), date: new Date().toISOString(), user: "Ahmad", module, action: message });
      current.current = next;
      setState(next);
      notify(message);
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : "Perubahan tidak dapat disimpan.", true); return false; }
  }
  function reset() { const seed = createSeed(); current.current = seed; setState(seed); notify("Data demo dikembalikan ke kondisi awal."); }
  return <Context.Provider value={{ state, transact, notify, reset }}>{children}{toast && <div ref={toastRef} popover="manual" className={`admin-toast ${toast.error ? "error" : ""}`} role={toast.error ? "alert" : "status"}>{toast.error ? <CircleAlert size={20} /> : <CheckCircle2 size={20} />}<span>{toast.message}</span><button aria-label="Tutup notifikasi" onClick={() => setToast(null)}><X size={16} /></button></div>}</Context.Provider>;
}
export function useDemo() { const value = useContext(Context); if (!value) throw new Error("DemoProvider diperlukan"); return value; }
