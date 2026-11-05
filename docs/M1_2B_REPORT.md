# M1.2B — penyempurnaan visual dokumen keuangan

## Arah desain

Identitas Hasta dipertahankan: hijau gelap, emas hangat, kanvas putih dan logo asli `public/logo-mark.png`. Bentuk lengkung pada logo membawa karakter hospitality/perjalanan ibadah tanpa ornamen tambahan yang mengganggu pembacaan.

Dokumen kini memakai font **Lato Regular dan Bold yang ditanamkan dalam PDF**, ukuran judul yang lebih besar, metadata dua kolom, panel paket, tabel dengan header hijau dan baris berselang, angka rata kanan, serta blok ringkasan berkontras tinggi. Label DEMO dan disclaimer tetap tersedia pada setiap halaman, dengan skala lebih tenang dari informasi transaksi.

## Perubahan per dokumen

- **Invoice:** header berlogo, nomor dokumen, tanggal invoice/penerbitan, jatuh tempo hanya bila tercatat, badge pembayaran, penerbit/pelanggan, ringkasan paket, tabel tagihan, tabel pembayaran terverifikasi, serta nilai kontrak/total dibayar/sisa tagihan.
- **Payment Receipt:** jumlah diterima menjadi fokus utama. Status terverifikasi, identitas jamaah, paket, referensi, tanggal transaksi, tanggal verifikasi dan metode pembayaran dikelompokkan dalam panel dan tabel detail. Tidak menambahkan tanda tangan atau identitas penerbit resmi fiktif.
- **Statement of Account:** ringkasan akun tampil sebelum riwayat pembayaran, diikuti tabel kronologis dan saldo akhir yang tegas. Header tabel diulang ketika tabel berlanjut pada halaman berikutnya.
- Semua dokumen memakai A4, footer bernomor halaman, pembungkusan teks panjang dan pemisahan isi tabel/panel yang tidak memotong data.

## Integritas dan lingkup kode

Aturan M1.2 tidak diubah: angka berasal dari snapshot booking dan pembayaran terverifikasi, Haji tetap memakai asosiasi Haji sendiri, HPP tidak masuk dokumen pelanggan, dan pembuatan PDF tidak memutasi state. Pratinjau masih menggunakan Blob PDF yang sama dengan unduhan.

`financialDocument()` menambahkan data presentasi bertipe dari hasil validasi dan saldo yang sudah dihitung. API teks `lines` dipertahankan. Renderer di `lib/admin/financial-pdf.ts` mengatur header, metadata, panel, tabel, ringkasan dan footer; tidak menghitung ulang uang.

Berkas utama:

- `lib/admin/financial-documents.ts`, `lib/admin/financial-pdf.ts`.
- `public/fonts/Lato-Regular.ttf`, `Lato-Bold.ttf`, `OFL-Lato.txt`.
- `package.json` dan lockfile: `@pdf-lib/fontkit` untuk embedding font.
- `tests/m1_2.spec.ts`: suplai aset lokal untuk renderer pada pengujian Node; assertion keuangan sebelumnya tetap dipertahankan.
- `tests/m1_2b.spec.ts`: logo tertanam, satu halaman untuk contoh normal, raster preview dari PDF aktual, serta pagination/stres teks dan transaksi panjang.

## Contoh PDF dan preview

Contoh berikut sepenuhnya fiktif, bertanggal 3 November 2026, dan dapat diregenerasi dengan tes M1.2B. PNG dirender dari berkas PDF yang sama menggunakan PDF.js, bukan mockup terpisah.

