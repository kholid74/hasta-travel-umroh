/**
 * Satu-satunya sumber data perusahaan.
 * SITUS DEMO — nama, izin, alamat, dan rekening di bawah ini fiktif.
 * Nomor WhatsApp adalah nomor asli Kalsara Digital Studio.
 */
export const company = {
  name: "Hasta Travel",
  tagline: "Perjalanan Dimulai dari Sebuah Niat",
  // Sengaja dibuat mustahil valid supaya tidak mungkin bertabrakan dengan izin travel nyata.
  licensePPIU: "DEMO-000 TAHUN 2026",
  licensePIHK: "DEMO-000 TAHUN 2026",
  address: {
    street: "Jl. Contoh Raya No. 00, Lantai 3",
    city: "Jakarta Selatan",
    postalCode: "12000",
  },
  bank: {
    name: "Bank Demo Syariah",
    // 0000... — mustahil menjadi rekening nyata milik siapa pun.
    accountNumber: "0000 0000 0000 0000",
    accountHolder: "PT HASTA TRAVEL DEMO",
  },
  /**
   * Kanal resmi untuk memeriksa izin. Sengaja `null`: portal lama (simpu.kemenag.go.id) tidak dapat
   * diakses saat audit dan alamat portal pengganti belum terverifikasi. Isi hanya dengan URL resmi
   * yang sudah dikonfirmasi travel klien — jangan menebak alamat pemerintah.
   */
  licenseCheckUrl: null as string | null,
  licenseAuthority: "kementerian yang membidangi penyelenggaraan haji dan umrah",
  whatsapp: "6285156589720",
  studio: {
    name: "Kalsara Digital Studio",
    url: "https://kalsara.studio",
  },
} as const;

/**
 * Level A of the public disclosure hierarchy (PUBLIC-02C): one short line per page.
 * Level B sits next to operator WhatsApp CTAs (WA_DEMO_NOTE) and in the legal block; level C is the
 * footer showcase panel. The old wording mentioned testimonials, which the site no longer shows.
 */
export const DEMO_NOTICE =
  "Situs demo: Hasta Travel adalah operator fiktif. Paket, harga, jadwal, dan nomor izin di sini adalah contoh.";
