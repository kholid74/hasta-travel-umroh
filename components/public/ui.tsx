import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Kredit, Ornamen } from "@/components/home/Motif";
import { DEMO_NOTICE, company } from "@/content/company";
import {
  fotoKaabaDekat, fotoKubahHijau, fotoPayungNabawi, type Foto,
} from "@/content/photos";
import type { PackageType } from "@/content/types";
import { statusKeberangkatan } from "@/lib/format";

/**
 * Shared public-page building blocks (PUBLIC-02B). They reuse the PUBLIC-02A-R tokens, bands and
 * motifs; pages compose them differently so they do not all look the same.
 */

/** Visible package-type labels. New copy says "Umrah"; slugs and package names (data) are unchanged. */
export const LABEL_TIPE: Record<PackageType, string> = {
  "umroh-reguler": "Umrah Reguler",
  "umroh-plus": "Umrah Plus",
  "umroh-ramadhan": "Umrah Ramadhan",
};

/** Standard seat wording across the public site: "Tersedia", "Sisa n kursi", "Penuh". */
export function labelKursi(seats: number): string {
  const s = statusKeberangkatan(seats);
  if (s === "sold-out") return "Penuh";
  if (s === "limited") return `Sisa ${seats} kursi`;
  return "Tersedia";
}

export function StatusKursi({ seats, className = "" }: { seats: number; className?: string }) {
  const s = statusKeberangkatan(seats);
  return (
    <span className={`font-semibold ${s === "available" ? "text-success" : "text-warning"} ${className}`} data-status={s}>
      {labelKursi(seats)}
    </span>
  );
}

/**
 * Destination photograph for a package card or intro. These show the holy sites every package visits,
 * never a partner hotel. Chosen by package id (p01, p02 …) so a package keeps the same photo across
 * pages and filters, and neighbouring packages differ.
 */
const FOTO_DESTINASI: Foto[] = [fotoKaabaDekat, fotoPayungNabawi, fotoKubahHijau];
export function fotoPaket(id: string): Foto {
  const n = Number(id.replace(/\D/g, "")) || 0;
  return FOTO_DESTINASI[n % FOTO_DESTINASI.length];
}

