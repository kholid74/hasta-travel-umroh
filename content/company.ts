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
  whatsapp: "6285156589720",
  studio: {
    name: "Kalsara Digital Studio",
    url: "https://kalsara.studio",
  },
} as const;

export const DEMO_NOTICE =
  "Situs demo: seluruh data perusahaan, harga, dan testimoni di sini fiktif.";
