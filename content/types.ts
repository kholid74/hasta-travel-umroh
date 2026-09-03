export type AccessRoute = "direct" | "underground" | "crossing";

export type Hotel = {
  name: string;
  starRating: number;
  /** Jarak berjalan kaki ke pintu masjid terdekat, dibulatkan ke 10m terdekat. */
  distanceMeters: number;
  /** Ditulis lengkap dengan pintu acuannya supaya angkanya bisa dicek sendiri. */
  landmark: string;
  route: AccessRoute;
  /** true = tidak ada tangga di rute (ada lift/ramp sepanjang jalan). */
  stepFree: boolean;
  photoRef?: string;
};

export type OccupancyPrice = {
  quad: number;
  triple: number;
  double: number;
};

export type Departure = {
  id: string;
  /** ISO date, contoh "2026-03-12". */
  date: string;
  departureCity: string;
  airline: string;
  seatsAvailable: number;
  /** Kalau ada, menimpa harga dasar paket (musim ramai lebih mahal). */
  price?: OccupancyPrice;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description: string;
};

export type PackageType = "umroh-reguler" | "umroh-plus" | "umroh-ramadhan";

export type Package = {
  id: string;
  slug: string;
  name: string;
  type: PackageType;
  /** Jumlah hari. */
  duration: number;
  price: OccupancyPrice;
  makkahHotel: Hotel;
  madinahHotel: Hotel;
  itinerary: ItineraryDay[];
  facilities: string[];
  exclusions: string[];
  requirements: string[];
  tags: string[];
  featured: boolean;
  departures: Departure[];
};

/** Haji Khusus tidak dijual sebagai keberangkatan — yang dibeli adalah antrean. */
export type HajiPackage = {
  id: string;
  slug: string;
  name: string;
  waitingYears: number;
  estimatedDepartureYear: number;
  quotaNote: string;
  priceUSD: number;
  dpUSD: number;
  installmentNote: string;
  durationDays: number;
  makkahHotel: Hotel;
  madinahHotel: Hotel;
  facilities: string[];
  requirements: string[];
};

export type DepartureStatus = "available" | "limited" | "sold-out";
