"use client";
import { useEffect, useState } from "react";
import { businessToday } from "@/lib/departures";

/**
 * Jakarta business date on the client (PUBLIC-01).
 * First render uses the server's value so hydration matches the static/ISR HTML; after mount the
 * visitor's current date takes over, so a cached page can never present a past departure as open.
 * Re-checked when the tab becomes visible again (e.g. a page left open overnight).
 */
export function useBusinessToday(serverToday: string) {
  const [today, setToday] = useState(serverToday);
  useEffect(() => {
    const update = () => setToday(businessToday());
    update();
    const onVisible = () => { if (document.visibilityState === "visible") update(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);
  return today;
}
