/** Jalankan: node lib/katalog.check.ts */
import assert from "node:assert/strict";
import type { Departure, Hotel } from "../content/types.ts";
import {
  bulanTersedia, type KatalogRow, filterDariQuery, queryDariFilter, saring,
} from "./katalog.ts";

const hotel: Hotel = {
  name: "Hotel Uji",
  starRating: 4,
  distanceMeters: 300,
  landmark: "Masjidil Haram",
  route: "direct",
  stepFree: true,
};

const dep = (date: string, seats: number, quad?: number): Departure => ({
  id: date,
  date,
  departureCity: "Jakarta",
  airline: "Saudia",
  seatsAvailable: seats,
  price: quad ? { quad, triple: quad + 2e6, double: quad + 5e6 } : undefined,
});

const row = (
  id: string,
  type: KatalogRow["type"],
  duration: number,
  quad: number,
  departures: Departure[],
): KatalogRow => ({
  id,
  slug: id,
  name: id,
  type,
  duration,
  price: { quad, triple: quad + 2e6, double: quad + 5e6 },
  makkahHotel: hotel,
  madinahHotel: hotel,
  departures,
});

const rows: KatalogRow[] = [
  row("murah", "umroh-reguler", 9, 26e6, [
    dep("2026-10-14", 18),
    dep("2027-03-10", 4),
  ]),
  row("mahal", "umroh-plus", 14, 47e6, [
    dep("2026-10-07", 0), // sold out, tetap harus tampil
    dep("2027-03-24", 12),
  ]),
  // Keberangkatan musim ramai memakai harga override yang lebih mahal.
  row("musiman", "umroh-ramadhan", 12, 30e6, [dep("2027-02-05", 9, 44e6)]),
];

// Filter bulan memilih keberangkatan bulan itu, bukan yang terdekat.
const maret = saring(rows, { bulan: "2027-03", sort: "tanggal" });
assert.deepEqual(maret.map((h) => h.keberangkatan.date), ["2027-03-10", "2027-03-24"]);
assert.equal(maret[0].jumlahTanggalLain, 0);

// Sold out ditampilkan apa adanya, tidak disembunyikan.
assert.ok(saring(rows, { sort: "tanggal" }).some((h) => h.keberangkatan.seatsAvailable === 0));

// Batas harga memakai harga keberangkatan (override), bukan harga dasar paket.
// "musiman" berharga dasar 30jt tapi keberangkatannya 44jt, jadi harus tersaring keluar.
assert.deepEqual(
  saring(rows, { maks: 35e6, sort: "tanggal" }).map((h) => h.row.id),
  ["murah"],
);

// Urutan harga naik memakai harga keberangkatan juga.
assert.deepEqual(
  saring(rows, { sort: "harga-naik" }).map((h) => h.row.id),
  ["murah", "musiman", "mahal"],
);
assert.deepEqual(
  saring(rows, { sort: "harga-turun" }).map((h) => h.row.id),
  ["mahal", "musiman", "murah"],
);

// Kombinasi yang tidak menyisakan apa pun mengembalikan daftar kosong, bukan error.
assert.deepEqual(saring(rows, { bulan: "2099-01", sort: "tanggal" }), []);
assert.deepEqual(saring(rows, { tipe: "umroh-plus", durasi: 9, sort: "tanggal" }), []);

// Tipe ngawur di URL diabaikan — katalog tidak boleh jadi kosong gara-gara URL rusak.
assert.equal(filterDariQuery(new URLSearchParams("tipe=ngawur")).tipe, undefined);
assert.equal(saring(rows, filterDariQuery(new URLSearchParams("tipe=ngawur"))).length, 3);
assert.equal(filterDariQuery(new URLSearchParams("maks=abc")).maks, undefined);

// Filter -> query -> filter kembali ke nilai yang sama.
const asli = {
  tipe: "umroh-plus" as const,
  bulan: "2027-03",
  maks: 50e6,
  durasi: 14,
  sort: "harga-turun" as const,
};
assert.deepEqual(filterDariQuery(new URLSearchParams(queryDariFilter(asli))), asli);
assert.equal(queryDariFilter({ sort: "tanggal" }), "");

// Bulan tanpa keberangkatan tidak muncul di dropdown.
assert.deepEqual(bulanTersedia(rows), ["2026-10", "2027-02", "2027-03"]);

console.log("katalog.ts OK");
