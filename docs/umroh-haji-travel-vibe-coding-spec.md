# UMROH & HAJI TRAVEL WEBSITE
## Vibe Coding Master Specification

> Dokumen ini adalah template/demo portofolio Kalsara Digital Studio — generik, belum terikat ke satu klien travel tertentu. Semua data bisnis (nama travel, nomor izin, harga, testimoni) di dalam dokumen ini adalah **DATA DEMO** dan wajib diganti dengan data resmi klien sebelum situs digunakan secara nyata. Jangan pernah mengklaim nomor izin, statistik jamaah, atau testimoni di sini sebagai fakta nyata.

---

## 1. Executive Summary

Website katalog paket Umroh & Haji, multipage, tanpa online payment/booking kompleks — semua konversi berakhir di WhatsApp dengan pesan yang sudah membawa konteks paket. Target: calon jamaah Indonesia yang sedang membandingkan travel, bukan yang sudah siap checkout online. Diferensiator utama bukan klaim "terbaik" atau "terpercaya" generik (semua kompetitor sudah pakai klaim itu) — melainkan **kejujuran yang bisa diverifikasi**: jarak hotel yang diukur bukan disamarkan, legalitas yang bisa langsung dicek, status paket (termasuk sold out) yang ditampilkan apa adanya.

---

## 2. Research Findings

Metodologi: pengecekan langsung ke 4 website travel Umroh/Haji Indonesia yang benar-benar aktif (bukan dari listicle SEO), ditambah pencarian berita 2026 soal kasus gagal berangkat, dan artikel lintas-sumber soal kebutuhan jamaah lansia/keluarga.

**Catatan jujur soal keterbatasan riset ini:** ini bukan riset kuantitatif berskala besar — sample kompetitor kecil (4 situs, bukan 10-20), dan tidak ada wawancara langsung dengan calon jamaah. Pola yang ditemukan bersifat indikatif dan konsisten lintas sumber, tapi bukan statistik yang presisi. Bagian mana pun di dokumen ini yang menyebut "banyak jamaah..." atau semacamnya merujuk ke pola yang teramati di sumber-sumber yang dicek, bukan angka survei.

---

## 3. Competitor Insights

**Alhijaz Indowisata** (alhijaz.id) — Model katalog klasik: tabel paket per keberangkatan lengkap dengan hotel+bintang, maskapai, tanggal, sisa seat, dan status "Sold Out" ditampilkan apa adanya. WA CTA sudah pre-filled dan berbeda pesan per konteks (Haji/Badal/Umroh/Admin). Legalitas ditampilkan berat: nomor izin PPIU/PIHK, link cek SISKOPATUH Kemenag, rekening resmi dengan peringatan anti-penitipan-ke-agen. Juga menjual lewat jaringan agen/reseller individual dengan link WA masing-masing.

**ESQ Tours** (esqtours.com) — Pendekatan brand/narrative, bukan katalog: nyaris tidak menampilkan harga di homepage, jual "makna perjalanan" lewat framing training ESQ 165. Ada halaman kampanye per bulan/tema (`/umroh-ramadhan/`, `/umroh-akbar/`), tim leadership dengan foto, partner logo, artikel reguler. Paling penting: memasang **banner peringatan penipuan** di homepage — bukti nyata bahwa nama besar mereka sering dipalsukan oknum.

**Shafira Tours** — Situs solid secara keseluruhan (harga, testimoni, galeri, blog lengkap) tapi halaman detail paket 404 — bukti bahwa "terlihat matang" tidak berarti fondasi teknisnya benar.

**Cheria Travel/Holiday** — Contoh nyata "website jelek tapi funnel jalan": platform Blogspot, tersebar di banyak domain (cheriatravel.com, cheriatravel.id, cheria-travel.com, cheria-bogor.com), halaman dari 2018–2020 masih ter-index bercampur dengan konten baru. Model bisnisnya dibangun dari blog/SEO bertahun-tahun, positioning lebih luas dari umroh murni (wisata halal internasional).

**Pola yang sudah jadi table-stakes (jangan dianggap diferensiator):** badge "5 Pasti Umroh" Kemenag, nomor izin PPIU/PIHK sebagai teks, WA pre-filled, testimoni berfoto. Hampir semua kompetitor aktif sudah punya ini — meniru pola ini saja tidak akan membuat situs terlihat berbeda.

