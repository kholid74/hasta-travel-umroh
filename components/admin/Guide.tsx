import Link from "next/link";
import { ArrowDown, ArrowRight, CheckCircle2, Compass, Play, Sparkles } from "lucide-react";
import { moduleTitle } from "@/content/admin/navigation";

const journey = [
  {
    id: "siapkan", label: "Siapkan bisnis", role: "Owner & admin", title: "Siapkan fondasi perjalanan",
    intro: "Mulai dari profil travel, pembagian tugas tim, lalu tentukan produk dan jadwal yang akan dijual.",
    result: "Tim memiliki acuan paket, harga, tanggal, dan kuota sebelum menerima pendaftaran.",
    features: [
      { slug: "settings", text: "Atur profil travel, rekening pembayaran, cabang, dan preferensi dokumen. Rekening dipakai pada invoice demo; pengaturan lainnya memperlihatkan konfigurasi yang tersedia." },
      { slug: "users", text: "Kenali pembagian tugas melalui daftar pengguna, status aktif, pilihan peran, dan matriks izin. Pengaturan peran di showcase merupakan simulasi, belum membatasi akses atau membuat akun sungguhan." },
      { slug: "paket", text: "Kelola penawaran umrah: harga, durasi, itinerary, hotel, dan penerbangan. Buat atau duplikasi paket, lalu atur status publikasinya. Harga booking yang sudah dibuat tetap memakai harga saat pemesanan." },
      { slug: "keberangkatan", text: "Buat rombongan dengan tanggal dan kapasitas tertentu. Pantau kesiapan pembayaran, dokumen, kamar, manasik, dan perlengkapan; lengkapi checklist layanan sebelum menandai berangkat, kemudian selesai." },
    ],
  },
  {
    id: "jangkau", label: "Jangkau calon jamaah", role: "Marketing & sales", title: "Dari etalase hingga percakapan pertama",
    intro: "Perkenalkan layanan melalui konten website, kemudian kumpulkan dan tindak lanjuti calon jamaah dalam satu alur penjualan.",
    result: "Setiap calon jamaah memiliki sumber, minat paket, penanggung jawab, dan tindak lanjut yang jelas.",
    features: [
      { slug: "website-paket", text: "Pilih paket yang ditampilkan, disembunyikan, atau dijadikan unggulan pada katalog demo. Perubahan di sini belum mengubah website publik." },
      { slug: "artikel", text: "Tulis dan edit judul, kategori, serta isi artikel. Tinjau pratinjau, simpan draft, atau ubah status publikasi dalam demo." },
      { slug: "testimoni", text: "Kelola pengalaman jamaah sebagai bahan kepercayaan calon pelanggan. Tambahkan, edit, tinjau, setujui, atau sembunyikan testimoni demo." },
      { slug: "galeri", text: "Susun dokumentasi menggunakan gambar yang tersedia. Atur judul, caption, kategori, tanggal, serta visibilitas; demo belum menerima unggahan gambar baru." },
      { slug: "leads-website", text: "Lihat calon jamaah dengan sumber Website agar follow-up lebih terarah. Daftar ini memakai data contoh, belum menerima formulir website secara langsung." },
      { slug: "crm", text: "Kelola lead lewat tabel atau kanban, pindahkan tahap, catat follow-up, dan lihat pratinjau WhatsApp. Saat calon jamaah siap, konversi lead untuk membuat data jamaah, booking, dan invoice sekaligus." },
    ],
  },
  {
    id: "daftarkan", label: "Daftarkan & tagihkan", role: "Sales, admin & finance", title: "Ubah minat menjadi pendaftaran",
    intro: "Pilih jamaah, rombongan keberangkatan, dan tipe kamar. Booking menghubungkan identitas jamaah, kursi, harga, serta tagihannya.",
    result: "Jamaah terdaftar pada rombongan yang tepat, dengan invoice dan sisa tagihan yang dapat ditelusuri.",
    features: [
      { slug: "jamaah", text: "Simpan identitas dan kontak; tambah satu per satu atau impor JSON sesuai template. Halaman detail menghubungkan paspor, dokumen, visa, booking, pembayaran, kamar, keluarga, dan aktivitas." },
      { slug: "booking", text: "Buat pemesanan untuk jamaah, pilih keberangkatan serta kamar Double, Triple, atau Quad. Sistem memeriksa kapasitas dan booking aktif; pembatalan melepaskan kursi dan kamar dalam simulasi." },
      { slug: "invoice", text: "Buka rincian biaya dan pembayaran setiap booking. Cetak atau simpan invoice sebagai PDF melalui browser, unduh kuitansi teks, dan coba simulasi pengingat tagihan." },
      { slug: "pembayaran", text: "Catat DP, cicilan, atau pelunasan, kemudian verifikasi transaksi. Pembayaran baru berstatus Menunggu; sisa tagihan hanya berkurang setelah verifikasi, dengan validasi agar nominal tidak berlebih." },
      { slug: "agen", text: "Tambah agen dan pantau jamaah, booking, penjualan, serta komisinya. Detail agen membantu tim memahami kontribusi setiap mitra dan riwayat transaksi terkait." },
    ],
  },
  {
    id: "persiapkan", label: "Lengkapi persiapan", role: "Tim operasional", title: "Pastikan setiap jamaah siap berangkat",
    intro: "Setelah pendaftaran, koordinasikan berkas, akomodasi, pembekalan, dan logistik berdasarkan rombongan. Progresnya ikut membentuk kesiapan keberangkatan.",
    result: "Tim dapat melihat kebutuhan yang belum selesai sebelum menyatakan rombongan siap berangkat.",
    features: [
      { slug: "dokumen", text: "Tinjau paspor, KTP, vaksin, dan foto; coba unggah, verifikasi, atau tolak berkas serta perbarui status visa. Pantau masa berlaku paspor. Pemilihan file hanya memperbarui status demo, tanpa penyimpanan berkas atau pengajuan visa nyata." },
      { slug: "rooming", text: "Atur kamar Makkah dan Madinah lewat drag-and-drop, tombol Atur, atau Auto Assign. Alokasi memeriksa rombongan, kapasitas, dan jenis kelamin; tinjau peringatan bila anggota keluarga terpisah." },
      { slug: "manasik", text: "Buat jadwal pembekalan dengan tanggal, waktu, lokasi, dan pemateri. Catat kehadiran jamaah agar tim mengetahui siapa yang sudah mengikuti manasik." },
      { slug: "transportasi", text: "Tinjau rincian penerbangan, jadwal, terminal, serta PNR contoh. Alokasikan jamaah ke bus dengan pemeriksaan kapasitas dan lihat informasi pengemudi serta rute." },
      { slug: "perlengkapan", text: "Pantau stok, kebutuhan, dan distribusi koper maupun perlengkapan lainnya. Tambahkan stok dan tandai barang diterima per jamaah; distribusi memeriksa stok serta mencegah pencatatan ganda." },
      { slug: "vendor", text: "Lihat mitra pemasok dan transaksi terkait. Daftar vendor berasal dari pengeluaran yang dicatat, sehingga mitra baru muncul saat digunakan pada transaksi biaya." },
      { slug: "manifest", text: "Tinjau daftar jamaah per rombongan, filter data, lalu ekspor Excel atau cetak melalui browser. Checklist SISKOPATUH membantu persiapan data; tidak mengirim data ke sistem pemerintah." },
    ],
  },
  {
    id: "dampingi", label: "Dampingi perjalanan", role: "Operasional & layanan jamaah", title: "Jaga koordinasi sampai perjalanan selesai",
    intro: "Gunakan informasi kesiapan untuk menentukan tindak lanjut. Sampaikan pengingat kepada kelompok yang relevan, lalu perbarui status rombongan melalui menu Keberangkatan.",
    result: "Tim tahu siapa yang perlu dihubungi dan pekerjaan apa yang harus ditindaklanjuti.",
    features: [
      { slug: "broadcast", text: "Pilih template WhatsApp atau email, sesuaikan pesan, lalu pilih penerima menurut paket, keberangkatan, pembayaran, dokumen, atau agen. Periksa pratinjau sebelum simulasi kirim; tidak ada pesan yang benar-benar dikirim." },
      { slug: "notifikasi", text: "Buka pemberitahuan berdasarkan kategori atau status baca. Tandai dibaca satu per satu atau sekaligus, lalu ikuti tautan ke modul untuk menindaklanjuti informasi." },
    ],
  },
  {
    id: "evaluasi", label: "Evaluasi hasil", role: "Owner & finance", title: "Pahami hasil bisnis dan rapikan tindak lanjut",
    intro: "Selama dan setelah perjalanan, pantau penerimaan, tagihan, biaya, serta kontribusi agen. Gunakan laporan untuk mengevaluasi penjualan dan persiapan rombongan berikutnya.",
    result: "Keputusan berikutnya memiliki dasar: performa penjualan, kondisi tagihan, biaya, dan riwayat perubahan.",
    features: [
      { slug: "dashboard", text: "Dapatkan ringkasan jamaah, keberangkatan, penerimaan, piutang, dan lead. Grafik, peringatan, progres dokumen, serta aktivitas membantu menentukan prioritas harian dari data demo yang saling terhubung." },
      { slug: "pengeluaran", text: "Catat biaya menurut kategori, vendor, tanggal, dan keberangkatan, lalu tandai dibayar dalam simulasi. Bandingkan penerimaan, biaya, dan estimasi margin; fitur ini belum merupakan buku besar akuntansi." },
      { slug: "komisi", text: "Tinjau komisi agen berdasarkan booking aktif dan level agen. Coba alur persetujuan hingga status dibayar untuk memahami proses pencairan; tidak ada transfer dana nyata." },
      { slug: "laporan", text: "Jelajahi 10 laporan: penjualan, penerimaan, piutang, performa paket, profitabilitas keberangkatan, agen, sumber jamaah, dokumen, persediaan, dan konversi lead. Gunakan periode pada laporan keuangan serta ekspor tabel; laporan snapshot menunjukkan kondisi data saat ini." },
      { slug: "analytics", text: "Masuk langsung ke analisis konversi untuk melihat pergerakan lead menuju booking. Gunakan tampilan laporan yang sama untuk menelusuri performa penjualan lebih lanjut." },
      { slug: "aktivitas", text: "Telusuri perubahan yang tercatat selama memakai demo. Filter menurut pengguna, modul, aksi, atau tanggal untuk memahami urutan pekerjaan tim." },
    ],
  },
];

