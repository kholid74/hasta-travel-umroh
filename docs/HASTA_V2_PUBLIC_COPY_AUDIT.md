# Hasta Travel V2 — Public Copy Audit (M3.0-B)

> Current copy is quoted verbatim from the repository (file noted). Proposed copy is in natural, professional Bahasa Indonesia, avoids superlatives, guarantees, religious overstatement, and claims about licensing that the operator has not verified. Every number marked *contoh* stays labelled as an example until the client supplies real policy.

Related: [Audit](HASTA_V2_PUBLIC_AUDIT.md) · [Sitemap](HASTA_V2_PUBLIC_SITEMAP.md) · [Journeys](HASTA_V2_PUBLIC_JOURNEY.md) · [Refinement plan](HASTA_V2_PUBLIC_REFINEMENT_PLAN.md)

Rating legend: ✅ keep · ✏️ revise · ⚠️ risk (accuracy/claims) · ➕ missing

---

## 1. Voice assessment

**Strengths (keep):**
- Concrete and evidence-led ("180 meter, bukan cuma 'dekat'").
- Respectful tone.
- It explains *why* ("melebihkan ke arah lambat adalah satu-satunya arah kesalahan yang tidak merugikan").
- It warns against proxy payments.
- No superlatives.
- Honest about uncertainty in Haji timing.

**Weaknesses:**
1. **Two audiences mixed.** Customer copy repeatedly addresses a studio prospect: "Kejujuran soal ini adalah bagian dari yang sedang kami tunjukkan", "nama dan foto pembimbing sengaja tidak ditampilkan — data seperti itu akan terlihat seperti data asli…". A pilgrim reading it is confused about whether the operator is real.
2. **Feature talk instead of visitor benefit.** "Tombol WhatsApp di halaman paket otomatis membawa nama paket dan tanggalnya."
3. **Mixed English.** seat, Sold Out, Detail paket, Booking.
4. **Spelling inconsistency.** "Umroh" on the site, "Umrah" in the workspace and PDFs; "antrean" vs "antre".
5. **Regulatory statements written as fixed facts** (passport months, mahram letter, Kemenag porsi issuance, Furoda).
6. **Some headings are clever but vague.** "Tiga paket, tiga jarak", "Dari sebuah niat, menuju perjalanan yang dipersiapkan dengan baik" repeats the hero idea.

## 2. Terminology decisions (recommendation — needs client sign-off)

| Topic | Current | Recommendation |
|---|---|---|
| Umroh vs Umrah | Public "Umroh"; workspace, PDFs and product label "Umrah" | Pick one across site, PDF and portal. **Recommend "Umrah"** (standard spelling in KBBI) in headings and documents. "Umroh" can stay in metadata/keywords if the client wants search familiarity (all three reviewed competitors use "Umroh"). |
| Haji Khusus vs Mujamalah/Furoda | Furoda listed as a Haji Khusus product | Present as separate families: **Haji Khusus (kuota resmi, dengan nomor porsi)** and **Haji Mujamalah (undangan Pemerintah Arab Saudi, tanpa nomor porsi)**. Show Mujamalah only if the client actually offers it and can describe it accurately. |
| Seat | "Sisa 4 seat", "Sold Out" | "Sisa 4 kursi", "Penuh" |
| Jamaah | "jamaah" (public), "jamaah"/"Jamaah" (workspace) | Keep "jamaah" (consistent). |
| Konsultasi | "Konsultasi via WhatsApp", "Tanya paket ini" | Keep "Konsultasi" for general CTAs and "Tanya …" for contextual ones. |
| Registration | none | "Ajukan pendaftaran" (a request, not a confirmed booking) → later "Pendaftaran Anda" in the portal |
| Pembimbing / Muthawwif / Tour leader | "Pembimbing ibadah" (public); "Tour leader", "Muthawwif" (workspace) | Public: "pembimbing ibadah" with a short explanation; portal: "Tour leader & pembimbing". |
| Regulator | "SISKOPATUH Kemenag" | Replace with the institution and portal the client confirms (sources indicate Kemenhaj — see Audit §2.10). Until then use neutral wording: "portal resmi pemerintah". |

## 3. Global elements

