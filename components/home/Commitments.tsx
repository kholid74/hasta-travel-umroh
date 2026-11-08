import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Bus, Footprints, Luggage, UsersRound, UtensilsCrossed } from "lucide-react";
import { fotoPayungNabawi } from "@/content/photos";
import { Kredit, Ornamen } from "./Motif";

/**
 * Service benefits (PUBLIC-02A-R). Each line restates an item from the package facilities list
 * (content/packages.ts) or a rule the site enforces — no adjectives, no achievements.
 */
const LAYANAN = [
  { ikon: BookOpen, judul: "Manasik sebelum berangkat", isi: "Latihan tata cara Umrah bersama pembimbing, supaya tidak ada yang menebak-nebak di Tanah Suci." },
  { ikon: UsersRound, judul: "Pembimbing berbahasa Indonesia", isi: "Mendampingi ibadah dan ziarah selama perjalanan." },
  { ikon: UtensilsCrossed, judul: "Makan tiga kali sehari", isi: "Menu Indonesia selama di Makkah dan Madinah." },
  { ikon: Bus, judul: "Bus ber-AC", isi: "Untuk seluruh perpindahan kota dan ziarah." },
  { ikon: Luggage, judul: "Perlengkapan disiapkan", isi: "Koper, tas, kain ihram atau mukena, dan kartu identitas rombongan." },
  { ikon: Footprints, judul: "Rute hotel ke masjid dijelaskan", isi: "Jarak, tipe akses, dan apakah bebas tangga — penting bagi jamaah lansia dan pengguna kursi roda." },
];

export function Commitments() {
  return (
    <section aria-labelledby="komitmen-judul" className="mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <figure className="lg:sticky lg:top-8 lg:self-start">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card lg:aspect-[4/5]">
            <Image src={fotoPayungNabawi.src} alt={fotoPayungNabawi.alt} fill sizes="(min-width: 1024px) 440px, 100vw" className="object-cover object-[45%_50%]" />
          </div>
          <figcaption className="mt-2 text-xs text-muted">
            Pelataran Masjid Nabawi, Madinah. Foto: <Kredit foto={fotoPayungNabawi} />
          </figcaption>
        </figure>

        <div>
          <Ornamen className="text-gold-ink" />
          <h2 id="komitmen-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">
            Didampingi sejak manasik sampai pulang
          </h2>
          <p className="mt-4 max-w-[36rem] text-muted">
            Yang termasuk di setiap paket Umrah, supaya Anda bisa fokus beribadah dan keluarga di rumah tenang.
          </p>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
            {LAYANAN.map(({ ikon: Ikon, judul, isi }) => (
              <li key={judul} className="flex gap-4 border-t border-hairline py-5">
                <Ikon aria-hidden className="mt-1 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                <div>
                  <p className="font-semibold">{judul}</p>
                  <p className="mt-1 text-sm text-muted">{isi}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link href="/paket-umroh/umroh-ramah-lansia-12-hari#termasuk" className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-emerald underline underline-offset-4 hover:text-ink">
            Lihat contoh fasilitas lengkap sebuah paket
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
