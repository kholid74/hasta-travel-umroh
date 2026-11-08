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

/*
 * PUBLIC-02A-R — foto tambahan dari Wikimedia Commons, disimpan lokal (bukan hotlink).
 * Lisensi diperiksa lewat metadata Commons API; ringkasan di docs/public_02a_r/asset-metadata.json.
 * Ukuran diperkecil untuk web; tidak ada penyuntingan isi gambar. Kerumunan difoto dari jauh —
 * tidak ada orang yang ditampilkan atau dilabeli sebagai jamaah travel ini.
 */

export const fotoKaabaHaji: Foto = {
  src: "/foto/kaaba-haji.jpg",
  width: 2400,
  height: 1679,
  alt: "Ka'bah di tengah Masjidil Haram, dikelilingi jamaah berpakaian ihram putih yang bertawaf.",
  judul: "The Kaaba during Hajj (edited)",
  pembuat: "Adli Wahid",
  lisensi: "CC BY-SA 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj_(edited).jpg",
};

export const fotoKaabaDekat: Foto = {
  src: "/foto/kaaba-dekat.jpg",
  width: 1600,
  height: 1200,
  alt: "Ka'bah dengan pintu berhias kaligrafi emas, dilihat dari lantai atas Masjidil Haram.",
  judul: "The Ka'ba, Great Mosque of Mecca, Saudi Arabia (4)",
  pembuat: "Richard Mortel",
  lisensi: "CC BY 2.0",
  lisensiUrl: "https://creativecommons.org/licenses/by/2.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:The_Ka%27ba,_Great_Mosque_of_Mecca,_Saudi_Arabia_(4).jpg",
};

export const fotoKubahHijau: Foto = {
  src: "/foto/nabawi-kubah-hijau.jpg",
  width: 2000,
  height: 1333,
  alt: "Kubah Hijau dan menara-menara Masjid Nabawi di Madinah di bawah langit cerah.",
  judul: "Wide shot of the Green Dome at The Prophet's Mosque (Al Masjid-e-Nabawi)",
  pembuat: "TheHadiRahim",
  lisensi: "CC0",
  lisensiUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Wide_shot_of_the_Green_Dome_at_The_Prophet%27s_Mosque_(Al_Masjid-e-Nabawi).jpg",
};

export const fotoPayungNabawi: Foto = {
  src: "/foto/nabawi-payung.jpg",
  width: 1600,
  height: 1200,
  alt: "Payung-payung raksasa menaungi pelataran Masjid Nabawi yang berlantai marmer.",
  judul: "Masjid e Nabawi Courtyard Umbrellas",
  pembuat: "King Eliot",
  lisensi: "CC BY-SA 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Masjid_e_Nabawi_Courtyard_Umbrellas.jpg",
};

export const fotoJendelaNabawi: Foto = {
  src: "/foto/nabawi-jendela-bintang.jpg",
  width: 1200,
  height: 1766,
  alt: "Kubah Hijau Masjid Nabawi terlihat melalui bingkai jendela berbentuk bintang delapan.",
  judul: "Masjid An-Nabawi in Madinah",
  pembuat: "Adli Wahid",
  lisensi: "CC BY-SA 4.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Masjid_An-Nabawi_in_Madinah.jpg",
};

export const fotoTendaMina: Foto = {
  src: "/foto/mina-tenda.jpg",
  width: 1800,
  height: 1200,
  alt: "Hamparan tenda putih di Mina pada malam hari, tempat jamaah haji bermalam.",
  judul: "Mina's tents",
  pembuat: "Arisdp",
  lisensi: "CC BY-SA 3.0",
  lisensiUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
  sumberUrl: "https://commons.wikimedia.org/wiki/File:Mina%27s_tents.JPG",
};