---

## 4. Customer Personas

Delapan persona di bawah ini mengikuti struktur brief awal. Yang bertanda **(riset)** punya dasar dari sumber yang dicek; yang bertanda **(asumsi wajar)** adalah asumsi berbasis pengetahuan umum industri travel, bukan temuan riset spesifik — perlu divalidasi ulang kalau dipakai untuk keputusan produk yang lebih besar dari sekadar template demo.

- **A — Calon jamaah pertama kali:** butuh penjelasan istilah dasar (miqat, ihram, thawaf, sa'i) tanpa terasa menggurui. *(asumsi wajar)*
- **B — Sudah pernah umroh:** lebih fokus ke perbandingan fasilitas dan harga, kurang butuh edukasi dasar. *(asumsi wajar)*
- **C — Keluarga yang ingin umroh bersama:** butuh info jadwal yang cocok dengan libur sekolah/kerja, kejelasan kamar sekeluarga. *(asumsi wajar)*
- **D — Orang tua/jamaah lansia:** jarak hotel ke masjid adalah faktor #1, bukan sekadar preferensi — sumber yang dicek menyebut perbedaan 200m vs 500m bisa berarti kelewat waktu shalat karena stamina terbatas. Butuh info akses lift/ramp/kursi roda. **(riset)**
- **E — Anak yang mencarikan paket untuk orang tua:** butuh kepastian jarak hotel yang **terukur, bukan klaim samar** ("hotel setaraf", "dekat masjid") — beberapa travel yang dicek eksplisit menyoroti kompetitor lain menyamarkan jarak sebenarnya. **(riset)**
- **F — Calon jamaah Haji Khusus/Plus:** fokus ke masa tunggu dan skema pembiayaan/angsuran, bukan tanggal keberangkatan cepat seperti umroh. *(asumsi wajar, didukung pola umum di semua kompetitor yang selalu memisahkan halaman Haji Khusus)*
- **G — Sensitif harga:** rawan tergoda "harga murah tak wajar" — pola ini berulang di kasus penipuan nyata yang dicek: korban sering tergiur harga jauh di bawah wajar tanpa mengecek legalitas dulu. **(riset)**
- **H — Mementingkan kenyamanan/hotel/layanan:** lebih peduli bintang hotel dan servis daripada harga termurah. *(asumsi wajar)*

**Pain point lintas-persona yang paling kuat buktinya:** ketakutan gagal berangkat/tertipu itu **nyata dan berulang**, bukan kecemasan berlebihan — berita 2026 yang dicek menunjukkan kasus seperti 95 dari 124 jamaah gagal berangkat karena kendala sistem, dan puluhan jamaah tertipu travel tak berizin di daerah lain. Ini alasan kenapa Bagian 9 (Trust Architecture) diperlakukan sebagai fitur inti, bukan pelengkap.

---

## 5. Customer Journey

```
DISCOVERY → LANDING → EXPLORE PACKAGES → FILTER → PACKAGE DETAIL
→ TRUST VALIDATION → QUESTIONS → WHATSAPP → KONSULTASI → BOOKING OFFLINE
```

| Tahap | Kebutuhan Info | CTA | Trust Signal |
|---|---|---|---|
| Landing | Positioning jelas, bukan buzzword kosong | Lihat Paket | Snapshot izin resmi |
| Explore/Filter | Bisa bandingkan cepat tanpa buka satu-satu | Filter, Bandingkan | Status ketersediaan jujur |
| Detail | Jawab "apa yang saya dapat" tanpa tanya admin | Konsultasi via WA | Jarak hotel terukur, harga include/exclude |
| Trust Validation | Bukti bisa diverifikasi, bukan sekadar klaim | Cek Legalitas | Link SISKOPATUH, alamat kantor fisik |
| WhatsApp | Pesan sudah bawa konteks paket | — | Respons cepat (target internal, bukan klaim di UI) |

Prinsip: jangan paksa semua orang ke WhatsApp di awal. Website harus dulu bikin user paham produk — baru CTA WA muncul sebagai langkah lanjut yang natural, bukan satu-satunya jalan keluar dari kebingungan.

---

## 6. UX Opportunities

- Jarak hotel ditampilkan dalam meter + estimasi menit jalan kaki + tipe akses (langsung vs muter lorong), bukan teks "dekat masjid"
- Trust section yang **actionable**: tombol/link cek SISKOPATUH langsung, bukan cuma nomor izin sebagai teks statis
- Status paket ditampilkan jujur termasuk "Sold Out" — konsisten dengan pola Alhijaz yang justru menambah kepercayaan
- Satu sumber data untuk katalog dan kalender keberangkatan (hindari duplikasi data ala halaman kampanye musiman yang bisa basi)
- Perbandingan 2-3 paket berdampingan untuk user yang bingung memilih

## 7. Competitive Gaps

- **Belum ada yang menampilkan jarak hotel secara terukur dan konsisten di semua paket** — ini gap terbesar dan jadi dasar Ultimate Feature
- Trust badge kompetitor kebanyakan klaim tanpa jalur verifikasi langsung dari situs itu sendiri
- Fragmentasi domain/konten usang (pola Cheria) — peluang diferensiasi lewat IA yang bersih dan terkontrol
- Komunikasi anti-penipuan kompetitor umumnya reaktif (banner peringatan) — belum terintegrasi jadi bagian dari pengalaman produk

---

## 8. Product Positioning

**Product Concept:** Katalog paket Umroh & Haji yang membantu calon jamaah membandingkan pilihan dengan tenang dan jelas, lalu melanjutkan konsultasi lewat WhatsApp dengan konteks yang sudah lengkap — tanpa proses booking online yang rumit.

**Positioning:** Bukan travel yang paling banyak berteriak "terpercaya", tapi travel yang menunjukkan buktinya — jarak hotel yang bisa diukur, legalitas yang bisa langsung dicek, status paket yang ditampilkan apa adanya.

**Core Differentiator:** Kejujuran yang bisa diverifikasi, bukan klaim yang bisa diulang travel manapun.

**UX Principles:**
1. Jangan paksa keputusan sebelum user paham produk
2. Setiap klaim trust harus punya jalur verifikasi, bukan cuma teks
3. Status "tidak tersedia" ditampilkan, bukan disembunyikan
4. Satu sumber data, banyak tampilan (katalog, kalender, perbandingan)
5. WA CTA selalu bawa konteks, tidak pernah generik

**Design Principles:**
1. Premium lewat kesederhanaan, bukan ornamen
2. Islamic geometry sebagai struktur, bukan dekorasi penuh
3. Foto otentik/arsitektural, hindari kesan stok foto
4. Tipografi editorial untuk kepercayaan, sans humanis untuk keterbacaan
5. Warna tenang (earthy/muted), bukan hijau-emas terang default

**Conversion Principles:**
1. WA CTA kontekstual di setiap titik keputusan, bukan cuma di footer
2. Informasi lengkap dulu, WA baru muncul sebagai langkah lanjut
3. Perbandingan memudahkan keputusan, bukan menunda-nunda
4. Trust ditunjukkan lewat detail spesifik, bukan superlative kosong

---

## 9. Information Architecture

IA dipangkas dari daftar awal 15+ halaman potensial. Halaman kampanye musiman per bulan (ala ESQ) dan blog/knowledge-center terpisah **sengaja tidak dimasukkan** di versi template ini — keduanya butuh komitmen konten jangka panjang dari klien asli (lihat risiko content-rot di temuan Cheria), bukan struktur yang bisa digeneralisasi di level template.

## 10. Sitemap

| Halaman | Tujuan | CTA Utama |
|---|---|---|
| Home | Positioning + entry katalog + trust snapshot | Lihat Paket |
| Paket Umroh | Katalog utama, filterable | Konsultasi via WA |
| Paket Haji Khusus | Katalog terpisah (harga, masa tunggu, kurs beda) | Konsultasi via WA |
| Detail Paket (dinamis) | Jawab semua pertanyaan dasar tanpa perlu tanya admin | Tanya Paket Ini |
| Jadwal Keberangkatan | View kalender dari data yang sama dengan katalog | Cek Keberangkatan |
| Tentang Kami | Profil, izin resmi + cara verifikasi, pembimbing | Profil Perusahaan |
| Testimoni & Galeri | Bukti sosial (data demo, ditandai jelas) | — |
| FAQ | Jawaban pertanyaan berulang (DP, pelunasan, pembatalan) | Tanya Lainnya via WA |
| Kontak | Alamat kantor fisik, rekening resmi, WA | Hubungi Kami |

---

## 11. Core Features

**Must Have**
- Katalog dengan filter dasar (tipe, bulan, rentang harga, durasi)
- Package card: harga, hotel+bintang, maskapai, tanggal, sisa seat, status
- **Badge Jarak & Akses Hotel** (Ultimate Feature — lihat Bagian 13)
- WA CTA kontekstual, pre-filled berbeda per tipe (Umroh/Haji/Badal/Admin)
- Trust section verifiable: link cek SISKOPATUH, alamat kantor fisik, rekening resmi + peringatan anti-penitipan
- FAQ yang jawab pertanyaan konkret (DP, pelunasan, pembatalan)

**Should Have**
- Departure calendar/list view
- Perbandingan 2-3 paket berdampingan
- Notice anti-penipuan yang edukatif ("begini cara pastikan situs ini bukan tiruan"), bukan sekadar banner pasif

**Nice to Have**
- Filter lanjutan (bintang hotel, maskapai)
- Download brosur PDF per paket
- Estimator kebutuhan keluarga sederhana

## 12. Feature Prioritization

| Fitur | Impact | Effort | Prioritas |
|---|---|---|---|
| Katalog + filter dasar | Tinggi | Sedang | Must |
| Badge Jarak & Akses Hotel | Tinggi | Rendah | Must (Ultimate) |
| WA CTA kontekstual | Tinggi | Rendah | Must |
| Trust section verifiable | Tinggi | Rendah | Must |
| FAQ | Sedang | Rendah | Must |
| Departure calendar | Sedang | Sedang | Should |
| Perbandingan paket | Sedang | Sedang | Should |
| Notice anti-penipuan edukatif | Sedang | Rendah | Should |
| Filter lanjutan | Rendah | Rendah | Nice |
| Download brosur | Rendah | Rendah | Nice |
| Family estimator | Rendah | Sedang | Nice |

---

## 13. Ultimate Feature — Badge Jarak & Akses Hotel

**Nama:** Badge Jarak & Akses (komponen: `HotelDistanceBadge`)

**Problem yang diselesaikan:** Semua kompetitor yang dicek memakai istilah "dekat Masjidil Haram" secara subjektif — beberapa sumber independen bahkan eksplisit menyoroti bahwa klaim ini disalahgunakan (jarak yang diklaim dekat ternyata butuh memutar lorong panjang). Untuk jamaah lansia, ini bukan soal kenyamanan kecil, tapi bisa berarti kelewat waktu shalat karena stamina tidak cukup untuk bolak-balik.

**Siapa yang paling butuh:** Persona D (lansia) dan E (anak yang carikan paket untuk orang tua) — tapi manfaatnya terasa untuk semua persona karena mengubah "dekat" dari klaim jadi fakta yang bisa dibandingkan.

**User flow:** User melihat badge jarak (contoh: "180m · 3 menit jalan kaki · akses langsung") langsung di package card saat browsing katalog — tidak perlu buka detail paket untuk tahu ini. Di halaman detail, badge ini diperluas dengan foto rute dan catatan aksesibilitas (lift, ramp, kursi roda).

**UX/UI concept:** Badge dengan ikon jarak + waktu jalan kaki, warna netral (bukan hijau "aman"/merah "bahaya" yang terkesan menghakimi hotel jauh — beberapa jamaah budget terbatas memang memilih hotel lebih jauh dengan sadar). Di detail paket, badge ini jadi bagian dari section Hotel, dilengkapi keterangan tipe akses (jalan langsung / lewat basement / naik-turun).

**Business impact:** Jadi alasan konkret kenapa website ini "terasa beda" saat dipakai sebagai demo portofolio — bukan fitur gimmick, tapi jawaban langsung atas klaim yang paling sering disamarkan industri.

**Trust impact:** Tinggi — kejujuran yang bisa diverifikasi (user bisa cek sendiri di Google Maps kalau ragu) lebih kuat dari sekadar badge "Terpercaya".

**Technical complexity:** Rendah. Data statis per hotel (meter, menit, tipe akses) di data model — tidak butuh API real-time atau integrasi maps kompleks untuk MVP.

**Data yang diperlukan:** `distanceMeters`, `walkMinutes`, `accessType` (`direct` / `underground` / `stairs`), opsional `photoRef` per hotel.

**Cocok untuk MVP:** Ya — ini yang membedakan MVP dari sekadar katalog generik.

---

## CATATAN — ULTIMATE FEATURE (Ide Fase Depan, Tidak Wajib di MVP)

**1. Verifikasi Legalitas Real-Time / Anti-Penipuan**
Problem: ketakutan #1 jamaah adalah gagal berangkat/tertipu (didukung berita 2026 nyata). Concept: widget yang benar-benar embed/link ke pengecekan SISKOPATUH Kemenag, plus panduan visual "cara pastikan situs ini bukan tiruan". Kenapa belum MVP: sudah tercakup sebagian sebagai Must Have (Trust Section), versi penuhnya (misalnya cek status real-time via API resmi kalau tersedia) butuh dependency ke sistem pemerintah yang di luar kendali template. Kompleksitas: sedang-tinggi kalau mau full real-time. Fase: v2.

**2. Package Match (Kuis Rekomendasi)**
Problem: user bingung pilih dari banyak paket. Concept: 3-5 pertanyaan (budget, durasi, prioritas, keberangkatan) → rekomendasi paket. Kenapa belum MVP: pola umum e-commerce, kurang spesifik ke masalah unik vertical ini dibanding Ultimate Feature terpilih. Kompleksitas: rendah-sedang. Fase: v2.

**3. Umroh Journey Timeline Interaktif**
Problem: itinerary panjang dalam bentuk tabel sulit dibayangkan calon jamaah pertama kali. Concept: visualisasi perjalanan Indonesia → Jeddah/Madinah → Makkah → pulang, sebagai timeline visual, bukan tabel. Kompleksitas: sedang (butuh ilustrasi/SVG custom). Fase: v2.

**4. Mode Ramah Lansia**
Problem: anak yang mendaftarkan orang tua (Persona E) butuh tampilan yang menonjolkan info relevan lansia (jarak hotel, akses kursi roda, pembimbing sabar) tanpa harus menyaring sendiri dari halaman detail biasa. Concept: toggle tampilan yang menyaring/menonjolkan info itu. Kompleksitas: sedang. Fase: v2/v3, tergantung validasi kebutuhan nyata dari klien.

---

## 14. Visual Direction

**Mood:** Tenang, premium, dipercaya — mendekati hospitality/editorial, bukan "biro travel tahun 2015".

**Yang dihindari secara eksplisit:** hijau terang + emas sebagai default, motif masjid/kubah sebagai background, gradient Islamic berlebihan, glassmorphism, Ka'bah sebagai background dekoratif.

**Arah yang dipakai:** Islamic geometry sebagai elemen struktural (garis divider, grid, border tipis) — bukan pola ornamental penuh bidang. Fotografi bergaya arsitektural/dokumenter otentik, bukan stok foto senyum generik. Motif visual berulang: ikon "meter marker" (jarak + waktu jalan kaki) sebagai identitas visual yang konsisten, karena ini jantung dari Ultimate Feature.

## 15. Design System

**Warna** *(nilai awal yang disarankan — sesuaikan dengan brand klien asli saat dipakai untuk proyek nyata)*

| Token | Hex (saran) | Peran |
|---|---|---|
| `primary` | `#1F3A3D` (deep teal) | Header, CTA utama, aksen tegas |
| `secondary` | `#0B2545` (navy tua) | Teks judul, elemen sekunder |
| `accent` | `#C46A3D` (terracotta) | Highlight, badge, elemen aksi kecil |
| `background` | `#FAF6EF` (warm sand) | Latar utama |
| `surface` | `#FFFFFF` | Card, panel |
| `text` | `#1C1C1A` | Body text |
| `muted` | `#8A8578` | Teks sekunder, caption |
| `success` | `#3F6B4F` | Status "Available" |
| `warning` | `#B5482A` | Status "Sold Out" / peringatan |

**Tipografi**
- Display/heading: serif editorial (mis. *Fraunces* atau *Source Serif 4*) — kesan premium, bukan techy
- Body/UI: sans humanist yang nyaman dibaca Bahasa Indonesia (mis. *Plus Jakarta Sans* atau *Inter*)
- Skala: heading besar tapi tidak bombastis; body minimal 16px untuk keterbacaan mobile

**Layout**
- Max width konten: ~1200px, dengan padding cukup lega di mobile (min 16px)
- Grid katalog: 1 kolom mobile, 2 kolom tablet, 3 kolom desktop
- Radius: sedang (8-12px), tidak pil-shape berlebihan
- Card: shadow tipis, border 1px warna `muted` opacity rendah — hindari shadow tebal bertumpuk

**Photography**
Foto arsitektural (hotel, masjid dari sudut wajar bukan dramatis berlebihan), dokumenter jamaah (bukan model stok), warna natural tidak oversaturated.

---

## 16. Content Strategy

**Bahasa:** Indonesia natural, hangat, informatif, tidak berlebihan. Hindari hard selling, klaim spiritual berlebihan, fear marketing.

**Contoh CTA:** Lihat Paket · Lihat Detail · Konsultasi via WhatsApp · Tanya Paket Ini · Cek Keberangkatan · Bandingkan Paket

**Contoh copy:**
- Homepage hero: "Paket Umroh & Haji dengan Jarak Hotel yang Bisa Anda Ukur Sendiri"
- Package card: "Umroh 12 Hari · Hotel 180m dari Masjidil Haram · Keberangkatan Jakarta"
- Trust section: "Cek langsung status izin kami di SISKOPATUH Kemenag — tidak perlu percaya kata-kata kami saja"
- FAQ intro: "Pertanyaan yang paling sering kami dapat sebelum jamaah mendaftar"

**Aturan konten wajib:** tidak ada angka jamaah, testimoni, atau statistik yang tidak berasal dari data klien asli. Semua contoh di dokumen ini adalah DATA DEMO.

---

## 17. Homepage Specification

1. **Hero** — value prop konkret (bukan "Experience the Ultimate Spiritual Journey"), CTA utama ke katalog
2. **Trust Snapshot** — izin resmi + link verifikasi, bukan wall of badge
3. **Katalog Preview** — 3-6 paket unggulan dengan badge jarak hotel terlihat
4. **Kenapa Memilih Kami** — diferensiator konkret termasuk jarak hotel terukur
5. **Testimoni** (data demo, ditandai jelas)
6. **FAQ Preview** — 3-4 pertanyaan teratas, link ke FAQ penuh
7. **CTA Akhir** — WA + link katalog

## 18. Package Listing Specification

Filter bar: tipe (Umroh Reguler/Plus/Ramadhan), bulan keberangkatan, rentang harga, durasi. Sort: harga, tanggal terdekat. Card menampilkan: nama, badge jarak hotel, hotel Makkah/Madinah + bintang, maskapai, tanggal, sisa seat, status, harga mulai, CTA WA kontekstual. Empty state: pesan jelas + saran ubah filter. Mobile: filter jadi drawer, card bisa scroll horizontal per kategori unggulan.

## 19. Package Detail Specification

Hero (nama paket, harga, status) → Ringkasan (tanggal, durasi, kota keberangkatan) → **Badge Jarak & Akses Hotel** (diperluas dengan foto rute) → Maskapai → Itinerary (timeline, bukan tabel panjang) → Harga Termasuk/Tidak Termasuk → Syarat Pendaftaran → Pembimbing/Tour Leader → Trust Section (verifikasi izin) → Testimoni terkait → FAQ relevan → WA CTA sticky di mobile.

## 20. Other Page Specifications

- **Jadwal Keberangkatan:** view kalender/list dari data yang sama dengan katalog (bukan sumber data terpisah)
- **Tentang Kami:** profil, izin PPIU/PIHK + cara verifikasi, tim pembimbing, alamat kantor fisik
- **Testimoni & Galeri:** foto/video jamaah (data demo, label jelas)
- **FAQ:** dikelompokkan per topik (pendaftaran, pembayaran, pembatalan, dokumen)
- **Kontak:** alamat, WA, rekening resmi + peringatan anti-penitipan ke pihak tidak resmi

---

## 21. Component Architecture

`Header`, `Navigation`, `Hero`, `PackageCard`, `PackageGrid`, `FilterBar`, `FilterDrawer`, `HotelDistanceBadge`, `PriceDisplay`, `ItineraryTimeline`, `TrustVerifyWidget`, `TestimonialCard`, `FAQAccordion`, `WhatsAppCTA` (context-aware, terima props tipe & nama paket), `FloatingWhatsApp`, `DepartureCalendar`, `ComparisonPanel`, `Footer`, `Breadcrumb`.

## 22. Data Model

```ts
type Hotel = {
  name: string;
  starRating: number;
  distanceMeters: number;
  walkMinutes: number;
  accessType: "direct" | "underground" | "stairs";
  photoRef?: string;
};

type Package = {
  id: string;
  slug: string;
  name: string;
  type: "umroh-reguler" | "umroh-plus" | "haji-khusus" | "badal";
  departureDate: string; // ISO date
  duration: number; // hari
  departureCity: string;
  price: number;
  currency: "IDR" | "USD";
  airline: string;
  makkahHotel: Hotel;
  madinahHotel: Hotel;
  itinerary: { day: number; title: string; description: string }[];
  facilities: string[];
  exclusions: string[];
  requirements: string[];
  tags: string[];
  featured: boolean;
  status: "available" | "limited" | "sold-out";
  seatsAvailable?: number;
};
```

Sumber data: JSON/TS statis (`content/packages.ts` atau setara) — tidak butuh database untuk MVP. Kalender keberangkatan dan katalog membaca dari struktur data yang sama.

## 23. WhatsApp Integration

Setiap CTA WA menyertakan konteks lewat pre-filled message, bukan pesan generik "Halo saya mau tanya":

- Umum: "Assalamualaikum, saya ingin tahu lebih lanjut soal paket Umroh & Haji."
- Per paket: "Assalamualaikum, saya tertarik dengan {nama paket} keberangkatan {tanggal}. Mohon informasi lengkapnya."
- Haji: "Assalamualaikum, saya ingin tanya soal paket Haji Khusus."
- Badal: "Assalamualaikum, saya ingin tanya soal Badal Umroh."

Floating WA button muncul di semua halaman (mobile: sticky bottom). Tidak perlu CRM kompleks — cukup differensiasi link `wa.me` per lokasi CTA untuk keperluan analitik dasar (lihat Bagian 30).

## 24. Responsive Behavior

**Mobile:** sticky WA CTA di bawah, filter jadi drawer, itinerary collapsible per hari, harga & status selalu terlihat tanpa scroll berlebihan.
**Tablet:** grid 2 kolom, filter bisa sidebar atau drawer tergantung lebar layar.
**Desktop:** grid 3 kolom, filter sidebar permanen, comparison panel side-by-side.

## 25. Accessibility

Target WCAG AA untuk elemen utama: kontras teks cukup, ukuran font body minimal 16px, touch target minimal 44x44px, navigasi keyboard untuk semua interaksi utama, semantic HTML (heading hierarchy benar, `alt` text deskriptif), `prefers-reduced-motion` dihormati, focus state terlihat jelas.

## 26. SEO

URL bersih per paket (`/paket-umroh/{slug}`), metadata unik per halaman, Open Graph image per paket. Structured data: `Organization` untuk info perusahaan, `BreadcrumbList` untuk navigasi. **Catatan kehati-hatian:** schema `Product`/`Offer` sebaiknya hanya dipakai kalau harga yang ditampilkan memang akurat dan terkini — kalau harga sering berubah/butuh konfirmasi WA, pertimbangkan untuk tidak memakai schema harga eksplisit agar tidak menyesatkan hasil pencarian. Keyword strategy: paket umroh, paket umroh [kota keberangkatan], umroh plus, umroh ramadhan, haji khusus — tanpa keyword stuffing di body copy.

## 27. Performance

Gambar dioptimasi & lazy-loaded, responsive images per breakpoint, static generation untuk halaman katalog/detail (Next.js dengan static export atau setara — tidak butuh server-side rendering kompleks untuk MVP), JS minimal (filter & comparison bisa client-side ringan tanpa framework state management berat).

## 28. Animation & Interaction

Subtle reveal saat scroll, hover state pada card, transisi halus untuk itinerary timeline. Hindari parallax berlebihan, animasi loading tanpa kebutuhan, dan efek scroll yang mengganggu keterbacaan di mobile.

## 29. Demo Content

Semua data contoh (nama travel, nomor izin, harga, testimoni) WAJIB diberi label **"DATA DEMO"** yang terlihat jelas di UI (misal watermark kecil di footer atau banner). Jangan pernah menulis nomor izin resmi, alamat resmi, jumlah jamaah, atau nama pembimbing yang terlihat seperti data asli — gunakan placeholder eksplisit seperti `[NOMOR IZIN PPIU — diisi sesuai klien]`.

## 30. Analytics Recommendations

Lacak klik WA per lokasi CTA (card, detail, floating button, footer) lewat parameter berbeda di link `wa.me` atau event tracking sederhana. Lacak halaman paket yang paling sering dibuka. Tidak perlu dashboard analytics kompleks untuk MVP — Google Analytics/Plausible dasar sudah cukup.

## 31. Anti-AI-Slop Rules

Wajib dihindari: gradient berlebihan, glassmorphism, floating blobs, objek 3D tanpa makna, ilustrasi abstrak acak, foto orang hasil AI generate, testimoni/statistik palsu, lebih dari 3 gaya visual dalam satu halaman, animasi tanpa tujuan, shadow/badge/pill berlebihan, hero generik "Welcome to...", copy buzzword tanpa informasi nyata (contoh yang harus dihindari: "Experience the Ultimate Spiritual Journey" — bandingkan dengan contoh yang benar: "Umroh 12 Hari · Hotel 180m dari Masjidil Haram · Keberangkatan Jakarta").

## 32. Vibe Coding Implementation Instructions

**Rekomendasi stack:** Next.js (App Router) + TypeScript + Tailwind CSS, data statis (TS/JSON, lihat Bagian 22), static generation untuk halaman katalog & detail. Ini pilihan pragmatis untuk kompatibilitas luas dengan AI coding agent (Claude Code, Cursor, v0, Bolt, Lovable) — boleh disesuaikan kalau agent/tool yang dipakai punya preferensi lain, selama prinsip "tanpa backend kompleks, tanpa payment, tanpa auth" tetap dipegang.

**Aturan wajib:**
1. Build mobile-first.
2. Jangan tambah fitur di luar spesifikasi ini tanpa didiskusikan dulu.
3. Jangan mengarang data bisnis — semua data demo harus berlabel jelas.
4. Jangan pakai Lorem Ipsum.
5. Jangan pakai testimoni atau statistik palsu tanpa label DATA DEMO.
6. Jangan ubah arah brand (warna/tipografi) tanpa alasan yang didiskusikan.
7. Jangan tambah gradient hanya supaya terlihat modern.
8. Jangan pakai UI pattern tanpa fungsi jelas.
9. Prioritaskan content hierarchy dan readability di atas dekorasi.
10. Semua paket harus mudah dibandingkan dan punya WA CTA kontekstual.
11. Tidak ada sistem checkout/payment.
12. Tidak ada authentication kecuali benar-benar dibutuhkan di fase berikutnya.
13. Tidak ada dashboard/admin di MVP.
14. Jangan over-engineer — data statis sudah cukup untuk MVP.

## 33. Definition of Done

**UX:** user bisa temukan paket cepat, paham perbedaan paket tanpa tanya admin, lihat jarak hotel secara terukur, paham cara verifikasi legalitas, dan menghubungi WA dengan konteks yang sudah terbawa.

**UI:** responsive, tenang & premium sesuai Bagian 14-15, konsisten, tidak terlihat seperti template AI generik.

**Content:** tidak ada Lorem Ipsum, semua data demo berlabel jelas, copy Bahasa Indonesia natural dan konkret.

**Technical:** cepat, SEO-ready, accessible (WCAG AA elemen utama), maintainable, tidak over-engineered.

**Conversion:** WA mudah ditemukan di setiap titik keputusan, CTA selalu kontekstual, mobile conversion jadi prioritas utama.

## 34. Future Roadmap

- v2: Verifikasi Legalitas Real-Time, Package Match (kuis rekomendasi), Umroh Journey Timeline Interaktif
- v3: Mode Ramah Lansia, integrasi CRM ringan untuk tracking lead WA, konten blog/knowledge-center (setelah ada komitmen maintenance konten dari klien)
- Di luar scope template ini selamanya kecuali klien secara eksplisit minta: online payment, sistem booking otomatis, dashboard admin kompleks

---

*Dibuat sebagai template/demo portofolio Kalsara Digital Studio. Semua temuan riset kompetitor & pain point di dokumen ini berdasarkan pengecekan langsung ke situs publik dan berita 2026 yang tersedia saat penulisan — bukan survei terstruktur. Validasi ulang dengan riset lebih dalam sebelum dipakai untuk keputusan produk klien nyata.*
