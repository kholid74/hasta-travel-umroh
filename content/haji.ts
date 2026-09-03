import { hotelMadinah, hotelMakkah } from "@/content/hotels";
import type { HajiPackage } from "@/content/types";

/**
 * SITUS DEMO — masa tunggu, kuota, dan harga di bawah ini fiktif.
 * Haji Khusus tidak dijual sebagai keberangkatan: yang dibeli adalah antrean,
 * jadi paket ini sengaja tidak punya tanggal pasti maupun sisa seat.
 */
export const hajiPackages: HajiPackage[] = [
  {
    id: "h01",
    slug: "haji-khusus-reguler",
    name: "Haji Khusus Reguler",
    waitingYears: 6,
    estimatedDepartureYear: 2032,
    quotaNote:
      "Nomor porsi terbit setelah setoran awal diterima Kemenag. Perkiraan tahun berangkat bisa bergeser mengikuti kuota nasional yang ditetapkan Arab Saudi setiap tahun.",
    priceUSD: 12500,
    dpUSD: 5000,
    installmentNote:
      "Setoran awal untuk mendapat nomor porsi, sisanya dicicil sampai pelunasan pada tahun keberangkatan.",
    durationDays: 26,
    makkahHotel: hotelMakkah.elafAjyad,
    madinahHotel: hotelMadinah.odst,
    facilities: [
      "Visa haji khusus dan pengurusan nomor porsi",
      "Tiket pesawat pulang-pergi",
      "Akomodasi hotel selama di Makkah, Madinah, dan Armina",
      "Konsumsi penuh menu Indonesia",
      "Pembimbing ibadah dan tenaga kesehatan pendamping",
      "Manasik haji berkala sampai tahun keberangkatan",
    ],
    requirements: [
      "Paspor berlaku minimal 8 bulan dengan nama minimal dua suku kata",
      "Setoran awal untuk penerbitan nomor porsi",
      "Kartu vaksin meningitis menjelang keberangkatan",
      "Surat keterangan sehat dari dokter",
    ],
  },
  {
    id: "h02",
    slug: "haji-khusus-eksekutif",
    name: "Haji Khusus Eksekutif",
    waitingYears: 5,
    estimatedDepartureYear: 2031,
    quotaNote:
      "Kuota lebih terbatas dari paket reguler. Perkiraan tahun berangkat tetap bergantung pada kuota nasional, bukan janji kami.",
    priceUSD: 18900,
    dpUSD: 7500,
    installmentNote:
      "Setoran awal untuk nomor porsi, pelunasan bertahap. Jadwal cicilan disusun per jamaah.",
    durationDays: 24,
    makkahHotel: hotelMakkah.swissotel,
    madinahHotel: hotelMadinah.movenpick,
    facilities: [
      "Visa haji khusus dan pengurusan nomor porsi",
      "Tiket pesawat pulang-pergi",
      "Hotel bintang lima dengan akses langsung ke pelataran masjid",
      "Tenda Armina kategori upgrade",
      "Konsumsi penuh menu Indonesia",
      "Pembimbing ibadah dan tenaga kesehatan pendamping",
    ],
    requirements: [
      "Paspor berlaku minimal 8 bulan dengan nama minimal dua suku kata",
      "Setoran awal untuk penerbitan nomor porsi",
      "Kartu vaksin meningitis menjelang keberangkatan",
      "Surat keterangan sehat dari dokter",
    ],
  },
  {
    id: "h03",
    slug: "haji-mujamalah",
    name: "Haji Mujamalah (Visa Furoda)",
    waitingYears: 0,
    estimatedDepartureYear: 2027,
    quotaNote:
      "Tanpa antre nomor porsi, tetapi visa mujamalah diterbitkan langsung oleh Pemerintah Arab Saudi dan jumlahnya tidak pernah dipastikan sebelum musim haji berjalan. Siapa pun yang menjamin visa ini pasti terbit sedang menjanjikan hal yang bukan wewenangnya.",
    priceUSD: 27500,
    dpUSD: 10000,
    installmentNote:
      "Pembayaran bertahap dalam tahun berjalan. Bila visa tidak terbit, dana dikembalikan sesuai ketentuan yang disepakati di awal — bukan ditahan.",
    durationDays: 22,
    makkahHotel: hotelMakkah.fairmont,
    madinahHotel: hotelMadinah.darAlTaqwa,
    facilities: [
      "Pengurusan visa mujamalah",
      "Tiket pesawat pulang-pergi",
      "Hotel bintang lima terdekat dengan masjid",
      "Tenda Armina VIP",
      "Konsumsi penuh menu Indonesia",
      "Rombongan kecil dengan pembimbing khusus",
    ],
    requirements: [
      "Paspor berlaku minimal 8 bulan dengan nama minimal dua suku kata",
      "Uang muka pendaftaran",
      "Kartu vaksin meningitis",
      "Surat keterangan sehat dari dokter",
    ],
  },
];

export function hajiBySlug(slug: string): HajiPackage | undefined {
  return hajiPackages.find((p) => p.slug === slug);
}
