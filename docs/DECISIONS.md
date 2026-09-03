# Keputusan Build — Hasta Travel

> Hasil sesi grilling atas `umroh-haji-travel-vibe-coding-spec.md`.
> **Dokumen ini menang atas spec** di setiap titik yang bertentangan. Spec tetap jadi rujukan riset, positioning, dan tone.

## 1. Sifat proyek

- Deliverable = **portfolio piece** Kalsara Digital Studio, bukan client starter.
- Brand fiktif: **Hasta Travel** (`hasta` = satuan panjang tradisional; menautkan brand ke tesis "terukur"). Sudah dicek: tidak bentrok dengan travel umroh nyata. Nama "Mizan" **ditolak** — bentrok dengan PT Mizan Tours (Bekasi, PPIU U 60/2020).
- Label demo: satu badge kecil sticky di footer + baris jelas di halaman Kontak & Tentang. **Tidak ada** `[placeholder bracket]` tersebar di UI (menggantikan Bagian 29 spec).
- Semua data perusahaan terpusat di `content/company.ts`.
- Izin demo: `PPIU: DEMO-000 TAHUN 2026` — sengaja mustahil valid. Rekening demo bernomor mustahil valid.

## 2. Batas realisme

| Nyata | Fiktif |
|---|---|
| Nama hotel Makkah/Madinah + jarak terukur | Nama travel, nomor izin |
| Nama maskapai + **logo asli** (SVG Wikimedia, grayscale, tinggi seragam) | Alamat, rekening |
| Kota keberangkatan | Testimoni, pembimbing |
| Foto arsitektur (Unsplash, di-download ke `/public`) | Harga |

- **Nol foto wajah** di seluruh situs. Testimoni = kartu tipografi + inisial, bukan avatar orang.
- Disclaimer logo maskapai muncul di footer: nama maskapai disebut sebagai informasi rute, bukan tanda kemitraan.

### Revisi saat implementasi

- **Logo maskapai: hanya 2 dari 8.** Emirates dan Turkish Airlines tersedia berlisensi bebas di Wikimedia Commons. Garuda, Saudia, Lion Air, Qatar, Etihad, dan Oman Air tidak ada di sana karena logonya masih berhak cipta — menyalinnya dari situs maskapai bukan pilihan. `components/AirlineLogo.tsx` menampilkan logo bila tersedia, teks bila tidak.
- **Foto dari Wikimedia Commons, bukan Unsplash.** `source.unsplash.com` sudah mati dan mengunduh foto spesifik butuh ID yang harus ditebak. Dua foto dipakai, keduanya wajib atribusi dan kreditnya ditampilkan tepat di bawah fotonya (`components/Foto.tsx`, data di `content/photos.ts`):
  - Masjidil Haram — *Masjid al Haram Exterior* oleh King Eliot, CC BY-SA 4.0
  - Masjid Nabawi — *Al-Masjid an Nabawi* oleh Meshari Alawfi, CC BY 4.0
- **Hero tetap tanpa foto.** Kolom kanan hero memakai grafik penanda meter buatan sendiri — motif visual yang memang diminta Bagian 14 spec, dan menjelaskan produk dalam sekali lihat.

### Aset logo

Klien mengirim dua berkas; keduanya berlatar opak, jadi diproses lebih dulu (sharp, flood-fill dari tepi):

| Berkas sumber | Hasil | Dipakai di |
|---|---|---|
| `logo.png` (lambang, latar krem) | `app/icon.png` apa adanya | Favicon — latar terang justru aman di tab browser |
| `logo_vertical.png` (lockup, latar near-black) | `public/logo-mark.png` (lambang, transparan) | Header |
| `logo_vertical.png` | `public/logo-lockup.png` (lockup penuh, transparan) | Footer |

Versi terang tidak bisa dipakai di canvas gelap: setelah latarnya dihapus, rata-rata warna opaknya RGB(96,93,60) — praktis lenyap di `#0C1210`.

## 3. Domain model

Menggantikan Bagian 22 spec.

