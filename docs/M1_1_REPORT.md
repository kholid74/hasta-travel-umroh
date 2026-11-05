# M1.1 — Haji Khusus dan HPP

## Hasil implementasi

M1.1 memperluas aplikasi yang ada tanpa database, API bisnis baru, payment gateway, atau perubahan autentikasi demo. Sidebar hijau gelap, aksen emas, komponen tabel/form/dialog, dan semua rute sebelumnya dipertahankan.

| Area | Perilaku |
| --- | --- |
| `/admin/haji-khusus` | Daftar paket Haji, pencarian, filter status, dan simulasi tambah paket. |
| `/admin/haji-khusus/[id]` | Detail/edit paket, fasilitas, kapasitas, mata uang, asumsi kurs, tahun/tanggal rencana, dokumen, tahapan pembayaran, jamaah, kesiapan dan ringkasan keuangan. |
| Pendaftaran Haji | Memakai koleksi identitas, booking dan pembayaran yang sama. Status paket, status pendaftaran dan status perencanaan jamaah terpisah. Pendaftaran baru hanya pada paket Open dengan kapasitas tersedia. |
| HPP Umrah | Perhitungan lama tetap mendukung peserta berbayar/FOC, biaya per jamaah/grup/unit, diskon, BEP, template, simulasi dan revisi. |
| HPP Haji | Template terpisah untuk penerbangan, akomodasi Haji, layanan lapangan, transportasi/pendampingan, komisi, kontingensi dan operasional. Tidak membuat keberangkatan Umrah palsu. |
| Perbandingan HPP | Bandingkan dua versi dari produk yang sama atau Umrah versus Haji: peserta, biaya, HPP, revenue, margin, selisih dan rincian asumsi. |
| Riwayat | Draft dapat diedit. Finalisasi menyimpan dan mengunci versi; perubahan berikutnya lewat revisi baru. Snapshot nama paket, tahun/tanggal, harga IDR, tanggal asumsi dan seluruh komponen/kurs tetap tersimpan. |
| Browser storage | Seluruh transaksi demo tersimpan di localStorage setelah berhasil ditulis. Refresh/logout mempertahankannya. Reset data demo mengembalikan seed. Data rusak memerlukan reset eksplisit; kegagalan menulis tidak dilaporkan sebagai berhasil. |

Rincian audit dan rencana sebelum implementasi: [M1_1_IMPLEMENTATION_PLAN.md](M1_1_IMPLEMENTATION_PLAN.md).

## Cara mencoba

1. Jalankan `npm run dev`, buka `/admin/login`, dan gunakan akun demo yang sudah ada.
2. Buka **Haji Khusus**, lalu **Buat paket Haji** atau buka paket Amanah 2028. Status contoh: Draft, Open, Closed, Archived.
3. Sesuaikan harga/mata uang/kurs/tanggal asumsi, kapasitas, fasilitas, dokumen dan tahapan pembayaran. Total persentase tahap harus 100%. Tanggal rencana boleh kosong; jika diisi harus cocok dengan tahun paket.
4. Untuk mencoba pendaftaran baru, tambahkan identitas fiktif di **Jamaah**, lalu gunakan **Daftarkan jamaah** di paket Open. Buka booking untuk mencatat dan memverifikasi pembayaran dengan alur existing.
5. Buka **HPP Haji Khusus**, ubah peserta/biaya/asumsi, kemudian **Simpan draft**. Gunakan **Finalisasi costing** untuk mengunci versi dan **Buat revisi baru** untuk perubahan berikutnya.
6. Pilih **Bandingkan versi** di detail HPP untuk melihat riwayat paket tersebut; di daftar HPP untuk membandingkan produk berbeda.
7. Refresh untuk memeriksa persistensi. Menu profil → **Reset data demo** → konfirmasi menghapus perubahan demo tersimpan dan mengembalikan contoh awal.

## Model data dan asumsi perhitungan

