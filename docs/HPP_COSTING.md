# HPP & Kalkulasi Paket

## Audit sebelum implementasi — 8 Oktober 2026

| Area | Temuan existing | Gap |
| --- | --- | --- |
| Arsitektur | Next.js 16 App Router, React Context `DemoProvider`, seed statis; tidak ada database/API bisnis atau localStorage | Costing harus mengikuti state demo dalam memori |
| Paket | Produk, harga Quad/Triple/Double, detail Finance, duplikasi | Belum ada template komponen biaya |
| Keberangkatan | Relasi `packageId`, kapasitas, jamaah dari booking aktif | Belum ada rencana HPP tiap keberangkatan |
| Booking & pembayaran | Harga disalin saat booking, invoice dan pembayaran terverifikasi | Simulasi tidak boleh mengubah booking atau harga produk |
| Pengeluaran | Input biaya aktual per keberangkatan, kategori, vendor, status bayar | Tidak ada kuantitas, mata uang, kurs, atau budget terencana |
| Laporan | Nilai booking dikurangi pengeluaran sebagai estimasi laba kotor | Belum membedakan HPP, margin, markup, FOC, atau skenario |
| UI | Tabel/filter/ekspor, form, modal, konfirmasi, statistik, tab, toast, activity log berfungsi | Belum ada UI costing |

Reuse: `PageHeader`, `Panel`, `Stat`, `DataTable`, `Modal`, `Confirm`, `Tabs`, `SelectFilter`, `DemoProvider.transact`, reset seed, navigasi dan route admin terproteksi. Existing pengeluaran tetap menjadi sumber biaya aktual; costing adalah rencana terpisah.

## Pendekatan dan batas perubahan

Alur: **Package → Departure → Costing → Pricing → Profitability**. Satu template biaya per paket dapat disalin ke draft costing setiap keberangkatan. Salinan menyimpan kurs dan komponen secara mandiri. Costing final dikunci; revisi membuat draft baru dan mempertahankan final sebelumnya. Tidak ada publikasi harga otomatis.

Perubahan menjangkau model/state, seed, engine kalkulasi, UI costing, routing/navigasi, tautan dari paket dan keberangkatan, Panduan Admin, serta test. Tidak mengganti aritmetika atau harga booking/pembayaran existing. Risiko utama yang diuji: salah pembagi FOC, pembulatan uang, mutasi snapshot final/template, dan simulasi yang mengubah data jamaah.

Uang disimpan sebagai string desimal dan dihitung dengan native `BigInt` dalam sen; kuantitas maksimal 3 desimal, kurs maksimal 6 desimal. Tidak menambah dependency atau backend. Angka hasil estimasi adalah laba kotor, bukan laba bersih.

## Implementasi dan file

| File | Perubahan |
| --- | --- |
| `content/admin/costing.ts` | Tipe costing, template, skenario, 13 kategori awal, dan tiga contoh costing |
| `content/admin/types.ts`, `content/admin/seed.ts` | Relasi costing dalam `DemoState` dan reset seed |
| `lib/admin/costing.ts` | Parsing desimal, kalkulasi integer, validasi, draft/final/revisi, template dan snapshot skenario |
| `components/admin/Costing.tsx` | Overview, add/edit/delete biaya, kategori bebas, dasar perhitungan, simulasi, ringkasan, finalisasi, revisi |
| `components/admin/Store.tsx` | Penanda reset untuk mengosongkan perubahan lokal editor HPP saat Reset demo |
| `components/admin/AdminScreen.tsx`, `content/admin/navigation.ts`, `app/admin/(workspace)/[...path]/page.tsx` | Menu Finance dan route list/detail yang mengikuti autentikasi admin |
| `components/admin/Packages.tsx`, `components/admin/Departures.tsx`, `components/admin/Guide.tsx` | Tautan HPP dari Finance paket, detail keberangkatan, dan penjelasan journey |
| `app/admin/admin.css` | Form, toolbar, dan ringkasan Rupiah responsif menggunakan tema admin existing |
| `tests/costing.spec.ts` | Tes engine, snapshot/revisi, dan alur browser |
| `docs/ADMIN_SHOWCASE.md`, `docs/HPP_COSTING.md` | Rute dan dokumentasi audit, penggunaan, formula, validasi |

