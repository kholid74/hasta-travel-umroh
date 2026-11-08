# Hasta Travel V2 — Public Website Audit (M3.0-B)

> Audit and planning only. No application code, assets, demo data or admin workspace were changed. **Facts** (observed in code or screenshots) are kept separate from **Recommendations**.

| | |
|---|---|
| Source of truth | Repository `feature/hasta-finance-inventory` @ `79bad09`. Public code last changed in `229b5ba` (2026-10-03). |
| Rendered target | https://hasta-travel.demo.kalsara.id — static prerender (`X-Nextjs-Prerender: 1`, Vercel cache HIT, page age ≈ 2 days on 2026-11-07). It matches the repository's public code. |
| Capture date | 2026-11-07, Chrome headless, widths 1440 / 768 / 390 |
| Screenshots | `docs/public-audit/screenshots/{desktop-1440,tablet-768,mobile-390}/` — index in §9 |
| Companion docs | [Sitemap](HASTA_V2_PUBLIC_SITEMAP.md) · [Copy audit](HASTA_V2_PUBLIC_COPY_AUDIT.md) · [Journeys](HASTA_V2_PUBLIC_JOURNEY.md) · [Design direction](HASTA_V2_PUBLIC_DESIGN_DIRECTION.md) · [Refinement plan](HASTA_V2_PUBLIC_REFINEMENT_PLAN.md) |

---

## 1. Public route inventory (facts)