- `Package` (identitas, hotel, itinerary, fasilitas, syarat) **terpisah** dari `Departure` (tanggal, kota berangkat, maskapai, seats, harga override opsional).
- Harga per okupansi: `{ quad, triple, double }`. Card tampil "mulai Rp 27,5 jt (quad)"; detail tampil tabel 3 baris. Filter rentang harga memakai nilai quad.
- `status` **diturunkan** dari seats — `0` -> `sold-out`, `<=5` -> `limited`, selebihnya `available`. Bukan field yang diketik manual (mencegah kontradiksi).
- `HajiPackage` = tipe terpisah: `waitingYears`, `estimatedDepartureYear`, `quotaNote`, `priceUSD`, `dpUSD`, `installmentNote`. **Tanpa** "sisa seat" dan tanpa tanggal keberangkatan pasti.
- **Badal dihapus** dari model paket. Jadi satu blok di FAQ + satu CTA WA berkonteks badal.
- Hotel: `distanceMeters`, `landmark`, `route: "direct" | "underground" | "crossing"`, `stepFree: boolean`, `walkMinutes`.
  - `walkMinutes` dihitung pada **kecepatan lansia ~50 m/menit**, dilabeli "±4 menit jalan santai". Melebihkan ke arah lambat adalah satu-satunya arah kesalahan yang tidak merugikan pengguna.

### Konten demo
~16-20 paket. Status tersebar: beberapa sold-out, beberapa limited (2-5 seat). Harga 25-60 jt. Wajib ada paket hotel jauh & murah, supaya badge jarak yang netral punya alasan. Itinerary ditulis penuh untuk 4-5 paket unggulan; sisanya template per durasi (9/12/14 hari).

## 4. Halaman (7 + detail dinamis)

Home · Paket Umroh · Detail Paket · Haji Khusus · Jadwal Keberangkatan · FAQ · Tentang · Kontak

- **Dicoret:** halaman Testimoni & Galeri (tanpa foto asli, halaman ini justru bagian paling terlihat palsu). Ganti: 3 testimoni berlabel demo di Home.
- **Ditunda ke v2:** comparison panel. Gantinya card katalog dibuat padat informasi — jarak, bintang, maskapai, seats, harga quad terlihat tanpa buka detail.
- Detail: `/paket-umroh/{slug}` kanonik. Selector tanggal `?d=YYYY-MM-DD` mengubah harga, seats, maskapai, dan isi pesan WA. **Tidak ada** halaman per keberangkatan (hindari duplicate content).
- Filter & sort disimpan di URL query, di-`replaceState` saat berubah. Tanpa library state.
- Jadwal Keberangkatan = list dikelompokkan per bulan dari `Departure[]` yang sama. **Bukan** grid kalender.

## 5. WhatsApp

Nomor: `6285156589720` (Kalsara).

- CTA paket: pesan kontekstual paket (nama + tanggal), ditutup baris otomatis:
  `— Pesan ini dikirim dari situs demo Hasta Travel (Kalsara Digital Studio)`
- CTA penjualan terpisah di footer + banner demo: "Saya ingin website seperti ini".
- Link `wa.me` dibedakan per lokasi CTA untuk analitik dasar.

## 6. Trust section

Tombol verifikasi menuju portal Kemenag asli, disertai baris jujur:

> Situs demo — nomor izin ini sengaja tidak valid. Pada situs klien, tombol ini membuka data izin yang sebenarnya.

Ditambah: alamat kantor (fiktif) + peta, rekening demo + peringatan anti-penitipan, blok edukatif "cara memastikan situs ini bukan tiruan".

**Terjawab:** portal verifikasi resmi = `https://simpu.kemenag.go.id` (SISKOPATUH). Alternatif resmi lain: aplikasi Pusaka dan aplikasi Siskopatuh. Konstanta hidup sebagai `URL_SIMPU` di `components/TrustSection.tsx`.

## 7. Aturan visual (biner, bisa diverifikasi)

Menggantikan "tidak terlihat seperti template AI" yang tidak terukur di Bagian 33.

