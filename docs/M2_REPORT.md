# M2 — Inventory & Pilgrim Kit Management

## Implementasi

Rute `/admin/perlengkapan` tetap dipakai dengan satu sidebar **Perlengkapan Jamaah** dan tujuh tab: Overview, Master Barang, Barang Masuk/Keluar, Template Perlengkapan, Distribusi, Riwayat Serah Terima, Laporan. Identitas jamaah, booking, paket dan keberangkatan tetap memakai master bersama.

- Master barang memiliki SKU unik, nama, kategori, varian, satuan, minimum dan status aktif. Detail menampilkan ledger. Edit metadata tidak mengubah snapshot historis; satuan terkunci setelah ada pergerakan.
- Dua gudang fiktif tersedia: Jakarta dan Bandung. Saldo, pergerakan dan alokasi dapat difilter per gudang; kategori/produk juga tersedia bila relevan.
- Penerimaan/koreksi memakai kuantitas bilangan bulat positif, tanggal, referensi opsional, operator dan catatan. Koreksi wajib memiliki alasan. Postingan memakai konfirmasi; ledger tidak menyediakan pengeditan atau penghapusan.
- Template Umrah dan Haji dapat ditambah/diedit/dinonaktifkan. Isi kit dipilih operator; tidak ada pemilihan barang berdasarkan gender otomatis. Alokasi menyimpan snapshot template/item, sehingga revisi template tidak mengubah alokasi lama.
- Distribusi mendukung pencarian booking/jamaah, pilihan departure Umrah atau paket Haji, kebutuhan versus stok tersedia, alokasi atomik, progres per barang, rilis sisa dan penyerahan parsial/berulang. Daftar jamaah terdaftar dapat dibuka untuk melihat booking tanpa alokasi dan memulai alokasi langsung.
- Setiap serah terima menyimpan penerima, tanggal, operator, gudang, paket, item dan jumlah aktual, serta nomor bukti DEMO deterministik dari ID catatan. ID posting yang sama tidak dapat dikirim ulang.
- Retur merujuk bukti dan item yang benar-benar diserahkan. Akumulasi retur tidak boleh melebihi penyerahan. Retur layak kembali ke stok; retur rusak memiliki RETURN dan ADJUSTMENT_OUT berpasangan dalam transaksi yang sama, sehingga tidak menambah stok tersedia.
- Laporan: saldo per gudang, stok rendah, ledger, kebutuhan kit per rombongan/template, distribusi tertunda dan catatan serah terima diposting. CSV mengikuti filter/pencarian/urutan tabel; ekspor Excel existing tetap tersedia. Tidak ada biaya akuisisi atau valuasi yang diinventarisasi.

## Saldo dan invariant

Fisik = OPENING + RECEIPT + RETURN + ADJUSTMENT_IN − HANDOVER − ADJUSTMENT_OUT.

Reservasi = jumlah alokasi − jumlah diserahkan − jumlah dirilis. Tersedia = fisik − reservasi. Unit yang sudah diserahkan tidak lagi menjadi reservasi.

Ledger dan bukti diposting secara append-only pada Store. Snapshot alokasi tidak boleh ditulis ulang dan rilis tidak boleh dikurangi. Setiap transaksi Store memeriksa relasi, jumlah, status, kecocokan bukti versus movement, kondisi retur dan saldo nonnegatif sebelum menulis browser storage/publikasi state. Kegagalan validasi atau penyimpanan tidak menerbitkan perubahan parsial. Quantity tidak dipotong diam-diam agar transaksi lolos.

Pembatalan booking tidak menghapus ledger, alokasi atau bukti. Penyerahan baru ditolak; sisa reservasi tetap terlihat dan harus dirilis eksplisit. Bukti serah terima historis tetap tersedia karena mencatat kejadian yang telah diposting, berbeda dari konfirmasi pembayaran aktif.

## Persistensi dan migrasi

Key existing `hasta-workspace-m1.1` dipertahankan. Envelope baru menggunakan versi 2. Versi 1 dimigrasikan saat dibaca, lalu ditulis sebagai versi 2 pada penyimpanan berikutnya. Saldo lama menjadi OPENING; arsip `jamaah.equipment` menjadi alokasi/serah terima dan movement deterministik. Data finance, kontrak, versi HPP, users dan modul lain tetap dipertahankan.

Tanggal/penerima penyerahan lama memang tidak tersedia. Catatan migrasi menandainya secara eksplisit sebagai arsip demo, dengan tanggal migrasi contoh dan penerima tidak tercatat. Tidak ada klaim bukti riil dari arsip tersebut. Field equipment lama hanya dipertahankan sebagai arsip kompatibilitas; pembaca saldo, laporan dan readiness sudah memakai model baru.

Reset existing mengembalikan seluruh koleksi ke seed deterministik, termasuk ledger dan bukti. Data rusak/relasi tidak valid ditolak tanpa otomatis menimpa browser storage.

## Bukti PDF dan artefak

Renderer M1.2B diperluas dengan tipe dokumen serah terima: logo Hasta, Lato tertanam, hijau/emas, A4 portrait, panel paket, detail penerima/gudang/operator, tabel item/jumlah/satuan, ruang pengakuan kosong, label DEMO dan footer bernomor halaman. Preview menampilkan Blob yang sama dengan unduhan. Jumlah pada bukti berasal dari handover yang sudah diposting, bukan keseluruhan alokasi.

