# Checkpoint untuk Agent Berikutnya — Hasta Travel V2

Dokumen serah-terima. Baca seluruhnya sebelum mengubah kode. Isinya diverifikasi per **2026-11-09**,
branch `feature/hasta-finance-inventory`.

---

## 1. Ringkasan proyek

- **Apa ini:** situs showcase milik **Kalsara Digital Studio** untuk travel Umrah/Haji fiktif bernama
  **Hasta Travel**. Isinya ada tiga bagian:
  1. Situs publik (katalog Umrah, detail paket, Haji Khusus, jadwal, FAQ, Tentang, Kontak).
  2. Workspace admin demo di `/admin`, dengan gateway peran dan modul keuangan, inventaris, HPP dan PDF invoice/kwitansi.
  3. Kerangka portal jamaah di `/portal`.
- **Semua data fiktif:**
  - Nomor izin `DEMO-000 TAHUN 2026`, rekening `0000…`, alamat `Jl. Contoh Raya No. 00`.
  - Nomor WhatsApp adalah **nomor asli Kalsara** (`content/company.ts`) dan tidak boleh diganti dengan nomor karangan.
- **Stack:** Next.js **16.3.4** (App Router, Turbopack), React 19, Tailwind CSS v4 (`@theme` di `app/globals.css`),
  lucide-react, pdf-lib, Playwright. Tidak ada backend; state workspace disimpan di localStorage (DemoStore).
- **Aturan wajib dari `AGENTS.md`:** versi Next ini punya breaking changes. Baca panduan di
  `node_modules/next/dist/docs/` sebelum menulis kode Next. Cache Components **tidak** aktif, jadi
  `export const revalidate = 3600` (ISR) dipakai di halaman publik.

## 2. Status milestone

| Milestone | Status | Laporan |
|---|---|---|
| M1.1, M1.2, M1.2B, M2 (workspace, keuangan, inventaris, HPP, invoice) | Selesai (commit sebelumnya) | `docs/M1_*`, `docs/M2_REPORT.md`, `docs/HPP_COSTING.md` |
| M3.0 / M3.0-B: audit arsitektur dan audit situs publik | Selesai | `docs/HASTA_V2_*.md` |
| M3.1 / M3.1-R: gateway peran demo, akses, UX read-only, migrasi storage v3 | Selesai | `docs/M3_1_IMPLEMENTATION_REPORT.md`, `docs/M3_1_R_REPORT.md` |
| PUBLIC-01: menu mobile, audiens WhatsApp, aturan tanggal Jakarta, 404 | Selesai | `docs/PUBLIC_01_IMPLEMENTATION_REPORT.md` |
| PUBLIC-02A / 02A-R: design system "Sacred Journey", homepage | Selesai | `docs/PUBLIC_02A_REPORT.md`, `docs/PUBLIC_02A_R_REPORT.md` |
| PUBLIC-02B: semua halaman publik + sticky action | Selesai | `docs/PUBLIC_02B_REPORT.md` |
| PUBLIC-02C: polish final, load-more mobile, About operator, hierarki disclosure | Selesai | `docs/PUBLIC_02C_REPORT.md` (berisi **checklist Public Website V2**) |
| **M3.2 Agent Career Foundation** | **Selesai** · 95/95 test · schema v4 | `docs/M3_2_REPORT.md` |
| **M3.3 Komisi & Payout** | **Belum dimulai**, berikutnya di roadmap workspace | `docs/HASTA_V2_ROADMAP.md` §M3.3 |
| **PUBLIC-03** (pendaftaran/booking terhubung) | **Belum dimulai** | daftar di `docs/PUBLIC_02C_REPORT.md` §10 |

Urutan roadmap workspace: M3.3 → M4.1 → M4.2 → M5.1 → M5.2 → M6. Ada keputusan klien yang masih
terbuka (D4–D17) di `docs/HASTA_V2_ROADMAP.md` bagian "Decisions required". Jangan memutuskannya sendiri.

## 3. Cara menjalankan dan menguji

```bash
npm run lint
npm run typecheck        # next typegen && tsc --noEmit
npm run build
node lib/katalog.check.ts && node lib/format.check.ts && node lib/departures.check.ts
```

Playwright (`npm run test:admin` menjalankan **seluruh** suite, 95 test):

```bash
# Port 3000 biasanya dipakai dev server milik user. Jangan dimatikan.
# Uji terhadap build produksi di port lain:
ADMIN_SESSION_SECRET=playwright-only-hasta-demo-session-secret-0001 npx next start -p 3100   # background
PLAYWRIGHT_BASE_URL=http://localhost:3100 ADMIN_SESSION_SECRET=playwright-only-hasta-demo-session-secret-0001 npm run test:admin
```

