"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import { useBusinessToday } from "@/components/useBusinessToday";
import type { PackageType } from "@/content/types";
import { openDepartures } from "@/lib/departures";
import { bulanTahun, rupiahSingkat } from "@/lib/format";
import {
  FILTER_KOSONG,
  bulanTersedia,
  durasiTersedia,
  kotaTersedia,
  type Filter,
  type KatalogRow,
  type SortKey,
  filterDariQuery,
  queryDariFilter,
  saring,
} from "@/lib/katalog";

const TIPE: { nilai: PackageType | ""; label: string }[] = [
  { nilai: "", label: "Semua" },
  { nilai: "umroh-reguler", label: "Reguler" },
  { nilai: "umroh-plus", label: "Plus" },
  { nilai: "umroh-ramadhan", label: "Ramadhan" },
];

const BATAS_HARGA = [30e6, 35e6, 40e6, 50e6, 60e6];

const SORT: { nilai: SortKey; label: string }[] = [
  { nilai: "tanggal", label: "Tanggal terdekat" },
  { nilai: "harga-naik", label: "Harga terendah" },
  { nilai: "harga-turun", label: "Harga tertinggi" },
];

/** Phones (< 640 px) show this many matching packages first; tablet and desktop show all of them. */
export const UKURAN_HALAMAN_PONSEL = 9;

const kelasKontrol = "mt-1.5 min-h-12 w-full rounded-card border bg-surface px-3 text-base font-normal text-ink";
const kelasLabel = "block text-sm font-semibold";
const TANPA_FILTER = { tipe: undefined, bulan: undefined, kota: undefined, maks: undefined, durasi: undefined };

/**
 * Catalogue (PUBLIC-02B). Filters and sort are read from and written to the URL (deep links from the
 * homepage finder keep working); dates are re-checked against today's Jakarta date in the browser.
 */
