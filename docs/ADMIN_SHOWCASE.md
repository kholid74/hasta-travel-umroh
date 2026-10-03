# Hasta Travel Admin Showcase

Workspace demo operasional untuk presentasi Kalsara Digital Studio. Antarmuka berbahasa Indonesia, memakai identitas hijau gelap–amber Hasta, Manrope, dan ikon Lucide. Area kerja terang dipisahkan dari tema website publik agar tabel padat tetap mudah dibaca.

## Menjalankan

Gunakan Node.js 22+ dan npm.

```sh
npm ci
npm run dev
```

Buka `/admin/login`. Akun demo:

- Email: `demo@hasta.example`
- Password: `HastaDemo2026!`

Kredensial ini sengaja terbuka dan hanya memberikan akses ke data simulasi. Jangan menaruh data jamaah sungguhan dalam showcase.

Untuk production build, tetapkan `ADMIN_SESSION_SECRET` dengan minimal 32 karakter acak di environment server. Contoh membuat secret: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Simpan hasil sebagai secret, bukan di Git. Kemudian jalankan `npm run build` dan `npm start`. Tanpa secret yang memadai, login produksi menampilkan error konfigurasi dan tidak menerbitkan sesi. Tidak ada database yang diperlukan.

Font menggunakan konfigurasi `next/font/google` yang sudah ada. Build pertama membutuhkan akses ke Google Fonts.

## Arsitektur

- Next.js 16.3.4 App Router, React 19, TypeScript, Tailwind 4.
- `app/layout.tsx`: font, metadata, dan dokumen HTML bersama.
- `app/(public)`: halaman publik dan layout Header/Footer, dengan URL serta isi halaman dipertahankan.
- `app/admin`: layout dan CSS terisolasi melalui `.admin-app`, login, dan Server Actions autentikasi.
- `app/admin/(workspace)`: layout terproteksi dan satu catch-all yang hanya menerima daftar modul yang dikenal. Pemeriksaan sesi dilakukan pada layout **dan setiap render halaman**.
- `components/admin/AdminScreen.tsx`: memilih modul dengan `next/dynamic`, sehingga modul dan grafik dimuat sesuai kebutuhan.
- `components/admin/Store.tsx`: React Context berisi satu state demo. Mutasi bekerja pada salinan, dibatalkan seluruhnya bila validasi gagal, lalu mencatat activity log dan toast.
- `content/admin/types.ts`: model data bertipe.
- `content/admin/seed.ts`: seed deterministik, memakai produk dari `content/packages.ts`.
- `lib/admin/model.ts`: relasi, perhitungan, dan aturan booking, pembayaran, rooming, distribusi, serta readiness.
- `components/admin/ui.tsx`: tabel dengan pencarian, sorting, pagination, seleksi, dan ekspor; dialog native dengan focus trap dan Escape; form, badge, progress, serta empty state.
- Recharts hanya digunakan pada dashboard dan laporan. Tidak ada state manager, ORM, SDK WhatsApp, atau payment gateway.

## Data dan konsistensi

Seed memuat 48 jamaah, 24 lead, 18 produk katalog, 8 batch keberangkatan, 10 agen, 48 booking/invoice, dan lebih dari 20 transaksi. Angka dashboard dihitung dari data ini, bukan KPI dekoratif. Tanggal acuan presentasi adalah **2 Oktober 2026**, agar skenario tetap stabil.

Produk adalah penawaran perjalanan, sedangkan keberangkatan adalah batch operasional. Booking menghubungkan jamaah dengan batch dan menyimpan harga saat booking dibuat. Perubahan harga produk tidak menimpa invoice lama. Satu jamaah memiliki paling banyak satu booking aktif pada showcase.

Batch operasional merupakan sampel subset dari katalog publik; kapasitas/jumlah pendaftar demo tidak disinkronkan dengan angka stok katalog publik. CMS memakai produk publik yang sama sebagai seed, tetapi perubahan CMS tidak memublikasikan atau memutasi website publik.

Pembayaran baru berstatus Menunggu. Hanya pembayaran Terverifikasi yang mengurangi tagihan. Validasi memperhitungkan pembayaran tertunda agar total tidak melebihi invoice. Pembatalan melepaskan kursi dan kamar serta menandai transaksi dikembalikan dalam simulasi. Sistem ini bukan buku besar akuntansi.

Rooming dipisahkan menurut batch dan kota hotel. Alokasi menolak kapasitas berlebih, jenis kelamin yang berbeda, serta jamaah dari batch lain. Auto Assign mengisi tempat yang sesuai tanpa menambah kamar secara diam-diam; kebutuhan keluarga yang terpisah ditampilkan untuk ditinjau tim.

## Rute

Semua path berikut berawalan `/admin/`.

| Area | Rute |
| --- | --- |
| Akses | `login`, redirect dari `/admin` |
| Overview | `dashboard`, `panduan` (penjelasan seluruh menu, enam tahap perjalanan, dan langkah mencoba demo) |
| Sales | `crm`, `leads-website`, `booking`, `booking/[id]`, `jamaah`, `jamaah/[id]` |
| Operasional | `paket`, `paket/[id]`, `keberangkatan`, `keberangkatan/[id]`, `manifest`, `dokumen`, `rooming`, `manasik`, `transportasi` |
| Finance | `pembayaran`, `invoice`, `invoice/[bookingId]`, `pengeluaran`, `komisi` |
| Partners | `agen`, `agen/[id]`, `vendor` |
| Inventory | `perlengkapan` |
| Komunikasi | `broadcast`, `notifikasi` |
| Reports | `laporan`, `analytics` |
| Website | `website-paket`, `artikel`, `testimoni`, `galeri` |
| System | `users`, `aktivitas`, `settings` |

