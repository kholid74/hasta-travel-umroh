# Audit riwayat pembayaran booking dan PDF

Tanggal audit: 5 November 2026. Audit dilakukan pada implementasi aktual setelah M2, sebelum perubahan fitur ini.

## Temuan awal

| Area | Implementasi yang ditemukan | Gap |
| --- | --- | --- |
| Model | `content/admin/types.ts`: Booking menyimpan `total` kontrak historis; Payment merujuk `bookingId`, dengan id, amount, date, method, status, verifiedAt/reference opsional. Banyak Payment boleh merujuk booking yang sama. | Tidak ada master pembayaran paralel; jangan membuatnya. |
| Pencatatan | `components/admin/CreateForm.tsx`, `lib/admin/model.ts:recordPayment`: Transfer bank dan Tunai di kantor sama-sama masuk antrean Menunggu. | Tanggal selalu DEMO_TODAY, referensi eksternal belum bisa diisi dari form. |
| Verifikasi | `verifyPayment` menerima hanya Menunggu, memeriksa booking aktif dan sisa tagihan, lalu menyimpan Terverifikasi dan verifiedAt. | Tidak ada workflow penolakan transaksi tersendiri. |
| Status | Menunggu, Terverifikasi, Dikembalikan. Pembatalan booking pada `components/admin/Finance.tsx` menandai semua pembayaran Dikembalikan sebagai simulasi refund. `lib/admin/persistence.ts` memvalidasi enum ini. | Ditolak dan Dibatalkan bukan status pembayaran yang terpisah. Jangan mengklaim tersedia atau menyamakan refund dengan penolakan. |
| Saldo | `financialBalance` pada `lib/admin/model.ts` menghitung kontrak dan pembayaran Terverifikasi dengan BigInt, lalu sisa. `paid`/`outstanding` mendelegasikan ke helper ini. Dokumen memakai mode strict untuk menolak kelebihan bayar/inkonsistensi. | Riwayat seluruh status belum dikembalikan oleh helper bersama. |
| Dashboard | `components/admin/Dashboard.tsx` memakai payments bersama untuk penerimaan per periode dan outstanding untuk piutang. Finance memakai paid/outstanding. | Agregasi penerimaan bulanan masih melakukan filter/sum sendiri; perlu memakai pembayaran eligible dari helper yang sama. Penerimaan bulanan memang berbeda cakupan dari total seumur booking. |
| Booking/invoice UI | `Finance.tsx` detail sudah punya tabel semua cicilan, tanggal, metode, nominal, status dan verifikasi. | Urutan belum kronologis; referensi eksternal/tanggal verifikasi belum terlihat. |
| Detail jamaah | `components/admin/Jamaah.tsx`, tab Pembayaran sudah menampilkan total tagihan/terbayar/sisa dan tabel transaksi. | Metode, referensi eksternal dan tanggal verifikasi belum terlihat. Tabel diduplikasi dengan booking. |
| Invoice | `lib/admin/financial-documents.ts` + `financial-pdf.ts` sudah memuat seluruh pembayaran Terverifikasi, metode, tanggal transaksi/verifikasi, referensi dan saldo. | Judul belum Riwayat Pembayaran; pembayaran Menunggu/Dikembalikan tidak tampil, sehingga belum seluruh catatan. |
| Receipt | Generator yang sama; hanya boleh diterbitkan untuk satu Payment Terverifikasi dan booking aktif. Hero nominal/detail adalah pembayaran tersebut. `FinancialDocuments.tsx` meregenerasi/menonaktifkan dari state terbaru. | Belum ada riwayat cicilan dan ringkasan saldo booking sebagai informasi pendukung. Receipt harus tetap mengakui satu pembayaran, bukan total cicilan. |
| Statement | Sudah memuat riwayat kronologis Terverifikasi, kontrak, total dibayar dan sisa. | Status noneligible belum tampil. |
| Persistensi | DemoStore terpusat; envelope v2 pada localStorage `hasta-workspace-m1.1`. Snapshot preview/unduhan memakai model dan Blob PDF sama. | Tidak memerlukan perubahan schema atau migrasi untuk fitur ini. |
| Tes | `tests/m1_2.spec.ts` memeriksa kedua produk, real PDF, saldo, receipt pending/refund ditolak, refresh/download/mobile, pagination dan nonmutation. `m1_2b.spec.ts` memeriksa font/logo/layout/A4/long tables; `m1_1.spec.ts`, `admin.spec.ts` menguji transaksi/persistensi. | Perlu tes eksplisit dua cicilan transfer/tunai + status noneligible di seluruh PDF dan detail booking/jamaah. |