Struktur data:

- `CostItem`: nama, kategori string bebas, tipe (`person/group/unit`), sasaran (`all/paying/foc`), kuantitas, satuan, harga satuan, mata uang, kurs, keterangan.
- `CostTemplate`: `packageId` dan salinan komponen. Penyimpanan template mengganti template paket untuk draft baru; costing yang sudah ada tidak berubah.
- `Costing`: `departureId`, nomor revisi, status Draft/Final, jamaah berbayar, peserta gratis, harga jual, diskon per jamaah, komponen, catatan, waktu finalisasi.
- `CostScenario`: `costingId`, nama, dan snapshot lengkap asumsi serta komponen. Memuat skenario tidak menimpa draft/final costing.
- Semua nominal berupa string desimal dalam state. Hasil kalkulasi berupa `bigint` sen, tidak disimpan sebagai floating-point. Jumlah peserta berupa integer, dibatasi 1–10.000 berbayar dan 0–10.000 gratis.

## Formula dan pembulatan

Misalkan `N` jamaah berbayar, `F` peserta gratis, `P` harga jual per jamaah, dan `D` diskon per jamaah.

1. Biaya dasar setiap baris = kuantitas × harga satuan × kurs IDR. Pembulatan **half-up ke dua desimal IDR** dilakukan pada biaya dasar ini.
2. Per jamaah: biaya dasar × (`N`, `F`, atau `N + F`) sesuai sasaran yang dipilih. Per grup/per unit: biaya dasar tanpa dikalikan peserta lagi. Kuantitas unit, misalnya 9 kamar × 5 malam = 45 kamar-malam, diisi admin.
3. Total biaya = jumlah total seluruh baris.
4. HPP per jamaah berbayar = total biaya ÷ `N`; hasil tampilan dibulatkan ke sen. Biaya FOC masuk total dan dialokasikan ke pembagi berbayar.
5. Revenue = `(P − D) × N`.
6. Estimasi laba kotor = revenue − total biaya.
7. Margin laba kotor = laba kotor ÷ revenue × 100%.
8. Markup = `(P − HPP) ÷ HPP × 100%`, memakai harga sebelum diskon. Engine menghitung rasio dengan total biaya sebelum pembulatan tampilan HPP.
9. BEP peserta berbayar = pembulatan ke atas `biaya tetap ÷ (P − D − biaya variabel per peserta berbayar)`, minimal 1 peserta. Biaya tetap termasuk komponen per grup/unit dan biaya FOC. Jika kontribusi tidak positif, BEP tidak tercapai, kecuali biaya tetap dan kontribusi sama-sama nol (impas sejak 1 peserta).

Margin/markup disajikan dua desimal persen. Revenue nol atau biaya nol menghasilkan rasio “Tidak terdefinisi” pada pembagi yang bersangkutan. Kurs IDR wajib 1; kurs lain positif, disimpan per baris, tanpa mengambil kurs pasar. Input negatif, eksponen, desimal melebihi presisi, identitas/satuan kosong, komponen kosong, dan ID baris ganda ditolak.

**BEP bersifat kondisional:** valid selama kuantitas unit, harga, kurs, dan FOC tetap. Kamar, bus, dan kapasitas tidak otomatis bertambah saat simulasi jamaah bertambah. UI menjelaskan asumsi ini dan menandai skenario yang melampaui kapasitas; angka BEP bukan jaminan kelayakan operasional.

## Cara mengakses dan mencoba

