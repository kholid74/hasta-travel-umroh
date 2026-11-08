import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Bus, Check, FileCheck2, HandHeart, Landmark, Luggage, MessageCircle, UsersRound, UtensilsCrossed,
} from "lucide-react";
import { Kredit } from "@/components/home/Motif";
import { PenandaMeter } from "@/components/PenandaMeter";
import { CatatanDemo, JudulBagian, PageIntro, PenutupKonsultasi } from "@/components/public/ui";
import { TrustSection } from "@/components/TrustSection";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { company } from "@/content/company";
import { PASSPORT_MIN_MONTHS } from "@/content/requirements";
import { fotoJendelaNabawi, fotoPayungNabawi } from "@/content/photos";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Profil Hasta Travel (operator fiktif untuk demo): cara kami menyiapkan perjalanan Umrah dan Haji Khusus, pendampingan jamaah, komitmen layanan, dan legalitas. Situs demo.",
};

/**
 * About (PUBLIC-02C): reads as an operator profile, not a description of the website.
 * Every service statement restates the package facilities (content/packages.ts) or the FAQ; there is
 * no company history, founder, pilgrim count, testimonial, permit or team photo.
 */
const PERSIAPAN = [
  {
    ikon: MessageCircle,
    judul: "Dimulai dari kebutuhan jamaah",
    isi: "Konsultasi pertama membahas siapa yang berangkat, usia dan kondisi kesehatannya, bulan yang diinginkan, serta kebutuhan seperti kursi roda. Dari situ kami menyarankan paket dan rute hotel yang sesuai.",
  },
  {
    ikon: Landmark,
    judul: "Hotel dipilih dengan jarak yang jelas",
    isi: "Untuk jamaah lansia, jarak hotel ke masjid menentukan seberapa sering ia sanggup kembali untuk shalat berjamaah. Karena itu jarak kami tulis dalam meter, lengkap dengan tipe rute dan keterangan bebas tangga.",
  },
  {
    ikon: FileCheck2,
    judul: "Dokumen disiapkan lebih awal",
    isi: `Paspor (contoh ketentuan: berlaku minimal ${PASSPORT_MIN_MONTHS} bulan), vaksin, dan berkas lain diperiksa bersama sebelum pelunasan, supaya tidak ada yang tertinggal menjelang keberangkatan.`,
  },
  {
    ikon: BookOpen,
    judul: "Manasik sebelum berangkat",
    isi: "Jamaah berlatih tata cara Umrah bersama pembimbing, lalu menerima perlengkapan dan pengarahan terakhir sebelum terbang.",
  },
];

const PENDAMPINGAN = [
  { ikon: UsersRound, judul: "Pembimbing berbahasa Indonesia", isi: "Mendampingi ibadah dan ziarah sejak manasik sampai kembali ke Tanah Air." },
  { ikon: UtensilsCrossed, judul: "Makan tiga kali sehari", isi: "Menu Indonesia selama di Makkah dan Madinah." },
  { ikon: Bus, judul: "Bus ber-AC", isi: "Untuk seluruh perpindahan kota dan ziarah." },
  { ikon: Luggage, judul: "Perlengkapan", isi: "Koper, tas, kain ihram atau mukena, dan kartu identitas rombongan." },
  { ikon: HandHeart, judul: "Jamaah lansia dan pengguna kursi roda", isi: "Sebutkan saat konsultasi; kami sarankan paket dengan rute yang benar-benar bisa dilalui." },
];

const KOMITMEN = [
  "Jarak hotel ke masjid ditulis dalam meter, untuk hotel yang dekat maupun yang jauh.",
  "Harga ditulis per orang untuk tiga tipe kamar, per tanggal keberangkatan.",
  "Tanggal yang sudah penuh tetap ditampilkan sebagai Penuh, tidak disembunyikan.",
  "Ketentuan pembatalan dijelaskan sebelum Anda membayar, bukan sesudahnya.",
  "Pembayaran hanya ke rekening atas nama perusahaan.",
];

