import type { ItineraryDay } from "@/content/types";

/**
 * Rangka itinerary per durasi. Travel sungguhan memang memakai rangka yang sama
 * untuk banyak paket — yang berbeda hotel, maskapai, dan tanggalnya. Paket
 * unggulan menulis itinerary-nya sendiri.
 */

const HARI_BERANGKAT: ItineraryDay = {
  day: 1,
  title: "Keberangkatan dari Tanah Air",
  description:
    "Berkumpul di bandara 4 jam sebelum keberangkatan, pembagian perlengkapan, briefing terakhir bersama pembimbing, lalu terbang menuju Madinah.",
};

const HARI_TIBA_MADINAH = (day: number): ItineraryDay => ({
  day,
  title: "Tiba di Madinah",
  description:
    "Mendarat di Bandara Pangeran Mohammad bin Abdulaziz, proses imigrasi, menuju hotel untuk check-in dan istirahat. Shalat berjamaah pertama di Masjid Nabawi.",
});

const HARI_NABAWI = (day: number): ItineraryDay => ({
  day,
  title: "Ibadah di Masjid Nabawi",
  description:
    "Shalat arba'in, ziarah ke Makam Rasulullah, dan giliran masuk Raudhah sesuai jadwal aplikasi Nusuk yang diurus pembimbing.",
});

const HARI_ZIARAH_MADINAH = (day: number): ItineraryDay => ({
  day,
  title: "Ziarah Kota Madinah",
  description:
    "Masjid Quba, Jabal Uhud dan makam para syuhada, Masjid Qiblatain, serta kebun kurma. Kembali ke hotel sebelum Zuhur.",
});

const HARI_KE_MAKKAH = (day: number): ItineraryDay => ({
  day,
  title: "Madinah menuju Makkah — Umroh Pertama",
  description:
    "Check-out, mandi dan berihram, mengambil miqat di Bir Ali, perjalanan darat ke Makkah, lalu melaksanakan thawaf, sa'i, dan tahallul.",
});

const HARI_HARAM = (day: number): ItineraryDay => ({
  day,
  title: "Ibadah Mandiri di Masjidil Haram",
  description:
    "Waktu bebas untuk memperbanyak thawaf sunnah dan shalat berjamaah. Pembimbing tetap mendampingi di titik kumpul yang disepakati.",
});

const HARI_ZIARAH_MAKKAH = (day: number): ItineraryDay => ({
  day,
  title: "Ziarah Kota Makkah + Umroh Kedua",
  description:
    "Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, dan Mina. Mengambil miqat di Ja'ranah untuk umroh kedua bagi yang berkenan.",
});

const HARI_PULANG = (day: number): ItineraryDay => ({
  day,
  title: "Kembali ke Tanah Air",
  description:
    "Thawaf wada', check-out hotel, perjalanan menuju Bandara King Abdulaziz Jeddah, dan terbang pulang.",
});

const HARI_TIBA = (day: number): ItineraryDay => ({
  day,
  title: "Tiba di Tanah Air",
  description: "Mendarat di bandara keberangkatan, pengurusan bagasi, dan perpisahan rombongan.",
});

export function itinerary9(): ItineraryDay[] {
  return [
    HARI_BERANGKAT,
    HARI_TIBA_MADINAH(2),
    HARI_NABAWI(3),
    HARI_ZIARAH_MADINAH(4),
    HARI_KE_MAKKAH(5),
    HARI_HARAM(6),
    HARI_ZIARAH_MAKKAH(7),
    HARI_PULANG(8),
    HARI_TIBA(9),
  ];
}

export function itinerary12(): ItineraryDay[] {
  return [
    HARI_BERANGKAT,
    HARI_TIBA_MADINAH(2),
    HARI_NABAWI(3),
    HARI_ZIARAH_MADINAH(4),
    HARI_NABAWI(5),
    HARI_KE_MAKKAH(6),
    HARI_HARAM(7),
    HARI_ZIARAH_MAKKAH(8),
    HARI_HARAM(9),
    HARI_HARAM(10),
    HARI_PULANG(11),
    HARI_TIBA(12),
  ];
}

export function itinerary14(): ItineraryDay[] {
  return [
    HARI_BERANGKAT,
    HARI_TIBA_MADINAH(2),
    HARI_NABAWI(3),
    HARI_ZIARAH_MADINAH(4),
    HARI_NABAWI(5),
    HARI_NABAWI(6),
    HARI_KE_MAKKAH(7),
    HARI_HARAM(8),
    HARI_ZIARAH_MAKKAH(9),
    HARI_HARAM(10),
    HARI_HARAM(11),
    HARI_HARAM(12),
    HARI_PULANG(13),
    HARI_TIBA(14),
  ];
}
