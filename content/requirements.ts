/**
 * Persyaratan bersama situs publik (PUBLIC-01).
 *
 * SITUS DEMO — daftar ini adalah CONTOH. Ketentuan resmi (paspor, visa, kesehatan, dokumen
 * pendamping) dapat berubah dan wajib dikonfirmasi oleh travel sungguhan sebelum dipakai.
 * Klaim yang belum dapat diverifikasi (mis. surat mahram, platform visa tertentu) sengaja
 * tidak ditulis sebagai aturan tetap.
 */
export const REQUIREMENT_NOTE =
  "Contoh persyaratan pada situs demo. Ketentuan resmi dapat berubah dan dikonfirmasi saat konsultasi.";

/** Sejalan dengan pemeriksaan kesiapan di workspace (validPassport: 180 hari setelah keberangkatan). */
export const PASSPORT_MIN_MONTHS = 6;

export const passportRequirement = `Paspor berlaku minimal ${PASSPORT_MIN_MONTHS} bulan dari tanggal keberangkatan, dengan nama minimal dua suku kata`;
export const vaccinationRequirement = "Vaksinasi sesuai ketentuan kesehatan terbaru (misalnya meningitis)";

export const umrahRequirements = [
  passportRequirement,
  vaccinationRequirement,
  "Pas foto berwarna latar putih ukuran 4x6",
  "Kartu keluarga dan akta kelahiran untuk jamaah di bawah 17 tahun",
  "Dokumen tambahan untuk kondisi tertentu dikonfirmasi saat konsultasi",
  "Contoh ketentuan pembayaran: uang muka saat pendaftaran, pelunasan 40 hari sebelum keberangkatan",
];

export const hajiKhususRequirements = [
  passportRequirement,
  "Setoran awal sesuai ketentuan pendaftaran untuk penerbitan nomor porsi",
  vaccinationRequirement,
  "Surat keterangan sehat dari dokter",
];

export const hajiMujamalahRequirements = [
  passportRequirement,
  "Uang muka pendaftaran sesuai ketentuan yang disepakati",
  vaccinationRequirement,
  "Surat keterangan sehat dari dokter",
];
