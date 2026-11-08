# PUBLIC-02A-R — Sacred Journey Visual Identity & Homepage Refinement

Status: **implemented and tested** (2026-11-08). A visual and storytelling refinement of the PUBLIC-02A homepage,
not a rebuild. Quick-finder behaviour, URL filters, PUBLIC-01 date rules, WhatsApp audiences, routes, admin,
PDFs, payments and inventory are unchanged.

Before = PUBLIC-02A final state (`docs/public_02a_r/screenshots/before/`). After = this milestone
(`docs/public_02a_r/screenshots/after/`).

## 1. What changed, in one paragraph

The near-black frame became **deep forest green**, the action colour became **muted gold**, and reading
bands alternate **warm ivory** and **sand**. Six licensed photographs of Makkah, Madinah and Mina now carry
the story: the hero is a wide photograph of the Ka'bah with the headline on an arched forest panel below it.
Three restrained motifs (an eight-point star pattern, an arched frame and a gold star rule) recur through the
page. Featured packages became photo cards. Upcoming departures shrank to four date tiles. Haji Khusus moved
from a black band to a sand editorial split. Service benefits became an icon list taken from the package
facilities, and the journey became a timeline. The hotel list gained a distance ruler. Copy was rewritten
for a pilgrim or family member.

## 2. Visual direction and tokens

### Palette (`app/globals.css`)

| Role | Token | Value | Notes |
|---|---|---|---|
| Brand frame (header, hero, closing, footer) | `background` / `surface` / `raised` | `#113126` / `#18392d` / `#1f4335` | Replaces near-black `#0c1210` site-wide |
| Text on frame | `ink` / `muted` | `#f4efe4` / `#b8c7bd` | 12.3:1 / 8.0:1 |
| Action (button fill) | `primary` / `primary-hover` | `#e3b35a` / `#ecc274` | Muted gold; replaces saturated amber `#f0a62b` |
| Text on gold | `onprimary` | `#13261d` | 8.2:1 |
| Gold text on frame | `accent` | `#e3b35a` | 7.3:1 |
| Main content background | `ivory` | `#f6f1e6` | via `.band-light` |
| Cards and forms on ivory | `paper` | `#fdfaf3` | |
| Rhythm band (no form controls) | `sand` | `#eadfc6` | via `.band-sand` |
| Identity accent on light | `emerald` | `#1d6b4f` | 5.7:1 ivory, 4.9:1 sand |
| Gold text on light | `gold-ink` | `#7a5c1c` | 5.5:1 ivory, 4.7:1 sand |
| Gold hairlines / ornaments on light | `champagne` | `#d8c9a3` | decorative only |
| Ink on light | `deep` | `#17211c` | 14.4:1 ivory |
| Form control border on light | `control` | `#8a8270` | 3.6:1 on paper |

`.band-light` and `.band-sand` remap the semantic tokens (background, surface, ink, muted, hairline, accent,
success, warning), so shared components need no forks. Status colours on light: success `#2e6b45` (6.1:1),
warning `#a8432b` (5.8:1 paper, 4.5:1 sand). On the frame: success `#7fd1a8` (7.8:1), warning `#ff9a7d` (6.8:1).

**Why the frame colour changed globally.** The header and footer are shared by every public page. A forest
header on the homepage and a black one elsewhere would split the brand, so the dark tokens changed at the
token level. Other public pages keep their dark layout and now render on forest (spot-checked in
`docs/public_02a_r/screenshots/other-pages/`). The admin workspace uses its own `--a-*` tokens and is
unaffected. Moving those pages to ivory is PUBLIC-02B.

### Motifs (three, restrained)

| # | Motif | Implementation | Where | Rule |
|---|---|---|---|---|
| 1 | Eight-point star (khatam) pattern | `.motif-bintang` (light) and `.motif-bintang-gelap` (forest): inline SVG tile, 18–22 % stroke opacity | Panel behind the quick-finder card; panel behind the closing photo | Never behind text; only on decorative panels offset behind a card or photo |
| 2 | Arched frame | `.bingkai-lengkung` (semicircular top) and an elliptical arch on the hero panel | Hero headline panel (with inner gold hairline), Haji photo, closing photo | Max one arch per section |
| 3 | Gold star rule | `<Ornamen/>` in `components/home/Motif.tsx` | Above each section heading | Decorative (`aria-hidden`); not between body lines |

No Arabic calligraphy was added as decoration. Calligraphy visible inside photographs (the Kiswah) is part of
the photograph.

### Homepage design rules (for PUBLIC-02B and later)

1. Forest frame for brand moments (header, hero, closing, footer). Never more than two consecutive dark bands.
2. Ivory for anything people compare or fill in; sand only for rhythm bands without form controls.
3. Gold is a button fill or a hairline. As text on light surfaces, use `gold-ink`.
4. Emerald is the text-link and icon colour on light surfaces.
5. Photographs: licensed, self-hosted in `public/foto/`, registered in `content/photos.ts`, credited on the page.
   Do not label people in photographs as this travel's pilgrims.
