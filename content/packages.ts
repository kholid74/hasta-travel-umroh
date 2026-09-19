import { hotelMadinah, hotelMakkah } from "@/content/hotels";
import { itinerary9, itinerary12, itinerary14 } from "@/content/itinerary";
import type { Departure, OccupancyPrice, Package } from "@/content/types";

/** SITUS DEMO — harga, ketersediaan seat, dan nama paket di bawah ini fiktif. */

const jt = (n: number) => Math.round(n * 1_000_000);
const harga = (quad: number, triple: number, double: number): OccupancyPrice => ({
  quad: jt(quad),
  triple: jt(triple),
  double: jt(double),
});

const dep = (
  slug: string,
  date: string,
  departureCity: string,
  airline: string,
  seatsAvailable: number,
  price?: OccupancyPrice,
): Departure => ({ id: `${slug}-${date}`, date, departureCity, airline, seatsAvailable, price });

const FASILITAS = [
  "Tiket pesawat pulang-pergi kelas ekonomi",
  "Visa umroh dan pengurusan Nusuk",
  "Akomodasi hotel sesuai paket",
  "Makan 3x sehari, menu Indonesia",
  "Bus ber-AC untuk seluruh perjalanan dan ziarah",
  "Pembimbing ibadah berbahasa Indonesia",
  "Air zamzam 5 liter",
  "Perlengkapan: koper, tas, kain ihram atau mukena, ID card",
  "Manasik umroh sebelum keberangkatan",
  "Asuransi perjalanan",
];

const EXCLUSIONS = [
  "Pembuatan paspor",
  "Vaksin meningitis",
  "Kelebihan bagasi di luar ketentuan maskapai",
  "Pengeluaran pribadi: laundry, telepon, oleh-oleh",
  "Tips dan handling di luar ketentuan paket",
  "Biaya perubahan tanggal keberangkatan setelah tiket terbit",
];

const SYARAT = [
  "Paspor berlaku minimal 8 bulan dengan nama minimal dua suku kata",
  "Kartu vaksin meningitis yang masih berlaku",
  "Pas foto berwarna latar putih ukuran 4x6",
  "Kartu keluarga dan akta kelahiran untuk jamaah di bawah 17 tahun",
  "Surat mahram untuk jamaah perempuan sesuai ketentuan yang berlaku",
  "Uang muka saat pendaftaran, pelunasan 40 hari sebelum keberangkatan",
];

type Draft = Omit<Package, "facilities" | "exclusions" | "requirements" | "itinerary"> & {
  itinerary?: Package["itinerary"];
};

function bangun(draft: Draft): Package {
  const bawaan =
    draft.duration === 9 ? itinerary9() : draft.duration === 14 ? itinerary14() : itinerary12();
  return {
    ...draft,
    itinerary: draft.itinerary ?? bawaan,
    facilities: FASILITAS,
    exclusions: EXCLUSIONS,
    requirements: SYARAT,
  };
}