- Klasifikasi produk: `UMRAH` dan `HAJJ_SPECIAL`. Konfigurasi Haji berada di `hajjPackages`; identitas, booking, pembayaran, template dan versi HPP tetap berada dalam satu `DemoState` bertipe.
- Keberangkatan operasional Umrah tetap terpisah. Haji memakai tahun rencana dan tanggal opsional; tidak menghitung antrean, nomor porsi, setoran resmi atau kelayakan regulasi.
- Harga penawaran Haji dapat berupa IDR, USD atau SAR. Booking baru mengunci nilai kontrak IDR beserta mata uang/harga/kurs/tanggal asal. Konversi kontrak dibulatkan sekali ke rupiah utuh dengan half-up, sesuai model pembayaran existing.
- Edit penawaran tidak mengubah nilai booking lama. Edit persyaratan menambahkan dokumen yang belum ada pada identitas jamaah terkait tanpa menghapus arsip dokumen lama.
- Jatuh tempo Haji belum ditetapkan otomatis; tahapan pembayaran merupakan konfigurasi komersial ilustratif, bukan deposit wajib. Contoh tidak membuktikan kepastian keberangkatan.
- Seluruh hasil HPP dilaporkan dalam IDR. Kurs adalah input manual per komponen, dengan tanggal asumsi skenario. Contoh bertanggal 2 Oktober 2026 memakai USD 16.000 dan SAR 4.300; bukan kurs pasar/live.
- Kalkulator existing memakai aritmetika integer `bigint`: kuantitas maksimal 3 desimal, harga 2 desimal dan kurs 6 desimal. Nilai dasar baris dibulatkan half-up ke 2 desimal IDR sebelum dikalikan peserta sasaran.
- Total variabel = biaya variabel per jamaah berbayar × jumlah berbayar. Biaya tetap termasuk baris grup/unit dan alokasi FOC. Komisi, kontingensi dan operasional adalah baris biaya eksplisit, sehingga tidak ditambahkan dua kali.
- Total biaya = variabel + biaya tetap (termasuk seluruh komponen tambahan). HPP = total biaya ÷ jamaah berbayar. Revenue = (harga jual − diskon) × jamaah berbayar. Margin estimasi = revenue − total biaya; persentase = margin ÷ revenue × 100. Tidak sama dengan laba akuntansi final.
- Kurs IDR wajib 1. Peserta nol, angka tidak valid, biaya negatif, kurs kosong/nol, tanggal asumsi tidak valid dan ID komponen ganda ditolak. Biaya unit tidak otomatis berubah ketika jumlah peserta berubah; kapasitas berlebih ditandai pada simulasi.

Contoh Haji Amanah: 30 jamaah berbayar, tanpa FOC. Variabel Rp136.400.000/jamaah; biaya tetap Rp165.000.000; total Rp4.257.000.000; HPP Rp141.900.000; revenue Rp6.000.000.000; margin estimasi Rp1.743.000.000 atau 29,05%. Angka ringkasan dan versi berasal dari catatan yang sama.

## Perubahan berkas

- Baru: `content/admin/hajj.ts`, `lib/admin/hajj.ts`, `lib/admin/persistence.ts`, `components/admin/Hajj.tsx`, `components/admin/CostingComparison.tsx`, `tests/m1_1.spec.ts`, serta rencana/laporan M1.1 ini.
- Model/seed/kalkulator: `content/admin/{types,seed,costing}.ts`, `lib/admin/{model,costing}.ts`.
- Integrasi: `components/admin/{Store,AdminScreen,Shell,Costing,Finance,Jamaah,Reports,Guide,ui}.tsx`, `content/admin/navigation.ts`, `app/admin/(workspace)/[...path]/page.tsx`, `app/admin/admin.css`.
- Dokumentasi/test existing: `README.md`, `docs/{ADMIN_SHOWCASE,HPP_COSTING,FUTURE_BACKEND}.md`, `tests/{admin,costing}.spec.ts`.
- `next.config.ts`: fallback `/favicon.ico` menuju ikon existing `/icon.png`, setelah tes console menemukan permintaan favicon 404. `ui.tsx` juga mempertahankan angka nol pada Fields agar ringkasan tidak menampilkannya sebagai data kosong.

## Verifikasi aktual

| Pemeriksaan | Hasil aktual |
| --- | --- |
| `npm run lint` | Lulus. |
| `npm run typecheck` | Lulus (`next typegen` dan `tsc --noEmit`). |
| `npm run build` | Lulus; 30 halaman statis dihasilkan dan route admin dinamis tetap tersedia. |
| `npm run test:admin` | **16/16 lulus**, 1,5 menit pada hasil build produksi (`next start` port 3100 yang digunakan ulang oleh Playwright). |
| Impeccable detector | Tidak ada temuan (`[]`) pada target UI yang diperiksa. |
| Diff whitespace | Lulus `git diff --check` dengan pengenalan CRLF Windows. |
| Review visual | Screenshot desktop 1440×1000 dan mobile 390×844 diperiksa; tabel panjang tetap bergulir di dalam kontainer. |