| Element | Current (file) | Rating | Proposed |
|---|---|---|---|
| Nav labels | Paket Umroh · Haji Khusus · Jadwal · FAQ · Tentang · Kontak (`Header.tsx`) | ✏️ | Paket Umrah · Haji Khusus · Jadwal · Panduan & FAQ · Tentang · Kontak (+ "Masuk" in V2) |
| Header CTA | "Konsultasi via WhatsApp" | ✅ | Keep; mobile label "Konsultasi" |
| Footer studio CTA | "Saya ingin website seperti ini" | ✏️ | Keep for the demo, but move it into a clearly separated "Tentang demo ini" strip so pilgrims don't mistake it for the operator: "Untuk pemilik travel: lihat cara situs ini dibuat →" |
| Demo notice (`DEMO_NOTICE`) | "Situs demo — seluruh data perusahaan, harga, dan testimoni di sini fiktif." repeated under every H1 | ✏️ | One persistent slim banner site-wide: "Situs demonstrasi. Nama perusahaan, izin, harga, dan testimoni bersifat fiktif." Remove the per-page repetition. |
| Footer bottom line | "DATA DEMO · Dibuat oleh Kalsara Digital Studio… Bukan penyelenggara perjalanan ibadah." | ✅ | Keep |
| 404 | "404 · This page could not be found." (Next default) | ➕ | H1 "Halaman tidak ditemukan" · "Alamat ini mungkin sudah berubah. Silakan lihat paket yang tersedia atau hubungi kami." · CTAs: Lihat paket · Konsultasi |

## 4. Homepage

| Element | Current | Rating | Proposed |
|---|---|---|---|
| Eyebrow | UMROH & HAJI KHUSUS | ✅ | UMRAH & HAJI KHUSUS |
| H1 | "Perjalanan Dimulai dari Sebuah *Niat*." | ✅ | Keep (brand tagline, emotionally appropriate, not overclaiming) |
| Supporting text | "Hasta Travel menemani perjalanan ibadah Anda menuju Baitullah, dengan persiapan yang matang dan layanan yang penuh perhatian." | ✏️ generic | "Pilih paket Umrah dengan informasi yang bisa Anda periksa: jarak hotel ke masjid dalam meter, perkiraan waktu jalan kaki untuk jamaah lansia, dan harga untuk setiap tipe kamar." |
| Hero CTAs | Lihat paket · Konsultasi via WhatsApp | ✏️ | **Lihat paket Umrah** · Konsultasi via WhatsApp; tertiary text link "Informasi Haji Khusus →" |
| Licence strip | "Izin PPIU DEMO-000 TAHUN 2026 — nomor demo, sengaja dibuat tidak valid." · "Cek legalitas di SISKOPATUH" | ⚠️ | "Izin PPIU: DEMO-000 TAHUN 2026 (contoh)" · "Cara memeriksa izin travel →" linking to a confirmed official portal |
| Featured heading | "Tiga paket, tiga jarak" | ✏️ | "Keberangkatan terdekat" (if showing dates) or "Pilih berdasarkan jarak hotel" + sub "Tiga contoh paket dengan jarak hotel yang berbeda — dari yang paling hemat sampai yang paling dekat." |
| Link | "Lihat semua 18 paket" | ✅ | "Lihat semua 18 paket" (count must use packages with upcoming dates) |
| About teaser H2 | "Dari sebuah niat, menuju perjalanan yang dipersiapkan dengan baik" | ✏️ repeats hero | "Kenapa kami menulis jarak dalam meter" (the brand story) |
| About paragraphs | 3 paragraphs, third: "Karena bagi kami, perjalanan ibadah layak dipersiapkan dengan penuh perhatian." | ✏️ | Condense to 2 sentences + the `PenandaMeter` graphic |
| Testimonial | "Saya mendaftarkan ibu yang umurnya 71… Ternyata memang segitu." — "S. R., Bekasi — testimoni DATA DEMO, fiktif." | ⚠️ | Remove from the homepage until verified testimonials exist; in the demo show "Contoh tampilan ulasan jamaah (fiktif)" only inside a clearly labelled demo block, or omit |
| FAQ heading | "Yang paling sering ditanyakan" | ✅ | Keep |
| Closing H2 | "Sudah tahu paket mana yang cocok?" | ✏️ | "Belum yakin paket mana yang sesuai?" |
| Closing body | "Tombol WhatsApp di halaman paket otomatis membawa nama paket dan tanggalnya." | ✏️ feature talk | "Ceritakan siapa yang akan berangkat, perkiraan bulan, dan kebutuhan khusus — misalnya kursi roda. Tim kami membantu membandingkan pilihannya." |