- [Sampel bukti PDF](samples/m2/handover-demo.pdf)
- [Preview sampel dari PDF aktual](samples/m2/handover-demo.png)
- Screenshot Playwright: `test-results/m2/overview-desktop.png`, `stock-receipt.png`, `allocation-KIT-UMRAH.png`, `allocation-KIT-HAJJ_SPECIAL.png`, `partial-handover.png`, `handover-preview.png`, `distribution-desktop.png`, `reports-mobile.png`, `templates-desktop.png`, `damaged-return.png`.

Sampel dapat diregenerasi dengan `npm run test:admin -- tests/m2.spec.ts`. Screenshot mengikuti alur browser yang benar-benar dijalankan.

## Berkas

Baru: `content/admin/inventory.ts`, `lib/admin/inventory.ts`, `components/admin/Inventory.tsx`, `components/admin/HandoverReceipt.tsx`, `tests/m2.spec.ts`, rencana/laporan M2 dan sampel PDF/PNG.

Diperbarui: `content/admin/{types,seed}.ts`, `lib/admin/{model,persistence,export,financial-pdf}.ts`, `components/admin/{Store,AdminScreen,Operations,Reports,Guide,ui}.tsx`, CSS admin, tes admin existing serta dokumentasi. Cabang stok mutable lama di Operations dan fungsi distribusi lama dihapus agar tidak ada jalur saldo paralel. Tidak ada dependency baru untuk M2.

## Verifikasi aktual

Pemeriksaan dijalankan pada 4 November 2026:

| Pemeriksaan | Hasil aktual |
| --- | --- |
| `npm run lint` | Lulus, exit 0 |
| `npm run typecheck` | Lulus, exit 0 |
| `npm run build` | Lulus, exit 0; build produksi Next.js |
| `npm run test:admin` | **25/25 lulus**, 1,9 menit, pada server build produksi |
| `git diff --check` | Lulus, exit 0 |

Enam tes M2 mencakup penerimaan/koreksi, underflow, reservasi, penyerahan parsial/berulang, duplikasi, rilis, retur layak/rusak, kedua produk, booking batal, migrasi versi 1, persistensi/reset, CSV, isi/geometri/logo PDF, editor master/template serta desktop/mobile. Seluruh suite admin, costing, M1.1, M1.2 dan M1.2B ikut dijalankan; assertion finance/HPP sebelumnya dipertahankan. PDF diperiksa melalui parser dan rasterisasi, bukan hanya ekstensi unduhan. Screenshot desktop/mobile dan sampel PDF juga ditinjau secara visual.

Log build dan Playwright: `test-results/m2-build.log`, `test-results/m2-tests.log`. Arsip `hasta-m2-review.zip` berisi source proyek, dokumentasi, sampel PDF dan screenshot, tanpa `node_modules`, build cache, `.git` atau file environment. Tidak ada commit, push atau deployment yang dilakukan.

## Batasan

- Demo client-side untuk satu workspace/tab aktif. Tidak ada penguncian lintas tab/perangkat, otorisasi produksi, audit server, backup atau jaminan anti-manipulasi. Menyimpan bersamaan di beberapa tab dapat menimpa perubahan; gunakan satu tab dan data fiktif.
- Gudang Jakarta/Bandung disediakan sebagai lokasi demo tetap; editor master gudang dan transfer antar-gudang tidak ditambahkan.
- Kuantitas menggunakan bilangan bulat; penerimaan per transaksi dibatasi 10.000.000. Minimum barang diterapkan per kombinasi SKU/gudang. KPI total fisik dilabeli unit campuran, bukan valuasi atau unit homogen.
- Satu alokasi per booking/template, termasuk yang telah dirilis. Reissue kit yang sama belum didukung. Retur tidak membuka ulang alokasi historis; operator meninjau kebutuhan kit susulan secara eksplisit.
- Retur rusak diasumsikan langsung dikeluarkan dari persediaan layak. Tidak ada siklus karantina, perbaikan, vendor return atau persetujuan write-off produksi.
- “Serah terima diposting” adalah jumlah kejadian penyerahan, termasuk penyerahan parsial; berbeda dari jumlah kit yang sepenuhnya selesai. Booking tanpa kit belum mengikat gudang atau stok. Laporan kebutuhan template bersifat teoretis, tidak menambah reservasi.
- Font Lato dan batas aksara Latin M1.2B tetap berlaku. Ruang pengakuan kosong bukan tanda tangan yang ditangkap atau diverifikasi. Tidak ada klaim kepatuhan atau integrasi pemerintah.

## Rekomendasi M3

Untuk milestone agen berikutnya, definisikan kebijakan komisi dan milestone secara eksplisit, gunakan booking/verified payments bersama sebagai sumber eligibility, simpan snapshot kebijakan dan event insentif yang dapat diaudit, serta uji pembatalan/refund/idempotensi. Pisahkan pencatatan insentif dari pergerakan stok. Tidak ada implementasi M3 pada perubahan ini.
