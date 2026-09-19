import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Foto } from "@/components/Foto";
import { PackageCard } from "@/components/PackageCard";
import { PenandaMeter } from "@/components/PenandaMeter";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { URL_SIMPU } from "@/components/TrustSection";
import { company } from "@/content/company";
import { faq, faqDetailPaket } from "@/content/faq";
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
        {/* Lapisan rata, bukan gradient: teks harus terbaca tanpa efek. */}
        <div
          aria-hidden
          className="absolute inset-0"
          // rgba eksplisit, bukan modifier opasitas Tailwind: warna token ini oklab,
          // dan modifier di atasnya bisa berakhir opak di sebagian mesin render.
          style={{ backgroundColor: "rgba(12, 18, 16, 0.62)" }}
        />

        <div className="relative mx-auto flex min-h-[78vh] w-full max-w-[1200px] flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="text-sm font-semibold text-accent">Umroh &amp; Haji Khusus</p>
          <h1 className="mt-3 max-w-[20ch] text-5xl sm:text-7xl">
            Hotel <em className="italic">180 meter</em> dari masjid, bukan sekadar &ldquo;dekat&rdquo;.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink">
            Setiap paket di {company.name} menuliskan jarak hotel dalam meter, tipe rutenya, dan
            waktu jalan kaki pada kecepatan jamaah lansia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/paket-umroh"
              className="inline-flex min-h-12 items-center rounded-card bg-primary px-6 font-semibold text-onprimary"
            >
              Lihat {packages.length} paket umroh
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
          <p className="mt-8 w-fit max-w-full rounded-card bg-background px-3 py-1.5 text-xs text-muted">
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
        <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-x-4 px-4 text-sm sm:px-6">
          <p className="py-3 text-muted">
            Izin PPIU {company.licensePPIU} (nomor demo, sengaja dibuat tidak valid).
          </p>
          <a
            href={URL_SIMPU}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4 hover:text-accent"
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
        <div className="flex flex-wrap items-end justify-between gap-x-4">
          <h2 id="unggulan" className="text-3xl sm:text-4xl">
            Tiga paket, tiga jarak
          </h2>
          <Link
            href="/paket-umroh"
            className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:text-accent"
          >
            Lihat semua {packages.length} paket
          </Link>
        </div>
        {unggulan.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {unggulan.map(({ paket, keberangkatan }) => (
              <PackageCard key={paket.id} paket={paket} keberangkatan={keberangkatan} />
            ))}
          </div>
        ) : (
          <p className="mt-8 rounded-card border border-hairline bg-surface p-6 text-muted">
            Belum ada keberangkatan terjadwal untuk paket pilihan. Buka daftar paket untuk melihat
            tanggal yang tersedia.
          </p>
        )}
      </section>

      <section
        aria-labelledby="tentang"
        className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-16 sm:px-6 md:grid-cols-2 md:items-center"
      >
        <Foto foto={fotoAbraj} className="aspect-[4/5] w-full" />
        <div>
          <h2 id="tentang" className="text-3xl sm:text-4xl">
            Tiga hotel yang sama-sama disebut &ldquo;dekat&rdquo;
          </h2>
          <p className="mt-5 text-muted">
            Hotel 180 meter dan hotel 950 meter sama-sama bisa disebut dekat. Bagi jamaah berusia 70
            tahun, selisih itu menentukan ia masih sanggup kembali ke masjid untuk shalat
            berikutnya atau tidak.
          </p>
          <div className="mt-6 rounded-card border border-hairline bg-surface p-5">
            <PenandaMeter />
          </div>
          <Link
            href="/tentang"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:text-accent"
          >
            Alasan kami menulis jarak dalam meter
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[800px] px-4 pb-16 text-center sm:px-6">
        <blockquote className="font-display text-2xl leading-snug sm:text-3xl">
          &ldquo;Saya mendaftarkan ibu yang umurnya 71. Jarak hotelnya ditulis 180 meter, bukan cuma
          &lsquo;dekat&rsquo;. Ternyata memang segitu.&rdquo;
        </blockquote>
        <p className="mt-4 text-sm text-muted">S. R., Bekasi. Testimoni DATA DEMO, fiktif.</p>
      </section>

      <section aria-labelledby="faq-home" className="mx-auto w-full max-w-[800px] px-4 pb-16 sm:px-6">
        <h2 id="faq-home" className="text-3xl sm:text-4xl">
          Pertanyaan sebelum mendaftar
        </h2>
        <div className="mt-6 space-y-2">
          {faqDetailPaket.slice(0, 3).map((item) => (
            <details key={item.q} className="rounded-card border border-hairline bg-surface">
              <summary className="p-4 font-medium">{item.q}</summary>
              <p className="px-4 pb-4 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
        <Link
          href="/faq"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 hover:text-accent"
        >
          Baca semua {faq.length} pertanyaan
        </Link>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6">
        <div className="border-t border-hairline pt-12 text-center">
          <h2 className="text-3xl sm:text-4xl">Sudah tahu paket mana yang cocok?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Tombol WhatsApp di halaman paket otomatis membawa nama paket dan tanggalnya.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/paket-umroh"
              className="inline-flex min-h-12 items-center rounded-card bg-primary px-6 font-semibold text-onprimary"
            >
              Bandingkan {packages.length} paket umroh
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