Tes meliputi semua navigasi admin/public existing, perhitungan exact, input invalid, snapshot versi, alur Umrah, pendaftaran/pembayaran Haji, refresh/reset, penyimpanan rusak/penuh, dan desktop/mobile. Tes navigasi serta alur Haji memeriksa error console/page dan tidak menemukan error pada run akhir.

Build awal di sandbox gagal mengambil Google Fonts; build berhasil setelah dijalankan dengan akses jaringan untuk font existing. Pengujian produksi memakai `ADMIN_SESSION_SECRET` acak sementara pada proses server uji, tanpa mengubah berkas environment atau autentikasi aplikasi. Run awal juga menemukan selector pencarian nama/alert yang terlalu umum dan fallback favicon 404; selector diperjelas dan favicon diarahkan ke ikon existing sebelum run akhir. Log akhir berada di `test-results/m1-1-tests.log`.

Screenshot dihasilkan oleh Playwright pada `test-results/` dan dapat diregenerasi melalui `npm run test:admin`:

- `m1-1-hajj-list-desktop.png`
- `m1-1-hajj-detail-desktop.png`, `m1-1-hajj-detail-mobile.png`
- `m1-1-hajj-editor-desktop.png`, `m1-1-hajj-editor-mobile.png`
- `m1-1-hpp-hajj-desktop.png`
- `m1-1-hpp-comparison-desktop.png`, `m1-1-hpp-comparison-mobile.png`
- `m1-1-product-comparison-desktop.png`
- `hpp-desktop.png`, `hpp-mobile.png` untuk alur Umrah existing.

## Batasan dan pekerjaan berikutnya

Tidak ada item implementasi utama M1.1 yang sengaja ditunda. Batas operasional frontend di bawah tetap berlaku; hasil pengujian browser ini memakai Chrome, bukan seluruh kombinasi browser/perangkat.

- Demo hanya pada browser/origin yang sama. Tidak ada sinkronisasi lintas perangkat/tab, backup server, approval multi-user, audit yang tahan manipulasi atau jaminan retensi. Tab yang menyimpan terakhir dapat menimpa perubahan tab lain. Menghapus browser storage menghapus perubahan.
- Penyimpanan memakai key `hasta-workspace-m1.1`, envelope versi 1, dengan pemeriksaan bentuk/referensi dan input yang baru. Data rusak tidak otomatis ditimpa. Penyimpanan diblokir/penuh harus diperbaiki agar transaksi dapat disimpan.
- Gunakan data fiktif; browser storage tidak menyediakan perlindungan PII produksi. Cookie login existing tetap terpisah; logout tidak menghapus data demo.
- Identitas mengikuti batas existing satu booking aktif per jamaah. Perencanaan Haji tidak memakai rule manifest/visa Umrah. Ringkasan Haji bukan penilaian kepatuhan atau kesiapan produksi.
- Skema tahapan merupakan definisi rencana; penagihan otomatis per milestone dan jadwal jatuh tempo tidak ditambahkan. Komisi pada HPP adalah asumsi biaya; insentif agen bertingkat bukan bagian M1.1.
- Draft lokal yang belum disimpan masih dapat hilang ketika meninggalkan halaman. Finalisasi merupakan penguncian simulasi. Harga paket publik tetap independen dari pengelolaan demo admin.
- M1.2, perluasan inventori dan advanced agent commissions tidak diimplementasikan.

Rekomendasi M1.2: gunakan booking dan pembayaran bersama sebagai sumber tunggal invoice/payment PDF; pertahankan snapshot kontrak dan nilai IDR; sertakan rincian asumsi valuta, sisa tagihan, identitas fiktif dan label DEMO. Tambahkan unduhan PDF langsung yang diuji untuk Umrah/Haji, pagination, teks panjang dan bukti pembayaran terverifikasi. Alur cetak/PDF existing dipertahankan sampai fase tersebut.
