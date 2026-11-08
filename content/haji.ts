import { hotelMadinah, hotelMakkah } from "@/content/hotels";
import { hajiKhususRequirements, hajiMujamalahRequirements } from "@/content/requirements";
import type { HajiPackage } from "@/content/types";

/**
 * SITUS DEMO — masa tunggu, kuota, dan harga di bawah ini fiktif.
 * Haji Khusus tidak dijual sebagai keberangkatan: yang didaftarkan adalah antrean (nomor porsi),
 * jadi paket ini sengaja tidak punya tanggal pasti maupun sisa seat.
 * Haji Mujamalah adalah jalur terpisah (visa undangan, tanpa nomor porsi) dan ditampilkan sebagai
 * contoh yang memerlukan konfirmasi operator — tidak ada kepastian visa yang dijanjikan.
 */
export const hajiPackages: HajiPackage[] = [
  {
    id: "h01",
    slug: "haji-khusus-reguler",
    name: "Haji Khusus Reguler",
    kategori: "khusus",
    waitingYears: 6,
    estimatedDepartureYear: 2032,
    quotaNote:
      "Nomor porsi diterbitkan melalui sistem pemerintah setelah setoran awal diterima. Perkiraan tahun berangkat dapat bergeser mengikuti kuota yang ditetapkan setiap tahun.",
    priceUSD: 12500,
    dpUSD: 5000,
    installmentNote:
      "Setoran awal untuk mendapat nomor porsi, sisanya dicicil sampai pelunasan pada tahun keberangkatan.",
    durationDays: 26,
    makkahHotel: hotelMakkah.elafAjyad,
    madinahHotel: hotelMadinah.odst,
    facilities: [
      "Pengurusan pendaftaran dan nomor porsi Haji Khusus",
      "Tiket pesawat pulang-pergi",
      "Akomodasi hotel selama di Makkah, Madinah, dan Armina",
      "Konsumsi penuh menu Indonesia",
      "Pembimbing ibadah dan tenaga kesehatan pendamping",
      "Manasik haji berkala sampai tahun keberangkatan",
    ],
    requirements: hajiKhususRequirements,
  },
  {
    id: "h02",
    slug: "haji-khusus-eksekutif",
    name: "Haji Khusus Eksekutif",
    kategori: "khusus",
    waitingYears: 5,
    estimatedDepartureYear: 2031,
    quotaNote:
      "Kuota paket ini lebih terbatas. Perkiraan tahun berangkat tetap bergantung pada kuota yang ditetapkan setiap tahun, bukan janji kami.",
    priceUSD: 18900,
    dpUSD: 7500,
    installmentNote:
      "Setoran awal untuk nomor porsi, pelunasan bertahap. Jadwal cicilan disusun per jamaah.",
    durationDays: 24,
    makkahHotel: hotelMakkah.swissotel,
    madinahHotel: hotelMadinah.movenpick,
    facilities: [
      "Pengurusan pendaftaran dan nomor porsi Haji Khusus",
      "Tiket pesawat pulang-pergi",
      "Hotel bintang lima dengan akses langsung ke pelataran masjid",
      "Tenda Armina kategori upgrade",
      "Konsumsi penuh menu Indonesia",
      "Pembimbing ibadah dan tenaga kesehatan pendamping",
    ],
    requirements: hajiKhususRequirements,
  },
  {
    id: "h03",
    slug: "haji-mujamalah",
    name: "Haji Mujamalah",
    kategori: "mujamalah",
    waitingYears: 0,
    estimatedDepartureYear: 2027,
    quotaNote:
      "Visa mujamalah diterbitkan atas undangan Pemerintah Arab Saudi dan jumlahnya tidak dapat dipastikan sebelum musim haji. Kami tidak menjanjikan kepastian visa ini; berhati-hatilah terhadap pihak yang menjaminnya.",
    priceUSD: 27500,
    dpUSD: 10000,
    installmentNote:
      "Pembayaran bertahap dalam tahun berjalan. Ketentuan pengembalian dana bila visa tidak terbit disepakati tertulis sebelum pembayaran (contoh ketentuan demo).",
    durationDays: 22,
    makkahHotel: hotelMakkah.fairmont,
    madinahHotel: hotelMadinah.darAlTaqwa,
    facilities: [
      "Pendampingan pengajuan visa mujamalah (penerbitan tidak dijamin)",
      "Tiket pesawat pulang-pergi",
      "Hotel bintang lima terdekat dengan masjid",
      "Tenda Armina VIP",
      "Konsumsi penuh menu Indonesia",
      "Rombongan kecil dengan pembimbing khusus",
    ],
    requirements: hajiMujamalahRequirements,
  },
];

export function hajiBySlug(slug: string): HajiPackage | undefined {
  return hajiPackages.find((p) => p.slug === slug);
}

/**
 * PUBLIC-02B — pertanyaan umum Haji Khusus. Jawabannya hanya merangkum keterangan yang sudah ada di data
 * paket dan halaman ini (kuota tahunan, setoran awal, kurs, jalur Mujamalah); tidak ada aturan baru.
 */
export const faqHaji: { q: string; a: string }[] = [
  {
    q: "Apakah tahun keberangkatan bisa dipastikan sejak mendaftar?",
    a: "Tidak. Setelah setoran awal, yang Anda dapatkan adalah nomor porsi dan perkiraan tahun berangkat. Tahun sebenarnya mengikuti kuota yang ditetapkan setiap tahun, sehingga bisa maju atau mundur. Berhati-hatilah terhadap pihak yang menjanjikan tahun pasti.",
  },
  {
    q: "Kenapa harganya dalam dolar AS?",
    a: "Biaya Haji Khusus lazim dikutip dalam dolar AS. Nilai rupiahnya mengikuti kurs pada tanggal pembayaran dan dikonfirmasi saat konsultasi.",
  },
  {
    q: "Bagaimana skema pembayarannya?",
    a: "Dimulai dengan setoran awal untuk mendaftarkan nomor porsi, lalu sisa biaya dicicil sampai pelunasan pada tahun keberangkatan. Jadwal cicilan disusun per jamaah dan dijelaskan tertulis sebelum Anda membayar.",
  },
  {
    q: "Apa bedanya dengan Haji Mujamalah?",
    a: "Haji Mujamalah tidak memakai nomor porsi; visanya diterbitkan atas undangan Pemerintah Arab Saudi dan jumlahnya tidak dapat dipastikan sebelum musim haji. Karena itu jalurnya dijelaskan terpisah di bagian bawah halaman ini.",
  },
];
