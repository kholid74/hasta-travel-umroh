/**
 * Foto berlisensi bebas dari Wikimedia Commons. Keduanya mewajibkan atribusi,
 * jadi kredit ditampilkan di bawah setiap foto — bukan disembunyikan di halaman
 * terpisah. Sesuai semangat situs ini: kalau meminta orang memverifikasi klaim
 * kami, kami juga menyebut sumber gambar kami.
 */
export type Foto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  judul: string;
  pembuat: string;
  lisensi: string;
  lisensiUrl: string;
  sumberUrl: string;
};

export const fotoHaram: Foto = {
  src: "/foto/masjidil-haram.jpg",
  width: 1920,
  height: 1439,
  alt: "Masjidil Haram di Makkah dilihat dari luar, dengan menara dan pelataran di sekelilingnya.",
  judul: "Masjid al Haram Exterior",
  pembuat: "King Eliot",
  lisensi: "CC BY-SA 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Masjid_al_Haram_Exterior.jpg",
};

export const fotoNabawi: Foto = {
  src: "/foto/masjid-nabawi.jpg",
  width: 1280,
  height: 1907,
  alt: "Masjid Nabawi di Madinah dengan menara dan payung pelataran.",
  judul: "Al-Masjid an Nabawi",
  pembuat: "Meshari Alawfi",
  lisensi: "CC BY 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Al-Masjid_an_Nabawi.jpg",
};

export const fotoAbraj: Foto = {
  src: "/foto/abraj-al-bait.jpg",
  width: 960,
  height: 1708,
  alt: "Menara Abraj Al Bait menjulang di sisi Masjidil Haram, Makkah.",
  judul: "Abraj Al Bait Mecca",
  pembuat: "Ahmadrizo",
  lisensi: "CC BY-SA 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Abraj_Al_Bait_Mecca.jpg",
};