- Secret di atas **khusus test** (juga ada di `playwright.config.ts`). Jangan dipakai untuk hal lain.
- `next dev` menolak server kedua selama dev server user berjalan, jadi gunakan `next build` + `next start -p 3100`.
- **Setelah selesai, matikan hanya proses kamu sendiri.** Di Windows/PowerShell, cek dulu bahwa command line-nya
  berisi `start -p 3100`, baru `Stop-Process`.
- Hasil terakhir:
  - Full suite **95/95** (termasuk M3.2 spec 9/9).
  - Spec publik (`home`, `public`, `public_02b`, `public_02c`) **135/135** dalam 3 repeat.
  - `git status docs/samples` bersih. Sampel PDF tidak boleh berubah kecuali memang disengaja.
- `UPDATE_SAMPLES=1` memperbarui `docs/samples` (lihat `tests/helpers/artifacts.ts`). Jangan dipakai tanpa alasan.

## 4. Peta kode penting

### Situs publik

| Area | File |
|---|---|
| Layout publik (Header, Footer, sticky bar, `viewport-fit=cover`) | `app/(public)/layout.tsx` |
| Homepage | `app/(public)/page.tsx` + `components/home/*` (HomeHero, TrustStrip, QuickFinder, FeaturedDepartures, HajiIntro, Commitments, JourneySteps, HotelDistances, FaqPreview, ClosingCta, Motif) |
| Komponen bersama halaman publik | `components/public/ui.tsx`: `PageIntro`, `JudulBagian`, `PenutupKonsultasi`, `CatatanDemo`, `KreditFoto`, `LABEL_TIPE`, `labelKursi`/`StatusKursi`, `fotoPaket`, `tagLayanan`, `PenggarisJarak`, `tanggalPendek` |
| Kartu paket | `components/PackageCard.tsx`: `varian="foto"` (homepage) dan `varian="katalog"` (tanpa foto) |
| Katalog | `app/(public)/paket-umroh/page.tsx`, `components/KatalogClient.tsx` (filter di URL, load-more 9 di bawah 640 px) |
| Detail paket | `app/(public)/paket-umroh/[slug]/page.tsx`, `components/DetailClient.tsx` (`DetailProvider` + PilihKeberangkatan, HargaKamar, RingkasanPilihan, StickyDetail, PenutupDetail) |
| Haji | `app/(public)/haji-khusus/page.tsx`, data `content/haji.ts` (termasuk `faqHaji`) |
| Jadwal | `app/(public)/jadwal-keberangkatan/page.tsx`, `components/JadwalClient.tsx` |
| FAQ / Tentang / Kontak | `app/(public)/{faq,tentang,kontak}/page.tsx` |
| Sticky action mobile | `components/StickyBar.tsx` (shell), `components/MobileConsultBar.tsx` (umum), `StickyDetail` (detail) |
| Navigasi | `components/SiteNav.tsx` (`PUBLIC_NAV`, menu `<dialog>`), `components/Header.tsx`, `components/Footer.tsx` (panel demo `data-area="demo-showcase"`) |
| 404 | `app/not-found.tsx`, `app/(public)/not-found.tsx`, `components/NotFoundContent.tsx` |

### Logika dan data (ubah dengan hati-hati)

| Area | File |
|---|---|
| Tanggal bisnis Jakarta | `lib/departures.ts` (`businessToday`, `openDepartures`, `isOpenForRegistration`, `unavailableReason`), `components/useBusinessToday.ts` |
| Katalog/filter | `lib/katalog.ts` (`saring`, `filterDariQuery`/`queryDariFilter`, `toRow`; `KatalogRow.tags` opsional) |
| Format dan harga | `lib/format.ts` (`hargaKeberangkatan`, `statusKeberangkatan`, `LABEL_STATUS`; sold-out = "Penuh") |
| WhatsApp | `lib/whatsapp.ts` (`pesanWa`, `linkWa`, `audienceOf`; konteks: umum, paket, haji, badal, lainnya, studio) |
| Data paket | `content/packages.ts`, `content/hotels.ts`, `content/itinerary.ts`, `content/faq.ts`, `content/requirements.ts`, `content/company.ts` (`DEMO_NOTICE`) |
| Foto berlisensi | `content/photos.ts` + `public/foto/*`; metadata lisensi di `docs/public_02a_r/asset-metadata.json` |
| Workspace / gateway | `app/admin/*`, `components/admin/*` (`Store.tsx` = DemoStore), `content/admin/roles.ts`, `lib/admin/access.ts`, `lib/admin/migrations.ts`, `lib/admin/session-token.ts` |
| **Agen & Karier (M3.2)** | `content/admin/career.ts` (types, algorithms, DEFAULT_CAREER_LEVELS), `components/admin/AgentManagement.tsx` (admin UI), `components/portal/PortalScreen.tsx` (portal agen) |

