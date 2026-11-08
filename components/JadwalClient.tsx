"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { LABEL_TIPE, StatusKursi } from "@/components/public/ui";
import { useBusinessToday } from "@/components/useBusinessToday";
import type { PackageType } from "@/content/types";
import { isOpenForRegistration } from "@/lib/departures";
import { bulanTahun, rupiahSingkat, tanggalPanjang } from "@/lib/format";

export type BarisJadwal = {
  id: string;
  date: string;
  slug: string;
  namaPaket: string;
  tipe: PackageType;
  durasi: number;
  departureCity: string;
  airline: string;
  seatsAvailable: number;
  jarakMakkah: number;
  hargaQuad: number;
};

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
/** Weekday computed from the calendar date itself (UTC), so it never shifts with the viewer's time zone. */
const hariDari = (iso: string) => HARI[new Date(`${iso}T00:00:00Z`).getUTCDay()];

const kelasKontrol = "mt-1.5 min-h-12 w-full rounded-card border bg-surface px-3 text-base font-normal text-ink";
const TIPE_SAH: PackageType[] = ["umroh-reguler", "umroh-plus", "umroh-ramadhan"];

type Saring = { bulan: string; kota: string; tipe: PackageType | "" };
const KOSONG: Saring = { bulan: "", kota: "", tipe: "" };

/**
 * Departure schedule (PUBLIC-02B). Re-filtered against today's Jakarta date in the browser (PUBLIC-01);
 * month, city and type live in the URL with the same keys as the catalogue (`bulan`, `kota`, `tipe`).
 */