1. Login admin, buka **Finance → HPP & Kalkulasi Paket** (`/admin/hpp`). Pilih keberangkatan untuk membuka `/admin/hpp/[departureId]`. Paket → Finance dan detail keberangkatan juga menyediakan tautan.
2. Tiga costing contoh pertama memakai kombinasi biaya IDR/SAR/USD, 35/30/20 jamaah berbayar dan 2 pendamping gratis. Contoh pertama memiliki laba; contoh ketiga memakai tiket lebih mahal dengan peserta lebih sedikit sehingga rugi.
3. Buka **Breakdown biaya**. Tambahkan komponen, pilih sasaran peserta, isi kurs, edit atau hapus baris. Kategori boleh diketik bebas. Gunakan pengelompokan kategori, pencarian, dan ekspor tabel.
4. Ubah jamaah berbayar, FOC, harga, atau diskon. Ringkasan otomatis menghitung HPP, revenue, laba kotor, margin, markup, dan BEP. **Simpan draft** menyimpan perubahan dalam sesi demo.
5. Pada **Simulasi harga**, bandingkan 20/25/30/35/40 jamaah. Ubah harga menjadi Rp1.000.000 untuk contoh rugi yang jelas, simpan dengan nama, lalu muat kembali. Simulasi tidak mengubah dasar costing maupun jamaah aktual.
6. **Jadikan template paket** menyalin komponen dari versi tersimpan. Buat keberangkatan baru dengan paket yang sama melalui menu Keberangkatan, buka HPP, lalu **Buat draft costing** untuk memakai template itu.
7. **Finalisasi costing** mengunci versi. Klik **Buat revisi baru**, ubah draft baru, dan pilih versi lama melalui **Revisi costing** untuk membuktikan final sebelumnya tetap utuh.
8. **Ringkasan** memperlihatkan total pengeluaran yang benar-benar tercatat (Menunggu dan Dibayar), terpisah dari rencana HPP. Aksi simpan/final/revisi/template/skenario tercatat di Activity Log.
9. Menu profil → **Reset data demo** mengembalikan contoh awal, termasuk draft editor yang belum disimpan. Refresh juga menghapus perubahan sesi demo.

## Verifikasi

- `npm run build`: lulus, termasuk TypeScript dan 30 halaman statis; admin tetap dynamic/terproteksi.
- `npm run typecheck`: lulus.
- `npm run lint`: lulus.
- `node lib/format.check.ts` dan `node lib/katalog.check.ts`: lulus.
- `npm run test:admin`: 12 tes lulus, mencakup seluruh menu admin, halaman publik, workflow CRM–booking–pembayaran, dokumen, inventori, CMS, panduan dan HPP.
- Pengujian HPP diulang setelah perbaikan reset/tata letak: 6 tes lulus, termasuk browser desktop dan mobile.
- Kasus engine: per jamaah, grup, unit, campuran, kurs, presisi sen/pembulatan, input invalid/nol, revenue/diskon, laba, margin versus markup, BEP, profit/loss, FOC, template, snapshot skenario, revisi final dan isolasi booking/harga.

## Limitasi dan langkah berikutnya

Data hanya di memori workspace, tidak persist ke server/browser storage. Kurs dan kuantitas unit diisi manual. Model memakai satu harga jual rata-rata per jamaah untuk costing; tarif Quad/Triple/Double aktual dan invoice existing tetap independen. Perubahan lokal yang belum disimpan hilang saat meninggalkan editor. Finalisasi adalah penguncian di demo, belum approval multi-user atau audit yang tahan manipulasi.

Untuk produksi, simpan nominal sebagai database DECIMAL atau integer minor-unit, gunakan transaksi dan kontrol akses server, serta simpan revisi final secara immutable. Tambahkan integrasi biaya aktual, pricing campuran tipe kamar, dan aturan kapasitas bertingkat hanya saat kebutuhan operasionalnya ditetapkan. Pajak, rekonsiliasi bank, dan perhitungan laba bersih belum dicakup.
