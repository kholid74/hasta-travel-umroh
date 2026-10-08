# Codex Task — Audit & Implementasi Modul HPP / Package Costing Umroh

## Context

Project ini merupakan platform pengelolaan Travel Umroh milik Kalsara Digital Studio, yang dikembangkan sebagai reusable core product untuk berbagai travel penyelenggara.

Ada kebutuhan nyata dari calon klien untuk menghitung HPP paket Umroh, mulai dari komponen biaya operasional, biaya per grup keberangkatan, hingga harga jual dan margin keuntungan.

**Objective:** Audit implementasi existing terlebih dahulu, kemudian lengkapi modul HPP / Package Costing jika belum tersedia atau belum memenuhi kebutuhan bisnis.

## Phase 1 — Codebase Discovery & Audit

Sebelum melakukan perubahan:

1. Pelajari struktur repository, framework, database, routing, UI components, dan pola state management.
2. Identifikasi entity/model yang sudah tersedia:
   - Package / Paket Umroh
   - Departure / Keberangkatan
   - Jamaah / Passenger
   - Booking / Registration
   - Payment / Installment
   - Financial / Expense / Costing
3. Cari apakah sudah tersedia fitur:
   - HPP / Harga Pokok Penjualan
   - Cost breakdown
   - Package pricing
   - Margin calculation
   - Profit estimation
   - Actual expense tracking
4. Periksa apakah fitur existing sudah memiliki UI yang benar-benar bisa digunakan, bukan sekadar mockup.
5. Identifikasi data source: database, API, mock data, localStorage, atau static fixtures.
6. Periksa apakah modul HPP sebaiknya terhubung ke Package, Departure, atau keduanya.

**Jangan membuat modul duplikat jika fitur serupa sudah tersedia.**

Buat ringkasan hasil audit berisi:

- Existing functionality
- Missing functionality
- Reusable components
- Data dependencies
- Proposed implementation approach

## Phase 2 — Business Domain Design

Gunakan struktur domain:

**Package → Departure → Costing → Pricing → Profitability**

Satu paket Umroh dapat memiliki beberapa jadwal keberangkatan dengan HPP berbeda.

Contoh:

Paket Umroh Reguler 12 Hari

- Keberangkatan Januari
- Keberangkatan Februari
- Keberangkatan Ramadan

Masing-masing keberangkatan dapat memiliki harga tiket, hotel, jumlah jamaah, dan margin berbeda.

Pastikan sistem mendukung perhitungan HPP di tingkat departure, dengan template biaya yang dapat digunakan ulang dari package.

## Phase 3 — Cost Components

Buat pengelolaan komponen biaya yang fleksibel dan dapat dikonfigurasi.

Kategori awal:

1. Tiket pesawat
2. Hotel Makkah
3. Hotel Madinah
4. Visa dan administrasi
5. Transportasi
6. Konsumsi / catering
7. Handling dan ground service
8. Tour leader / muthawif
9. Perlengkapan jamaah
10. Asuransi
11. Manasik
12. Biaya operasional
13. Biaya lain-lain

Setiap komponen biaya memiliki:

- Nama biaya
- Kategori
- Tipe biaya
- Kuantitas
- Satuan
- Harga satuan
- Mata uang
- Nilai kurs jika relevan
- Total biaya
- Keterangan

Dukung tiga jenis perhitungan:

- **Per jamaah:** biaya mengikuti jumlah jamaah yang dikenakan biaya.
- **Per grup:** biaya tetap untuk satu keberangkatan.
- **Per unit:** biaya berdasarkan jumlah unit, misalnya kamar hotel, bus, atau kendaraan.

Hindari asumsi bahwa semua biaya dapat dihitung hanya dengan membagi total biaya grup terhadap jumlah jamaah.

## Phase 4 — HPP Calculation Engine

Implementasikan calculation engine yang menghasilkan:

**A. Total biaya keberangkatan**

Total seluruh komponen biaya setelah memperhitungkan kuantitas, kurs, dan satuan.

**B. HPP per jamaah**

Total biaya keberangkatan dibagi jumlah jamaah yang menjadi dasar perhitungan.

**C. Harga jual paket**

Harga jual per jamaah yang dapat ditentukan admin.

**D. Estimasi revenue**

Harga jual dikalikan jumlah jamaah berbayar, dengan memperhitungkan diskon atau penyesuaian jika tersedia.

**E. Estimasi laba kotor**

Estimasi revenue dikurangi total biaya yang relevan.

**F. Margin laba kotor**

Laba kotor dibagi revenue dikalikan 100%.

**G. Markup**

Selisih harga jual dan HPP dibagi HPP dikalikan 100%.

Bedakan margin dan markup secara eksplisit.

Gunakan decimal-safe monetary calculations. Jangan menggunakan floating-point biasa untuk menyimpan atau menghitung nilai uang.

## Phase 5 — Scenario Simulation

Admin harus bisa melakukan simulasi sebelum menetapkan harga paket.

Contoh:

- 20 jamaah
- 25 jamaah
- 30 jamaah
- 35 jamaah
- 40 jamaah

Untuk setiap skenario tampilkan:

- Total biaya
- HPP per jamaah
- Harga jual
- Estimasi revenue
- Estimasi laba kotor
- Margin keuntungan
- Break-even point jika dapat dihitung secara valid

Jumlah jamaah dalam simulasi tidak boleh otomatis mengubah data jamaah aktual.

Dukung penyimpanan skenario sebagai draft apabila arsitektur existing memungkinkan.

## Phase 6 — UI/UX Implementation

Ikuti design system existing Kalsara Travel.

Jangan membuat UI yang berbeda secara visual dari dashboard lainnya.

Tambahkan menu atau sub-menu **HPP & Kalkulasi Paket** di lokasi navigasi yang paling relevan.

Halaman utama:

### 1. Costing Overview

Tampilkan:

- Paket
- Keberangkatan
- Jumlah jamaah rencana
- Total biaya
- HPP per jamaah
- Harga jual
- Estimasi margin
- Status costing

### 2. Costing Detail

Tampilkan breakdown biaya dalam tabel editable.

Admin dapat:

- Tambah komponen biaya
- Edit komponen biaya
- Hapus komponen biaya
- Kelompokkan biaya berdasarkan kategori
- Mengubah jumlah jamaah rencana
- Melihat kalkulasi otomatis
- Menyimpan draft
- Finalisasi costing

### 3. Pricing Simulation

Buat interface simulasi jumlah jamaah, harga jual, dan margin.

Perubahan input harus langsung memperbarui kalkulasi tanpa reload halaman.

### 4. Costing Summary

Tampilkan ringkasan:

- Total biaya
- HPP per jamaah
- Harga jual
- Revenue
- Gross profit
- Gross margin

Gunakan format Rupiah Indonesia dan visual hierarchy yang jelas.

## Phase 7 — Important Business Rules

1. HPP setiap departure dapat berbeda walaupun menggunakan package yang sama.
2. Costing draft tidak boleh otomatis mengubah harga jual paket publik.
3. Perubahan costing setelah finalisasi harus dapat dilacak atau dibuat sebagai revisi.
4. Pembagian biaya harus menggunakan jumlah jamaah yang tepat, bukan selalu total peserta termasuk pendamping gratis.
5. Biaya untuk tour leader, complimentary passenger, atau FOC tetap diperhitungkan.
6. Mendukung biaya dalam IDR, SAR, dan USD jika relevan, dengan kurs yang disimpan pada costing.
7. Validasi pembagi nol, input negatif, kurs tidak valid, dan data tidak lengkap.
8. Jangan menyamakan laba kotor dengan laba bersih.
9. Tidak boleh merusak flow Package, Departure, Registration, atau Payment yang sudah tersedia.
10. Jangan hardcode komponen biaya ke calculation engine; kategori biaya harus extensible.

## Phase 8 — Demo Readiness

Project ini digunakan sebagai interactive showcase untuk calon klien.

Pastikan:

- Seluruh tombol utama dapat digunakan.
- Form add/edit/delete berfungsi.
- Kalkulasi otomatis berjalan.
- Tersedia minimal tiga contoh paket atau departure dengan karakteristik HPP berbeda.
- Ada contoh skenario profit dan loss.
- Demo tidak bergantung pada integrasi pembayaran atau API pihak ketiga yang belum tersedia.
- Data demo dapat di-reset atau di-seed ulang.
- Tidak menggunakan data pribadi jamaah asli.

Ikuti arsitektur existing:

- Jika modul lain menggunakan mock data, ikuti pola mock data.
- Jika menggunakan database/API, integrasikan sesuai pola existing.
- Jangan membuat backend baru hanya untuk kebutuhan showcase tanpa alasan teknis yang jelas.
- Jangan menyatakan fitur sudah persisted jika hanya disimpan sementara di browser.

## Phase 9 — Testing & Verification

Tambahkan test untuk:

- Per-jamaah cost calculation
- Fixed group cost allocation
- Unit-based cost calculation
- Mixed cost components
- Currency conversion
- Zero participants
- Revenue calculation
- Gross profit calculation
- Margin vs markup
- Scenario simulation
- Free-of-charge passenger cost allocation
- Costing revision behavior

Jalankan build, lint, dan test yang tersedia di repository.

Pastikan tidak ada regresi pada fitur existing.

## Deliverables

Setelah selesai, laporkan:

1. Hasil audit fitur HPP existing.
2. Gap yang ditemukan.
3. Perubahan yang diimplementasikan.
4. File yang dibuat atau diubah.
5. Struktur data yang digunakan.
6. Formula perhitungan.
7. Cara mengakses modul HPP di dashboard.
8. Cara mencoba fitur dengan data demo.
9. Hasil build dan test.
10. Limitasi yang masih ada dan rekomendasi pengembangan selanjutnya.

## Execution Rules

- Audit first, implement second.
- Reuse existing architecture and components.
- Prioritize clean, maintainable, reusable code.
- Do not introduce unnecessary dependencies.
- Preserve existing UI and user flows.
- If a major architectural decision is required, document the trade-offs before proceeding.
- Implement a complete, functional vertical slice rather than disconnected mockup screens.
