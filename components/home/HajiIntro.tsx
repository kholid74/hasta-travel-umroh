import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { hajiPackages } from "@/content/haji";
import { fotoTendaMina } from "@/content/photos";
import { dolar } from "@/lib/format";
import { linkWa } from "@/lib/whatsapp";
import { Kredit, Ornamen } from "./Motif";

/** How Haji Khusus registration differs from Umrah, in three steps. Waiting time is never promised. */
const ALUR_HAJI = [
  { judul: "Setoran awal", isi: "Untuk mendaftarkan nomor porsi." },
  { judul: "Nomor porsi & menunggu", isi: "Tahun berangkat mengikuti kuota tahunan." },
  { judul: "Pelunasan & berangkat", isi: "Dicicil sampai tahun keberangkatan." },
];

/**
 * Haji Khusus entry (PUBLIC-02A-R). Editorial split on a sand band; the Mina tent city (a Hajj-only
 * place) in an arched frame keeps the offer visually distinct from Umrah. Mujamalah stays a separate path.
 */
export function HajiIntro() {
  const khusus = hajiPackages.filter((p) => p.kategori === "khusus");
  return (
    <section aria-labelledby="haji-judul" className="band-sand">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <figure className="mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-none">
          <div className="bingkai-lengkung relative aspect-[1/1] sm:aspect-[4/5] border-[6px] border-paper shadow-[0_12px_32px_-18px_rgba(23,33,28,0.5)]">
            <Image src={fotoTendaMina.src} alt={fotoTendaMina.alt} fill sizes="(min-width: 1024px) 440px, 90vw" className="object-cover object-[60%_50%]" />
          </div>
          <figcaption className="mt-3 text-center text-xs text-muted">
            Tenda jamaah di Mina. Foto: <Kredit foto={fotoTendaMina} />
          </figcaption>
        </figure>

        <div>
          <Ornamen className="text-gold-ink" />
          <h2 id="haji-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">
            Haji Khusus: mendaftar antrean, bukan memilih tanggal
          </h2>
          <p className="mt-5 max-w-[36rem]">
            Tahun keberangkatan haji ditentukan kuota yang ditetapkan pemerintah setiap tahun, jadi hanya bisa
            diperkirakan. Harga dikutip dalam dolar AS.
          </p>

          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {ALUR_HAJI.map((l, i) => (
              <li key={l.judul} className="border-t-2 border-emerald/70 pt-3">
                <span className="text-xs font-semibold text-emerald">Langkah {i + 1}</span>
                <p className="mt-1 font-semibold">{l.judul}</p>
                <p className="mt-0.5 text-sm text-muted">{l.isi}</p>
              </li>
            ))}
          </ol>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2" data-haji-khusus-list>
            {khusus.map((p) => (
              <li key={p.id} className="rounded-card border border-hairline bg-paper p-4">
                <p className="font-display text-2xl leading-tight">{p.name}</p>
                <p className="mt-1 text-sm tabular-nums">
                  {dolar(p.priceUSD)} <span className="text-muted">· setoran awal {dolar(p.dpUSD)}</span>
                </p>
                <p className="mt-1 text-sm text-muted">Perkiraan masa tunggu ± {p.waitingYears} tahun*</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-[36rem] text-xs text-muted">
            * Angka contoh pada situs demo. Masa tunggu sebenarnya mengikuti kuota tahunan dan dapat bergeser; tidak ada
            travel yang bisa menjanjikan tahun keberangkatan.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/haji-khusus"
              className="inline-flex min-h-12 items-center gap-2 rounded-card bg-forest px-6 font-semibold text-ivory transition-colors hover:bg-emerald"
            >
              Pelajari Haji Khusus
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
            <a
              href={linkWa({ kind: "haji", kategori: "khusus" })}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="home-haji"
              data-wa-audience="operator"
              className="inline-flex min-h-12 items-center gap-2 rounded-card border border-forest/40 px-6 font-semibold text-forest transition-colors hover:border-forest"
            >
              <WhatsAppIcon className="size-5" />
              Tanya masa tunggu
            </a>
          </div>
          <p className="mt-5 text-sm text-muted">
            Mencari Haji Mujamalah (visa undangan, tanpa nomor porsi)? Jalurnya berbeda dan dijelaskan terpisah di{" "}
            <Link href="/haji-khusus#haji-mujamalah" className="font-semibold text-emerald underline underline-offset-4 hover:text-ink">halaman Haji</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
