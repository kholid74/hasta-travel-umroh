# PUBLIC-02A — Design System & Homepage Refinement

Status: **implemented and tested** (2026-11-08). Direction B "Dua Waktu" applied to the homepage and to shared tokens.
Package detail pages, Haji routes, the admin workspace, PDFs, payments and inventory were not redesigned.

## 1. Summary

- Shared tokens added first (`app/globals.css`): five named colours plus a `.band-light` scope that remaps the existing
  semantic tokens. Components keep using `bg-surface`, `text-ink`, `text-muted`, etc., so the same component renders
  correctly on dark and ivory bands without per-page colour code.
- Homepage rebuilt from ten reusable server/client components in `components/home/`.
- Functional quick finder (month, departure city, package type) using the static fixtures and the PUBLIC-01 Jakarta
  business date; results hand the same filters to the catalogue URL. The catalogue gained a matching **Kota keberangkatan**
  filter, and catalogue cards now show the departure city next to the date.
- Removed from the homepage: the fictional testimonial, the generic "Tentang kami" teaser, eyebrow labels, and the
  crane-dominated Masjidil Haram hero photo.
- Tests: 5 new homepage tests; full suite **60/60 passed twice**; homepage + public specs **57/57 across 3 repeats**.

## 2. Design tokens (Direction B)

### Named colours (`@theme`)

| Token | Value | Use |
|---|---|---|
| `--color-ivory` | `#f4efe4` | Background of light bands |
| `--color-paper` | `#fbf8f1` | Cards and forms on ivory |
| `--color-forest` | `#245b45` | Text accents, links, focus ring and selection on ivory |
| `--color-deep` | `#17211c` | Ink on ivory |
| `--color-control` | `#8a8270` | Form-control borders on ivory (non-text contrast 3.6:1) |

Existing dark tokens (background, surface, ink, muted, hairline, primary amber, onprimary) are unchanged.

### `.band-light` scope

Wrap any section in `<div className="band-light">` and the semantic tokens are remapped:

| Semantic token | Dark (default) | Inside `.band-light` |
|---|---|---|
| `background` | existing dark | `ivory` |
| `surface` | existing dark surface | `paper` |
| `raised` | existing | `#efe8da` |
| `ink`, `secondary` | existing light ink | `deep` |
| `muted` | existing | `#55615a` |
| `hairline` | existing | `#d6cdb9` |
| `accent` | existing | `forest` |
| `success` / `warning` | existing | `#2e6b45` / `#a8432b` |

Also scoped: `color-scheme: light`, caret, `::selection`, `:focus-visible` outline (forest) and form-control borders.
Globally: `color-scheme: dark`, themed scrollbar and caret. A shared `.disclosure` chevron styles `<details>` lists.

Rules: amber (`primary`) is a **button fill only** on ivory (1.8:1 as text — never use it as text there). Do not use
`hover:bg-secondary` on amber buttons inside a light band (secondary becomes dark ink); the homepage uses
`hover:bg-[#f5b54a]`.

### Measured contrast (WCAG 2.x)

| Pair | Ratio |
|---|---|
| ink (deep) on ivory | 14.4:1 |
| muted on ivory / on paper | 5.7:1 / 6.1:1 |
| forest on ivory | 6.9:1 |
| warning on paper | 5.7:1 |
| success on paper | 6.0:1 |
| onprimary on amber | 9.2:1 |
| control border on paper | 3.6:1 |

Typography is unchanged: Instrument Serif for display, Manrope for UI/body. No gradients, illustrations or effects
were added; the only shadow is a soft one on the quick-finder form.

## 3. Final homepage section inventory

