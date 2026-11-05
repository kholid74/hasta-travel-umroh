# M2 — Inventory & Pilgrim Kit Management

## Audit sebelum implementasi

Perlengkapan berada di `Operations.tsx`: saldo awal mutable `inventory.stock`, distribusi berupa nama barang dalam `jamaah.equipment`, dan reservasi semu untuk semua jamaah aktif. Belum ada gudang, ledger, alokasi nyata, template kit, serah terima parsial, retur atau bukti PDF. `Reports.tsx` dan readiness juga membaca model lama. Tidak ada master jamaah/booking baru yang diperlukan.

Store sudah mengkloning state per transaksi, menulis localStorage sebelum menerbitkan perubahan, dan menyediakan reset. Envelope persistence versi 1 perlu dimigrasikan tanpa menghapus kontrak, pembayaran, HPP atau perubahan pengguna. PDF M1.2B sudah memiliki logo asli, font Lato, layout A4, panel/tabel dan footer berulang. UI menyediakan DataTable, Modal, Confirm, Fields, Tabs, Stat dan Panel. Pengujian Playwright memeriksa model, browser, isi PDF dan geometri.

## Model dan migrasi

Tambahkan master barang (SKU/kategori/unit/varian/minimum/aktif), gudang, ledger pergerakan append-only, template kit per produk, alokasi dengan snapshot item/kuantitas rilis, dan serah terima dengan snapshot penerima/booking/paket/operator/item. Saldo fisik berasal dari ledger; reservasi hanya sisa alokasi nyata, tidak termasuk unit diserahkan atau dirilis.

Seed/migrasi mengubah stok lama menjadi OPENING dan distribusi lama menjadi alokasi/serah terima serta HANDOVER deterministik. Model lama `stock`/`equipment` tidak lagi menjadi sumber saldo; arsip equipment lama dipertahankan untuk kompatibilitas data, sementara pembaca aktif dialihkan. Naikkan envelope ke versi 2 pada key browser yang sama. Validasi relasi dan saldo sebelum restore/save; transaksi ledger baru tidak boleh mengubah catatan lama.

## Navigasi dan alur

Pertahankan `/admin/perlengkapan` dan satu sidebar. Tab internal: Overview, Master Barang, Barang Masuk/Keluar, Template Perlengkapan, Distribusi, Riwayat Serah Terima, Laporan. Gudang demo Jakarta dan Bandung dapat dipilih; tidak menambahkan administrasi lokasi di luar lingkup.

1. Penerimaan/koreksi → validasi barang/gudang/kuantitas/tanggal/alasan → konfirmasi → satu transaksi ledger.
2. Pilih departure Umrah atau paket Haji dan booking aktif → template sesuai produk → cek kebutuhan versus tersedia → simpan snapshot dan reservasi atomik.
3. Serah terima sebagian/seluruh sisa → recipient/tanggal/operator → konfirmasi → token idempotensi → snapshot serah terima dan HANDOVER → status alokasi.
4. Rilis sisa → konfirmasi → hanya kuantitas yang belum diserahkan; tidak mengubah ledger atau bukti lama. Pembatalan booking memblokir penyerahan baru dan tidak menghapus sejarah; sisa reservasi dilepas eksplisit dari UI.
5. Retur terhubung bukti serah terima. Retur layak menambah stok. Retur rusak diposting sebagai RETURN dan ADJUSTMENT_OUT bersamaan, dengan alasan/disposisi eksplisit; stok tersedia tidak bertambah. Retur tidak membuka ulang alokasi historis.
6. PDF bukti memakai snapshot serah terima yang benar-benar diposting; preview dan unduhan memakai Blob yang sama. Gunakan renderer branded yang sama melalui penambahan model presentasi serah terima, tanpa perubahan kalkulasi keuangan.

## Berkas dan risiko

Tambahkan `content/admin/inventory.ts`, `lib/admin/inventory.ts`, `components/admin/Inventory.tsx`, `components/admin/HandoverReceipt.tsx`, `tests/m2.spec.ts`. Perluas types/seed/persistence/Store, dispatcher, Reports/readiness dan generator PDF. Hapus cabang inventory lama di Operations agar tidak ada jalur mutable stok paralel. Tambahkan CSV melalui util ekspor existing.

Risiko utama: migrasi data lama, hitungan reservasi setelah penyerahan parsial, klik ganda, metadata/template berubah, pembatalan booking, retur melebihi penyerahan dan catatan lama dimutasi. Semua operasi berlangsung pada draft Store dan validasi seluruh invariant sebelum publikasi. Pembaruan unit barang yang sudah memiliki ledger harus ditolak agar satuan historis tidak ambigu.

## Pengujian

Uji saldo/underflow, stok tersedia versus reservasi, duplikasi, parsial dan multipel, rilis, retur layak/rusak, pembatalan, migrasi/persistensi/reset, kedua produk, data snapshot dan append-only. Uji browser desktop/mobile, form/konfirmasi dan unduhan PDF. Parse PDF aktual, cek A4/logo/item/penerima, dan rasterisasi sampel. Jalankan lint, typecheck, build, seluruh Playwright termasuk M1.1/M1.2. Perubahan tes inventory lama menyesuaikan alur baru; jangan melemahkan tes finance/HPP. M3 tidak dimulai.
