import type { Hotel } from "@/content/types";

/**
 * Nama hotel dan jaraknya adalah fakta publik yang bisa dicek siapa pun di peta —
 * bukan data bisnis karangan. Jarak = perkiraan jalan kaki ke pintu masjid
 * terdekat, dibulatkan ke 10 m terdekat. Yang fiktif di situs ini hanyalah
 * travel, harga, izin, dan testimoni.
 */

const HARAM = "Masjidil Haram";
const NABAWI = "Masjid Nabawi";

export const hotelMakkah = {
  fairmont: {
    name: "Fairmont Makkah Clock Royal Tower",
    starRating: 5,
    distanceMeters: 120,
    landmark: HARAM,
    route: "direct",
    stepFree: true,
  },
  pullmanZamzam: {
    name: "Pullman ZamZam Makkah",
    starRating: 5,
    distanceMeters: 180,
    landmark: HARAM,
    route: "direct",
    stepFree: true,
  },
  swissotel: {
    name: "Swissôtel Al Maqam Makkah",
    starRating: 5,
    distanceMeters: 230,
    landmark: HARAM,
    route: "direct",
    stepFree: true,
  },
  hiltonSuites: {
    name: "Hilton Suites Makkah",
    starRating: 5,
    distanceMeters: 280,
    landmark: HARAM,
    route: "crossing",
    stepFree: true,
  },
  elafAjyad: {
    name: "Elaf Ajyad Makkah",
    starRating: 4,
    distanceMeters: 350,
    landmark: HARAM,
    route: "direct",
    stepFree: false,
  },
  leMeridien: {
    name: "Le Méridien Towers Makkah",
    starRating: 4,
    distanceMeters: 400,
    landmark: HARAM,
    route: "crossing",
    stepFree: false,
  },
  hyattJabalOmar: {
    name: "Hyatt Regency Makkah Jabal Omar",
    starRating: 5,
    distanceMeters: 450,
    landmark: HARAM,
    route: "underground",
    stepFree: true,
  },
  grandAlMassa: {
    name: "Grand Al Massa Makkah",
    starRating: 3,
    distanceMeters: 550,
    landmark: HARAM,
    route: "crossing",
    stepFree: false,
  },
  mGrandAjyad: {
    name: "M Grand Ajyad Makkah",
    starRating: 3,
    distanceMeters: 700,
    landmark: HARAM,
    route: "crossing",
    stepFree: false,
  },
  anjum: {
    name: "Anjum Hotel Makkah",
    starRating: 4,
    distanceMeters: 950,
    landmark: HARAM,
    route: "crossing",
    stepFree: true,
  },
  alKiswah: {
    name: "Al Kiswah Towers Hotel",
    starRating: 3,
    distanceMeters: 1500,
    landmark: HARAM,
    route: "crossing",
    stepFree: false,
  },
} satisfies Record<string, Hotel>;

export const hotelMadinah = {
  movenpick: {
    name: "Anwar Al Madinah Mövenpick",
    starRating: 5,
    distanceMeters: 80,
    landmark: NABAWI,
    route: "direct",
    stepFree: true,
  },
  darAlTaqwa: {
    name: "Dar Al Taqwa Hotel",
    starRating: 5,
    distanceMeters: 100,
    landmark: NABAWI,
    route: "direct",
    stepFree: true,
  },
  pullmanZamzam: {
    name: "Pullman ZamZam Madina",
    starRating: 5,
    distanceMeters: 150,
    landmark: NABAWI,
    route: "direct",
    stepFree: true,
  },
  alEimanRoyal: {
    name: "Al Eiman Royal Hotel",
    starRating: 4,
    distanceMeters: 200,
    landmark: NABAWI,
    route: "direct",
    stepFree: false,
  },
  frontel: {
    name: "Frontel Al Harithia Hotel",
    starRating: 4,
    distanceMeters: 250,
    landmark: NABAWI,
    route: "direct",
    stepFree: true,
  },
  badrAlMaqam: {
    name: "Grand Plaza Badr Al Maqam",
    starRating: 4,
    distanceMeters: 350,
    landmark: NABAWI,
    route: "direct",
    stepFree: false,
  },
  odst: {
    name: "Odst Al Madinah Hotel",
    starRating: 4,
    distanceMeters: 400,
    landmark: NABAWI,
    route: "crossing",
    stepFree: true,
  },
  alAnsarGolden: {
    name: "Al Ansar Golden Hotel",
    starRating: 3,
    distanceMeters: 550,
    landmark: NABAWI,
    route: "direct",
    stepFree: false,
  },
  millennium: {
    name: "Millennium Al Aqeeq Hotel",
    starRating: 5,
    distanceMeters: 600,
    landmark: NABAWI,
    route: "crossing",
    stepFree: true,
  },
  rove: {
    name: "Rove Madinah",
    starRating: 3,
    distanceMeters: 850,
    landmark: NABAWI,
    route: "crossing",
    stepFree: false,
  },
} satisfies Record<string, Hotel>;