### Tes

`tests/*.spec.ts`:

- Admin/keuangan: `admin`, `costing`, `invoice_layout`, `m1_*`, `m2`, `payment_history`, `m3_1_gateway`, `m3_2_agents`.
- Publik: `public`, `home`, `public_02b`, `public_02c`.

Helper ada di `tests/helpers/`.

## 5. Aturan bisnis yang tidak boleh dilanggar

1. **Tanggal keberangkatan:**
   - Hanya tanggal **setelah hari ini (Asia/Jakarta)** yang ditawarkan. Hari keberangkatan itu sendiri sudah tutup.
   - Dicek di server (ISR) **dan** di browser setelah hydration.
   - Tautan `?d=` yang lama atau tidak dikenal dijelaskan ke pengunjung, tidak dialihkan diam-diam.
2. **Harga:**
   - Harga per keberangkatan memakai `hargaKeberangkatan` (override per tanggal).
   - Status kursi selalu diturunkan dari `seatsAvailable`. Tanggal penuh **tetap ditampilkan**.
3. **Dua audiens WhatsApp:**
   - `data-wa-audience="operator"`: pesan diawali "Assalamu'alaikum" dan selalu diakhiri baris demo
     (kontak demonstrasi Kalsara).
   - `studio`: hanya satu tautan, di panel demo footer.
   - Jangan pernah mengarahkan pertanyaan jamaah ke penjualan studio.
4. **Haji:**
   - Haji Khusus adalah antrean (nomor porsi), bukan tanggal. Masa tunggu selalu bertanda `*` dan
     dikualifikasi sebagai perkiraan.
   - Haji Mujamalah adalah jalur terpisah, tanpa janji visa.
5. **Klaim:**
   - Tidak ada testimoni, statistik, sertifikasi, sejarah perusahaan, tim, atau izin yang disajikan sebagai asli.
   - Tag paket "Termurah" dan "Paling banyak dipilih" disaring dari tampilan publik (`tagLayanan`).
   - Jangan mengarang URL verifikasi izin pemerintah (`licenseCheckUrl` sengaja `null`).
6. **Hierarki disclosure:**
   - A: satu `CatatanDemo` (`data-demo-note="umum"`) per halaman.
   - B: `WaDemoNote` di dekat CTA WhatsApp, plus label "contoh fiktif" di `TrustSection`.
   - C: panel demo di footer.
7. **Gateway peran adalah demo, bukan otorisasi produksi.** Menyembunyikan tombol bukan bentuk keamanan;
   penjaga izin ada di Store/`lib/admin/access.ts`.

## 6. Design system (terkunci)

- **Arah:** "Sacred Journey — Warm Islamic Editorial". Detail lengkap di `docs/PUBLIC_02A_R_REPORT.md` §2.
- **Token di `app/globals.css`:**
  - Bingkai hijau hutan: `background #113126`, `surface #18392d`.
  - Emas redup untuk aksi: `primary #e3b35a` / `primary-hover`.
  - Warna terang: `ivory`, `paper`, `sand`, `emerald`, `gold-ink`, `champagne`, `forest`, `deep`, `control`.
- **Pita:**
  - `.band-light` (ivory) dan `.band-sand` memetakan ulang token semantik, jadi komponen tidak perlu di-fork.
  - Form hanya di ivory/paper, bukan di sand.
  - Emas hanya untuk isi tombol di permukaan terang; teks emas di permukaan terang pakai `gold-ink`.
- **Tiga motif saja:**
  - `.motif-bintang` / `.motif-bintang-gelap`: pola bintang delapan, tidak boleh di belakang teks.
  - `.bingkai-lengkung`: bingkai melengkung.
  - `<Ornamen/>`: garis emas dengan bintang.
- **Font:** Instrument Serif (display) dan Manrope (UI).
- **Jebakan CSS:** aturan global `h1,h2,h3 { font-family: display }` tidak berada di dalam layer, sehingga
  **mengalahkan utilitas Tailwind** seperti `font-sans`. Untuk judul kecil berfont sans, pakai `<p className="font-semibold">`.