const demoSteps = [
  { slug: "crm", title: "Mulai dari satu calon jamaah", text: "Buka lead Salman Al Farisi, pilih keberangkatan yang tersedia, lalu klik Konversi ke booking." },
  { slug: "booking", title: "Lihat hasil pendaftaran", text: "Cari Salman pada Booking. Buka detailnya untuk melihat invoice yang ikut terbentuk." },
  { slug: "pembayaran", title: "Catat dan verifikasi pembayaran", text: "Catat pembayaran dari detail booking, lalu verifikasi. Perhatikan perubahan sisa tagihan dan status pembayaran." },
  { slug: "jamaah", title: "Ikuti persiapan jamaah", text: "Buka profil Salman untuk meninjau dokumen dan kamar. Lanjutkan ke Dokumen & Visa, Rooming List, dan Perlengkapan Jamaah." },
  { slug: "dashboard", title: "Lihat dampaknya pada bisnis", text: "Kembali ke Dashboard dan periksa ringkasan yang berubah. Buka Activity Log untuk menelusuri aksi yang baru dilakukan." },
];

export default function Guide() {
  const featureCount = journey.reduce((count, stage) => count + stage.features.length, 0);
  return (
    <div className="admin-guide">
      <header className="guide-hero">
        <div>
          <span className="guide-eyebrow"><Compass size={15} aria-hidden="true" /> PANDUAN ADMIN HASTA</span>
          <h1>Satu alur kerja.<br />Seluruh perjalanan jamaah.</h1>
          <p>Kenali bagaimana tim travel bekerja bersama, dari calon jamaah pertama kali bertanya hingga perjalanan selesai. Temukan fungsi setiap menu dan coba sendiri alurnya.</p>
          <div className="admin-actions">
            <a className="admin-button amber" href="#alur-admin">Jelajahi alur <ArrowDown size={15} aria-hidden="true" /></a>
            <a className="guide-hero-link" href="#coba-demo"><Play size={14} aria-hidden="true" /> Coba satu perjalanan demo</a>
          </div>
        </div>
        <aside className="guide-overview" aria-label="Ringkasan panduan">
          <Sparkles size={22} aria-hidden="true" />
          <strong>Kenali perannya.<br />Pahami langkahnya.</strong>
          <p>Sales → Admin → Finance → Operasional → Owner</p>
          <div><span><b>{journey.length}</b> tahap perjalanan</span><span><b>{featureCount}</b> menu dijelaskan</span></div>
        </aside>
      </header>

      <section className="guide-definitions" aria-label="Istilah dasar">
        <div><b>Paket = penawaran</b><p>Produk yang dijual, berisi layanan, durasi, dan harga.</p></div>
        <div><b>Keberangkatan = rombongan</b><p>Pelaksanaan paket pada tanggal dan kuota tertentu.</p></div>
        <div><b>Booking = pendaftaran</b><p>Penghubung jamaah, rombongan, pilihan kamar, dan tagihan.</p></div>
      </section>

      <nav className="guide-nav" aria-label="Tahapan perjalanan admin">
        {journey.map((stage, index) => <a key={stage.id} href={`#${stage.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{stage.label}<ArrowRight size={14} aria-hidden="true" /></a>)}
      </nav>

      <section id="alur-admin" className="guide-section" aria-labelledby="journey-title">
        <div className="guide-section-heading"><span className="guide-kicker">ALUR KERJA TRAVEL</span><h2 id="journey-title">Dari persiapan hingga evaluasi</h2><p>Ikuti urutannya untuk memahami perjalanan lengkap, atau langsung pilih tahap yang sesuai dengan peran Anda.</p></div>
        <div className="guide-journey">
          {journey.map((stage, index) => (
            <article className="guide-stage" id={stage.id} key={stage.id}>
              <header className="guide-stage-heading">
                <span className="guide-stage-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <div><span className="guide-kicker">{stage.role}</span><h3>{stage.title}</h3><p>{stage.intro}</p></div>
              </header>
              <div className="guide-features">
                {stage.features.map(feature => (
                  <div className="guide-feature" key={feature.slug}>
                    <h4><Link href={`/admin/${feature.slug}`}>{moduleTitle(feature.slug)}<ArrowRight size={15} aria-hidden="true" /></Link></h4>
                    <p>{feature.text}</p>
                  </div>
                ))}
              </div>
              <div className="guide-outcome"><CheckCircle2 size={18} aria-hidden="true" /><p><b>Hasil tahap ini</b>{stage.result}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section id="coba-demo" className="guide-section guide-demo" aria-labelledby="demo-title">
        <div className="guide-section-heading"><span className="guide-kicker">COBA LANGSUNG</span><h2 id="demo-title">Ikuti satu jamaah dari awal</h2><p>Gunakan data contoh Salman Al Farisi untuk melihat hubungan antarfitur. Bila lead ini sudah dikonversi, pilih Reset demo dari menu profil untuk memulai kembali; semua perubahan demo akan dihapus.</p></div>
        <ol className="guide-demo-steps">
          {demoSteps.map(step => <li key={step.slug}><div><h3>{step.title}</h3><p>{step.text}</p><Link href={`/admin/${step.slug}`}>Buka {moduleTitle(step.slug)} <ArrowRight size={14} aria-hidden="true" /></Link></div></li>)}
        </ol>
      </section>

      <section className="guide-section" aria-labelledby="help-title">
        <div className="guide-section-heading"><span className="guide-kicker">SEBELUM MENJELAJAH</span><h2 id="help-title">Hal kecil yang membantu Anda mencoba</h2></div>
        <div className="guide-help">
          <details open><summary>Bagaimana berpindah dan mencari data?</summary><p>Gunakan sidebar untuk berpindah modul; di ponsel, buka tombol navigasi. Pencarian global atau Ctrl/Cmd + K menemukan jamaah, paket, booking, invoice, keberangkatan, dan agen. Tombol + Tambah menyediakan pintasan input. Tabel menyediakan pencarian, pengurutan, filter, dan ekspor sesuai modulnya.</p></details>
          <details open><summary>Apakah perubahan saya tersimpan?</summary><p>Data demo saling terhubung selama Anda berpindah menu di workspace. Memuat ulang halaman atau memilih Reset demo akan mengembalikan data contoh. Gunakan data fiktif saat mencoba.</p></details>
          <details open><summary>Apa yang masih berupa simulasi?</summary><p>WhatsApp, email, pembayaran, pencairan komisi, pengajuan visa, dan SISKOPATUH belum terhubung ke layanan nyata. CMS belum memublikasikan perubahan ke website, berkas dokumen belum disimpan, dan User & Roles belum menerapkan akses pengguna sungguhan. Status serta pratinjau menunjukkan alur kerja yang bisa Anda evaluasi.</p></details>
        </div>
      </section>
      <div className="guide-finish"><div><h2>Mulai dari prioritas tim Anda.</h2><p>Panduan ini selalu tersedia melalui menu Panduan Admin.</p></div><Link className="admin-button primary" href="/admin/dashboard">Buka Dashboard <ArrowRight size={15} aria-hidden="true" /></Link></div>
    </div>
  );
}