## Perubahan yang dipilih

1. Kembalikan riwayat kronologis seluruh status dari `financialBalance`; koleksi eligible dan aritmetika BigInt tetap menjadi sumber saldo tunggal. Dashboard mengambil penerimaan eligible dari helper yang sama dan tetap memfilter periode transaksi.
2. Invoice, receipt dan statement menampilkan **Riwayat Pembayaran** dengan tanggal, metode, referensi, nominal dan status. Tanggal verifikasi tetap dibedakan dari tanggal transaksi. Menunggu/Dikembalikan ditandai tidak mengurangi tagihan. Receipt mempertahankan hero/detail transaksi spesifik dan menjelaskan riwayat sebagai konteks saldo saat penerbitan.
3. Ringkasan berlabel Total Harga Paket, Total Pembayaran Terverifikasi, Sisa Tagihan. Ini mengikuti snapshot kontrak, bukan harga paket saat ini. Pembayaran pending/refund tidak masuk total terverifikasi.
4. Satu komponen tabel untuk detail booking dan jamaah, memakai riwayat/saldo helper yang sama. Form pencatatan menerima tanggal transaksi dan referensi opsional dengan validasi domain; kedua metode tetap wajib diverifikasi.
5. Pertahankan status/model/workflow existing. Tidak menambahkan workflow penolakan/cancel pembayaran baru di luar permintaan. Status yang tidak dikenal tetap ditolak saat restore. Receipt pending/refund tetap dilarang. Pembatalan booking tetap memakai perilaku M1.2 dan tercatat jelas pada UI.

## Cakupan dan risiko

Berkas: `lib/admin/{model,financial-documents,financial-pdf}.ts`, `components/admin/{PaymentHistory,Finance,Jamaah,Dashboard,CreateForm}.tsx`, tes PDF/browser dan audit ini. Tidak mengubah inventory, HPP, ID dokumen, schema, atau data lama. Riwayat tambahan dapat menambah halaman receipt; gunakan renderer tabel berulang yang ada. PDF unduhan lama adalah snapshot dan tidak dapat dicabut; preview baru selalu memakai status terbaru. Data demo hanya lokal satu browser/tab, bukan pembukuan produksi.

## Hasil verifikasi

Pemeriksaan aktual pada 5 November 2026:

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Lulus, exit 0, tanpa warning pada pemeriksaan akhir |
| `npm run typecheck` | Lulus, exit 0 |
| `npm run build` | Lulus, exit 0 |
| `npm run test:admin` | **27/27 lulus (3,8 menit)** pada server build produksi |
| `git -c core.safecrlf=false diff --check` | Lulus, exit 0; override hanya menonaktifkan peringatan konversi LF/CRLF pada perintah ini |
| Pemeriksa mekanis UI | Tidak ada temuan (`[]`) |
| Review visual | Raster PDF aktual invoice/receipt, screenshot desktop detail jamaah dan mobile ditinjau |