- **Tanpa:** gradient, ilustrasi AI, atau foto yang diklaim sebagai foto hotel.
- **Foto baru:** harus berlisensi, disimpan lokal, didaftarkan di `content/photos.ts`, dan dikreditkan di halaman.

## 7. Konvensi kerja dan jebakan

- **Line ending campuran:** sebagian file CRLF, misalnya `app/(public)/page.tsx` dan `paket-umroh/*`. Saat
  menulis ulang file, pertahankan EOL aslinya. `sed -i` di Git Bash bisa mengubah CRLF menjadi LF, jadi cek dengan
  `file <path>`.
- **Heredoc bash** yang memuat `·`, data-URI SVG atau kutip bersarang sering gagal. Tulis skrip ke file
  sementara (Write tool), lalu jalankan dengan `node`.
- **Terminologi tampilan:** Umrah, Haji Khusus, Jamaah, Keberangkatan, Sisa kursi, Penuh, Konsultasi,
  Harga per orang, Filter.
  - Yang **tidak diubah:** route `/paket-umroh`, slug, nama paket di data ("Umroh …"), judul itinerary, dan
    baris penutup demo di pesan WA ("bukan biro perjalanan umroh/haji", yang di-assert oleh test).
  - Mengganti nama data memerlukan rencana migrasi.
- **Bukan di dalam scope publik:** admin, DemoStore, keuangan, invoice, HPP, inventaris, agen/komisi, logika
  tanggal dan harga.
- **Git:**
  - Commit dan push hanya kalau user minta.
  - User memakai email `kholidabdillah@gmail.com` untuk commit di repo ini, lewat `git -c user.email=… commit`.
    Config global tidak diubah.
  - Akhiri pesan commit dengan `Co-Authored-By` sesuai instruksi sistem.
- **File untracked milik user yang sengaja tidak di-commit:** `hasta-docs-dan-contoh-pdf.zip`,
  `hasta-m2-review.zip`, `hasta-payment-history-review.zip`, `new_feature_instruction.md`. Jangan dihapus.

## 8. Keterbatasan yang diketahui

- Katalog di ponsel menyimpan jumlah "muat lebih banyak" di state, tidak di URL.
- Kartu katalog tanpa foto; foto paket atau hotel spesifik menunggu aset dari klien.
- Nama paket dan judul itinerary masih "Umroh" (data bisnis).
- FAQ Haji dan copy Tentang hanya merangkum konten demo; operator sungguhan harus meninjaunya.
- Tabel banding Haji hanya tampil di bawah 768 px; tablet melihat dua kartu berdampingan.

## 9. Pekerjaan berikutnya (pilih sesuai instruksi user, jangan memulai sendiri)

### PUBLIC-03 (butuh data terhubung)

- Pra-registrasi/booking dari sidebar detail dan sticky bar (keberangkatan terpilih sudah tersedia di
  `DetailProvider`).
- Ketersediaan kursi dan harga live dari workspace.
- Lead ke CRM dengan persetujuan.
- Masuk portal jamaah.
- Intake pendaftaran Haji Khusus (alur porsi).
- Rencana migrasi "Umroh" → "Umrah" di data.
- Foto milik klien dan URL cek izin resmi yang sudah terverifikasi.

### Workspace

- **M3.2 Agent Career Foundation:** ✅ **Selesai** — lihat `docs/M3_2_REPORT.md`.
- **M3.3 Komisi & Payout:** berikutnya. Portal `/portal/agen/komisi` sudah ada placeholder "Segera hadir · M3.3". Lihat `docs/HASTA_V2_ROADMAP.md` §M3.3.
- Lanjut M4.1, dan seterusnya sesuai `docs/HASTA_V2_ROADMAP.md`.

## 10. Checklist cepat sebelum menyerahkan pekerjaan

- [ ] Baca laporan milestone terkait dan dokumentasi Next di `node_modules/next/dist/docs/`.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` hijau.
- [ ] `npm run test:admin` hijau terhadap build di port 3100 (bukan 3000).
- [ ] `git status docs/samples` bersih.
- [ ] Tidak ada overflow horizontal di 360, 390, 768 dan 1440 px untuk halaman publik.
- [ ] Laporan `docs/<MILESTONE>_REPORT.md` berisi hasil test yang **benar-benar dijalankan**.
- [ ] Server 3100 milik kamu sudah dimatikan; server 3000 milik user tidak disentuh.
