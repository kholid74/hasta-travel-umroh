import type { Departure, DepartureStatus, OccupancyPrice } from "@/content/types";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "Rp 27.500.000" — dipakai di halaman detail. */
export function rupiah(nominal: number): string {
  return "Rp " + Math.round(nominal).toLocaleString("id-ID");
}

/** "Rp 27,5 jt" — dipakai di card, yang butuh kepadatan. */
export function rupiahSingkat(nominal: number): string {
  const juta = nominal / 1_000_000;
  const angka = juta % 1 === 0 ? String(juta) : juta.toFixed(1).replace(".", ",");
  return `Rp ${angka} jt`;
}

/**
 * "12 Maret 2026". Dipecah manual, bukan lewat Date, supaya tanggal tidak
 * pernah bergeser satu hari karena zona waktu.
 */
export function tanggalPanjang(iso: string): string {
  const [tahun, bulan, hari] = iso.split("-");
  return `${Number(hari)} ${BULAN[Number(bulan) - 1]} ${tahun}`;
}

/** "Maret 2026" — untuk pengelompokan di halaman Jadwal Keberangkatan. */
export function bulanTahun(iso: string): string {
  const [tahun, bulan] = iso.split("-");
  return `${BULAN[Number(bulan) - 1]} ${tahun}`;
}

/**
 * Waktu jalan kaki pada kecepatan jamaah lansia (~50 m/menit), bukan kecepatan
 * orang sehat (~80 m/menit). Melebihkan ke arah lambat adalah satu-satunya arah
 * kesalahan yang tidak merugikan pengguna.
 */
export const KECEPATAN_JALAN_LANSIA = 50;

export function menitJalan(meter: number): number {
  return Math.max(1, Math.ceil(meter / KECEPATAN_JALAN_LANSIA));
}

/** Status selalu diturunkan dari seats — tidak pernah diketik manual. */
export function statusKeberangkatan(seatsAvailable: number): DepartureStatus {
  if (seatsAvailable <= 0) return "sold-out";
  if (seatsAvailable <= 5) return "limited";
  return "available";
}

export const LABEL_STATUS: Record<DepartureStatus, string> = {
  available: "Tersedia",
  limited: "Sisa terbatas",
  "sold-out": "Sold Out",
};

export function hargaKeberangkatan(
  paket: { price: OccupancyPrice },
  keberangkatan: Departure,
): OccupancyPrice {
  return keberangkatan.price ?? paket.price;
}

/** Keberangkatan terdekat yang belum lewat; sold-out tetap ditampilkan apa adanya. */
export function keberangkatanTerdekat(
  paket: { departures: Departure[] },
  hariIni: string,
): Departure | undefined {
  return paket.departures
    .filter((d) => d.date >= hariIni)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** "US$ 12.500" — harga Haji Khusus dikutip dalam dolar, seperti praktik industrinya. */
export function dolar(nominal: number): string {
  return "US$ " + Math.round(nominal).toLocaleString("id-ID");
}