| # | Section | Band | Component | Notes |
|---|---|---|---|---|
| 1 | Header / navigation | dark | `components/Header.tsx` (unchanged) | PUBLIC-01 mobile menu kept |
| 2 | Hero | dark | `home/HomeHero.tsx` | Split: headline + copy + CTAs, Masjid Nabawi photo |
| 3 | Legal / anti-fraud strip | dark surface | `home/TrustStrip.tsx` | Fictional PPIU label, company-account rule, link to `/tentang#legalitas` |
| 4 | Quick package discovery | ivory | `home/QuickFinder.tsx` | Month, city, type; open departures only |
| 5 | Featured packages + upcoming departures | ivory | `home/FeaturedDepartures.tsx` | 3 cards + next 6 open dates |
| 6 | Haji Khusus introduction | dark | `home/HajiIntro.tsx` | Queue vs. date explanation, 2 Haji Khusus programmes, CTA |
| 7 | Service benefits | ivory | `home/Commitments.tsx` | Four checkable commitments + distance diagram |
| 8 | Registration journey | ivory | `home/JourneySteps.tsx` | Five numbered steps (sequence carries meaning) |
| 9 | Hotel / location information | ivory | `home/HotelDistances.tsx` | Makkah and Madinah hotels, nearest first; 5 shown, rest in a disclosure |
| 10 | FAQ preview | ivory | `home/FaqPreview.tsx` | 4 questions + link to `/faq` |
| 11 | Final consultation CTA | dark | `home/ClosingCta.tsx` | WhatsApp (operator) + schedule link, one demo note |
| 12 | Footer + Kalsara demo panel | dark | `components/Footer.tsx` (unchanged) | Studio WhatsApp lives only here |

### Deviations from the proposed sequence

- **Haji Khusus is a dark band in the middle of the page.** Direction B keeps dense information on ivory; this band is
  short and editorial, and the change of ground marks the switch from Umrah to a different product. It is the only
  mid-page dark band.
- **Hero photo is beside the text, not behind it.** Text on plain dark ground gives the strongest contrast and needs no
  overlay; the photograph keeps its own frame and credit.
- **Hotel list is truncated to the five nearest per city**, with a disclosure labelled with the count and distance range
  of the rest, so far (and cheaper) hotels are one tap away rather than hidden.
- `components/FeaturedPackages.tsx` (PUBLIC-01, uncommitted) was removed; it had no other users.

## 4. Copy: before → after

| Place | Before | After |
|---|---|---|
| Hero kicker | "Umroh & Haji Khusus" eyebrow | removed |
| Hero headline | Perjalanan Dimulai dari Sebuah Niat. | unchanged (amber italic "Niat") |
| Hero support | "{company} menemani perjalanan ibadah Anda menuju Baitullah, dengan persiapan yang matang dan layanan yang penuh perhatian." | "Pilih paket Umrah dengan informasi yang bisa Anda periksa sendiri: jarak hotel ke masjid dalam meter, perkiraan waktu jalan kaki untuk jamaah lansia, dan harga untuk setiap tipe kamar." |
| Hero primary CTA | Lihat paket | **Lihat Paket Umrah** |
| Hero secondary CTA | Konsultasi via WhatsApp | unchanged (operator audience) |
| Hero disclosure | full WhatsApp demo note | short line "Situs demonstrasi: data travel fiktif, dan WhatsApp terhubung ke nomor contoh." + link to the demo panel |
| Licence strip | "{label} — situs demo, bukan izin sungguhan." | label (already reads "contoh fiktif") + "Pembayaran hanya ke rekening atas nama perusahaan…" + check-licence link |
| Featured | "Tiga paket, tiga jarak" | "Tiga paket, tiga jarak ke Masjidil Haram" + "Paket di katalog ini terutama berbeda pada jarak hotel ke masjid. Bandingkan jaraknya dulu, lalu harganya." |
| About teaser | three paragraphs of general reassurance | removed (no checkable content); benefits now stated as behaviour in section 7 |
| Testimonial | fictional quote "S. R., Bekasi" | removed |
| Haji | not on homepage | "Haji Khusus didaftarkan sebagai antrean, bukan tanggal." + footnoted waiting-time estimates |
| Closing | "Sudah tahu paket mana yang cocok?" | "Belum yakin paket mana yang sesuai?" + who/when/needs prompt |

**Spelling:** homepage-authored copy and the primary CTA use "Umrah" as the brief requires. Navigation labels, route
names and package names in data still read "Umroh". Unifying them is a PUBLIC-02B decision (it touches nav, URLs,
metadata and fixtures).

## 5. Business rules preserved

- Departures are offered only when `date > businessToday()` (Asia/Jakarta), on the server and again in the browser
  after hydration (`useBusinessToday`). The finder, featured cards and upcoming list all use `openDepartures`.
- Seat status is derived from `seatsAvailable`; sold-out dates are shown as such, not hidden. Departure-specific prices
  (`hargaKeberangkatan`) are used everywhere a date is shown.
- Every operator WhatsApp link carries `data-wa-audience="operator"` and ends with the Kalsara demo line; the studio
  link appears once, in the footer demo panel. The full demo note appears once in `<main>` (closing CTA).