## 5. Umrah listing and cards

| Element | Current | Rating | Proposed |
|---|---|---|---|
| H1 / intro | "Paket Umroh" · "Setiap paket menampilkan jarak hotel ke masjid dalam meter, tipe aksesnya, dan perkiraan waktu jalan kaki pada kecepatan jamaah lansia — sekitar 50 meter per menit. Angkanya bisa Anda cek sendiri di peta." | ✅ | Keep; spelling "Umrah" |
| Filter labels | Jenis · Bulan keberangkatan · Durasi · Harga maksimum (quad) · Urutkan | ✏️ | Jenis paket · Bulan · Durasi · Anggaran per orang (kamar berempat) · Urutkan; add "Kota keberangkatan" |
| Filter button | "Filter (aktif)" | ✏️ | "Filter · 2 aktif" |
| Empty state | "Tidak ada paket yang cocok" + guidance | ✅ | Keep; add "atau tanyakan tanggal lain lewat WhatsApp" |
| Card availability | "Sisa 4 seat" / "Sold Out" | ✏️ | "Sisa 4 kursi" / "Penuh" |
| Card price label | "Mulai dari, sekamar berempat" | ✏️ | "Mulai dari (kamar berempat)" |
| Card CTA | "Detail paket" | ✏️ | "Lihat detail" |

## 6. Package detail

| Element | Current | Rating | Proposed |
|---|---|---|---|
| Date section | "Pilih tanggal keberangkatan" | ✅ | Keep |
| Sold-out chip | "· sold out" | ✏️ | "· penuh"; when selected, show "Tanggal ini penuh. Pilih tanggal lain atau daftar tunggu." |
| Price heading/body | "Harga per jamaah" · "Harga berbeda menurut jumlah orang sekamar…" | ✅ | Keep; add a line "Uang muka dan jadwal pelunasan dijelaskan sebelum Anda membayar." |
| Primary CTA | "Tanya paket ini via WhatsApp" | ✏️ | Two CTAs: **Ajukan pendaftaran** (primary, V2) · **Tanya paket ini via WhatsApp** (secondary) |
| Sticky mobile CTA | "Tanya paket ini" | ✅ | Keep; add "Daftar" when the form exists |
| Hotels intro | "…perbedaan 200 meter dengan 800 meter bisa menentukan seseorang sempat ikut shalat berjamaah atau tidak." | ✅ | Keep (specific, appropriate) |
| Route copy | "Rute mengharuskan menyeberang jalan atau memutar lewat jembatan penyeberangan." | ✅ | Keep |
| Pembimbing | "…Pada situs demo ini nama dan foto pembimbing sengaja tidak ditampilkan — data seperti itu akan terlihat seperti data asli, dan justru itu yang paling sering dipalsukan situs tiruan." | ✏️ audience mix | "Setiap rombongan didampingi pembimbing ibadah berbahasa Indonesia sejak manasik hingga kembali ke Tanah Air. Profil pembimbing untuk tanggal yang Anda pilih kami informasikan saat konsultasi." (the demo explanation moves to the demo disclosure page) |
| Requirements | "Paspor berlaku minimal 8 bulan…", "Surat mahram untuk jamaah perempuan sesuai ketentuan yang berlaku" | ⚠️ | Keep as "Contoh persyaratan" until the operator supplies its current written list; harmonise the passport period with the workspace rule |
| Facilities | "Visa umroh dan pengurusan Nusuk" | ⚠️ | Confirm wording with the operator |

## 7. Haji Khusus