const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
/** "10 Feb 2027" — for tight spaces such as the sticky bar. */
export function tanggalPendek(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${BULAN_PENDEK[Number(m) - 1]} ${y}`;
}

/** Section heading with the gold star rule (motif 3). */
export function JudulBagian({
  id, judul, lead, className = "", ornamen = "text-gold-ink",
}: { id: string; judul: ReactNode; lead?: ReactNode; className?: string; ornamen?: string }) {
  return (
    <div className={`max-w-[42rem] ${className}`}>
      <Ornamen className={ornamen} />
      <h2 id={id} className="mt-4 text-3xl sm:text-[2.5rem] sm:leading-[1.08]">{judul}</h2>
      {lead && <div className="mt-3 text-muted">{lead}</div>}
    </div>
  );
}

/**
 * Disclosure level A: the one short "Situs demo" line per page (in the intro). With `wa`, it also
 * covers the operator WhatsApp CTAs placed right next to it, so the intro does not stack two notes.
 */
export function CatatanDemo({ className = "", wa = false }: { className?: string; wa?: boolean }) {
  return (
    <p className={`text-sm text-muted ${className}`} data-demo-note="umum">
      {DEMO_NOTICE}
      {wa && ` Tombol WhatsApp terhubung ke nomor demonstrasi ${company.studio.name}, bukan ke biro perjalanan.`}
    </p>
  );
}

/**
 * Configured package tags that describe a real service difference. Popularity or "cheapest" claims
 * ("Paling banyak dipilih", "Termurah") cannot be verified on a demo and are never shown publicly.
 */
const TAG_TIDAK_DITAMPILKAN = new Set(["Termurah", "Paling banyak dipilih"]);
export function tagLayanan(tags: string[] | undefined, maks = 2): string[] {
  return (tags ?? []).filter((t) => !TAG_TIDAK_DITAMPILKAN.has(t)).slice(0, maks);
}

/**
 * Distance at a glance for catalogue cards: the mosque at the left, the hotel as a marker on a
 * 0–1,500 m line. Decorative (aria-hidden); the same distance is written as text beside it.
 */
export function PenggarisJarak({ meter }: { meter: number }) {
  const pct = Math.min(100, Math.max(2, (meter / 1500) * 100));
  return (
    <span aria-hidden className="relative block h-3 w-full">
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-champagne" />
      <span className="absolute left-0 top-0 h-3 w-1 rounded-[1px] bg-forest" />
      <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald ring-2 ring-paper" style={{ left: `${pct}%` }} />
    </span>
  );
}

export type Remah = { href: string; label: string };

/**
 * Forest page intro. `foto` + `bentuk` choose the composition:
 * - "lengkung": text left, photo in an arched frame right (desktop) — catalogue, about.
 * - "lebar": photo strip across the top, text panel below it — Haji, package detail.
 * - tanpa foto: compact text intro — schedule, FAQ, contact.
 */
export function PageIntro({
  judul, lead, remah, foto, posisiFoto = "object-center", bentuk = "lengkung", children, id = "judul-halaman", sesudahJudul,
}: {
  judul: ReactNode;
  lead?: ReactNode;
  remah?: Remah[];
  foto?: Foto;
  posisiFoto?: string;
  bentuk?: "lengkung" | "lebar";
  children?: ReactNode;
  id?: string;
  /** Rendered between the heading and the lead, e.g. a type/duration line. */
  sesudahJudul?: ReactNode;
}) {
  const teks = (
    <div className="min-w-0">
      {remah && (
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          {remah.map((r, i) => (
            <span key={r.href}>
              {i > 0 && <span aria-hidden> · </span>}
              <Link href={r.href} className="underline underline-offset-4 hover:text-ink">{r.label}</Link>
            </span>
          ))}
        </nav>
      )}
      <Ornamen className={`text-primary ${remah ? "mt-5" : ""}`} />
      <h1 id={id} className="mt-4 text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.04] [text-wrap:balance]">{judul}</h1>
      {sesudahJudul}
      {lead && <div className="mt-4 max-w-[38rem] leading-relaxed text-ink/90 sm:text-lg">{lead}</div>}
      {children}
      {foto && (
        <p className={`mt-6 text-xs text-muted ${bentuk === "lengkung" ? "hidden lg:block" : ""}`}>
          Foto: <Kredit foto={foto} />
        </p>
      )}
    </div>
  );

  if (foto && bentuk === "lebar") {
    return (
      <section aria-labelledby={id} className="border-b border-hairline">
        <div className="relative h-28 sm:h-64 lg:h-72">
          <Image src={foto.src} alt={foto.alt} fill priority sizes="100vw" className={`object-cover ${posisiFoto}`} />
        </div>
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 pt-6 sm:px-6 sm:pb-14 sm:pt-10">{teks}</div>
      </section>
    );
  }

  return (
    <section aria-labelledby={id} className="border-b border-hairline">
      <div className={`mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-14 ${foto ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end lg:gap-16" : ""}`}>
        {teks}
        {foto && (
          <div className="relative hidden lg:block">
            <div aria-hidden className="motif-bintang-gelap bingkai-lengkung absolute -bottom-4 -right-4 left-6 top-6" />
            <div className="bingkai-lengkung relative aspect-[4/5] border border-primary/40">
              <Image src={foto.src} alt={foto.alt} fill priority sizes="360px" className={`object-cover ${posisiFoto}`} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Forest closing band used at the end of public pages; hides the mobile sticky bar while in view. */
export function PenutupKonsultasi({
  judul, lead, children, id = "penutup-halaman",
}: { judul: ReactNode; lead?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section aria-labelledby={id} className="border-t border-hairline" data-sticky-hide>
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <Ornamen className="text-primary" />
        <h2 id={id} className="mt-4 max-w-[20ch] text-3xl sm:text-5xl sm:leading-[1.05]">{judul}</h2>
        {lead && <div className="mt-4 max-w-[36rem] text-ink/90">{lead}</div>}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

/** Credits for photos shown further down a page (cards, bands). Every photo on a page is credited. */
export function KreditFoto({ foto, className = "" }: { foto: { label: string; foto: Foto }[]; className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-muted ${className}`} data-photo-credits>
      Kredit foto (Wikimedia Commons):{" "}
      {foto.map((f, i) => (
        <span key={f.foto.src}>
          {i > 0 && " · "}
          <Kredit label={f.label} foto={f.foto} />
        </span>
      ))}
    </p>
  );
}

/** The three destination photos used on package cards, with labels for KreditFoto. */
export const KREDIT_FOTO_KARTU = [
  { label: "Pintu Ka'bah", foto: fotoKaabaDekat },
  { label: "Pelataran Nabawi", foto: fotoPayungNabawi },
  { label: "Kubah Hijau", foto: fotoKubahHijau },
];