export const packages: Package[] = [
  bangun({
    id: "p01",
    slug: "umroh-hemat-9-hari",
    name: "Umroh Hemat 9 Hari",
    type: "umroh-reguler",
    duration: 9,
    price: harga(25.9, 27.9, 30.9),
    makkahHotel: hotelMakkah.alKiswah,
    madinahHotel: hotelMadinah.rove,
    featured: true,
    departures: [
      dep("umroh-hemat-9-hari", "2026-10-14", "Jakarta", "Lion Air", 18),
      dep("umroh-hemat-9-hari", "2026-11-11", "Surabaya", "Lion Air", 4),
      dep("umroh-hemat-9-hari", "2027-01-13", "Jakarta", "Lion Air", 22),
      dep("umroh-hemat-9-hari", "2027-04-14", "Medan", "Lion Air", 26),
    ],
  }),
  bangun({
    id: "p02",
    slug: "umroh-reguler-9-hari",
    name: "Umroh Reguler 9 Hari",
    type: "umroh-reguler",
    duration: 9,
    price: harga(27.9, 29.9, 32.9),
    makkahHotel: hotelMakkah.mGrandAjyad,
    madinahHotel: hotelMadinah.alAnsarGolden,
    featured: false,
    departures: [
      dep("umroh-reguler-9-hari", "2026-10-07", "Jakarta", "Saudia", 0),
      dep("umroh-reguler-9-hari", "2026-11-18", "Jakarta", "Saudia", 12),
      dep("umroh-reguler-9-hari", "2027-01-20", "Solo", "Garuda Indonesia", 9),
    ],
  }),
  bangun({
    id: "p03",
    slug: "umroh-reguler-12-hari",
    name: "Umroh Reguler 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(29.9, 31.9, 34.9),
    makkahHotel: hotelMakkah.grandAlMassa,
    madinahHotel: hotelMadinah.badrAlMaqam,
    featured: false,
    departures: [
      dep("umroh-reguler-12-hari", "2026-10-21", "Jakarta", "Saudia", 15),
      dep("umroh-reguler-12-hari", "2026-12-02", "Surabaya", "Oman Air", 3),
      dep("umroh-reguler-12-hari", "2027-01-27", "Jakarta", "Saudia", 20),
      dep("umroh-reguler-12-hari", "2027-05-12", "Makassar", "Etihad Airways", 24),
    ],
  }),
  bangun({
    id: "p04",
    slug: "umroh-nyaman-12-hari",
    name: "Umroh Nyaman 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(32.5, 34.5, 37.9),
    makkahHotel: hotelMakkah.elafAjyad,
    madinahHotel: hotelMadinah.alEimanRoyal,
    featured: false,
    departures: [
      dep("umroh-nyaman-12-hari", "2026-11-04", "Jakarta", "Qatar Airways", 11),
      dep("umroh-nyaman-12-hari", "2027-01-06", "Jakarta", "Qatar Airways", 16),
      dep("umroh-nyaman-12-hari", "2027-04-21", "Surabaya", "Emirates", 19),
    ],
  }),
  bangun({
    id: "p05",
    slug: "umroh-dekat-haram-9-hari",
    name: "Umroh Dekat Haram 9 Hari",
    type: "umroh-reguler",
    duration: 9,
    price: harga(38.9, 41.5, 45.9),
    makkahHotel: hotelMakkah.swissotel,
    madinahHotel: hotelMadinah.pullmanZamzam,
    featured: false,
    departures: [
      dep("umroh-dekat-haram-9-hari", "2026-10-28", "Jakarta", "Saudia", 6),
      dep("umroh-dekat-haram-9-hari", "2026-12-09", "Jakarta", "Garuda Indonesia", 0),
      dep("umroh-dekat-haram-9-hari", "2027-02-03", "Jakarta", "Saudia", 14),
    ],
  }),
  bangun({
    id: "p06",
    slug: "umroh-premium-12-hari",
    name: "Umroh Premium 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(44.5, 47.5, 52.9),
    makkahHotel: hotelMakkah.pullmanZamzam,
    madinahHotel: hotelMadinah.movenpick,
    featured: true,
    departures: [
      dep("umroh-premium-12-hari", "2026-11-25", "Jakarta", "Garuda Indonesia", 8),
      dep("umroh-premium-12-hari", "2027-01-13", "Jakarta", "Garuda Indonesia", 10),
      dep("umroh-premium-12-hari", "2027-05-05", "Surabaya", "Emirates", 16),
    ],
  }),
  bangun({
    id: "p07",
    slug: "umroh-ramah-lansia-12-hari",
    name: "Umroh Ramah Lansia 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(49.9, 53.5, 58.9),
    makkahHotel: hotelMakkah.fairmont,
    madinahHotel: hotelMadinah.darAlTaqwa,
    featured: true,
    departures: [
      dep("umroh-ramah-lansia-12-hari", "2026-10-21", "Jakarta", "Garuda Indonesia", 5),
      dep("umroh-ramah-lansia-12-hari", "2027-02-10", "Jakarta", "Garuda Indonesia", 12),
      dep("umroh-ramah-lansia-12-hari", "2027-04-07", "Jakarta", "Saudia", 14),
    ],
  }),
  bangun({
    id: "p08",
    slug: "umroh-keluarga-14-hari",
    name: "Umroh Keluarga 14 Hari",
    type: "umroh-reguler",
    duration: 14,
    price: harga(41.5, 44.5, 49.5),
    makkahHotel: hotelMakkah.hiltonSuites,
    madinahHotel: hotelMadinah.frontel,
    featured: false,
    departures: [
      dep("umroh-keluarga-14-hari", "2026-12-20", "Jakarta", "Saudia", 2, harga(44.5, 47.5, 52.5)),
      dep("umroh-keluarga-14-hari", "2027-03-24", "Surabaya", "Qatar Airways", 17),
      dep("umroh-keluarga-14-hari", "2027-06-23", "Jakarta", "Saudia", 21, harga(43.5, 46.5, 51.5)),
    ],
  }),
  bangun({
    id: "p09",
    slug: "umroh-ekonomis-14-hari",
    name: "Umroh Ekonomis 14 Hari",
    type: "umroh-reguler",
    duration: 14,
    price: harga(28.9, 30.9, 33.9),
    makkahHotel: hotelMakkah.anjum,
    madinahHotel: hotelMadinah.rove,
    featured: false,
    departures: [
      dep("umroh-ekonomis-14-hari", "2026-11-11", "Makassar", "Lion Air", 25),
      dep("umroh-ekonomis-14-hari", "2027-01-20", "Balikpapan", "Lion Air", 18),
      dep("umroh-ekonomis-14-hari", "2027-05-19", "Medan", "Lion Air", 27),
    ],
  }),
  bangun({
    id: "p10",
    slug: "umroh-plus-thaif-12-hari",
    name: "Umroh Plus Thaif 12 Hari",
    type: "umroh-plus",
    duration: 12,
    price: harga(34.9, 36.9, 40.5),
    makkahHotel: hotelMakkah.elafAjyad,
    madinahHotel: hotelMadinah.odst,
    featured: false,
    departures: [
      dep("umroh-plus-thaif-12-hari", "2026-11-18", "Jakarta", "Saudia", 13),
      dep("umroh-plus-thaif-12-hari", "2027-03-10", "Jakarta", "Saudia", 20),
    ],
  }),
  bangun({
    id: "p11",
    slug: "umroh-plus-turki-14-hari",
    name: "Umroh Plus Turki 14 Hari",
    type: "umroh-plus",
    duration: 14,
    price: harga(46.9, 49.9, 54.9),
    makkahHotel: hotelMakkah.leMeridien,
    madinahHotel: hotelMadinah.millennium,
    featured: true,
    departures: [
      dep("umroh-plus-turki-14-hari", "2026-10-07", "Jakarta", "Turkish Airlines", 7),
      dep("umroh-plus-turki-14-hari", "2027-04-14", "Jakarta", "Turkish Airlines", 18),
    ],
  }),
  bangun({
    id: "p12",
    slug: "umroh-plus-dubai-12-hari",
    name: "Umroh Plus Dubai 12 Hari",
    type: "umroh-plus",
    duration: 12,
    price: harga(42.9, 45.5, 49.9),
    makkahHotel: hotelMakkah.hiltonSuites,
    madinahHotel: hotelMadinah.odst,
    featured: false,
    departures: [
      dep("umroh-plus-dubai-12-hari", "2026-12-16", "Jakarta", "Emirates", 4),
      dep("umroh-plus-dubai-12-hari", "2027-05-26", "Jakarta", "Emirates", 22),
    ],
  }),
  bangun({
    id: "p13",
    slug: "umroh-plus-kairo-14-hari",
    name: "Umroh Plus Kairo 14 Hari",
    type: "umroh-plus",
    duration: 14,
    price: harga(45.5, 48.5, 53.5),
    makkahHotel: hotelMakkah.leMeridien,
    madinahHotel: hotelMadinah.badrAlMaqam,
    featured: false,
    departures: [
      dep("umroh-plus-kairo-14-hari", "2026-11-04", "Jakarta", "Saudia", 0),
      dep("umroh-plus-kairo-14-hari", "2027-04-28", "Jakarta", "Saudia", 16),
    ],
  }),
  bangun({
    id: "p14",
    slug: "umroh-awal-ramadhan-1448-12-hari",
    name: "Umroh Awal Ramadhan 1448 H, 12 Hari",
    type: "umroh-ramadhan",
    duration: 12,
    price: harga(36.9, 38.9, 42.9),
    makkahHotel: hotelMakkah.grandAlMassa,
    madinahHotel: hotelMadinah.alAnsarGolden,
    featured: false,
    departures: [
      dep("umroh-awal-ramadhan-1448-12-hari", "2027-02-05", "Jakarta", "Saudia", 9),
      dep("umroh-awal-ramadhan-1448-12-hari", "2027-02-08", "Surabaya", "Oman Air", 14),
    ],
  }),
  bangun({
    id: "p15",
    slug: "umroh-pertengahan-ramadhan-1448-14-hari",
    name: "Umroh Pertengahan Ramadhan 1448 H, 14 Hari",
    type: "umroh-ramadhan",
    duration: 14,
    price: harga(42.9, 45.9, 50.9),
    makkahHotel: hotelMakkah.elafAjyad,
    madinahHotel: hotelMadinah.alEimanRoyal,
    featured: false,
    departures: [
      dep("umroh-pertengahan-ramadhan-1448-14-hari", "2027-02-17", "Jakarta", "Saudia", 3),
      dep("umroh-pertengahan-ramadhan-1448-14-hari", "2027-02-19", "Jakarta", "Qatar Airways", 11),
    ],
  }),
  bangun({
    id: "p16",
    slug: "umroh-lailatul-qadr-1448-14-hari",
    name: "Umroh Lailatul Qadr 1448 H, 14 Hari",
    type: "umroh-ramadhan",
    duration: 14,
    price: harga(57.9, 61.9, 68.9),
    makkahHotel: hotelMakkah.swissotel,
    madinahHotel: hotelMadinah.pullmanZamzam,
    featured: true,
    departures: [
      dep("umroh-lailatul-qadr-1448-14-hari", "2027-02-24", "Jakarta", "Garuda Indonesia", 0),
      dep("umroh-lailatul-qadr-1448-14-hari", "2027-02-26", "Jakarta", "Saudia", 2),
    ],
  }),
  bangun({
    id: "p17",
    slug: "umroh-syawal-1448-12-hari",
    name: "Umroh Syawal 1448 H, 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(33.9, 35.9, 39.5),
    makkahHotel: hotelMakkah.hyattJabalOmar,
    madinahHotel: hotelMadinah.odst,
    featured: false,
    departures: [
      dep("umroh-syawal-1448-12-hari", "2027-03-17", "Jakarta", "Saudia", 15),
      dep("umroh-syawal-1448-12-hari", "2027-03-24", "Medan", "Saudia", 19),
    ],
  }),
  bangun({
    id: "p18",
    slug: "umroh-akhir-tahun-12-hari",
    name: "Umroh Akhir Tahun 12 Hari",
    type: "umroh-reguler",
    duration: 12,
    price: harga(39.9, 42.5, 46.9),
    makkahHotel: hotelMakkah.hiltonSuites,
    madinahHotel: hotelMadinah.frontel,
    featured: false,
    departures: [
      dep("umroh-akhir-tahun-12-hari", "2026-12-23", "Jakarta", "Saudia", 1),
      dep("umroh-akhir-tahun-12-hari", "2026-12-27", "Surabaya", "Qatar Airways", 6),
    ],
  }),
];

export function paketBySlug(slug: string): Package | undefined {
  return packages.find((p) => p.slug === slug);
}