export default function TentangPage() {
  return (
    <main>
      <PageIntro
        foto={fotoJendelaNabawi}
        posisiFoto="object-[50%_45%]"
        judul={<>Tentang <em className="italic text-primary">{company.name}</em></>}
        lead={
          <p>
            Biro perjalanan Umrah dan Haji Khusus yang mendampingi jamaah beserta keluarganya, dari konsultasi pertama
            sampai kembali ke Tanah Air. {company.tagline}.
          </p>
        }
      >
        <CatatanDemo className="mt-5" />
      </PageIntro>

      <div className="band-light">
        <div className="mx-auto w-full max-w-[1200px] space-y-20 px-4 pb-20 pt-16 sm:px-6 sm:pt-20">
          <section aria-labelledby="persiapan">
            <JudulBagian
              id="persiapan"
              judul="Cara kami menyiapkan perjalanan"
              lead={<p>Perjalanan ibadah yang tenang dimulai jauh sebelum hari keberangkatan.</p>}
            />
            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
              <ol className="divide-y divide-hairline border-y border-hairline">
                {PERSIAPAN.map(({ ikon: Ikon, judul, isi }) => (
                  <li key={judul} className="flex gap-4 py-5">
                    <Ikon aria-hidden className="mt-1 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                    <div>
                      <p className="font-semibold">{judul}</p>
                      <p className="mt-1 text-muted">{isi}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <figure className="self-start rounded-card border border-hairline bg-surface p-6">
                <PenandaMeter />
                <figcaption className="mt-3 text-sm text-muted">
                  Tiga hotel yang sama-sama bisa disebut &ldquo;dekat masjid&rdquo;. Selisihnya baru terlihat setelah jaraknya
                  ditulis, dan waktu jalannya dihitung dengan langkah jamaah lansia.
                </figcaption>
              </figure>
            </div>
          </section>

          <section aria-labelledby="pendampingan" className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            <figure className="lg:sticky lg:top-6 lg:self-start">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card">
                <Image src={fotoPayungNabawi.src} alt={fotoPayungNabawi.alt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
              </div>
              <figcaption className="mt-2 text-xs text-muted">Pelataran Masjid Nabawi, Madinah. Foto: <Kredit foto={fotoPayungNabawi} /></figcaption>
            </figure>
            <div>
              <JudulBagian id="pendampingan" judul="Pendampingan selama di Tanah Suci" />
              <ul className="mt-6 divide-y divide-hairline border-y border-hairline">
                {PENDAMPINGAN.map(({ ikon: Ikon, judul, isi }) => (
                  <li key={judul} className="flex gap-4 py-4">
                    <Ikon aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.6} />
                    <div>
                      <p className="font-semibold">{judul}</p>
                      <p className="mt-0.5 text-sm text-muted">{isi}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted">
                Kami juga melayani Badal Umrah, yang dilaksanakan petugas di Makkah tanpa keberangkatan jamaah dari
                Indonesia. Nama dan foto pembimbing tidak dicantumkan di situs demo ini.
              </p>
            </div>
          </section>

          <section aria-labelledby="komitmen">
            <JudulBagian id="komitmen" judul="Komitmen yang bisa Anda periksa" />
            <ul className="mt-6 grid gap-x-10 sm:grid-cols-2">
              {KOMITMEN.map((t) => (
                <li key={t} className="flex gap-3 border-t border-hairline py-4">
                  <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald" strokeWidth={1.75} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="profil" className="space-y-6">
            <JudulBagian id="profil" judul="Profil operator" lead={<p>Data di bawah adalah contoh untuk situs demo dan tidak merujuk ke perusahaan sungguhan.</p>} />
            <dl className="grid gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-2" data-profil-operator>
              {[
                ["Nama usaha", `${company.name} (operator fiktif)`],
                ["Layanan", "Umrah reguler, Umrah plus, Umrah Ramadhan, Haji Khusus, Badal Umrah"],
                ["Kantor", `${company.address.street}, ${company.address.city} ${company.address.postalCode} (contoh)`],
                ["Jam layanan", "Senin–Jumat 09.00–17.00, Sabtu 09.00–14.00 (contoh)"],
              ].map(([dt, dd]) => (
                <div key={dt} className="bg-surface p-5">
                  <dt className="text-sm text-muted">{dt}</dt>
                  <dd className="mt-1 font-semibold">{dd}</dd>
                </div>
              ))}
            </dl>
            <TrustSection tanpaKantor />
          </section>
        </div>
      </div>

      <PenutupKonsultasi
        judul="Ingin berbincang lebih dulu?"
        lead={<p>Ceritakan rencana perjalanan Anda atau keluarga. Kami bantu memilih antara paket Umrah dan pendaftaran Haji Khusus.</p>}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={linkWa({ kind: "umum" })}
            target="_blank"
            rel="noopener noreferrer"
            data-wa-source="tentang-penutup"
            data-wa-audience="operator"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary hover:bg-primary-hover"
          >
            <WhatsAppIcon className="size-5" />
            Konsultasi via WhatsApp
          </a>
          <Link href="/paket-umroh" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold hover:border-ink/70">
            Lihat paket Umrah
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
          <Link href="/haji-khusus" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-card border border-ink/35 px-6 font-semibold hover:border-ink/70">
            Tentang Haji Khusus
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
        <WaDemoNote className="mt-4" />
      </PenutupKonsultasi>
    </main>
  );
}