6. Do not repeat metre distances outside the featured cards and the hotel section.
7. One Lucide icon set, stroke 1.6–1.75, emerald on light.
8. Section spacing: `pt-16` on phones and `pt-28` from `sm` up. Headings `text-3xl` → `sm:text-[2.75rem]`.

## 3. Photography and licence inventory

All files were downloaded from Wikimedia Commons, resized for the web and saved under `public/foto/` (no hotlinking,
no content edits). Licences were read from the Commons API `extmetadata`
(`docs/public_02a_r/asset-metadata.json`). Every photo is credited on the page: in a caption, and in the
"Kredit foto" line at the end of the closing section.

| File | Subject | Author | Licence | Size | Used in |
|---|---|---|---|---|---|
| `kaaba-haji.jpg` | Ka'bah during Hajj, wide | Adli Wahid | CC BY-SA 4.0 | 2400×1679 | Hero; Makkah hotel card strip |
| `kaaba-dekat.jpg` | Ka'bah door, close | Richard Mortel | CC BY 2.0 | 1600×1200 | Featured card 1 |
| `nabawi-payung.jpg` | Nabawi courtyard umbrellas | King Eliot | CC BY-SA 4.0 | 1600×1200 | Featured card 2; services |
| `nabawi-kubah-hijau.jpg` | Green Dome, wide | TheHadiRahim | CC0 | 2000×1333 | Featured card 3; Madinah hotel card strip |
| `mina-tenda.jpg` | Mina tent city at night | Arisdp | CC BY-SA 3.0 | 1800×1200 | Haji Khusus |
| `nabawi-jendela-bintang.jpg` | Green Dome through a star-shaped window | Adli Wahid | CC BY-SA 4.0 | 1200×1766 | Closing CTA |

Source pages: see `sumberUrl` in `content/photos.ts`.

Selection rules applied:
- Construction cranes excluded. Candidates with cranes, such as *Masjid al-Haram 2022* and the existing
  `masjidil-haram.jpg`, were rejected.
- Watermarked images excluded.
- Close-up identifiable faces excluded, such as an Arafat portrait.
- Crowds appear only at a distance, and nobody is labelled as a customer.

Featured-card photos show places every package visits, not the package's hotel. Alt text describes the place only.

Existing files `masjidil-haram.jpg`, `masjid-nabawi.jpg` and `abraj-al-bait.jpg` are kept. `masjid-nabawi.jpg` is
still used on `/tentang`. The other two are no longer referenced by any page; they stay in the repository with
their metadata in `content/photos.ts` and can be removed in PUBLIC-02B.

**Remaining gaps.** None blocks this milestone.

| Gap | Needed asset |
|---|---|
| Hotel imagery | Client-owned photos of each partner hotel (exterior, room, route to the mosque). The site deliberately shows no hotel photos rather than wrong ones. |
| Authentic Hasta travel moments | Client photos of manasik sessions, airport briefing and group guidance, with consent. These replace the generic courtyard photo in "Didampingi sejak manasik sampai pulang". |
| Client licence | Before production, replace CC BY-SA images with client-owned photos, or keep the attribution line. CC BY-SA allows commercial use with attribution. |
| Hero resolution | The hero is 2400 px wide; a client 3200 px+ landscape original would be sharper on large retina screens. |

## 4. Final homepage sequence

| # | Section | Band | Component |
|---|---|---|---|
| 1 | Header | forest | `Header.tsx` (unchanged; recoloured by tokens) |
| 2 | Hero: Ka'bah photo, arched headline panel, CTAs, demo line, Haji Khusus pointer (desktop) | forest | `home/HomeHero.tsx` |
| 3 | Legal / anti-fraud strip | sand | `home/TrustStrip.tsx` |
| 4 | Quick finder ("Kapan Anda ingin berangkat?") | ivory + star panel | `home/QuickFinder.tsx` |
| 5 | Featured Umrah packages (photo cards) + 4 upcoming-date tiles | ivory | `home/FeaturedDepartures.tsx` |
| 6 | Haji Khusus editorial split (Mina photo, 3-step registration, 2 programmes) | sand | `home/HajiIntro.tsx` |
| 7 | Services ("Didampingi sejak manasik sampai pulang") | ivory | `home/Commitments.tsx` |
| 8 | Registration timeline (5 steps) | ivory | `home/JourneySteps.tsx` |
| 9 | Hotel distances: Makkah and Madinah cards with distance ruler | sand | `home/HotelDistances.tsx` |
| 10 | FAQ ("Yang sering ditanyakan keluarga") | ivory | `home/FaqPreview.tsx` |
| 11 | Closing CTA + photo credits | forest | `home/ClosingCta.tsx` |
| 12 | Footer + Kalsara demo panel | forest | `Footer.tsx` (unchanged) |

