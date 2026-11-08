# Hasta Travel V2 — Recommended Public Information Architecture (M3.0-B)

> Recommendation only. Existing URLs are kept (no redirects needed). New pages are added only where an audited journey is missing a step; everything else extends an existing page.

Related: [Audit](HASTA_V2_PUBLIC_AUDIT.md) · [Journeys](HASTA_V2_PUBLIC_JOURNEY.md) · [Copy](HASTA_V2_PUBLIC_COPY_AUDIT.md) · [Design direction](HASTA_V2_PUBLIC_DESIGN_DIRECTION.md) · [Refinement plan](HASTA_V2_PUBLIC_REFINEMENT_PLAN.md)

---

## 1. Sitemap

```
/                               Beranda                          (existing, restructured)
├─ /paket-umroh                 Paket Umrah (katalog)            (existing, refined)
│  └─ /paket-umroh/[slug]?d=    Detail paket + pilih tanggal     (existing, refined)
├─ /jadwal-keberangkatan        Jadwal                           (existing, + filters)
├─ /haji-khusus                 Haji Khusus (gambaran + proses)  (existing, restructured)
│  └─ /haji-khusus/[slug]       Detail program Haji              (NEW — uses existing hajiBySlug)
├─ /daftar                      Ajukan pendaftaran (3 langkah)   (NEW — journey D)
│  └─ /daftar/terima-kasih      Konfirmasi + instruksi bayar     (NEW — journey D)
├─ /mitra                       Menjadi Mitra Hasta              (NEW — agent entry)
├─ /faq                         Panduan & FAQ (+ Haji, Mitra)    (existing, extended)
├─ /tentang                     Tentang & cara kami bekerja      (existing, refined; holds demo disclosure section #demo)
├─ /kontak                      Kontak & konsultasi              (existing, + form)
└─ not-found                    404 berbahasa Indonesia          (NEW file, no URL)

Header:  Paket Umrah · Haji Khusus · Jadwal · Panduan & FAQ · Tentang · Kontak · [Masuk ▾ (V2)] · [Konsultasi]
Footer:  Layanan (Umrah, Haji Khusus, Jadwal, Badal via Kontak) · Bantuan (FAQ, Kontak, Cara cek izin) ·
         Kemitraan (/mitra) · Legal & keamanan (rekening resmi, peringatan titipan dana) · Strip "Tentang demo ini"
Portals (workspace V2, not public marketing pages): /admin/login (gateway) · /portal/jamaah · /portal/agen
```

Deliberately **not** added:
- Testimonials and gallery pages: no verifiable content, and DECISIONS.md already rejected them.
- An articles/blog: no editorial owner. The workspace CMS stays internal until there is one.
- Separate city landing pages.
- A Badal page: Badal stays a Kontak route and an FAQ item.
- A separate booking-status page: returning pilgrims use the portal.

## 2. Page specifications

