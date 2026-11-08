import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { fotoKaabaHaji } from "@/content/photos";
import { linkWa } from "@/lib/whatsapp";
import { Kredit } from "./Motif";

/**
 * Hero (PUBLIC-02A-R). A wide photograph of the Ka'bah carries the destination; the headline sits on
 * a solid forest panel with an arched top (motif 2) that overlaps the photo's lower edge, below the
 * Ka'bah, so the subject is never covered. No overlay, no gradient.
 */
export function HomeHero() {
  return (
    <section aria-labelledby="hero-judul" className="relative">
      <div className="relative h-[300px] sm:h-[420px] lg:h-[520px]">
        <Image
          src={fotoKaabaHaji.src}
          alt={fotoKaabaHaji.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_40%] lg:object-[50%_64%]"
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-4 sm:px-6">
        <div className="relative -mt-16 grid gap-6 sm:-mt-28 lg:grid-cols-[minmax(0,640px)_1fr] lg:items-end lg:gap-14">
          <div className="relative rounded-b-card rounded-t-[50%_72px] bg-background px-6 pb-9 pt-14 sm:rounded-t-[50%_110px] sm:px-10 sm:pb-11 sm:pt-20">
            {/* Gold hairline following the arch: the panel reads as a niche, not a box. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-2.5 rounded-b-[6px] rounded-t-[50%_64px] border border-primary/35 sm:inset-3.5 sm:rounded-t-[50%_100px]"
            />
            <h1 id="hero-judul" className="relative text-center text-[clamp(2.6rem,7.5vw,4.25rem)] leading-[1.02] [text-wrap:balance]">
              Perjalanan Dimulai dari Sebuah <em className="italic text-primary">Niat</em>.
            </h1>
            <p className="relative mx-auto mt-5 max-w-[36rem] text-center leading-relaxed text-ink/90 sm:text-lg">
              Kami bantu Anda dan keluarga menyiapkan Umrah dengan tenang: paket yang jelas biayanya, hotel yang jaraknya ke
              masjid tertulis, dan pembimbing yang menemani dari manasik sampai pulang.
            </p>
            <div className="relative mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center" data-sticky-hide>
              <Link
                href="/paket-umroh"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary transition-colors hover:bg-primary-hover"
              >
                Lihat Paket Umrah
                <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </Link>
              <a
                href={linkWa({ kind: "umum" })}
                target="_blank"
                rel="noopener noreferrer"
                data-wa-source="hero"
                data-wa-audience="operator"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold transition-colors hover:border-ink/70"
              >
                <WhatsAppIcon className="size-5" />
                Konsultasi via WhatsApp
              </a>
            </div>
            <p className="relative mt-5 text-center text-sm text-muted" data-demo-note="umum">
              Situs demonstrasi: data travel fiktif, WhatsApp ke nomor contoh.{" "}
              <a href="#tentang-demo" className="underline underline-offset-4 hover:text-ink">Tentang demo ini</a>
            </p>
          </div>

          <div className="pb-2 lg:pb-8">
            <Link
              href="/haji-khusus"
              className="group hidden max-w-[26rem] border-l-2 border-primary/60 py-1 pl-5 lg:block"
            >
              <span className="font-display text-2xl leading-tight group-hover:text-primary">Berencana Haji Khusus?</span>
              <span className="mt-1 block text-sm text-muted">
                Pendaftarannya lewat antrean nomor porsi, bukan tanggal. Lihat cara kerjanya
                <ArrowRight aria-hidden className="ml-1 inline size-4 align-[-3px]" strokeWidth={2} />
              </span>
            </Link>
            <p className="text-xs text-muted lg:mt-8">
              Ka&apos;bah di Masjidil Haram, Makkah. Foto: <Kredit foto={fotoKaabaHaji} />
            </p>
          </div>
        </div>
      </div>
      <div className="h-12 sm:h-16" aria-hidden />
    </section>
  );
}