| Element | Current | Rating | Proposed |
|---|---|---|---|
| Intro | "Haji Khusus tidak dijual seperti umroh. Yang Anda daftarkan bukan tanggal keberangkatan, melainkan antrean — karena itu halaman ini menampilkan masa tunggu dan skema pembayaran lebih dulu, bukan hitung mundur seat." | ✏️ | "Pendaftaran Haji Khusus berbeda dengan Umrah. Yang Anda dapatkan setelah setoran awal adalah nomor porsi dan perkiraan tahun keberangkatan, bukan tanggal pasti. Karena itu kami menampilkan perkiraan masa tunggu dan skema pembayaran lebih dulu." |
| Quota note (Reguler) | "Nomor porsi terbit setelah setoran awal diterima Kemenag…" | ⚠️ | "Nomor porsi diterbitkan melalui sistem pemerintah setelah setoran awal diterima. Perkiraan tahun berangkat dapat berubah mengikuti kuota yang ditetapkan setiap tahun." (institution name to be confirmed) |
| Mujamalah title | "Haji Mujamalah (Visa Furoda)" under Haji Khusus | ⚠️ | Separate section "Haji Mujamalah" with: "Visa mujamalah diterbitkan atas undangan Pemerintah Arab Saudi. Kepastian visa baru diketahui menjelang musim haji, sehingga tahun keberangkatan tidak dapat dijamin." Show only if the client offers it. |
| Mujamalah note | "Siapa pun yang menjamin visa ini pasti terbit sedang menjanjikan hal yang bukan wewenangnya." | ✏️ tone | "Kami tidak menjanjikan kepastian visa ini, dan kami menyarankan Anda berhati-hati terhadap pihak yang menjaminnya." |
| Payment note | "…Kurs rupiah mengikuti tanggal pembayaran, jadi nilai rupiahnya dikonfirmasi saat konsultasi — bukan dipatok di halaman ini supaya tidak menyesatkan." | ✏️ | "Harga dalam dolar AS. Nilai rupiah mengikuti kurs pada tanggal pembayaran dan akan dikonfirmasi saat konsultasi." |
| Waiting label | "Tanpa antre" | ✏️ | "Tanpa nomor porsi" (precise) |
| CTA | "Tanya masa tunggu & pembayaran" | ✏️ | Haji Khusus: "Tanya masa tunggu & pembayaran"; Mujamalah: "Tanya ketersediaan & ketentuan" |
| WhatsApp (haji) | "…soal paket Haji Khusus Haji Mujamalah (Visa Furoda), terutama masa tunggu dan skema pembayarannya." | ⚠️ bug | Haji Khusus: "Assalamu'alaikum, saya ingin konsultasi **{nama paket}**: perkiraan masa tunggu, setoran awal, dan skema pelunasan." · Mujamalah: "Assalamu'alaikum, saya ingin konsultasi **Haji Mujamalah**: ketentuan pendaftaran dan pengembalian dana bila visa tidak terbit." |
| ➕ Process | — | ➕ | "Langkah pendaftaran Haji Khusus: 1. Konsultasi & pemeriksaan dokumen · 2. Setoran awal ke rekening perusahaan · 3. Penerbitan nomor porsi · 4. Cicilan sesuai jadwal · 5. Manasik berkala · 6. Pelunasan & keberangkatan" (labelled as an example flow until confirmed) |

## 8. Jadwal, FAQ, Tentang, Kontak

