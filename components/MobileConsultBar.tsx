"use client";

import { usePathname } from "next/navigation";
import { StickyBar } from "@/components/StickyBar";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { audienceOf, consultContextForPath, linkWa } from "@/lib/whatsapp";

/**
 * Persistent operator consultation entry on phones (PUBLIC-01, reworked in PUBLIC-02B). Package detail
 * pages render their own date-aware bar, so this one stays out of the way there: one sticky action per page.
 */
export function MobileConsultBar() {
  const pathname = usePathname();
  if (/^\/paket-umroh\/[^/]+/.test(pathname)) return null;
  const context = consultContextForPath(pathname);
  const haji = context.kind === "haji";
  return (
    <StickyBar kind="umum" breakpoint="md">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm leading-snug">
          {haji ? "Ingin tahu masa tunggu Haji Khusus?" : "Ada pertanyaan soal paket?"}
          <span className="block text-xs text-muted">Demo · nomor contoh Kalsara</span>
        </p>
        <a
          href={linkWa(context)}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="sticky-umum"
          data-wa-audience={audienceOf(context)}
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
        >
          <WhatsAppIcon />
          Konsultasi
        </a>
      </div>
    </StickyBar>
  );
}