- Haji Mujamalah is not listed with Haji Khusus; it is referenced only as a separate path (`/haji-khusus#haji-mujamalah`).
- No licences, testimonials, statistics, guarantees or achievements were added. Waiting times carry an asterisked
  qualification; registration terms are labelled "Contoh ketentuan".

## 6. Photography

- Hero: `masjid-nabawi.jpg` (CC BY 4.0, credited in the caption), cropped toward the dome, minarets and palms.
  Two small distant cranes remain visible at tablet width.
- Haji band: `abraj-al-bait.jpg` (CC BY-SA 4.0), top crop on the clock tower; some cranes at the right edge.
- The previous hero (`masjidil-haram.jpg`) was dropped: red cranes span its sky at every hero crop.
- **Recommended replacement (PUBLIC-02B / client):** a licensed, client-owned or commissioned landscape photograph of
  Masjidil Haram or Masjid Nabawi without construction, at least 2400 px wide. No remote or unlicensed image was used.

## 7. Screenshots

`docs/public_02a/screenshots/before/` and `after/`: `home-{desktop|tablet|mobile}-{fold|full}.png`
(1440×900, 768×1024, 390×844 @2x).

## 8. Tests

Commands (production build served by `next start -p 3100`, test-only session secret):

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx eslint app components lib tests` | pass |
| `npm run build` | pass (`/` static, ISR 1 h) |
| `node lib/katalog.check.ts` | `katalog.ts OK` (adds city-filter assertions) |
| Full Playwright suite, run 1 | **60 passed** — `docs/public_02a/test-run-1.log` |
| Full Playwright suite, run 2 | **60 passed** — `docs/public_02a/test-run-2.log` |
| `home.spec.ts` + `public.spec.ts`, `--repeat-each=3` | **57 passed** — `docs/public_02a/test-public-repeat3.log` |
| `git status docs/samples` | clean (PDF samples unchanged) |

New tests (`tests/home.spec.ts`):

1. Quick finder narrows by month and city, results deep-link to `?d=` in that month, submit opens
   `/paket-umroh?bulan=…&kota=…` and the catalogue selects show the same values; cards show the city.
2. Under a fixed clock of 1 March 2027 (WIB) no past month or date is offered; an empty combination shows the empty
   state, a disabled submit, a schedule link and a working reset.
3. Hero headline and CTA order/targets, operator audience, demo link; Haji CTA → `/haji-khusus`, no Mujamalah in the
   Haji Khusus list, Mujamalah link to its own section; featured cards link to a concrete date and show three prices.
4. No fabricated claims (no testimonial, no "terbaik/termurah/terpercaya/dijamin/garansi/100%"), demo note once in
   `<main>`, no studio CTA in the page body.
5. Mobile 390 px: primary CTA in the first screen, ≥ 44 px tap targets, one sticky bar, menu button, no overflow,
   keyboard-operable FAQ disclosure.

Updated: the PUBLIC-01 date-cutoff test now checks the homepage's date-bearing elements
(`[data-departure-card]`, `[data-upcoming-row]`, `[data-finder-result]`) with a retrying assertion.

One flake was found and fixed during the work: a test read the finder options before the browser re-checked the date.
The finder now exposes `data-hydrated` and the assertions retry.

## 9. Known limitations

- The homepage HTML is regenerated at most hourly (ISR). Between regenerations the hotel list (server-rendered) may
  include a hotel whose last departure closed that day; the finder, featured cards and upcoming list re-check in the
  browser.
- The quick finder's "Jenis paket" uses the three catalogue types; duration is not offered on the homepage (it remains
  in the catalogue) to keep the form to three fields on mobile.
- Cranes remain visible in both photographs (see §6).
- "Umrah" vs "Umroh" is mixed across homepage copy and navigation (see §4).
- The mobile sticky consult bar (PUBLIC-01) overlays content while scrolling, as before; it does not stack with other bars.

## 10. Dependencies for PUBLIC-02B

- Decide the Umrah/Umroh spelling site-wide (nav, routes, metadata, fixtures).
- Apply `.band-light` and the homepage components' patterns to the catalogue, schedule, FAQ, about and contact pages.
- Replace hero/Haji photography with licensed, construction-free images.
- Consider reusing `FeaturedDepartures`' card layout for the catalogue `PackageCard` so both show distance first.
- Optional: run `/impeccable init` to record PRODUCT.md / DESIGN.md from these tokens so later milestones share them.
