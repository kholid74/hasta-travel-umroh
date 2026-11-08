import Link from "next/link";
import { ArrowRight, Landmark } from "lucide-react";
import { labelIzin } from "@/components/TrustSection";

/** Compact legal / anti-fraud facts on a sand strip between the hero and the finder. No badges. */
export function TrustStrip() {
  return (
    <section aria-label="Legalitas dan keamanan pembayaran" className="band-sand border-y border-hairline">
      <ul className="mx-auto grid w-full max-w-[1200px] gap-x-10 gap-y-3 px-4 py-5 text-sm sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
        <li className="text-muted">{labelIzin("PPIU")}</li>
        <li className="flex items-start gap-2.5 lg:border-l lg:border-hairline lg:pl-10">
          <Landmark aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald" strokeWidth={1.75} />
          <span>Pembayaran hanya ke rekening atas nama perusahaan, bukan ke rekening pribadi siapa pun.</span>
        </li>
        <li>
          <Link
            href="/tentang#legalitas"
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-emerald underline underline-offset-4 hover:text-ink"
          >
            Cara memeriksa izin travel
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </li>
      </ul>
    </section>
  );
}