- Tipografi: **Fraunces** (h1/h2 + angka besar: harga, jarak) + **Plus Jakarta Sans** (sisanya). Dua keluarga font, tidak lebih. Inter dicoret — itu sidik jari situs hasil AI.
- Nol `linear-gradient` di seluruh proyek.
- Nol `backdrop-blur`.
- Maksimum 2 tingkat shadow (`sm` card, `md` drawer/sticky). Tidak ada shadow berwarna.
- Radius satu nilai: `10px`, di semua komponen.
- Hero **tanpa foto full-bleed**. Layout tipografi + satu foto ter-crop di sisi.
- Ikon dari satu set: Lucide, stroke seragam.
- Nol emoji di UI.
- Animasi hanya fade/translate <=200ms; semuanya mati saat `prefers-reduced-motion`.
- Aksen terracotta maksimum 3 kemunculan per layar.

Melanggar salah satunya boleh, tapi harus disebutkan alasannya — tidak diam-diam.

### Revisi arah visual — "Malam Gurun"

Arah lama (warm sand + Fraunces + terakota) dibatalkan: hasilnya nyaris identik dengan demo Kopi Renjana milik studio yang sama. Penggantinya:

- **Canvas gelap untuk seluruh situs.** `background` `#0C1210`, `surface` `#151C19`, teks bone `#F2EFE8`, garis `#24302B`.
- **Amber `#F0A62B` satu-satunya warna panas.** Dipakai untuk tombol utama, angka pada penanda meter, dan status "sisa terbatas". Sold out memakai `#FF8A6B`. Aturan lama "aksen maksimum 3 per layar" gugur — amber kini warna aksi, bukan hiasan.
- **Tipografi: Instrument Serif (display, termasuk italic untuk penekanan) + Manrope (body).** Fraunces dan Plus Jakarta Sans dicoret.
- **Hero memakai foto.** Aturan lama "hero tanpa foto full-bleed" dibatalkan atas permintaan klien. Keterbacaan dijaga lapisan rata `rgba(12,18,16,0.62)` — bukan gradient.
  - Catatan teknis: modifier opasitas Tailwind di atas token warna `oklab` (`bg-background/62`) bisa berakhir opak di sebagian mesin render. Lapisan hero memakai `rgba()` eksplisit lewat `style`.
- **Kartu paket hanya menampilkan sorotan**: jarak hotel Makkah, nama hotel, tanggal terdekat, ketersediaan, harga quad, lalu tombol "Detail paket". Hotel Madinah, maskapai, dan jumlah tanggal lain pindah ke halaman detail.
- **Homepage dipangkas**: tiga testimoni jadi satu kutipan, blok trust penuh jadi satu strip, dan band foto terpisah dihapus karena fotonya kini ada di hero.
- **Susunan homepage final**: hero berfoto → strip izin → tiga kartu paket → blok "Tentang kami" (foto Abraj Al Bait + dua paragraf + tautan ke `/tentang`) → satu kutipan testimoni → tiga FAQ → CTA akhir.
  - Section "Tiga hotel yang sama-sama disebut dekat masjid" dihapus dari homepage. Grafik penanda meter pindah ke halaman Tentang sebagai `components/PenandaMeter.tsx`, dengan caption yang menjelaskan maksudnya.
  - Foto ketiga: *Abraj Al Bait Mecca* oleh Ahmadrizo, CC BY-SA 4.0, Wikimedia Commons.

## 8. Format

- Harga: `Rp 27.500.000` di detail, `Rp 27,5 jt` di card.
- Tanggal: `12 Maret 2026`. Tanpa nama hari.
- Hijriah: hanya di nama paket ("Umroh Ramadhan 1447 H"). **Tidak pernah** sebagai tanggal.

## 9. Stack

Next.js 15 App Router + TypeScript + Tailwind v4. Semua halaman SSG. Deploy **Vercel**, bukan `output: 'export'` — alasan tunggal: `next/image` menangani responsive images tanpa pipeline gambar manual. Situs ini berat gambar.

## 10. Urutan build & titik review

1. Data model + format helper + satu `PackageCard` -> **REVIEW**
2. Katalog + filter berbasis URL
3. Halaman detail paket -> **REVIEW**
4. Haji Khusus, Jadwal Keberangkatan, FAQ, Tentang, Kontak
5. Home **terakhir** — home adalah ringkasan dari katalog & detail; menulisnya duluan menghasilkan copy kosong.
