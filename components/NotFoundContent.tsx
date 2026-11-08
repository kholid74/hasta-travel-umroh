import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaDemoNote } from "@/components/WaDemoNote";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { linkWa } from "@/lib/whatsapp";

/** Branded Indonesian 404 body shared by app/not-found.tsx and app/(public)/not-found.tsx. */
export function NotFoundContent() {
  return (
    <main className="mx-auto w-full max-w-[800px] flex-1 px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-accent">404 · Halaman tidak ditemukan</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">Halaman ini tidak tersedia</h1>
      <p className="mt-5 max-w-xl text-muted">
        Alamat yang Anda buka mungkin salah ketik, sudah dipindahkan, atau paketnya sudah tidak ditawarkan.
        Silakan kembali ke beranda atau lihat paket yang masih tersedia.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/paket-umroh"
          className="inline-flex min-h-12 items-center gap-2 rounded-card bg-primary px-6 font-semibold text-onprimary"
        >
          Lihat paket Umrah
          <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 rounded-card border border-ink/25 bg-surface px-6 font-semibold"
        >
          Kembali ke beranda
        </Link>
      </div>
      <div className="mt-10 rounded-card border border-hairline bg-surface p-5">
        <p className="text-sm">Mencari paket tertentu atau tanggal yang sudah lewat?</p>
        <p className="mt-1 text-sm text-muted">
          Lihat{" "}
          <Link href="/jadwal-keberangkatan" className="underline underline-offset-4 hover:text-primary">jadwal keberangkatan</Link>{" "}
          atau tanyakan langsung.
        </p>
        <a
          href={linkWa({ kind: "umum" })}
          target="_blank"
          rel="noopener noreferrer"
          data-wa-source="404"
          data-wa-audience="operator"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-card border border-primary px-4 text-sm font-semibold text-primary"
        >
          <WhatsAppIcon />
          Konsultasi via WhatsApp
        </a>
        <WaDemoNote className="mt-2" />
      </div>
    </main>
  );
}
