import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  fotoJendelaNabawi, fotoKaabaDekat, fotoKaabaHaji, fotoKubahHijau, fotoPayungNabawi, fotoTendaMina,
} from "@/content/photos";
import { linkWa } from "@/lib/whatsapp";
import { Kredit, Ornamen } from "./Motif";

/**
 * Closing call (PUBLIC-02A-R) on the forest frame: Masjid Nabawi seen through an eight-point star
 * window, in an arched frame over a low-contrast star panel (motifs 1 and 2). Ends with every photo credit.
 */
export function ClosingCta() {
  return (
    <section aria-labelledby="penutup-judul" className="overflow-hidden" data-sticky-hide>
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-16 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
        <div>
          <Ornamen className="text-primary" />
          <h2 id="penutup-judul" className="mt-5 max-w-[16ch] text-4xl sm:text-6xl sm:leading-[1.04]">
            Siap meniatkan perjalanan ke Tanah Suci?
          </h2>
          <p className="mt-6 max-w-[34rem] text-lg text-ink/90">
            Ceritakan siapa yang akan berangkat, bulan yang Anda incar, dan kebutuhan khusus seperti kursi roda. Kami bantu
            memilih paket yang sesuai, tanpa harus memutuskan hari ini.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={linkWa({ kind: "umum" })}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="cta-akhir"
              data-wa-audience="operator"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary transition-colors hover:bg-primary-hover"
            >
              <WhatsAppIcon className="size-5" />
              Konsultasi via WhatsApp
            </a>
            <Link
              href="/jadwal-keberangkatan"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold transition-colors hover:border-ink/70"
            >
              Lihat jadwal keberangkatan
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </div>
          <WaDemoNote className="mt-4" />
        </div>

        <figure className="relative mx-auto w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[420px]">
          <div aria-hidden className="motif-bintang-gelap bingkai-lengkung absolute -bottom-5 -right-5 left-8 top-8" />
          <div className="bingkai-lengkung relative aspect-[3/4] border border-primary/40">
            <Image src={fotoJendelaNabawi.src} alt={fotoJendelaNabawi.alt} fill sizes="(min-width: 1024px) 420px, 380px" className="object-cover object-[50%_45%]" />
          </div>
        </figure>
      </div>

      <div className="mx-auto w-full max-w-[1200px] border-t border-hairline px-4 py-6 sm:px-6">
        <p className="text-xs leading-relaxed text-muted" data-photo-credits>
          Kredit foto (Wikimedia Commons): <Kredit label="Ka'bah saat haji" foto={fotoKaabaHaji} /> ·{" "}
          <Kredit label="Pintu Ka'bah" foto={fotoKaabaDekat} /> · <Kredit label="Pelataran Nabawi" foto={fotoPayungNabawi} /> ·{" "}
          <Kredit label="Kubah Hijau" foto={fotoKubahHijau} /> · <Kredit label="Tenda Mina" foto={fotoTendaMina} /> ·{" "}
          <Kredit label="Nabawi dari jendela bintang" foto={fotoJendelaNabawi} />
        </p>
      </div>
    </section>
  );
}