`manifest` dan `rooming` menerima `?departure=<id>` untuk membuka batch dari dashboard/detail keberangkatan. Ctrl/Cmd+K mencari jamaah, booking, paket, invoice, agen, dan keberangkatan. Tombol Tambah menyediakan aksi lintas modul.

## Skenario presentasi

1. Buka Leads Website atau CRM, lalu pilih **Salman Al Farisi**.
2. Tambahkan catatan dan jadwalkan follow-up. Pilih keberangkatan, kemudian Konversi ke booking.
3. Cari Salman di Booking. Booking, jamaah, dan invoice telah dibuat dalam satu perubahan.
4. Catat pembayaran Rp10.000.000, kemudian Verifikasi. Sisa tagihan berubah di invoice, jamaah, dashboard, dan laporan.
5. Buka data jamaah untuk melengkapi identitas/paspor; pada Dokumen pilih berkas JPG/PNG/PDF maksimal 5 MB lalu verifikasi.
6. Proses visa setelah nomor dan verifikasi paspor lengkap.
7. Atur kamar Makkah dan Madinah lewat drag-and-drop atau dialog Atur. Auto Assign tersedia sebagai bantuan.
8. Catat check-in manasik, alokasikan bus, dan distribusikan perlengkapan.
9. Tinjau kesiapan batch dan manifest. Selesaikan pembayaran dan checklist sebelum menandai rombongan berangkat.
10. Buka pengeluaran/laporan untuk membahas estimasi profit; gunakan Reset Data Demo untuk presentasi berikutnya.

## Ekspor dan impor

- Ekspor Excel menghasilkan **SpreadsheetML `.xml`**, dapat dibuka oleh Excel/LibreOffice. Data bertipe String mencegah isi teks ditafsirkan sebagai formula. Bukan berkas `.xlsx`.
- Cetak / PDF membuka dokumen cetak; pilih **Save as PDF** pada dialog browser. Manifest mencetak seluruh hasil filter/seleksi, bukan hanya halaman tabel yang terlihat.
- Invoice dan kuitansi berlabel demo; kuitansi diunduh sebagai teks.
- Impor jamaah menerima JSON maksimal 1 MB dan 100 baris. Unduh template dari halaman Jamaah. `name` dan `phone` wajib valid; nomor duplikat membatalkan seluruh impor.
- Unggahan dokumen memperbarui state verifikasi, tetapi tidak mengirim, menyimpan, atau memindai berkas. Jangan menggunakan dokumen asli saat presentasi.
- Persiapan SISKOPATUH merupakan berkas dan checklist contoh, bukan format resmi tersertifikasi atau koneksi API pemerintah.

## Autentikasi

`app/admin/actions.ts` memvalidasi kredensial demo pada server. `lib/admin/auth.ts` mengelola cookie HttpOnly, SameSite=Lax, scoped ke `/admin`, dengan Secure pada production. Token ditandatangani HMAC-SHA256 memakai `node:crypto` dan dibandingkan secara constant time, serta memiliki expiry.

Tanpa Ingat saya, cookie menjadi session cookie dengan batas token 8 jam. Dengan Ingat saya, cookie dan token berlaku 30 hari. Logout menghapus cookie dengan path yang sama. Development memiliki fallback secret acak per proses; restart/HMR dapat mengakhiri sesi. Gunakan environment secret stabil untuk presentasi produksi/multi-instance.

Autentikasi ini hanya gerbang showcase, bukan identitas pelanggan atau penyimpanan data privat. Integrasi produksi harus mengganti provider kredensial, menyimpan sesi yang dapat dicabut, menerapkan pembatasan percobaan login dan otorisasi server, serta menghapus akun demo.

## Reset dan persistensi

State demo bertahan saat berpindah modul menggunakan navigasi internal. Refresh penuh, logout, atau Reset Data Demo mengembalikan seed. Tidak ada localStorage untuk PII atau data operasional. Login menggunakan cookie server tersendiri.

Role matrix, konfigurasi default, dan preferensi keamanan adalah simulasi konfigurasi. Peran akun demo tetap Owner. Profil rekening dipakai pada invoice; preferensi lain tidak mengganti kebijakan server. CMS dan galeri hanya pratinjau internal, menggunakan aset foto berlisensi yang sudah ada.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm run build
npm run test:admin
node lib/format.check.ts
node lib/katalog.check.ts
```

Playwright menggunakan Chrome yang terpasang, satu worker, dan port 3100. Server dev dijalankan otomatis jika belum tersedia. Tes memeriksa relasi data, batas kapasitas, nominal pembayaran, tanda tangan sesi, redirect login/logout, seluruh menu sidebar, semua halaman publik utama, viewport mobile, pencarian, tab, dialog, serta alur CRM–booking–payment–inventory dan operasi lain. Screenshot hasil pemeriksaan berada di `test-results/` (diabaikan Git).

Lihat [FUTURE_BACKEND.md](./FUTURE_BACKEND.md) untuk batas demo dan jalur integrasi Neon.
