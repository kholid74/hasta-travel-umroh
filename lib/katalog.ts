import type { Departure, Hotel, OccupancyPrice, Package, PackageType } from "@/content/types";
import { openDepartures } from "./departures.ts";

/** Bentuk ringkas paket untuk katalog — itinerary dan syarat tidak ikut dikirim ke browser. */
export type KatalogRow = {
  id: string;
  slug: string;
  name: string;
  type: PackageType;
  duration: number;
  price: OccupancyPrice;
  makkahHotel: Hotel;
  madinahHotel: Hotel;
  departures: Departure[];
  /** Configured package tags (content/packages.ts); shown publicly only through `tagLayanan`. */
  tags?: string[];
};

export type SortKey = "tanggal" | "harga-naik" | "harga-turun";

export type Filter = {
  tipe?: PackageType;
  /** "YYYY-MM" */
  bulan?: string;
  /** Kota keberangkatan, mis. "Surabaya". */
  kota?: string;
  /** Batas atas harga quad, dalam rupiah. */
  maks?: number;
  durasi?: number;
  sort: SortKey;
};

export const FILTER_KOSONG: Filter = { sort: "tanggal" };

export type HasilKatalog = {
  row: KatalogRow;
  keberangkatan: Departure;
  jumlahTanggalLain: number;
};

export function toRow(paket: Package, hariIni: string): KatalogRow {
  return {
    id: paket.id,
    slug: paket.slug,
    name: paket.name,
    type: paket.type,
    duration: paket.duration,
    price: paket.price,
    makkahHotel: paket.makkahHotel,
    madinahHotel: paket.madinahHotel,
    tags: paket.tags,
    // Hanya keberangkatan yang masih bisa didaftar (setelah hari ini, waktu Jakarta).
    departures: openDepartures(paket.departures, hariIni),
  };
}

function hargaQuad(row: KatalogRow, keberangkatan: Departure): number {
  return (keberangkatan.price ?? row.price).quad;
}

/**
 * Menyaring paket, lalu memilih keberangkatan yang benar-benar cocok dengan
 * filter — bukan sekadar yang terdekat. Kalau user memfilter bulan Maret, kartu
 * harus menampilkan tanggal Maret, bukan tanggal Oktober.
 */
export function saring(rows: KatalogRow[], filter: Filter): HasilKatalog[] {
  const hasil: HasilKatalog[] = [];

  for (const row of rows) {
    if (filter.tipe && row.type !== filter.tipe) continue;
    if (filter.durasi && row.duration !== filter.durasi) continue;

    const cocok = row.departures.filter((d) => {
      if (filter.bulan && !d.date.startsWith(filter.bulan)) return false;
      if (filter.kota && d.departureCity !== filter.kota) return false;
      if (filter.maks && hargaQuad(row, d) > filter.maks) return false;
      return true;
    });
    if (cocok.length === 0) continue;

    hasil.push({ row, keberangkatan: cocok[0], jumlahTanggalLain: cocok.length - 1 });
  }

  const urut: Record<SortKey, (a: HasilKatalog, b: HasilKatalog) => number> = {
    tanggal: (a, b) => a.keberangkatan.date.localeCompare(b.keberangkatan.date),
    "harga-naik": (a, b) => hargaQuad(a.row, a.keberangkatan) - hargaQuad(b.row, b.keberangkatan),
    "harga-turun": (a, b) => hargaQuad(b.row, b.keberangkatan) - hargaQuad(a.row, a.keberangkatan),
  };
  return hasil.sort(urut[filter.sort]);
}

/** Daftar bulan yang benar-benar punya keberangkatan, untuk mengisi dropdown. */
export function bulanTersedia(rows: KatalogRow[]): string[] {
  const set = new Set<string>();
  for (const row of rows) for (const d of row.departures) set.add(d.date.slice(0, 7));
  return [...set].sort();
}

/** Kota keberangkatan yang benar-benar punya jadwal. */
export function kotaTersedia(rows: KatalogRow[]): string[] {
  return [...new Set(rows.flatMap((r) => r.departures.map((d) => d.departureCity)))].sort((a, b) => a.localeCompare(b, "id"));
}

export function durasiTersedia(rows: KatalogRow[]): number[] {
  return [...new Set(rows.map((r) => r.duration))].sort((a, b) => a - b);
}

export function filterDariQuery(query: URLSearchParams): Filter {
  const sort = query.get("sort");
  const tipe = query.get("tipe");
  const sah: PackageType[] = ["umroh-reguler", "umroh-plus", "umroh-ramadhan"];
  return {
    tipe: sah.includes(tipe as PackageType) ? (tipe as PackageType) : undefined,
    bulan: query.get("bulan") || undefined,
    kota: query.get("kota") || undefined,
    maks: Number(query.get("maks")) || undefined,
    durasi: Number(query.get("durasi")) || undefined,
    sort: sort === "harga-naik" || sort === "harga-turun" ? sort : "tanggal",
  };
}

export function queryDariFilter(filter: Filter): string {
  const query = new URLSearchParams();
  if (filter.tipe) query.set("tipe", filter.tipe);
  if (filter.bulan) query.set("bulan", filter.bulan);
  if (filter.kota) query.set("kota", filter.kota);
  if (filter.maks) query.set("maks", String(filter.maks));
  if (filter.durasi) query.set("durasi", String(filter.durasi));
  if (filter.sort !== "tanggal") query.set("sort", filter.sort);
  return query.toString();
}
