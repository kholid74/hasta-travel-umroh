"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import { labelKursi } from "@/components/public/ui";
import { useBusinessToday } from "@/components/useBusinessToday";
import type { PackageType } from "@/content/types";
import { openDepartures } from "@/lib/departures";
import { bulanTahun, hargaKeberangkatan, rupiahSingkat, statusKeberangkatan, tanggalPanjang } from "@/lib/format";
import { bulanTersedia, kotaTersedia, queryDariFilter, type KatalogRow } from "@/lib/katalog";
import { Ornamen } from "./Motif";

const JENIS: { nilai: PackageType; label: string }[] = [
  { nilai: "umroh-reguler", label: "Reguler" },
  { nilai: "umroh-plus", label: "Plus (dengan wisata)" },
  { nilai: "umroh-ramadhan", label: "Ramadhan" },
];

const kontrol =
  "min-h-12 w-full rounded-card border bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2";

/**
 * Homepage quick finder (PUBLIC-02A). Uses the public catalogue data and the PUBLIC-01 business
 * date: only departures after today (Asia/Jakarta) are offered. The result is the catalogue with the
 * same filters in its URL, or a direct link to a matching package date. No booking happens here.
 */
export function QuickFinder({ rows: semua, serverToday }: { rows: KatalogRow[]; serverToday: string }) {
  const router = useRouter();
  // True once React owns the form (tests wait for it; the no-JS GET form works before that).
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const today = useBusinessToday(serverToday);
  const rows = useMemo(
    () => semua.map((r) => ({ ...r, departures: openDepartures(r.departures, today) })).filter((r) => r.departures.length > 0),
    [semua, today],
  );
  const [bulan, setBulan] = useState("");
  const [kota, setKota] = useState("");
  const [tipe, setTipe] = useState<PackageType | "">("");

  const cocok = rows
    .filter((r) => !tipe || r.type === tipe)
    .flatMap((r) => r.departures.filter((d) => (!bulan || d.date.startsWith(bulan)) && (!kota || d.departureCity === kota)).map((d) => ({ row: r, d })))
    .sort((a, b) => a.d.date.localeCompare(b.d.date));
  const jumlahPaket = new Set(cocok.map((c) => c.row.id)).size;
  const query = queryDariFilter({ bulan: bulan || undefined, kota: kota || undefined, tipe: tipe || undefined, sort: "tanggal" });
  const hrefKatalog = query ? `/paket-umroh?${query}` : "/paket-umroh";
  const adaPilihan = Boolean(bulan || kota || tipe);

  return (
    <section aria-labelledby="cari-judul" className="mx-auto w-full max-w-[1200px] px-4 pt-16 sm:px-6 sm:pt-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center lg:gap-16">
        <div>
          <Ornamen className="text-gold-ink" />
          <h2 id="cari-judul" className="mt-4 text-3xl sm:text-[2.75rem] sm:leading-[1.08]">Kapan Anda ingin berangkat?</h2>
          <p className="mt-4 max-w-[34ch] text-muted">
            Pilih bulan, kota keberangkatan, atau jenis paket. Hanya jadwal yang masih bisa didaftar yang muncul.
          </p>
        </div>

        {/* Motif 1: low-contrast star pattern on a panel behind the card; no text sits on it. */}
        <div className="relative">
          <div aria-hidden className="motif-bintang absolute -bottom-3 -right-3 left-6 top-6 rounded-card sm:-bottom-5 sm:-right-5 sm:left-10 sm:top-10" />
        <form
          action="/paket-umroh"
          method="get"
          onSubmit={(e) => { e.preventDefault(); router.push(hrefKatalog); }}
          className="relative rounded-card border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(23,33,28,0.06),0_8px_24px_-12px_rgba(23,33,28,0.18)] sm:p-6"
          data-quick-finder
          data-hydrated={hydrated}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-semibold">
              Bulan
              <select name="bulan" value={bulan} onChange={(e) => setBulan(e.target.value)} className={`${kontrol} mt-1.5 font-normal`}>
                <option value="">Semua bulan</option>
                {bulanTersedia(rows).map((b) => <option key={b} value={b}>{bulanTahun(`${b}-01`)}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Kota keberangkatan
              <select name="kota" value={kota} onChange={(e) => setKota(e.target.value)} className={`${kontrol} mt-1.5 font-normal`}>
                <option value="">Semua kota</option>
                {kotaTersedia(rows).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              Jenis paket
              <select name="tipe" value={tipe} onChange={(e) => setTipe(e.target.value as PackageType | "")} className={`${kontrol} mt-1.5 font-normal`}>
                <option value="">Semua jenis</option>
                {JENIS.map((j) => <option key={j.nilai} value={j.nilai}>{j.label}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 border-t border-hairline pt-5" aria-live="polite">
            {cocok.length > 0 ? (
              <>
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink" data-finder-count>{cocok.length} keberangkatan</span> dari {jumlahPaket} paket
                  {adaPilihan ? " sesuai pilihan Anda" : ""}. Terdekat:
                </p>
                <ul className="mt-3 divide-y divide-hairline">
                  {cocok.slice(0, 3).map(({ row, d }) => {
                    const status = statusKeberangkatan(d.seatsAvailable);
                    return (
                      <li key={d.id}>
                        <Link
                          href={`/paket-umroh/${row.slug}?d=${d.date}`}
                          className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-x-4 py-2.5 hover:text-accent"
                          data-finder-result
                        >
                          <span>
                            <span className="block font-semibold tabular-nums">{tanggalPanjang(d.date)} · {d.departureCity}</span>
                            <span className="block text-sm text-muted">
                              {row.name}
                              {status !== "available" ? ` · ${labelKursi(d.seatsAvailable)}` : ""}
                            </span>
                          </span>
                          <span className="text-right font-display text-xl tabular-nums text-forest">{rupiahSingkat(hargaKeberangkatan(row, d).quad)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div data-finder-empty>
                <p className="font-semibold">Belum ada keberangkatan untuk kombinasi ini.</p>
                <p className="mt-1 text-sm text-muted">Coba bulan atau kota lain, atau lihat seluruh jadwal.</p>
              </div>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                type="submit"
                disabled={cocok.length === 0}
                className="inline-flex min-h-12 items-center gap-2 rounded-card bg-primary px-5 font-semibold text-onprimary transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cocok.length > 0 ? `Lihat ${jumlahPaket} paket di katalog` : "Tidak ada hasil"}
                <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
              </button>
              {adaPilihan && (
                <button type="button" onClick={() => { setBulan(""); setKota(""); setTipe(""); }} className="min-h-11 text-sm font-semibold underline underline-offset-4">
                  Hapus pilihan
                </button>
              )}
              <Link href="/jadwal-keberangkatan" className="min-h-11 content-center text-sm font-semibold underline underline-offset-4">
                Lihat semua jadwal
              </Link>
            </div>
          </div>
        </form>
        </div>
      </div>
    </section>
  );
}