| Dokumen | Umrah | Haji Khusus |
| --- | --- | --- |
| Invoice | [PDF](samples/m1_2b/UMRAH-invoice.pdf) · [Preview](samples/m1_2b/UMRAH-invoice.png) | [PDF](samples/m1_2b/HAJJ_SPECIAL-invoice.pdf) · [Preview](samples/m1_2b/HAJJ_SPECIAL-invoice.png) |
| Kuitansi | [PDF](samples/m1_2b/UMRAH-receipt.pdf) · [Preview](samples/m1_2b/UMRAH-receipt.png) | [PDF](samples/m1_2b/HAJJ_SPECIAL-receipt.pdf) · [Preview](samples/m1_2b/HAJJ_SPECIAL-receipt.png) |
| Statement | [PDF](samples/m1_2b/UMRAH-statement.pdf) · [Preview](samples/m1_2b/UMRAH-statement.png) | [PDF](samples/m1_2b/HAJJ_SPECIAL-statement.pdf) · [Preview](samples/m1_2b/HAJJ_SPECIAL-statement.png) |

Screenshot browser tetap dihasilkan tes M1.2 pada `test-results/m1-2/`, termasuk pratinjau invoice/kuitansi/statement dan unduhan untuk kedua produk.

## Verifikasi

| Pemeriksaan aktual | Hasil |
| --- | --- |
| `npm run lint` | Lulus. |
| `npm run typecheck` | Lulus. |
| `npm run build` | Lulus pada build produksi; memerlukan akses jaringan untuk font website existing saat build. Font PDF sendiri disajikan lokal. |
| `npm run test:admin` | **19/19 lulus**, termasuk seluruh regresi M1.1/M1.2 dan tes visual PDF baru (1,4 menit). |
| `npm run test:admin -- tests/m1_2.spec.ts tests/m1_2b.spec.ts` | **3/3 lulus** pada build akhir setelah perapian kolom jumlah (53,6 detik). |
| Review visual | PNG hasil render PDF invoice, receipt dan statement diperiksa; keenam contoh normal tetap satu halaman A4. |
| Teks panjang / tabel panjang | Pengujian 100 transaksi dan deskripsi panjang lulus: saldo/referensi terakhir tetap ada, header tabel diulang dan koordinat teks tetap berada di halaman. |
| Pemeriksa mekanis Impeccable | Tidak ada temuan (`[]`). |

Tes M1.2 tetap memeriksa kontrak, pembayaran terverifikasi, blokir kuitansi yang tidak memenuhi syarat, total UI versus PDF, refresh, pembatalan booking dan unduhan desktop/mobile. Perubahan fixture hanya menyediakan logo/font lokal untuk renderer Node. Tes browser juga menunggu redirect login selesai sebelum membuka booking untuk menghindari navigasi yang membatalkan proses login.

Pengujian memakai server `next start` pada port 3100 dan kunci sesi acak sementara, tanpa perubahan environment tersimpan. Log akhir: `test-results/m1-2b-build.log`, `m1-2b-tests.log`, dan `m1-2b-final-tests.log`. Screenshot browser diperbarui bersama sampel akhir. Tidak ada pekerjaan visual utama M1.2B yang ditunda.

## Aset dan batasan

- Logo memakai bitmap asli dengan rasio yang dipertahankan; tidak dibuat ulang atau diganti. Logo dan font dimuat dari origin aplikasi, tanpa layanan font eksternal saat membuat PDF.
- Lato berasal dari [Google Fonts](https://github.com/google/fonts/tree/main/ofl/lato), berlisensi SIL OFL; lisensinya disertakan di `public/fonts/OFL-Lato.txt`. Subset Regular/Bold ditanamkan agar pembaca PDF tidak memerlukan font sistem.
- Font ini mendukung Latin/diakritik tetapi bukan seluruh aksara. Karakter yang tidak didukung menghasilkan pesan error yang eksplisit; tidak dihapus atau diganti diam-diam. Font Arab dan tata letak RTL belum ditambahkan.
- Bitmap logo membatasi pembesaran ekstrem; skala pada dokumen A4 tetap kecil. Tidak menambahkan cap, tanda tangan, nomor pajak atau klaim kepatuhan.
- Batas lokal-browser, snapshot unduhan dan status DEMO dari M1.2 tetap berlaku. Tidak ada perubahan inventori, komisi atau proses keuangan.