Shared pieces: `home/Motif.tsx` (`Ornamen`, `Kredit`).

### Section notes

- **Hero.** The photo is crop-tuned per breakpoint (`object-[50%_40%]`, desktop `50%_64%`), so the arched panel
  sits below the Ka'bah at 390, 768 and 1440 px. There is no overlay and no gradient; the text sits on a solid
  panel. Both CTAs are inside the first 900 px on desktop and the first 844 px on mobile (tested).
- **Featured cards.** Each card has a photo, a duration/type chip, the name, the date with city and seat status,
  and the Makkah hotel with distance and walking minutes. The price is shown as quad (headline), with triple and
  double beneath, plus a "Lihat detail" action. On phones and tablets the cards form a swipe row with the next
  card peeking in; all three stay in the DOM and the reading order.
- **Upcoming departures.** Reduced from 6 rows to 4 compact date tiles, plus the "Jadwal lengkap" link.
- **Haji Khusus.** Sand band instead of black. The three registration steps state that the year follows the
  annual quota. Waiting times carry an asterisk and a "contoh demo" note. Mujamalah is linked as a separate path.
- **Services.** Six items, each from `FASILITAS` in `content/packages.ts` or a rule the site enforces (route and
  step-free disclosure). No metre figures here.
- **Timeline.** Vertical with a connector on phones; horizontal with connector and icon discs on desktop. One
  short line per step; demo terms are marked "Contoh".
- **Hotels.** A linear-scale ruler (decorative, `aria-hidden`; the list carries the data), then the nearest
  hotels: 3 on phones, 5 from `sm`. The rest sit in a disclosure that states the count and distance range.
  Walking time uses the existing 50 m/min formula; no amenities were added.

## 5. Copy changes

| Place | Before (PUBLIC-02A) | After |
|---|---|---|
| Hero support | "Pilih paket Umrah dengan informasi yang bisa Anda periksa sendiri: jarak hotel ke masjid dalam meter, perkiraan waktu jalan kaki untuk jamaah lansia, dan harga untuk setiap tipe kamar." | "Kami bantu Anda dan keluarga menyiapkan Umrah dengan tenang: paket yang jelas biayanya, hotel yang jaraknya ke masjid tertulis, dan pembimbing yang menemani dari manasik sampai pulang." |
| Hero demo line | "Situs demonstrasi: data travel fiktif, dan WhatsApp terhubung ke nomor contoh." | "Situs demonstrasi: data travel fiktif, WhatsApp ke nomor contoh." |
| Hero (desktop) | none | "Berencana Haji Khusus? Pendaftarannya lewat antrean nomor porsi, bukan tanggal." → `/haji-khusus` |
| Finder heading | "Cari keberangkatan Umrah" | "Kapan Anda ingin berangkat?" |
| Featured heading | "Tiga paket, tiga jarak ke Masjidil Haram" | "Paket Umrah pilihan" + "Tiga paket dengan karakter berbeda: hotel paling dekat untuk orang tua, pilihan hemat, dan hotel bintang lima." |
| Card price | Quad / Triple / Double grid | "Mulai, per orang · kamar ber-4" + "Kamar ber-3 … · ber-2 …" |
| Haji heading | "Haji Khusus didaftarkan sebagai antrean, bukan tanggal." | "Haji Khusus: mendaftar antrean, bukan memilih tanggal" + 3 steps |
| Benefits | "Kenapa jarak kami tulis dalam meter" + 4 paragraphs on metres | "Didampingi sejak manasik sampai pulang" + 6 short facility items |
| Journey | 5 steps with 1–2 sentence paragraphs | 5 steps, one line each |
| Hotels heading | "Hotel yang kami pakai, diurutkan dari yang terdekat" | "Seberapa dekat hotelnya ke masjid?" |
| FAQ heading | "Yang paling sering ditanyakan" | "Yang sering ditanyakan keluarga" |
| Closing heading | "Belum yakin paket mana yang sesuai?" | "Siap meniatkan perjalanan ke Tanah Suci?" + "…tanpa harus memutuskan hari ini." |
| Catalogue cards | date only | date and departure city (PUBLIC-02A, unchanged here) |

New copy uses "Umrah". Route names, navigation and package names still read "Umroh" (PUBLIC-02B decision).
No testimonials, licences, statistics, guarantees or religious claims were added.

## 6. Evaluation (brief §10)

