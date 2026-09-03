/** Jalankan: node lib/format.check.ts */
import assert from "node:assert/strict";
import {
  bulanTahun, menitJalan, rupiah, rupiahSingkat, statusKeberangkatan, tanggalPanjang,
} from "./format.ts";

assert.equal(rupiah(27_500_000), "Rp 27.500.000");
assert.equal(rupiahSingkat(27_500_000), "Rp 27,5 jt");
assert.equal(rupiahSingkat(35_000_000), "Rp 35 jt");

// Tanggal tidak boleh bergeser karena zona waktu, berapa pun offset mesinnya.
assert.equal(tanggalPanjang("2026-03-12"), "12 Maret 2026");
assert.equal(tanggalPanjang("2026-01-01"), "1 Januari 2026");
assert.equal(bulanTahun("2026-12-05"), "Desember 2026");

// 180m pada kecepatan lansia = 4 menit, bukan 2 menit.
assert.equal(menitJalan(180), 4);
assert.equal(menitJalan(10), 1);
assert.equal(menitJalan(1200), 24);

assert.equal(statusKeberangkatan(0), "sold-out");
assert.equal(statusKeberangkatan(5), "limited");
assert.equal(statusKeberangkatan(6), "available");

console.log("format.ts OK");
