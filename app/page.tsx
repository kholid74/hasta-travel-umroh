import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Foto } from "@/components/Foto";
import { PackageCard } from "@/components/PackageCard";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { URL_SIMPU } from "@/components/TrustSection";
import { company } from "@/content/company";
import { faqDetailPaket } from "@/content/faq";
import { packages } from "@/content/packages";
import { fotoAbraj, fotoHaram } from "@/content/photos";
import { keberangkatanTerdekat } from "@/lib/format";
import { linkWa } from "@/lib/whatsapp";

export const metadata: Metadata = {
  description:
    "Katalog paket Umroh & Haji Khusus yang menuliskan jarak hotel ke masjid dalam meter, lengkap dengan tipe akses dan waktu jalan kaki jamaah lansia. Situs demo.",
};


export default function HomePage() {
  const hariIni = new Date().toISOString().slice(0, 10);
  const unggulan = packages
    .filter((p) =>
      ["umroh-ramah-lansia-12-hari", "umroh-hemat-9-hari", "umroh-premium-12-hari"].includes(p.slug),
    )
    .map((paket) => {
      const terdekat = keberangkatanTerdekat(paket, hariIni);
      return terdekat ? { paket, keberangkatan: terdekat } : null;
    })
    .filter((x) => x !== null);

  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden">
        <Image
          src={fotoHaram.src}
          alt={fotoHaram.alt}
          width={fotoHaram.width}
          height={fotoHaram.height}
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Lapisan rata, bukan gradient — teks harus terbaca tanpa efek. */}
        <div
          aria-hidden
          className="absolute inset-0"
          // rgba eksplisit, bukan modifier opasitas Tailwind: warna token ini oklab,
          // dan modifier di atasnya bisa berakhir opak di sebagian mesin render.
          style={{ backgroundColor: "rgba(12, 18, 16, 0.62)" }}
        />

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-[1200px] flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Umroh &amp; Haji Khusus
          </p>
          <h1 className="mt-4 max-w-[15ch] text-5xl sm:text-7xl">
            Perjalanan Dimulai dari Sebuah <em className="italic">Niat</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink">
            {company.name} menemani perjalanan ibadah Anda menuju Baitullah, dengan persiapan yang
            matang dan layanan yang penuh perhatian.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/paket-umroh"
              className="inline-flex min-h-12 items-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary"
            >
              Lihat paket
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
            <a
              href={linkWa({ kind: "umum" })}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="hero"
              className="inline-flex min-h-12 items-center gap-2 rounded-card border border-ink/25 bg-surface px-6 font-semibold"
            >
              <WhatsAppIcon className="size-5" />
              Konsultasi via WhatsApp
            </a>
          </div>
          <p className="mt-8 text-[11px] text-ink/70">
            Foto:{" "}
            <a
              href={fotoHaram.sumberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {fotoHaram.judul}
            </a>{" "}
            oleh {fotoHaram.pembuat},{" "}
            <a
              href={fotoHaram.lisensiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {fotoHaram.lisensi}
            </a>
          </p>
        </div>
      </section>

      <section className="border-y border-hairline bg-surface">
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-4 text-sm sm:px-6">
          <p className="text-muted">
            Izin PPIU {company.licensePPIU} — nomor demo, sengaja dibuat tidak valid.
          </p>
          <a
            href={URL_SIMPU}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold underline underline-offset-4 hover:text-accent"
          >
            Cek legalitas di SISKOPATUH
            <ExternalLink aria-hidden className="size-4" strokeWidth={1.75} />
          </a>
        </div>
      </section>

      <section
        aria-labelledby="unggulan"
        className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="unggulan" className="text-3xl sm:text-4xl">
            Tiga paket, tiga jarak
          </h2>
          <Link
            href="/paket-umroh"
            className="text-sm font-semibold underline underline-offset-4 hover:text-accent"
          >
            Lihat semua {packages.length} paket
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {unggulan.map(({ paket, keberangkatan }) => (
            <PackageCard key={paket.id} paket={paket} keberangkatan={keberangkatan} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="tentang"
        className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-16 sm:px-6 md:grid-cols-2 md:items-center"
      >
        <Foto foto={fotoAbraj} className="aspect-[4/5] w-full" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Tentang kami</p>
          <h2 id="tentang" className="mt-3 text-3xl sm:text-4xl">
            Dari sebuah niat, menuju perjalanan yang dipersiapkan dengan baik
          </h2>
          <p className="mt-5 text-muted">
            Setiap perjalanan menuju Baitullah dimulai dari sebuah niat. {company.name} hadir untuk
            membantu mewujudkan niat tersebut menjadi perjalanan yang terencana, nyaman, dan penuh
            ketenangan.
          </p>
          <p className="mt-4 text-muted">
            Kami menyajikan pilihan paket Umroh dan Haji dengan informasi yang jelas dan apa adanya
            — sehingga jamaah dapat memahami apa yang dipilih, apa yang didapatkan, dan bagaimana
            perjalanan akan berlangsung sejak dari Indonesia hingga kembali ke tanah air.
          </p>
          <p className="mt-4 text-muted">
            Karena bagi kami, perjalanan ibadah layak dipersiapkan dengan penuh perhatian.
          </p>
          <Link
            href="/tentang"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-accent"
          >
            Selengkapnya tentang kami
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[800px] px-4 pb-16 text-center sm:px-6">
        <blockquote className="font-display text-2xl leading-snug sm:text-3xl">
          &ldquo;Saya mendaftarkan ibu yang umurnya 71. Jarak hotelnya ditulis 180 meter, bukan cuma
          &lsquo;dekat&rsquo;. Ternyata memang segitu.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-muted">S. R., Bekasi — testimoni DATA DEMO, fiktif.</p>
      </section>

      <section aria-labelledby="faq-home" className="mx-auto w-full max-w-[800px] px-4 pb-16 sm:px-6">
        <h2 id="faq-home" className="text-3xl sm:text-4xl">
          Yang paling sering ditanyakan
        </h2>
        <div className="mt-6 space-y-2">
          {faqDetailPaket.slice(0, 3).map((item) => (
            <details key={item.q} className="rounded-card border border-hairline bg-surface">
              <summary className="cursor-pointer list-none p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-sm text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <Link
          href="/faq"
          className="mt-5 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent"
        >
          Lihat semua pertanyaan
        </Link>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="rounded-card border border-hairline bg-surface p-10 text-center">
          <h2 className="text-3xl sm:text-4xl">Sudah tahu paket mana yang cocok?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Tombol WhatsApp di halaman paket otomatis membawa nama paket dan tanggalnya.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/paket-umroh"
              className="inline-flex min-h-12 items-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary"
            >
              Lihat paket
              <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
            <a
              href={linkWa({ kind: "umum" })}
              target="_blank"
              rel="noopener noreferrer"
              data-wa-source="cta-akhir"
              className="inline-flex min-h-12 items-center gap-2 rounded-card border border-ink/25 bg-surface px-6 font-semibold"
            >
              <WhatsAppIcon className="size-5" />
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
