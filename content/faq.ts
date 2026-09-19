export type FaqItem = { q: string; a: string; topik: Topik };
export type Topik = "pendaftaran" | "pembayaran" | "pembatalan" | "dokumen" | "layanan";

export const LABEL_TOPIK: Record<Topik, string> = {
  pendaftaran: "Pendaftaran",
  pembayaran: "Pembayaran",
  pembatalan: "Pembatalan & perubahan",
  dokumen: "Dokumen & syarat",
  layanan: "Layanan lain",
};

/** SITUS DEMO — angka dan ketentuan di bawah ini contoh, bukan kebijakan travel nyata. */
export const faq: FaqItem[] = [
  {
    topik: "pendaftaran",
    q: "Berapa uang muka untuk mengunci seat?",
    a: "Contoh ketentuan: uang muka Rp 5.000.000 per jamaah, dan seat baru terkunci setelah uang muka masuk. Sebelum itu, seat masih bisa diambil pendaftar lain.",
  },
  {
    topik: "pembayaran",
    q: "Kapan pelunasan paling lambat?",
    a: "Contoh ketentuan: 40 hari sebelum keberangkatan. Tiket dan hotel diterbitkan pada rentang itu, dan keterlambatan bisa membuat harga berubah.",
  },
  {
    topik: "pembayaran",
    q: "Ke rekening mana pembayaran dikirim?",
    a: "Hanya ke rekening resmi atas nama perusahaan yang tercantum di halaman Kontak. Jangan pernah mentransfer ke rekening pribadi siapa pun, termasuk agen yang mengaku mewakili kami.",
  },
  {
    topik: "pembatalan",
    q: "Kalau saya batal berangkat, apakah uang kembali?",
    a: "Contoh ketentuan: sebelum tiket terbit, uang kembali dipotong biaya administrasi. Setelah tiket terbit dan visa diproses, biaya yang sudah dikeluarkan ke maskapai dan hotel tidak bisa ditarik kembali. Rinciannya dijelaskan sebelum Anda membayar.",
  },
  {
    topik: "pembatalan",
    q: "Bisakah tanggal keberangkatan diubah?",
    a: "Sebelum tiket terbit umumnya bisa, tergantung ketersediaan seat di tanggal tujuan. Setelah tiket terbit, perubahan mengikuti aturan maskapai dan ada biayanya.",
  },
  {
    topik: "dokumen",
    q: "Berapa lama paspor harus berlaku?",
    a: "Minimal 8 bulan dari tanggal keberangkatan, dengan nama minimal dua suku kata. Kalau nama di paspor hanya satu kata, paspor perlu diperbarui lebih dulu.",
  },
  {
    topik: "dokumen",
    q: "Apakah vaksin meningitis wajib?",
    a: "Ya. Kartu vaksin meningitis yang masih berlaku termasuk syarat masuk, dan diurus sendiri oleh jamaah di klinik atau kantor kesehatan pelabuhan.",
  },
  {
    topik: "layanan",
    q: "Bagaimana dengan jamaah lansia atau pengguna kursi roda?",
    a: "Setiap paket menampilkan jarak hotel dalam meter, tipe akses, dan apakah rutenya bebas tangga. Untuk kebutuhan kursi roda, sebutkan saat konsultasi supaya kami sarankan paket dengan rute yang benar-benar bisa dilalui.",
  },
  {
    topik: "layanan",
    q: "Apakah melayani Badal Umroh?",
    a: "Ya. Badal Umroh dilaksanakan oleh petugas di Makkah, tanpa keberangkatan jamaah dari Indonesia, sehingga tidak memiliki tanggal, hotel, maupun itinerary seperti paket umroh biasa. Tanyakan langsung lewat WhatsApp untuk ketentuannya.",
  },
];

/** FAQ yang relevan ditampilkan di halaman detail paket. */
export const faqDetailPaket = faq.filter((f) =>
  ["Berapa uang muka untuk mengunci seat?", "Kapan pelunasan paling lambat?", "Kalau saya batal berangkat, apakah uang kembali?", "Berapa lama paspor harus berlaku?"].includes(f.q),
);
