# Invoice layout refinement

Perubahan khusus invoice, berdasarkan masukan klien pada 5 November 2026.

## Hasil

- Logo, header hijau, aksen emas, font Lato, hierarki judul dan blok ringkasan dipertahankan. Tidak ada desain ulang receipt, statement atau bukti serah terima.
- Seluruh bagian **Catatan dokumen** dihapus dari invoice. Instruksi rekening yang sebelumnya berada di bawah catatan dipindahkan ke kanan atas, sejajar dengan identitas penerbit. Label DEMO, larangan transfer dana pada rekening simulasi dan disclaimer footer dipertahankan.
- Bank, nomor rekening dan nama pemilik rekening berasal dari **Settings → Pembayaran** (`bank`, `account`, `accountHolder`). Seed memakai identitas rekening demo dari aset company yang sudah ada. Renderer tidak menganggapnya rekening bisnis riil dan tidak mengarang nama pemilik bila kosong.
- Data localStorage lama yang belum punya `accountHolder` dipulihkan dengan string kosong, tanpa reset atau penetapan pemilik rekening fiktif. Invoice menampilkan keterangan bahwa field belum diisi. Ketiga field dibatasi 120 karakter pada form, serta diperiksa sebelum render invoice; teks membungkus dalam kolom kanan.
- Ringkasan **Total Harga Paket**, **Total Pembayaran Terverifikasi**, **Sisa Tagihan** sekarang langsung mengikuti tabel pembayaran. Blok ringkasan setinggi 98 pt selalu utuh; untuk tabel panjang, baris terakhir dan ringkasan dipindahkan bersama bila muat di halaman lanjutan.
- Ruang tabel bertambah melalui penghapusan catatan dan pengurangan jeda setelah panel paket. Kolom Status invoice diperlebar agar tanggal verifikasi tidak terpecah menjadi tiga baris pada contoh normal. Font isi tabel tetap 9 pt dengan jarak baris 13 pt dan padding vertikal yang sama; tidak diperkecil agar muat.
- Kalkulasi dan data transaksi tidak diubah. Kontrak tetap dari booking tersimpan; hanya Terverifikasi mengurangi tagihan. Menunggu dan Dikembalikan tetap terlihat dalam tabel dengan penjelasan di footer.

## Pagination aktual

Hasil parser PDF aktual:

| Jumlah pembayaran | Umrah | Haji Khusus |
| --- | --- | --- |
| 4 | **1 halaman** | **1 halaman** |
| 10 | **2 halaman** | **2 halaman** |
| 25 | **3 halaman** | **3 halaman** |

Fixture memakai nama paket pendek, referensi internal/eksternal, metode transfer/tunai, serta status Terverifikasi/Menunggu/Dikembalikan. Empat pembayaran masing-masing Rp5 juta menghasilkan total terverifikasi Rp10 juta; pada contoh Umrah kontrak Rp20 juta, sisa Rp10 juta. Fixture 10/25 pembayaran masing-masing bernilai Rp500 ribu. Jumlah halaman dapat bertambah bila nama jamaah, paket, referensi atau informasi rekening lebih panjang.

Sampel: `docs/samples/invoice-layout/UMRAH-{4,10,25}.pdf` dan `HAJJ_SPECIAL-{4,10,25}.pdf`. PNG seluruh halaman Umrah tersedia di folder yang sama. `pagination.json` menyimpan jumlah halaman dan saldo yang benar-benar diperiksa.

## Pemeriksaan

`tests/invoice_layout.spec.ts` memeriksa A4, semua record tetap muncul, urutan tabel/ringkasan, ringkasan hanya di halaman terakhir dan utuh, header tabel berulang, posisi rekening di kanan atas, disclaimer pada setiap halaman, tidak ada Catatan dokumen, dan batas koordinat teks. Tes browser menyimpan ketiga field rekening, refresh, lalu membaca isi PDF yang diunduh dari pratinjau aktual. Receipt/statement tetap memiliki catatan dan tidak memakai blok rekening invoice.

| Pemeriksaan aktual | Hasil |
| --- | --- |
| `npm run lint` | Lulus, exit 0 |
| `npm run typecheck` | Lulus, exit 0 |
| `npm run build` | Lulus, exit 0 |
| `npm run test:admin` | **29/29 lulus (3,3 menit)** pada server build produksi |
| Pemeriksa mekanis UI | Tidak ada temuan (`[]`) |

Review visual dilakukan pada PDF empat pembayaran (satu halaman) dan halaman terakhir dari PDF 25 pembayaran: ringkasan berada di bawah baris terakhir dan tidak terpotong. Percobaan awal empat pembayaran masih dua halaman karena tanggal verifikasi membungkus tiga baris; pelebaran kolom Status memperbaikinya tanpa mengecilkan font. Hasil pada tabel pagination berasal dari pengujian ulang versi akhir.

Log akhir: `test-results/invoice-layout-build.log`, `invoice-layout-lint.log`, `invoice-layout-typecheck.log`, `invoice-layout-final-tests.log`. Sampel milestone lama yang ditulis ulang oleh tes dikembalikan agar tetap menjadi arsip; sampel revisi invoice berada di folder baru yang disebut di atas. Tidak ada dependency baru, backend atau pekerjaan M3. Deployment belum dilakukan.
