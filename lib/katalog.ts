import type { Departure, Hotel, OccupancyPrice, Package, PackageType } from "@/content/types";

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
};

export type SortKey = "tanggal" | "harga-naik" | "harga-turun";

export type Filter = {
  tipe?: PackageType;
  /** "YYYY-MM" */
  bulan?: string;
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
    departures: paket.departures
      .filter((d) => d.date >= hariIni)
      .sort((a, b) => a.date.localeCompare(b.date)),
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

export function durasiTersedia(rows: KatalogRow[]): number[] {
  return [...new Set(rows.map((r) => r.duration))].sort((a, b) => a - b);
}

export function filterDariQuery(query: URLSearchParams): Filter {
  const sort = query.get("sort");
  const tipe = query.get("tipe");
  const sah: PackageType[] = ["umroh-reguler", "umroh-plus", "umroh-ramadhan"];
  return {
    tipe: sah.includes(tipe as PackageType) ? (tipe as PackageType) : undefined,
    bulan: query.get("bulan") ?? undefined,
    maks: Number(query.get("maks")) || undefined,
    durasi: Number(query.get("durasi")) || undefined,
    sort: sort === "harga-naik" || sort === "harga-turun" ? sort : "tanggal",
  };
}

export function queryDariFilter(filter: Filter): string {
  const query = new URLSearchParams();
  if (filter.tipe) query.set("tipe", filter.tipe);
  if (filter.bulan) query.set("bulan", filter.bulan);
  if (filter.maks) query.set("maks", String(filter.maks));
  if (filter.durasi) query.set("durasi", String(filter.durasi));
  if (filter.sort !== "tanggal") query.set("sort", filter.sort);
  return query.toString();
}