| Route | File | Status (live) | Rendering |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` | 200 | Static |
| `/paket-umroh` | `app/(public)/paket-umroh/page.tsx` + `components/KatalogClient.tsx` | 200 | Static HTML + client filters (URL query) |
| `/paket-umroh/[slug]` | `app/(public)/paket-umroh/[slug]/page.tsx` + `components/DetailClient.tsx` | 200 (18 slugs via `generateStaticParams`) | Static + client date selector (`?d=`) |
| `/haji-khusus` | `app/(public)/haji-khusus/page.tsx` | 200 | Static |
| `/jadwal-keberangkatan` | `app/(public)/jadwal-keberangkatan/page.tsx` | 200 | Static |
| `/faq` | `app/(public)/faq/page.tsx` | 200 | Static |
| `/tentang` | `app/(public)/tentang/page.tsx` | 200 | Static |
| `/kontak` | `app/(public)/kontak/page.tsx` | 200 | Static |
| `/admin/login` | admin workspace entry | 200 | Not linked from the public site |
| Any unknown path (e.g. `/booking`, `/daftar`, `/agen`, `/status`) | — | 404 | **Default Next.js 404**: white page, English text "This page could not be found.", no header, footer or way back (`mobile-390/09-not-found.jpg`) |

**Shared layout:** `app/(public)/layout.tsx` → `Header` + page + `Footer`. Root `app/layout.tsx` loads Instrument Serif (display) + Manrope (UI), `lang="id"`.

**Not present (do not exist in code):** testimonials page, gallery, articles/blog, Haji package detail pages (`hajiBySlug()` exists in `content/haji.ts` but no route uses it), registration/booking form, booking confirmation, payment instructions page, booking status/returning-customer page, pilgrim login, agent program page, agent registration, referral capture, privacy/cancellation policy pages, search.

**Data sources (all static, compiled at build):** `content/packages.ts` (18 Umrah packages, 47 departures), `content/haji.ts` (3 Hajj products), `content/hotels.ts`, `content/itinerary.ts` (9/12/14-day templates), `content/faq.ts` (9 Q&A), `content/company.ts` (fictitious company, real Kalsara WhatsApp number), `content/photos.ts` (3 Wikimedia Commons photos with attribution).

**"Today" is frozen at build time:** every page computes `new Date()` during prerender (`paket-umroh/page.tsx`, `[slug]/page.tsx`, `jadwal-keberangkatan/page.tsx`, `page.tsx`). The code says so itself (`paket-umroh/page.tsx:14-15`). Past departures stay visible and selectable until the next deploy. Of 47 fixture departures, 8 were already before 2026-11-07. The live build excludes them, but **11 November 2026** departures will still show as available after that date unless the site is rebuilt.

## 2. Page-by-page audit

### 2.1 Header (`components/Header.tsx`) and footer (`components/Footer.tsx`)

| | Facts |
|---|---|
| Header | Logo mark + "Hasta Travel" in display font. Nav: Paket Umroh · Haji Khusus · Jadwal · FAQ · Tentang · Kontak. Amber "Konsultasi via WhatsApp" button on desktop only (`hidden … md:inline-flex`). |
| Mobile nav | No menu button. The nav is a horizontally scrolling list: the measured `scrollWidth` is 441 px inside a 240 px box, so "Jadwal", "FAQ", "Tentang" and "Kontak" are off-screen, with no scroll affordance (`mobile-390/01-home-fold.jpg`). The WhatsApp button is hidden on mobile. |
| Footer | Lockup logo, fictitious address, "Izin PPIU DEMO-000 TAHUN 2026", "Cek di SISKOPATUH Kemenag" link, the same 6 nav links, a demo-portfolio disclosure, and the Kalsara sales CTA "Saya ingin website seperti ini" (WhatsApp to the studio). Bottom bar: "DATA DEMO · … Bukan penyelenggara perjalanan ibadah." |
| UX problems | (1) Mobile nav hides 4 of 6 destinations. (2) On mobile listing/schedule/FAQ/about pages the **only visible WhatsApp button is the studio sales CTA in the footer**, so a pilgrim could message the studio instead of the operator. (3) No entry point for returning pilgrims or agents. |
| Opportunities | Mobile menu sheet with primary WhatsApp; a persistent mobile consultation button; a "Masuk" entry (Jamaah / Mitra) once portals exist; visually separate the studio CTA from operator CTAs. |

### 2.2 Homepage `/`

- **Purpose / visitor:** first impression for families planning Umrah; secondarily people researching Haji Khusus.
- **Section order (facts):**
  1. Full-bleed hero photo (Masjidil Haram exterior with construction cranes visible), 62 % dark overlay. Eyebrow "UMROH & HAJI KHUSUS", H1 "Perjalanan Dimulai dari Sebuah *Niat*.", one supporting sentence, CTAs **Lihat paket** (primary) and **Konsultasi via WhatsApp**, photo credit.
  2. Licence strip: "Izin PPIU DEMO-000 TAHUN 2026 — nomor demo, sengaja dibuat tidak valid." with "Cek legalitas di SISKOPATUH ↗".
  3. "Tiga paket, tiga jarak": 3 hard-coded featured cards (Hemat 9 Hari 1500 m, Premium 12 Hari 180 m, Ramah Lansia 12 Hari 120 m) and "Lihat semua 18 paket".
  4. About teaser with Abraj Al Bait photo: "Dari sebuah niat, menuju perjalanan yang dipersiapkan dengan baik", 3 paragraphs, "Selengkapnya tentang kami".
  5. One testimonial quote, labelled "testimoni DATA DEMO, fiktif".
  6. FAQ preview (3 items) + "Lihat semua pertanyaan".
  7. Closing CTA "Sudah tahu paket mana yang cocok?" + Lihat paket / WhatsApp.
- **Components:** `PackageCard`, `Foto`, `WhatsAppIcon`, `URL_SIMPU`, `keberangkatanTerdekat`, `linkWa`.
- **Interactions:** links, `<details>` FAQ, WhatsApp deep links (`data-wa-source` = hero, cta-akhir).
- **UX problems:**
  - The hero does not say what is different about Hasta. The strongest differentiator, hotel distance in metres with walking time at elderly pace, appears only in the meta description and in the card badges.
  - Haji Khusus is named in the eyebrow but has **no section on the homepage**.
  - No schedule entry ("Jadwal") on the homepage, and no way to filter by month or budget from the hero.
  - The "Tiga paket, tiga jarak" heading is clever but does not tell a first-time visitor why these three were chosen.
  - The hero photo shows cranes, which weakens premium positioning.
  - The closing CTA copy talks about a feature ("Tombol WhatsApp … otomatis membawa nama paket") rather than the visitor's next step.
- **Opportunities:** a value proposition in the hero, a compact Umroh vs Haji Khusus split, featured departures by month, a "how registration works" step strip, and a trust section built on verifiable items.

### 2.3 Umrah listing `/paket-umroh`

- **Facts:** H1 "Paket Umroh", explanatory paragraph about metres and the 50 m/min walking pace, demo notice. Filters: Jenis (Semua/Reguler/Plus/Ramadhan as toggle buttons), Bulan keberangkatan, Durasi, Harga maksimum (quad), Urutkan. Filters sync to the URL query via `replaceState`. On mobile the filters collapse behind a **Filter** button showing a count (`10-paket-filter-open.jpg`). There is a helpful empty state with "Hapus semua filter" (`desktop-1440/10-paket-empty-state.jpg`). Each card shows type · duration, name, distance badge, Makkah hotel + stars + step-free, nearest matching date + seats ("Sisa 4 seat" turns amber at ≤ 5), "Mulai dari, sekamar berempat", price, and **Detail paket**.
- **Data:** `toRow()` and `saring()` in `lib/katalog.ts`. A filter selects the departure that actually matches (good).
- **UX problems:**
  - 18 cards on one page make the mobile page about 8,000 px tall.
  - Cards show only the Makkah hotel; the Madinah distance is hidden until the detail page.
  - There is no departure-city filter, although departures leave from Jakarta, Surabaya and Medan.
  - No WhatsApp on mobile (see §2.1).
  - The filter panel opens inline and pushes results down.
  - English words "seat" and "Sold Out" are mixed into Indonesian copy.
- **Opportunities:** departure-city filter, Makkah + Madinah distances on the card, a sticky "n paket · Filter" bar on mobile, a "Penuh" label, and a nudge to compare or consult.

### 2.4 Package detail `/paket-umroh/[slug]`

- **Section order (facts):**
  1. Breadcrumb.
  2. Type · duration, H1, demo notice.
  3. **Pilih tanggal keberangkatan** (date chips with city and sold-out label; summary of date, city, airline logo/text, availability).
  4. **Harga per jamaah** (quad/triple/double table + "Tanya paket ini via WhatsApp").
  5. Hotels with distance, walking time, route type and step-free explanations.
  6. 12-day itinerary, **all days expanded by default**.
  7. Termasuk / Belum termasuk.
  8. Syarat pendaftaran.
  9. Pembimbing (explains why names and photos are not shown).
  10. FAQ (4).
  11. Compact trust section.
- **Interactions:** choosing a date updates price, seats, airline and the WhatsApp text, and rewrites `?d=` (verified: the WhatsApp text changed to "7 April 2027" after selection, `desktop-1440/11-detail-date-selected.jpg`). There is a sticky mobile bar with date, quad price and **Tanya paket ini** (`mobile-390/11-detail-sticky-cta.jpg`).
- **UX problems:**
  - WhatsApp is the only next step. There is no "Daftar / Ajukan pendaftaran", no seat-hold explanation, no payment schedule (DP amount and deadline are only in the FAQ "contoh ketentuan").
  - Sold-out dates can still be selected, and the CTA still says "Tanya paket ini" with no waitlist wording.
  - The itinerary is fully expanded, so the mobile page is about 6,900 px.
  - The page has no package imagery.
  - The "Pembimbing" copy is demo meta-commentary aimed at a studio prospect, not at a pilgrim.
  - Selecting a date does not move the user to the price.
- **Opportunities:** a primary "Ajukan pendaftaran" flow next to WhatsApp, a payment schedule block, a collapsed itinerary with "Buka semua", a sold-out → "Daftar tunggu" state, and a share link.

### 2.5 Haji Khusus `/haji-khusus`

- **Facts:** H1 + intro ("Yang Anda daftarkan bukan tanggal keberangkatan, melainkan antrean…"). Three long cards: **Haji Khusus Reguler**, **Haji Khusus Eksekutif**, **Haji Mujamalah (Visa Furoda)**. Each shows masa tunggu, perkiraan berangkat, biaya (USD), setoran awal (USD), a quota note, a payment note, hotels with distances, collapsible facilities and requirements, and **Tanya masa tunggu & pembayaran** (WhatsApp). The full trust section follows.
- **UX problems:**
  - **Furoda/Mujamalah sits under "Haji Khusus"** although it is a different, non-quota route. The page itself says it has no queue, but its CTA still asks about "masa tunggu".
  - The WhatsApp text reads "…paket Haji Khusus Haji Mujamalah (Visa Furoda), terutama masa tunggu…" — duplicated and contradictory.
  - There are no detail pages, so cards can't be shared individually.
  - No process explainer (setoran awal → nomor porsi → pelunasan → manasik → keberangkatan).
  - Regulatory statements ("Nomor porsi terbit setelah setoran awal diterima Kemenag", Furoda issuance) are written as facts and may be outdated (see §7.2).
  - The prices in this public content **do not match** the admin workspace's Hajj packages (`content/admin/hajj.ts`: "Haji Khusus Amanah 2028 — Demo" US$ 12.500, "Keluarga 2029").
- **Opportunities:** a process timeline, separate product families, detail pages, a consultation form specific to Haji, and one shared Hajj catalogue for public and workspace.

### 2.6 Jadwal `/jadwal-keberangkatan`

- **Facts:** departures grouped by month ("Seluruh 39 tanggal keberangkatan…"). Each row shows date, package link, city · airline · Makkah distance, status + seats, and quad price.
- **UX problems:**
  - No filters, so the mobile page is about 8,100 px.
  - Month headings' accessible names concatenate ("November 20265 keberangkatan") because the count is an inline span with no separating space.
  - No "Tanya tanggal ini" action per row.
  - Sold-out rows give no alternative.
- **Opportunities:** month jump chips, city/type filters, and per-row WhatsApp or registration actions.

### 2.7 FAQ `/faq`

- **Facts:** 5 topics, 9 Q&A, many prefixed "Contoh ketentuan". `<summary class="list-none">` removes the disclosure marker and no icon replaces it. Closing WhatsApp CTA.
- **UX problems:**
  - No visible expand affordance.
  - No Haji Khusus FAQ.
  - No agent/partner FAQ.
  - Passport validity "minimal 8 bulan" differs from the workspace rule (`validPassport` = 180 days).
- **Opportunities:** a chevron affordance, Haji and Mitra topics, and rules aligned with the workspace.

### 2.8 Tentang `/tentang`

- **Facts:**
  - Sections: tagline paragraph, "Kenapa kami menulis jarak dalam meter" (strong), Nabawi photo, `PenandaMeter` SVG (180 / 450 / 950 m), "Apa yang kami tampilkan apa adanya" (4 commitments), Pembimbing (demo explanation), full trust section.
  - The page has no team, history, office photo, licence detail or service area.
- **Opportunities:** keep the meter rationale (the brand's core) and add a "how we work" process and verifiable licence details in the real deployment.

### 2.9 Kontak `/kontak`

- **Facts:**
  - Three WhatsApp routes: Tanya paket umroh / Tanya Haji Khusus / Tanya Badal Umroh.
  - Office address and opening hours.
  - The full trust section, which **repeats the office address** a second time on the same page (`mobile-390/08-kontak.jpg`).
  - No form, map, phone or email.
- **Opportunities:** a contact/consultation form (writes a lead in the workspace demo), a map link, and removal of the duplicate address.

### 2.10 Trust section (`components/TrustSection.tsx`, used on 4 pages)

- **Facts:**
  - Heading "Cek legalitas kami, jangan percaya kata-kata saja"; PPIU and PIHK demo numbers.
  - "Cek di SISKOPATUH Kemenag" button → `https://simpu.kemenag.go.id`, plus a demo explanation.
  - Office, official bank account, and an anti-proxy-payment warning (strong).
  - A 4-step "Cara memastikan situs ini bukan tiruan".
