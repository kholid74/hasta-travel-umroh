"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PackageCard } from "@/components/PackageCard";
import type { PackageType } from "@/content/types";
import { bulanTahun, rupiahSingkat } from "@/lib/format";
import {
  FILTER_KOSONG,
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

const kelasKontrol = "min-h-11 w-full rounded-card border border-hairline bg-surface px-3 text-base";
const TANPA_FILTER = { tipe: undefined, bulan: undefined, maks: undefined, durasi: undefined };

export function KatalogClient({
  rows,
  bulanOptions,
  durasiOptions,
}: {
  rows: KatalogRow[];
  bulanOptions: string[];
  durasiOptions: number[];
}) {
  const [filter, setFilter] = useState<Filter>(FILTER_KOSONG);
  const [panelTerbuka, setPanelTerbuka] = useState(false);

  // Filter dibaca dari URL setelah mount, bukan di server: halaman ini tetap
  // statis, dan HTML awalnya berisi seluruh paket supaya bisa diindeks.
  useEffect(() => {
    // Menyelaraskan state dengan URL SETELAH hydration. Membacanya saat render
    // akan membuat HTML server berbeda dengan klien, padahal HTML server memang
    // harus berisi daftar penuh supaya bisa diindeks mesin pencari.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilter(filterDariQuery(new URLSearchParams(window.location.search)));
  }, []);

  function ubah(sebagian: Partial<Filter>) {
    const baru = { ...filter, ...sebagian };
    setFilter(baru);
    const query = queryDariFilter(baru);
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }

  const hasil = saring(rows, filter);
  const adaFilterAktif = Boolean(filter.tipe || filter.bulan || filter.maks || filter.durasi);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 md:hidden">
        <button
          type="button"
          onClick={() => setPanelTerbuka((v) => !v)}
          className="inline-flex min-h-11 items-center gap-2 rounded-card border border-hairline bg-surface px-4 text-sm font-semibold"
          aria-expanded={panelTerbuka}
        >
          <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.75} />
          Filter{adaFilterAktif ? " (aktif)" : ""}
        </button>
        <p className="text-sm text-muted">{hasil.length} paket</p>
      </div>

      <div
        className={`${panelTerbuka ? "mt-4 block" : "hidden"} rounded-card border border-hairline bg-surface p-4 md:mt-0 md:block`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <fieldset className="sm:col-span-2 lg:col-span-4">
            <legend className="mb-1.5 text-sm font-medium text-muted">
              Jenis
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {TIPE.map((t) => {
                const aktif = (filter.tipe ?? "") === t.nilai;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => ubah({ tipe: t.nilai || undefined })}
                    aria-pressed={aktif}
                    className={`min-h-11 rounded-card border px-3 text-sm ${
                      aktif
                        ? "border-primary bg-primary font-semibold text-onprimary"
                        : "border-hairline bg-surface"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="f-bulan"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Bulan keberangkatan
            </label>
            <select
              id="f-bulan"
              className={kelasKontrol}
              value={filter.bulan ?? ""}
              onChange={(e) => ubah({ bulan: e.target.value || undefined })}
            >
              <option value="">Semua bulan</option>
              {bulanOptions.map((b) => (
                <option key={b} value={b}>
                  {bulanTahun(`${b}-01`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="f-durasi"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Durasi
            </label>
            <select
              id="f-durasi"
              className={kelasKontrol}
              value={filter.durasi ?? ""}
              onChange={(e) => ubah({ durasi: Number(e.target.value) || undefined })}
            >
              <option value="">Semua durasi</option>
              {durasiOptions.map((d) => (
                <option key={d} value={d}>
                  {d} hari
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="f-maks"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Harga maksimum (quad)
            </label>
            <select
              id="f-maks"
              className={kelasKontrol}
              value={filter.maks ?? ""}
              onChange={(e) => ubah({ maks: Number(e.target.value) || undefined })}
            >
              <option value="">Tanpa batas</option>
              {BATAS_HARGA.map((h) => (
                <option key={h} value={h}>
                  Sampai {rupiahSingkat(h)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="f-sort"
              className="mb-1.5 block text-sm font-medium text-muted"
            >
              Urutkan
            </label>
            <select
              id="f-sort"
              className={kelasKontrol}
              value={filter.sort}
              onChange={(e) => ubah({ sort: e.target.value as SortKey })}
            >
              {SORT.map((s) => (
                <option key={s.nilai} value={s.nilai}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {adaFilterAktif && (
          <div className="mt-4 flex justify-end border-t border-hairline pt-4">
            <button
              type="button"
              onClick={() => ubah(TANPA_FILTER)}
              className="min-h-11 text-sm font-semibold text-primary underline underline-offset-4"
            >
              Hapus semua filter
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 hidden text-sm text-muted md:block">
        Menampilkan {hasil.length} paket dari {rows.length} paket yang tersedia.
      </p>

      {hasil.length === 0 ? (
        <div className="mt-6 rounded-card border border-hairline bg-surface p-8 text-center">
          <p className="font-display text-xl">Tidak ada paket yang cocok</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Coba lebarkan batas harga, pilih bulan lain, atau hapus filter durasi. Kombinasi filter
            yang terlalu sempit sering menyisihkan paket yang sebenarnya cocok.
          </p>
          <button
            type="button"
            onClick={() => ubah(TANPA_FILTER)}
            className="mt-4 inline-flex min-h-11 items-center rounded-card bg-primary px-4 text-sm font-semibold text-onprimary"
          >
            Hapus semua filter
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-5 md:mt-6 md:grid-cols-2 lg:grid-cols-3">
          {hasil.map(({ row, keberangkatan, jumlahTanggalLain }) => (
            <PackageCard
              key={row.id}
              paket={row}
              keberangkatan={keberangkatan}
              jumlahTanggalLain={jumlahTanggalLain}
            />
          ))}
        </div>
      )}
    </div>
  );
}