| Page | Objective | Audience | Primary CTA | Secondary CTA | Sections (order) | Integration dependencies |
|---|---|---|---|---|---|---|
| `/` | Orient and route to the right product within one scroll | First-time families, adult children planning for parents, Haji researchers | Lihat paket Umrah | Konsultasi via WhatsApp | See §3 | Featured departures from catalogue; licence data; FAQ content |
| `/paket-umroh` | Find a fitting package quickly | Umrah planners comparing options | Lihat detail (per card) | Konsultasi (sticky on mobile) | Intro · filter bar (jenis, bulan, kota, durasi, anggaran, urutkan) · result count · cards · empty state · help band | Unified catalogue (Journey §6.3); optional live seats from workspace data |
| `/paket-umroh/[slug]` | Decide on date and room, then take a next step | Shortlisting visitors | Ajukan pendaftaran | Tanya paket ini (WhatsApp) | Header · date selector · price + **payment terms** · hotels & distances · itinerary (collapsed) · included/excluded · requirements · guide · FAQ · trust (compact) | `PublicInquiry`, referral code, unified departures |
| `/jadwal-keberangkatan` | Browse by date | Visitors with fixed leave/school dates | Lihat tanggal (row → detail with `?d=`) | Tanya tanggal ini | Intro · month chips · filters (kota, jenis) · grouped rows | Same catalogue |
| `/haji-khusus` | Explain how Haji Khusus works and route to a programme | Haji researchers (often older, longer horizon) | Lihat program | Konsultasi Haji | Intro (porsi vs tanggal) · process timeline · programme cards (compact) · Mujamalah section (separate, conditional) · costs & exchange note · FAQ Haji · trust | Unified Hajj catalogue; verified regulatory copy |
| `/haji-khusus/[slug]` | Full programme detail | Shortlisted Haji researchers | Ajukan konsultasi Haji | WhatsApp Haji | Summary (waiting estimate, est. year, price USD, setoran awal) · payment stages (from `milestones`) · hotels · facilities · requirements · FAQ · trust | `HajjPackage.milestones` already exists in the workspace |
| `/daftar` | Capture a structured registration request | Decided visitors | Kirim permintaan | Tanya dulu via WhatsApp | Step 1 paket & tanggal (prefilled) · Step 2 kontak & jamaah · Step 3 tinjau + persetujuan dihubungi · demo notice | `createPublicInquiry` → Lead (Journey §6.2) |
| `/daftar/terima-kasih` | Confirm and set expectations | Submitted visitors | Simpan / bagikan ringkasan | Akses demo jamaah | Request number · summary · what happens next (verification call, DP, invoice) · official account + anti-proxy warning · demo bridge note | Inquiry record; settings bank fields |
| `/mitra` | Introduce the partner programme honestly; collect applications | Prospective agents | Ajukan menjadi mitra | Lihat demo portal mitra | Peran mitra · cara kerja kode referensi · kode etik · proses seleksi · FAQ · formulir | `PublicInquiry(AGENT_APPLICATION)`; Agent portal (workspace M3.2) |
| `/faq` | Answer pre-registration questions | All | Konsultasi | Lihat paket | Topics: Pendaftaran · Pembayaran · Pembatalan · Dokumen · Haji Khusus · Mitra · Layanan lain | Content; rule alignment with workspace |
| `/tentang` | Build trust through method and verifiability | Evaluators | Lihat paket | Cara cek izin | Prinsip (meter, harga terbuka, penuh tetap tampil) · PenandaMeter · cara kami mendampingi (proses) · pembimbing · legalitas & rekening · **Tentang demo ini (#demo)** | Licence data |
| `/kontak` | Make contacting easy and contextual | Ready-to-talk visitors | WhatsApp per topik | Formulir konsultasi | Topic routes · short form · kantor & jam · peta (link) · rekening resmi (once) | `PublicInquiry(UMRAH_QUESTION / HAJJ_CONSULTATION)` |
| 404 | Recover lost visitors | Anyone | Lihat paket | Kembali ke beranda | Message · search-like links (Umrah, Haji, Jadwal, Kontak) | — |

## 3. Homepage content blueprint (recommended order)

Order based on audit findings: the differentiator is buried, Haji has no homepage presence, date-driven discovery is missing, trust is strong but scattered, and the closing CTA is feature talk.

| # | Section | Content | Why here (finding) |
|---|---|---|---|
| 1 | **Hero** | Keep the H1 tagline; new supporting line stating the measurable promise (metres, walking time, three room prices). CTAs: Lihat paket Umrah · Konsultasi. Tertiary link: Informasi Haji Khusus. Replace the crane photo with an existing asset crop or a calmer one (no new asset generated in this audit). | Value proposition is missing from the hero today |
| 2 | **Quick finder strip** | Bulan · Kota keberangkatan · Anggaran → submits to `/paket-umroh?…` (existing URL filters) | Reuses existing query filters; helps date-driven visitors |
| 3 | **Verifiable licence strip** | Licence text + "Cara memeriksa izin" (confirmed portal) | Trust near the top is a pattern verified across competitors; keep Hasta's text-not-badge approach |
| 4 | **Keberangkatan terdekat** | 3–6 departures (card = package, date, city, Makkah + Madinah distance, seats, price) + "Lihat jadwal lengkap" | Replaces "Tiga paket, tiga jarak" with an actionable list |
| 5 | **Umrah vs Haji Khusus** | Two side-by-side panels: what you register for (date vs porsi), timeframe, price basis (IDR vs USD), CTA each | Haji currently absent from the homepage |
| 6 | **Kenapa jarak ditulis dalam meter** | `PenandaMeter` graphic + 2 sentences + link to Tentang | Brand-defining idea, now hidden on Tentang |
| 7 | **Cara mendaftar** | 4 steps: Konsultasi → Ajukan pendaftaran → Uang muka ke rekening perusahaan → Persiapan dokumen & manasik (shown as an example flow) | Registration process is invisible today |
| 8 | **Pendampingan jamaah** | 3–4 service points, each verifiable (manasik, pembimbing berbahasa Indonesia, perlengkapan, bantuan dokumen); include lansia/kursi roda guidance | Uses facts already on detail pages |
| 9 | **Ulasan jamaah** | **Only if verified.** In the demo: omit, or one block clearly labelled "Contoh tampilan (fiktif)" | Avoid fabricated social proof |
| 10 | **FAQ (4)** | Payments, cancellation, documents, Haji waiting time | Existing component |
| 11 | **Closing consultation** | "Belum yakin paket mana yang sesuai?" + Konsultasi · Ajukan pendaftaran | Replaces feature-talk copy |
| 12 | **Footer** | As in §1, studio CTA separated into the demo strip | Prevents pilgrims from messaging the studio |

Mobile order is the same. Sections 2 and 5 collapse into stacked blocks; a persistent bottom "Konsultasi" button appears after the hero scrolls out of view.