export function KatalogClient({ rows: semuaRows, serverToday }: { rows: KatalogRow[]; serverToday: string }) {
  const today = useBusinessToday(serverToday);
  const rows = useMemo(
    () => semuaRows.map((r) => ({ ...r, departures: openDepartures(r.departures, today) })).filter((r) => r.departures.length > 0),
    [semuaRows, today],
  );
  const bulanOptions = bulanTersedia(rows);
  const durasiOptions = durasiTersedia(rows);
  const kotaOptions = kotaTersedia(rows);
  const [filter, setFilter] = useState<Filter>(FILTER_KOSONG);
  const [panelTerbuka, setPanelTerbuka] = useState(false);
  // Progressive disclosure on phones only. Purely client-side: the full filtered list is always in the
  // DOM (and in the static HTML); cards past the limit are hidden below 640 px with CSS.
  const [batas, setBatas] = useState(UKURAN_HALAMAN_PONSEL);
  const [pengumuman, setPengumuman] = useState("");
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync with the URL after hydration: the static HTML lists every package so it can be indexed,
    // and reading the query during render would make server and client HTML differ.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilter(filterDariQuery(new URLSearchParams(window.location.search)));
  }, []);

  function ubah(sebagian: Partial<Filter>) {
    // A new filter is a new result set: start again from the first page. Changing only the sort keeps
    // what the visitor already opened, re-ordered.
    if (Object.keys(sebagian).some((k) => k !== "sort")) {
      setBatas(UKURAN_HALAMAN_PONSEL);
      setPengumuman("");
    }
    const baru = { ...filter, ...sebagian };
    setFilter(baru);
    const query = queryDariFilter(baru);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  const hasil = saring(rows, filter);
  type Aktif = { label: string; hapus: Partial<Filter> };
  const aktif: Aktif[] = [];
  if (filter.tipe) aktif.push({ label: TIPE.find((t) => t.nilai === filter.tipe)!.label, hapus: { tipe: undefined } });
  if (filter.bulan) aktif.push({ label: bulanTahun(`${filter.bulan}-01`), hapus: { bulan: undefined } });
  if (filter.kota) aktif.push({ label: `Dari ${filter.kota}`, hapus: { kota: undefined } });
  if (filter.durasi) aktif.push({ label: `${filter.durasi} hari`, hapus: { durasi: undefined } });
  if (filter.maks) aktif.push({ label: `Sampai ${rupiahSingkat(filter.maks)}`, hapus: { maks: undefined } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 md:hidden">
        <button
          type="button"
          onClick={() => setPanelTerbuka((v) => !v)}
          className="inline-flex min-h-12 items-center gap-2 rounded-card border border-control bg-surface px-4 font-semibold"
          aria-expanded={panelTerbuka}
          aria-controls="panel-filter"
        >
          <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.75} />
          Filter{aktif.length ? ` (${aktif.length} aktif)` : ""}
        </button>
      </div>

      <div
        id="panel-filter"
        className={`${panelTerbuka ? "mt-4 block" : "hidden"} rounded-card border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(23,33,28,0.06),0_8px_24px_-14px_rgba(23,33,28,0.18)] sm:p-5 md:mt-0 md:block`}
      >
        <fieldset>
          <legend className={kelasLabel}>Jenis paket</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {TIPE.map((t) => {
              const dipilih = (filter.tipe ?? "") === t.nilai;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => ubah({ tipe: t.nilai || undefined })}
                  aria-pressed={dipilih}
                  className={`min-h-11 rounded-card border px-4 text-sm font-semibold transition-colors ${
                    dipilih ? "border-forest bg-forest text-ivory" : "border-control bg-surface hover:border-forest"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-hairline pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className={kelasLabel} htmlFor="f-bulan">
            Bulan keberangkatan
            <select id="f-bulan" className={kelasKontrol} value={filter.bulan ?? ""} onChange={(e) => ubah({ bulan: e.target.value || undefined })}>
              <option value="">Semua bulan</option>
              {bulanOptions.map((b) => <option key={b} value={b}>{bulanTahun(`${b}-01`)}</option>)}
            </select>
          </label>
          <label className={kelasLabel} htmlFor="f-kota">
            Kota keberangkatan
            <select id="f-kota" className={kelasKontrol} value={filter.kota ?? ""} onChange={(e) => ubah({ kota: e.target.value || undefined })}>
              <option value="">Semua kota</option>
              {kotaOptions.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className={kelasLabel} htmlFor="f-durasi">
            Durasi
            <select id="f-durasi" className={kelasKontrol} value={filter.durasi ?? ""} onChange={(e) => ubah({ durasi: Number(e.target.value) || undefined })}>
              <option value="">Semua durasi</option>
              {durasiOptions.map((d) => <option key={d} value={d}>{d} hari</option>)}
            </select>
          </label>
          <label className={kelasLabel} htmlFor="f-maks">
            Anggaran per orang (kamar ber-4)
            <select id="f-maks" className={kelasKontrol} value={filter.maks ?? ""} onChange={(e) => ubah({ maks: Number(e.target.value) || undefined })}>
              <option value="">Tanpa batas</option>
              {BATAS_HARGA.map((h) => <option key={h} value={h}>Sampai {rupiahSingkat(h)}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-hairline pb-4">
        <div>
          <p className="text-lg" aria-live="polite" data-jumlah-hasil={hasil.length}>
            <span className="font-semibold">{hasil.length} paket</span>
            <span className="text-muted"> {aktif.length ? "cocok dengan pilihan Anda" : `dari ${rows.length} paket yang masih bisa didaftar`}</span>
          </p>
          {aktif.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label="Filter aktif">
              {aktif.map((a) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onClick={() => ubah(a.hapus)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-emerald/40 bg-paper px-3 text-sm font-semibold text-emerald hover:border-emerald"
                  >
                    {a.label}
                    <X aria-hidden className="size-3.5" strokeWidth={2.25} />
                    <span className="sr-only">hapus filter</span>
                  </button>
                </li>
              ))}
              <li>
                <button type="button" onClick={() => ubah(TANPA_FILTER)} className="min-h-10 px-1 text-sm font-semibold underline underline-offset-4">
                  Hapus semua filter
                </button>
              </li>
            </ul>
          )}
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold" htmlFor="f-sort">
          Urutkan
          <select id="f-sort" className="min-h-11 rounded-card border bg-surface px-3 text-base font-normal" value={filter.sort} onChange={(e) => ubah({ sort: e.target.value as SortKey })}>
            {SORT.map((s) => <option key={s.nilai} value={s.nilai}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {hasil.length === 0 ? (
        <div className="mt-8 rounded-card border border-hairline bg-surface p-8 text-center" data-katalog-kosong>
          <p className="font-display text-2xl">Belum ada paket untuk kombinasi ini</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Coba lebarkan anggaran, pilih bulan lain, atau hapus filter durasi. Seluruh tanggal juga bisa dilihat
            sekaligus di jadwal keberangkatan.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => ubah(TANPA_FILTER)}
              className="inline-flex min-h-11 items-center rounded-card bg-primary px-5 font-semibold text-onprimary hover:bg-primary-hover"
            >
              Hapus semua filter
            </button>
            <Link href="/jadwal-keberangkatan" className="inline-flex min-h-11 items-center rounded-card border border-forest/40 px-5 font-semibold text-forest hover:border-forest">
              Lihat jadwal keberangkatan
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div ref={gridRef} className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {hasil.map(({ row, keberangkatan, jumlahTanggalLain }, i) => (
              <PackageCard
                key={row.id}
                paket={row}
                keberangkatan={keberangkatan}
                jumlahTanggalLain={jumlahTanggalLain}
                varian="katalog"
                className={i >= batas ? "max-sm:hidden" : ""}
              />
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden" data-muat-lebih>
            <p className="text-sm text-muted" data-terlihat={Math.min(batas, hasil.length)}>
              Menampilkan {Math.min(batas, hasil.length)} dari {hasil.length} paket
            </p>
            {hasil.length > batas && (
              <button
                type="button"
                onClick={() => {
                  const awal = batas;
                  const baru = Math.min(hasil.length, batas + UKURAN_HALAMAN_PONSEL);
                  setBatas(baru);
                  setPengumuman(`${baru - awal} paket lagi ditampilkan. Sekarang ${baru} dari ${hasil.length} paket.`);
                  // Move keyboard focus to the first newly shown package so the visitor continues from there.
                  requestAnimationFrame(() => gridRef.current?.querySelectorAll<HTMLElement>("article h3 a")[awal]?.focus());
                }}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card border border-forest/40 bg-surface px-5 font-semibold text-forest hover:border-forest"
              >
                Muat lebih banyak
                <span className="font-normal text-muted">({Math.min(UKURAN_HALAMAN_PONSEL, hasil.length - batas)} lagi)</span>
                <ChevronDown aria-hidden className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>
          <p className="sr-only" aria-live="polite" data-pengumuman-muat>{pengumuman}</p>
        </>
      )}
    </div>
  );
}
