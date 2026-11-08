"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { StatusKursi } from "@/components/public/ui";
import { useBusinessToday } from "@/components/useBusinessToday";
import { fotoKaabaDekat, fotoKubahHijau, fotoPayungNabawi, type Foto } from "@/content/photos";
import { openDepartures } from "@/lib/departures";
import { hargaKeberangkatan, rupiahSingkat, tanggalPanjang } from "@/lib/format";
import type { KatalogRow } from "@/lib/katalog";
import { Ornamen } from "./Motif";

/**
 * Destination photographs for the three featured cards. They show the holy sites every package visits,
 * not the package's hotel; alt text says so, and no hotel is pictured.
 */
const FOTO_KARTU: Foto[] = [fotoKaabaDekat, fotoPayungNabawi, fotoKubahHijau];

const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/**
 * Featured packages and the next open departures (PUBLIC-02A-R). Canonical data only: distances,
 * room prices and seat status come from the package fixtures, re-checked against the Jakarta date.
 */
export function FeaturedDepartures({
  unggulan, semua, serverToday, jumlahPaket,
}: { unggulan: KatalogRow[]; semua: KatalogRow[]; serverToday: string; jumlahPaket: number }) {
  const today = useBusinessToday(serverToday);
  const kartu = unggulan
    .map((row) => ({ row, d: openDepartures(row.departures, today)[0] }))
    .filter((x) => x.d !== undefined);
  const berikutnya = semua
    .flatMap((row) => openDepartures(row.departures, today).map((d) => ({ row, d })))
    .sort((a, b) => a.d.date.localeCompare(b.d.date))
    .slice(0, 4);

  return (
    <section aria-labelledby="unggulan-judul" className="mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-[40rem]">
          <Ornamen className="text-gold-ink" />
          <h2 id="unggulan-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">Paket Umrah pilihan</h2>
          <p className="mt-4 text-muted">
            Tiga paket dengan karakter berbeda: hotel paling dekat untuk orang tua, pilihan hemat, dan hotel bintang lima.
          </p>
        </div>
        <Link href="/paket-umroh" className="inline-flex min-h-11 items-center gap-2 font-semibold text-emerald underline underline-offset-4 hover:text-ink">
          Lihat semua {jumlahPaket} paket
          <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
        </Link>
      </div>

      {/* Mobile: a swipe row (next card peeks in), so all three stay visible without a 2,500 px stack. */}
      <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0">
        {kartu.map(({ row, d }, i) => (
          <PackageCard
            key={row.id}
            paket={row}
            keberangkatan={d!}
            foto={FOTO_KARTU[i % FOTO_KARTU.length]}
            unggulan
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
            className="w-[86%] shrink-0 snap-start sm:w-[46%] lg:w-auto"
          />
        ))}
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="text-2xl">Keberangkatan terdekat</h3>
          <Link href="/jadwal-keberangkatan" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-emerald underline underline-offset-4 hover:text-ink">
            Jadwal lengkap
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {berikutnya.map(({ row, d }) => {
            const [tahun, bulan, hari] = d.date.split("-");
            return (
              <li key={`${row.id}-${d.id}`}>
                <Link
                  href={`/paket-umroh/${row.slug}?d=${d.date}`}
                  data-upcoming-row
                  className="grid h-full grid-cols-[auto_1fr] gap-x-4 rounded-card border border-hairline bg-surface p-4 transition-colors hover:border-emerald"
                >
                  <span className="row-span-2 grid w-16 place-content-center rounded-[8px] bg-raised py-2 text-center">
                    <span className="font-display text-3xl leading-none tabular-nums text-forest">{Number(hari)}</span>
                    <span className="mt-1 text-xs font-semibold text-muted">{BULAN_PENDEK[Number(bulan) - 1]} {tahun}</span>
                    <span className="sr-only">{tanggalPanjang(d.date)}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{row.name}</span>
                    <span className="block text-sm text-muted">dari {d.departureCity}</span>
                  </span>
                  <span className="flex items-baseline justify-between gap-2 self-end">
                    <span className="text-sm tabular-nums">{rupiahSingkat(hargaKeberangkatan(row, d).quad)}</span>
                    <StatusKursi seats={d.seatsAvailable} className="text-sm" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-muted">Harga per orang untuk kamar ber-4. Tanggal yang sudah lewat tidak ditampilkan.</p>
      </div>
    </section>
  );
}