Dua tes baru `tests/payment_history.spec.ts` memeriksa urutan/cash/transfer/status/referensi/tanggal transaksi dan verifikasi, jumlah eligible versus pending/refund, larangan receipt noneligible, pelunasan, pembalikan status, validasi tanggal/metode/referensi, riwayat panjang, nonmutation, persistence, A4/batas teks, unduhan browser, konsistensi UI dan KPI dashboard, serta desktop/mobile. Seluruh tes admin/HPP/M1.1/M1.2/M1.2B/M2 tetap dijalankan. Tes layout M1.2B tetap memeriksa konten, font, logo, pagination dan batas koordinat; receipt seed kini boleh dua halaman karena tambahan riwayat/ringkasan.

Percobaan awal server dev memakai fallback font karena akses Google Fonts gagal; satu selector dropdown tes browser kemudian diperbaiki menjadi role combobox sesuai pola proyek. Hasil akhir di atas berasal dari build produksi yang berhasil mengambil font dengan akses jaringan dan seluruh suite yang dijalankan ulang, bukan hasil percobaan awal.

Log akhir: `test-results/payment-history-build.log`, `payment-history-lint.log`, `payment-history-typecheck.log`, `payment-history-final-tests.log`. Arsip source/dokumentasi/sampel/screenshot: `hasta-payment-history-review.zip`; tidak menyertakan file environment, node_modules, cache build atau .git. Tidak ada commit, push, deployment atau pekerjaan M3.

## Hasil implementasi

- `financialBalance` mengembalikan `history` seluruh catatan terurut tanggal transaksi lalu ID, dan `payments` eligible Terverifikasi untuk saldo. Ketiga PDF serta komponen baru `components/admin/PaymentHistory.tsx` menggunakan hasil ini. Tidak ada total yang disimpan atau master pembayaran baru.
- Detail booking dan tab Pembayaran jamaah memakai komponen yang sama: referensi internal/eksternal, tanggal transaksi, metode, nominal, status, tanggal verifikasi, total harga paket, total terverifikasi dan sisa tagihan. Aksi verifikasi dan receipt tetap berhubungan dengan Payment yang sama. Detail jamaah mengikuti booking aktif seperti perilaku sebelumnya; histori booking batal tetap dapat dilihat melalui daftar/detail Booking.
- Dashboard memakai transaksi eligible dari helper yang sama untuk KPI/grafik penerimaan. Filter bulan berdasarkan tanggal transaksi tetap berlaku; KPI bulan tertentu tidak mewakili total seumur booking. Saldo piutang tetap menggunakan outstanding/financialBalance.
- Invoice, receipt dan statement memuat Riwayat Pembayaran seluruh status tercatat. Kolom status menjelaskan tanggal verifikasi secara terpisah. Catatan pending/refund tidak dihitung dalam total. Tidak dibuat status penolakan baru.
- Receipt mempertahankan nomor, hero nominal dan detail satu transaksi yang diakui, kemudian menyertakan riwayat dan ringkasan saldo booking saat penerbitan. Riwayat panjang dapat menghasilkan beberapa halaman; tabel dan footer diulang oleh renderer yang sama. Receipt Menunggu/Dikembalikan atau booking batal tetap tidak tersedia.
- Form pencatatan menerima tanggal transaksi valid serta referensi opsional maksimal 120 karakter. Default tanggal demo dan API pemanggil lama tetap kompatibel. Saldo pending saat validasi pencatatan dijumlahkan dengan BigInt. Tidak ada dependency atau migrasi schema baru.

Sampel aktual (data fiktif) tersedia di `docs/samples/payment-history/`: PDF invoice/receipt/statement untuk UMRAH dan HAJJ_SPECIAL, serta raster tiap halaman contoh Umrah. Contoh Umrah menunjukkan kontrak Rp20.000.000, dua pembayaran terverifikasi masing-masing Rp5.000.000, pending Rp1.000.000, refund Rp2.000.000; total eligible tetap Rp10.000.000 dan sisa Rp10.000.000.

Screenshot browser: `test-results/payment-history/booking.png`, `pilgrim.png`, `pilgrim-mobile.png`. Sampel dan screenshot diregenerasi oleh `tests/payment_history.spec.ts`; pratinjau browser menampilkan Blob PDF yang sama dengan unduhan.