- **Verification target:**
  - From the audit environment, `simpu.kemenag.go.id` and `siskopatuh.kemenag.go.id` **did not resolve**.
  - `haji.go.id` responds with the title "Kementerian Haji dan Umrah Republik Indonesia", and `siskopatuh.haji.go.id` responds 200.
  - Recent coverage reports that PPIU/PIHK licensing is now issued by Kemenhaj (Ministry of Hajj and Umrah) under PMHU No. 2/2026 ([officia.id](https://officia.id/perbedaan-syarat-dan-prosedur-antara-izin-ppiu-dan-pihk-haji-khusus/), [riliskalimantan.com](https://www.riliskalimantan.com/2026/09/kemenhaj-perketat-izin-travel-umrah-50.html), [periskop.id](https://periskop.id/haji/20260821/cara-cek-travel-umrah-haji-khusus-resmi)). These are secondary sources and disagree on the exact portal URL, so the **official URL must be confirmed by the client from an Indonesian network** before changing it.
- **Risk:** the main trust CTA may lead to a dead host and names an institution that may no longer be responsible. This is classified P0 in the refinement plan.

## 3. Visual design audit

| Area | Observation (fact) | Assessment | Material? |
|---|---|---|---|
| Identity | Dark "Malam Gurun" palette (`globals.css`: bg `#0c1210`, surface `#151c19`, ink `#f2efe8`, amber `#f0a62b` as the only warm colour), Instrument Serif headings, Manrope body, logo mark | Distinctive, calm, premium; clearly not template-like. **Preserve.** | — |
| Consistency with workspace | Workspace and PDFs use forest green `#245b45` + gold on light surfaces; public uses near-black + amber; public spells "Umroh", workspace/PDF "Umrah" | Two identities for one brand; a pilgrim moving from site → invoice PDF → portal will feel the seam | Yes (V2 portals) |
| Typography | Display serif at 48–72 px hero, 24–36 px section heads; body 16 px, line-height 1.6; many 12–14 px muted captions | Hierarchy is clear. Small caption sizes (11–13 px) appear for credits and metadata | Cosmetic |
| Colour & contrast | Text pairs measured: ink/bg 16.5:1, muted/surface 6.7:1, amber/surface 8.4:1, warning/surface 7.5:1 — all pass AA. **UI borders** hairline `#24302b` vs surface = **1.26:1** | Text contrast is good. Input/card boundaries are faint (WCAG 1.4.11 asks 3:1 for component boundaries such as selects) | Yes (forms) |
| Spacing & composition | 1200 px container, generous section spacing, single-column 800 px for reading pages | Good. Long stacked cards make pages very tall on mobile (listing ≈ 8,100 px, schedule ≈ 8,100 px, detail ≈ 6,900 px) | Yes (mobile) |
| Hero | Full-bleed photo + flat overlay (no gradient, by design) | Strong typography; photo shows cranes; value proposition missing | Yes (copy), cosmetic (photo) |
| Imagery | 3 licensed Wikimedia photos, credits under each; no package imagery; no people | Honest and legal; repetitive; packages have no visual anchor | Cosmetic |
| Package cards | Badge with footprints icon, metres, minutes; price in display font; full-width amber button | The meter badge is the signature component. Missing Madinah distance and departure city | Partly |
| Icons & accents | lucide icons, footprints, shield, WhatsApp glyph; amber used for CTAs, eyebrow labels, limited-seat state and focus ring | Amber carries both "action" and "warning-ish limited seats"; acceptable but dense on detail pages | Cosmetic |
| CTA hierarchy | Primary amber (Lihat paket / Detail paket / Tanya paket ini), secondary outlined WhatsApp; studio CTA is outlined amber in the footer | Clear on desktop. Mobile lacks a persistent operator CTA except on the detail page | Yes |
| Responsive | No horizontal page overflow at 390/768/1440 (measured). Tablet uses 2-column cards | Works. Mobile nav overflow is the main defect | Yes |
| States | Empty state on the catalogue is good. No loading UI needed (static). **404 is the default unbranded English page**. No public `error.tsx` | 404 breaks the experience and language | Yes |
| Accessibility | `lang="id"`, skip-friendly structure, focus ring, reduced motion respected, all images have `alt`. Issues: FAQ `<summary>` without marker; schedule heading names concatenated; text-link nav targets < 24 px tall; 11 px credits | Mostly solid; fix the listed items | Partly |

Strong decisions to keep:
- Distances in metres with walking time at elderly pace (`menitJalan`, 50 m/min).
- Neutral-coloured distance badges that don't judge budget choices.
- Status derived from seats rather than typed by hand.
- One canonical detail page with `?d=` for dates.
- Showing sold-out departures openly.
- Three occupancy prices.
- The anti-proxy-payment warning.
- No gradients and no fake faces.
- Photo attribution.

## 4. Competitive and reference review

**Method:** four sites loaded with Chrome at 1440 and 390 px on 2026-11-07. Screenshots are kept outside the repository (third-party content). Observations are limited to what was rendered on the homepage; deeper flows were not tested.

| Site | Verified observations |
|---|---|
| JMI Tours & Travel (jmitourstravel.com, Indonesian PPIU/PIHK operator) | Blue/yellow brand. The hero states licence numbers as text ("Izin Umrah No.396 Tahun 2021", "Izin Haji No…"). The header has a **Login menu with "Akun Jamaah", "Akun Agen", "Akun Admin"**. Package carousel cards show airline, hotel, departure date and seats. Gallery and testimonials sections, articles, an app download section, bank accounts in the footer, and a floating WhatsApp button. The title uses superlatives ("Terbaik", "Akreditasi A"). |
| Zahara Tour (zaharatour.com) | Hamburger menu on mobile, floating WhatsApp bubble, hero "Aman & Amanah Menuju Baitullah", CTAs "Cek Paket Kami" / "Dapatkan Promo", seasonal package blocks (Ramadhan, Syawal, Juni), "Kenapa Harus Umroh Bersama…". The page title says "Travel Umroh Termurah Jakarta". The WhatsApp prefill lists what the visitor wants (types, nearest dates, estimated cost). |
| Nava Tour (navahajiumroh.com) | Light cream/olive palette. Hero "Travel Umroh Akreditasi A" with two CTAs (packages / WhatsApp). Trust stat cards (Akreditasi A, PPIU Aktif with number, Sejak 2013, "Zero Cancel"). Three tier cards (Reguler/Premium/Plus) with "mulai Rp29,9 Juta". Testimonials, gallery, articles, FAQ accordion, closing consultation band, footer with office, contact and hours. |
| Intrepid Travel (intrepidtravel.com, international departure-based tours) | Mega-menu by destination/"ways to travel", seasonal deals, "Popular trips" cards, a values section, newsletter form (name/email). Departure-date booking pages were not tested in this audit. |

Patterns (verified across ≥ 2 Indonesian sites):
- Licence and accreditation shown prominently near the hero.
- A floating or persistent WhatsApp button.
- A mobile hamburger menu.
- Tiered package presentation (Reguler / Premium / Plus).
- Testimonials and gallery sections.
- Articles for SEO.
- Superlative and promotional claims ("Terbaik", "Termurah", "Zero Cancel").
- One operator exposes **agent and pilgrim accounts from the public header**.

How Hasta differs today:
- It avoids superlatives and gives measurable facts (metres, minutes, three occupancy prices, sold-out shown). This is a credible differentiator and should stay.
- It lacks what competitors use for the next step: a persistent WhatsApp entry on mobile, a mobile menu, a registration path, and account entry points.

Recommendations drawn from this (inspiration, not reproduction):
- Place verifiable licence status near the hero, as text with a verification link, not as a badge image.
- Add a persistent consultation entry on mobile.
- Add "Masuk" for Jamaah and Mitra in V2.
- Keep the restraint: no "terbaik / termurah / zero cancel" style claims.

## 5. Public ↔ workspace integration (facts)

| Concern | Public site | Workspace | Gap |
|---|---|---|---|
| Umrah packages | `content/packages.ts` (static) | `DemoState.packages` seeded **from the same catalogue** at reset, editable, persisted in browser storage | Admin edits never reach the public site |
| Departures | 47 fixture departures with `seatsAvailable` | 8 departures (`UMR-YYMMDD-X`) derived from the first departure of 8 packages, `capacity` 45/25, seats derived from bookings | Different counts, IDs and seat numbers for the same package/date |
| Haji products | `content/haji.ts`: 3 products in USD (Reguler / Eksekutif / Mujamalah) | `content/admin/hajj.ts`: 2 different demo packages ("Amanah 2028", "Keluarga 2029") | Two unrelated catalogues |
| Leads | WhatsApp only; `data-wa-source` attributes, no analytics wired | `leads` with source "Website"; "Leads website" screen states the form isn't connected | No public → lead path |
| Booking / payment / invoice | None | Full demo (booking, installments, PDFs) | No public entry |
| Agent attribution | None (`?ref=` not read) | `jamaah.agentId`; M3.2 plans booking attribution and referral codes | No referral capture |
| Testimonials / articles | Hard-coded homepage quote; no articles | CMS module (`cms`) with testimonials/articles/gallery, explicitly "not published" | Duplicate content model |
| Bank details | `company.bank` (static) | `settings.bank/account/accountHolder` used on invoices | Two sources |
| Terminology | "Umroh", "Haji Khusus" | "Umrah", "Haji Khusus", product type `UMRAH`/`HAJJ_SPECIAL` | Inconsistent across site, PDFs and portal |

Architectural constraint: workspace data lives in each visitor's browser (`localStorage`), and the public site is static. A real cross-visitor integration needs a backend (`docs/FUTURE_BACKEND.md`). For the **demo**, a "same-browser bridge" is possible: the public site writes a lead or registration request into the same browser's workspace store through the workspace's domain functions, so a presenter can submit on the public site and open it in the workspace. Details are in the [Journey doc](HASTA_V2_PUBLIC_JOURNEY.md) §6.

## 6. Loading, empty and error states

| State | Present? | Evidence |
|---|---|---|
| Catalogue empty after filters | Yes, with recovery CTA | `KatalogClient.tsx`, screenshot `desktop-1440/10-paket-empty-state.jpg` |
| Package without upcoming dates | Yes ("Belum ada tanggal…") | `[slug]/page.tsx` |
| Unknown package slug | Default 404 | `notFound()` → unbranded page |
| Unknown public path | Default 404 (English, white) | `09-not-found.jpg` |
| Runtime error | No public `error.tsx` | — |
| Filter flash | Server HTML renders the full list, then applies URL filters after hydration (intentional for SEO). A deep link with filters shows all packages briefly. | `KatalogClient.tsx:51-58` |

## 7. Content risks needing client verification

1. **Regulator naming and verification link**: "SISKOPATUH Kemenag" and `simpu.kemenag.go.id` (see §2.10).
2. **Haji Mujamalah / Furoda**: availability statements and categorisation under "Haji Khusus". Sourcing and the current status of this visa route must come from the client.
3. **Document rules**:
   - "Paspor berlaku minimal 8 bulan" (the workspace uses 6 months).
   - "Surat mahram untuk jamaah perempuan sesuai ketentuan yang berlaku".
   - "Kartu vaksin meningitis".
   These are phrased as fixed rules and must follow the operator's current written requirements.
4. **"Visa umroh dan pengurusan Nusuk"** in facilities: confirm the current process wording.
5. **FAQ "Contoh ketentuan" numbers** (DP Rp 5 jt, pelunasan H-40) do not match workspace behaviour (Hajj milestones; Umrah "DP" label = ≤ Rp 10 jt paid).

## 8. Summary of key facts

- 8 public routes, all static; no registration, status, agent or Haji detail routes.
- WhatsApp is the only conversion mechanism. Messages carry the package and date (good) plus a demo footer line, and go to the studio's real number.
- The mobile header hides most of the navigation and the operator WhatsApp button.
- The trust CTA's target host did not resolve and may reference a superseded institution.
- The public and workspace catalogues diverge for departures and Hajj.

## 9. Screenshot index

All files are JPEG, captured 2026-11-07 from the live demo. `*-fold.jpg` is the first viewport; files without the suffix are full-page.

| # | Page | desktop-1440 | tablet-768 | mobile-390 |
|---|---|---|---|---|
| 01 | Home | `01-home.jpg`, `01-home-fold.jpg` | ✓ | ✓ |
| 02 | Paket Umroh | `02-paket-umroh*.jpg` | ✓ | ✓ |
| 03 | Detail (Umroh Ramah Lansia 12 Hari) | `03-paket-detail*.jpg` | ✓ | ✓ |
| 04 | Haji Khusus | `04-haji-khusus*.jpg` | ✓ | ✓ |
| 05 | Jadwal | `05-jadwal*.jpg` | ✓ | ✓ |
| 06 | FAQ | `06-faq*.jpg` | ✓ | ✓ |
| 07 | Tentang | `07-tentang*.jpg` | ✓ | ✓ |
| 08 | Kontak | `08-kontak*.jpg` | ✓ | ✓ |
| 09 | 404 (`/booking`) | `09-not-found*.jpg` | ✓ | ✓ |
| 10 | Interaction states | `10-paket-empty-state.jpg` | — | `10-paket-filter-open.jpg` |
| 11 | Journey step | `11-detail-date-selected.jpg` (WhatsApp text updated to the chosen date) | — | `11-detail-sticky-cta.jpg` |

Booking-flow screenshots cannot be captured because the flow does not exist (see the Journey doc). The capture script lived in the session scratchpad and was not added to the repository. Re-capture after the redesign with the same widths and page list for before/after comparison.