export function JadwalClient({ baris: semua, serverToday }: { baris: BarisJadwal[]; serverToday: string }) {
  const today = useBusinessToday(serverToday);
  const terbuka = semua.filter((b) => isOpenForRegistration(b.date, today));
  const [saring, setSaring] = useState<Saring>(KOSONG);
  const [panelTerbuka, setPanelTerbuka] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const tipe = q.get("tipe") as PackageType;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaring({ bulan: q.get("bulan") ?? "", kota: q.get("kota") ?? "", tipe: TIPE_SAH.includes(tipe) ? tipe : "" });
  }, []);

  function ubah(sebagian: Partial<Saring>) {
    const baru = { ...saring, ...sebagian };
    setSaring(baru);
    const q = new URLSearchParams();
    if (baru.tipe) q.set("tipe", baru.tipe);
    if (baru.bulan) q.set("bulan", baru.bulan);
    if (baru.kota) q.set("kota", baru.kota);
    const s = q.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  }

  const bulanOpsi = [...new Set(terbuka.map((b) => b.date.slice(0, 7)))].sort();
  const kotaOpsi = [...new Set(terbuka.map((b) => b.departureCity))].sort((a, b) => a.localeCompare(b, "id"));
  const baris = terbuka.filter(
    (b) => (!saring.bulan || b.date.startsWith(saring.bulan)) && (!saring.kota || b.departureCity === saring.kota) && (!saring.tipe || b.tipe === saring.tipe),
  );
  const perBulan = new Map<string, BarisJadwal[]>();
  for (const b of baris) {
    const kunci = b.date.slice(0, 7);
    perBulan.set(kunci, [...(perBulan.get(kunci) ?? []), b]);
  }
  const adaPilihan = Boolean(saring.bulan || saring.kota || saring.tipe);

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-center justify-between gap-4 sm:hidden">
          <button
            type="button"
            onClick={() => setPanelTerbuka((v) => !v)}
            aria-expanded={panelTerbuka}
            aria-controls="panel-jadwal"
            className="inline-flex min-h-12 items-center gap-2 rounded-card border border-control bg-surface px-4 font-semibold"
          >
            <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.75} />
            Filter{adaPilihan ? " (aktif)" : ""}
          </button>
          <p className="text-sm"><span className="font-semibold">{baris.length}</span> <span className="text-muted">keberangkatan</span></p>
        </div>
        <form
          id="panel-jadwal"
          onSubmit={(e) => e.preventDefault()}
          className={`${panelTerbuka ? "mt-3 grid" : "hidden"} gap-4 rounded-card border border-hairline bg-surface p-4 sm:mt-0 sm:grid sm:grid-cols-3 sm:p-5 lg:grid-cols-1`}
          aria-label="Filter jadwal"
          data-jadwal-filter
        >
          <label className="block text-sm font-semibold" htmlFor="j-bulan">
            Bulan
            <select id="j-bulan" className={kelasKontrol} value={saring.bulan} onChange={(e) => ubah({ bulan: e.target.value })}>
              <option value="">Semua bulan</option>
              {bulanOpsi.map((b) => <option key={b} value={b}>{bulanTahun(`${b}-01`)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold" htmlFor="j-kota">
            Kota keberangkatan
            <select id="j-kota" className={kelasKontrol} value={saring.kota} onChange={(e) => ubah({ kota: e.target.value })}>
              <option value="">Semua kota</option>
              {kotaOpsi.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <label className="block text-sm font-semibold" htmlFor="j-tipe">
            Jenis paket
            <select id="j-tipe" className={kelasKontrol} value={saring.tipe} onChange={(e) => ubah({ tipe: e.target.value as PackageType | "" })}>
              <option value="">Semua jenis</option>
              {TIPE_SAH.map((t) => <option key={t} value={t}>{LABEL_TIPE[t].replace("Umrah ", "")}</option>)}
            </select>
          </label>
          <div className="sm:col-span-3 lg:col-span-1">
            <p className="text-sm" aria-live="polite">
              <span className="font-semibold" data-jumlah-jadwal={baris.length}>{baris.length} keberangkatan</span>
              <span className="text-muted"> {adaPilihan ? "sesuai pilihan" : "yang masih bisa didaftar"}</span>
            </p>
            {adaPilihan && (
              <button type="button" onClick={() => ubah(KOSONG)} className="mt-2 min-h-11 text-sm font-semibold text-emerald underline underline-offset-4">
                Hapus pilihan
              </button>
            )}
          </div>
        </form>
        <p className="mt-3 hidden text-xs text-muted sm:block">Harga per orang untuk kamar ber-4. Tanggal yang sudah lewat tidak ditampilkan; tanggal penuh tetap terlihat.</p>
      </div>

      <div className="min-w-0 space-y-10">
        {[...perBulan.entries()].map(([kunci, isi]) => (
          <section key={kunci} aria-labelledby={`bulan-${kunci}`}>
            <h2 id={`bulan-${kunci}`} className="flex items-baseline gap-3 border-b border-hairline pb-2 text-2xl sm:text-3xl">
              {bulanTahun(`${kunci}-01`)}
              <span className="font-sans text-sm text-muted">
                <span className="sr-only"> · </span>
                {isi.length} keberangkatan
              </span>
            </h2>
            <ul className="divide-y divide-hairline">
              {isi.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/paket-umroh/${b.slug}?d=${b.date}`}
                    data-jadwal-baris
                    className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_8rem_7rem_auto]"
                  >
                    <span className="row-span-2 grid h-14 place-content-center rounded-[8px] bg-raised text-center sm:row-span-1">
                      <span className="font-display text-2xl leading-none tabular-nums text-forest">{Number(b.date.slice(8))}</span>
                      <span className="text-[11px] font-semibold text-muted">{hariDari(b.date)}</span>
                      <span className="sr-only">{tanggalPanjang(b.date)}</span>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold group-hover:text-emerald">{b.namaPaket}</span>
                      <span className="block text-sm text-muted">
                        dari {b.departureCity} · {b.airline} · {b.durasi} hari · {b.jarakMakkah} m ke Masjidil Haram
                      </span>
                    </span>
                    <span className="hidden sm:block"><StatusKursi seats={b.seatsAvailable} className="text-sm" /></span>
                    <span className="text-right font-display text-xl tabular-nums text-forest sm:text-left">{rupiahSingkat(b.hargaQuad)}</span>
                    <span className="col-start-2 sm:hidden"><StatusKursi seats={b.seatsAvailable} className="text-sm" /></span>
                    <span className="hidden items-center gap-1 text-sm font-semibold text-emerald sm:inline-flex">
                      Pilih
                      <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {baris.length === 0 && (
          <div className="rounded-card border border-hairline bg-surface p-8 text-center" data-jadwal-kosong>
            <p className="font-display text-2xl">{terbuka.length === 0 ? "Belum ada tanggal yang bisa didaftar" : "Tidak ada keberangkatan untuk pilihan ini"}</p>
            <p className="mx-auto mt-2 max-w-md text-muted">Coba bulan atau kota lain, atau tanyakan rencana keberangkatan berikutnya.</p>
            {adaPilihan && (
              <button type="button" onClick={() => ubah(KOSONG)} className="mt-5 inline-flex min-h-11 items-center rounded-card bg-primary px-5 font-semibold text-onprimary hover:bg-primary-hover">
                Hapus pilihan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