| Question | Answer |
|---|---|
| 1. Immediately an Umrah/Hajj site? | Yes. The first screen is the Ka'bah during tawaf at every width, and Madinah and Mina appear further down. |
| 2. Warmer, less near-black? | Yes. Near-black is gone. Forest appears only in the hero, closing and footer (about 30 % of desktop height); ivory and sand carry the rest. |
| 3. Islamic accents restrained? | Three motifs, low contrast, never behind body text, at most one arch per section. |
| 4. Stronger hierarchy? | Photo → arched headline → gold CTA. Section headings are larger and share one ornament. Card prices are the largest number on each card. |
| 5. Discovery and CTAs straightforward? | Finder behaviour unchanged (tests pass). Hero CTA order unchanged: catalogue first, WhatsApp second. |
| 6. Mobile more varied? | Bands alternate forest → sand → ivory → sand → ivory → sand → ivory → forest, with photographs in five sections, a swipe row and a timeline. Total height 12,218 CSS px vs 12,348 before (−1 %), despite six added photographs. |
| 7. Hasta still recognisable? | Same logo, Instrument Serif + Manrope, headline, gold accent (muted) and green, now the dominant brand colour, as in the PDFs and workspace. |

Page heights (CSS px): desktop 7,250 → 8,147 (photo-led sections are taller); tablet 9,793 → 11,459; mobile
12,348 → 12,218.

## 7. Tests

All results below come from the final production build (`next build`), served by `next start -p 3100` with the
test-only session secret.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx eslint app components lib tests` | pass |
| `npm run build` | pass (`/` static, ISR 1 h) |
| `node lib/katalog.check.ts` | `katalog.ts OK` |
| Full Playwright suite (admin regression + public + homepage), run 1 | **62 passed** — `docs/public_02a_r/test-run-1.log` |
| Full Playwright suite, run 2 | **62 passed** — `docs/public_02a_r/test-run-2.log` |
| `home.spec.ts` + `public.spec.ts`, `--repeat-each=3` | **63 passed** — `docs/public_02a_r/test-public-repeat3.log` |
| `git status docs/samples` | clean (PDF samples unchanged) |
| Horizontal overflow at 390 / 768 / 1440 | none (`scrollWidth` = viewport) |

The suite grew from 60 to 62 tests (two new homepage tests below).

Screenshots in `docs/public_02a_r/screenshots/`:
- `before/` and `after/`: `home-{desktop|tablet|mobile}-{fold|full}.png`
- `after/section-{finder|featured|haji|services|journey|hotels|faq|closing}-{desktop|mobile}.png`. In mobile
  section crops the sticky bar is hidden so it does not cover content.
- `other-pages/`: catalogue, detail, Haji, schedule and about at 1440 px after the palette change.

New or changed tests in `tests/home.spec.ts`:

- Featured cards: quad headline plus triple/double lines, one photo per card.
- **New:** every homepage `<img>` is served from `/public/foto/` (no remote URLs), and the credit line has a
  Commons source link and a licence link for each photo.
- **New:** hotel section shows 3 rows per city at 390 px and 5 at 1440 px; opening the disclosure reveals
  exactly the stated number of extra hotels.

Unchanged and still passing: quick-finder filters and URL handoff, no past dates, empty state, hero CTA order
and targets, Haji Khusus path and Mujamalah separation, no fabricated claims, a single demo note, mobile fold
and tap targets, sticky bar, keyboard FAQ, and all PUBLIC-01 and admin regression tests.

## 8. Remaining visual gaps

- Other public pages (catalogue, detail, Haji, schedule, FAQ, about, contact) show the forest frame but still use
  the dark content layout; they have no ivory bands, motifs or photographs yet.
- No partner-hotel or authentic Hasta trip photography exists (see §3).
- The hero photo is reused as the Makkah hotel strip and the Green Dome photo as the Madinah strip. Distinct
  photos would be better once client assets exist.
- The mobile sticky consult bar (PUBLIC-01) still overlaps the bottom 90 px of content while scrolling. It never
  stacks with other bars, and the homepage hero CTAs sit above it in the first screen.
- The tablet page (11,459 px) is longer than before because photo cards and editorial splits stack at 768 px.

## 9. Recommendation for PUBLIC-02B

1. Apply `.band-light` / `.band-sand`, `Ornamen` and the section spacing rules to the catalogue, package
   detail, Haji, schedule, FAQ, about and contact pages, keeping the forest frame for page heroes only.
2. Reuse the featured-card anatomy (photo, date and status, distance line, quad headline price) for
   `PackageCard` in the catalogue.
3. Decide the Umrah/Umroh spelling site-wide (navigation, routes with redirects, metadata, fixtures).
4. Request client assets: partner-hotel photos, manasik and departure-day photos with consent, and a
   high-resolution hero original.
5. Add per-page hero photographs, such as the Haji page with Mina/Arafat or the detail page with the package's
   Makkah hotel area, under the same licence workflow.
6. Optional: record these rules in DESIGN.md (`/impeccable document`) so later milestones share one source.