| Element | Current | Rating | Proposed |
|---|---|---|---|
| Jadwal intro | "Seluruh 39 tanggal keberangkatan yang dijadwalkan, termasuk yang sudah penuh. Daftar ini dibaca dari data yang sama dengan katalog paket…" | ✏️ | "39 tanggal keberangkatan Umrah, termasuk yang sudah penuh. Pilih tanggal untuk melihat harga dan ketersediaan." (the second sentence is developer-facing) |
| Month heading | "November 2026" + "5 keberangkatan" | ✏️ a11y | Separate with " · " so the accessible name reads "November 2026 · 5 keberangkatan" |
| FAQ intro | "…dijawab dengan angka dan ketentuan, bukan dengan ajakan menghubungi admin." | ✏️ | "Jawaban atas pertanyaan yang paling sering kami terima sebelum pendaftaran. Angka bertanda *contoh* adalah ilustrasi pada situs demo ini." |
| FAQ DP answer | "Contoh ketentuan: uang muka Rp 5.000.000 per jamaah, dan seat baru terkunci setelah uang muka masuk…" | ✏️ | "Contoh ketentuan: uang muka Rp 5.000.000 per jamaah. Kursi dikonfirmasi setelah uang muka diterima dan diverifikasi di rekening perusahaan." (align with the workspace verification flow) |
| FAQ passport | "Minimal 8 bulan dari tanggal keberangkatan…" | ⚠️ | Align with the operator's rule and the workspace check (currently 6 months) |
| ➕ FAQ Haji | — | ➕ | Masa tunggu, nomor porsi, setoran awal, kurs, pembatalan |
| ➕ FAQ Mitra | — | ➕ | See Journey doc §7 |
| Tentang H1/lead | "Tentang Hasta Travel" · "{tagline} — … menemani perjalanan ibadah Anda menuju Baitullah, dengan persiapan yang matang dan layanan yang penuh perhatian." | ✏️ | Lead with the operating principles: "Kami membantu jamaah memilih dan mempersiapkan Umrah dan Haji Khusus dengan informasi yang dapat diperiksa sendiri." |
| Tentang commitments | "Paket yang sudah penuh tetap ditampilkan…", "Harga ditulis untuk tiga jenis okupansi…", "Nomor izin bisa dicek sendiri…" | ✅ | Keep (strong, verifiable) |
| Kontak intro | "Semua konsultasi berjalan lewat WhatsApp. Pilih jalur yang sesuai supaya pesan Anda sudah membawa konteksnya sejak kalimat pertama." | ✏️ | "Pilih topik konsultasi. Pesan WhatsApp akan terisi otomatis, dan Anda tetap bisa mengubahnya sebelum mengirim." |
| Trust heading | "Cek legalitas kami, jangan percaya kata-kata saja" | ✅ | Keep |
| Trust CTA | "Cek di SISKOPATUH Kemenag" | ⚠️ | "Periksa izin di portal resmi" (link and institution confirmed by the client) |
| Trust demo note | "…Kejujuran soal ini adalah bagian dari yang sedang kami tunjukkan." | ✏️ audience mix | Move to the demo disclosure; keep "Nomor izin pada situs demo ini fiktif." |
| Anti-proxy warning | "Pembayaran hanya ke rekening atas nama perusahaan. Jangan menitipkan uang ke rekening pribadi siapa pun, termasuk yang mengaku agen kami." | ✅ | Keep. It is important for the agent programme too. |
| "Cara memastikan…" list | 4 steps | ✅ | Keep; update the step-2 portal wording |

## 9. WhatsApp prefilled messages

All messages currently end with "— Pesan ini dikirim dari situs demo Hasta Travel (Kalsara Digital Studio)". Keep this line in the demo: it protects the studio's real number from being mistaken for a real operator.

| Source | Current | Rating | Proposed |
|---|---|---|---|
| umum (header, hero, closing, FAQ, Kontak) | "Assalamualaikum, saya ingin tahu lebih lanjut soal paket Umroh & Haji." | ✏️ | "Assalamu'alaikum, saya ingin konsultasi paket Umrah. Rencana berangkat: (bulan) · Jumlah jamaah: (orang) · Kota keberangkatan: (kota)." Placeholders help the operator answer in one reply. |
| paket (detail, sticky) | "Assalamualaikum, saya tertarik dengan {paket} keberangkatan {tanggal} dari {kota}. Mohon informasi lengkapnya." | ✅ | Keep; add "Tipe kamar: (quad/triple/double) · Jumlah jamaah: (orang)" and, when present, "Kode referensi: {CODE}" |
| haji | see §7 | ⚠️ | see §7 |
| badal | "Assalamualaikum, saya ingin tanya soal layanan Badal Umroh." | ✅ | Keep ("Badal Umrah") |
| studio | "Halo Kalsara Digital Studio, saya ingin membuat website travel seperti demo Hasta Travel ini." | ✅ | Keep |
| Salutation spelling | "Assalamualaikum" | ✏️ | Use one form consistently, e.g. "Assalamu'alaikum" |

## 10. Copy to avoid (checklist for V2)

- Superlatives and guarantees: "terbaik", "termurah", "pasti berangkat", "zero cancel", "100% aman".
- Religious promises: "dijamin mabrur", "pasti diterima".
- Unverified licence or accreditation badges, or certificate images without a verification link.
- Testimonials without a verifiable source. In the demo, any example must be labelled fictitious inline.
- Simulated commission or income examples on agent pages (see Journey §7).
- Government process claims not confirmed by the operator (quota, porsi issuance, Furoda availability).
