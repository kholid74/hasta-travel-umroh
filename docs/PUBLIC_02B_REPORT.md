# PUBLIC-02B — Public Pages Visual, UX & Package Discovery Refinement

Status: **implemented and tested** (2026-11-08). The PUBLIC-02A-R "Sacred Journey — Warm Islamic Editorial"
system, with the approved homepage as reference, now covers the catalogue, package detail, Haji Khusus, schedule,
FAQ, About and Contact pages. No business rule, pricing rule, date rule, route or workspace module changed.

Screenshots: `docs/public_02b/screenshots/before/` (PUBLIC-02A-R state) and `after/`.

## 1. Summary

| Page | Before | After |
|---|---|---|
| `/paket-umroh` | Dark page, text cards, filters in an uppercase grid | Forest intro with arched Nabawi photo. Ivory body with a filter card (type chips + month, city, duration, budget), active-filter chips that can be removed, sort in the results header, photo cards identical to the homepage cards, honest sold-out cards, empty state with reset and schedule link |
| `/paket-umroh/[slug]` | One long dark column; price box and CTA mid-page; 12–14 itinerary days all open | Photo-strip intro with key facts (duration, both hotel distances, price from). Desktop two columns with a sticky summary (selected date, seats, three prices, the one consultation action). Ordered sections: date → prices → hotels → included/excluded → itinerary in 3 expandable stages → requirements → FAQ → legal → closing band |
| `/haji-khusus` | Dark, card-per-programme with mixed facts | Mina photo intro. 3-step "Dari pendaftaran sampai berangkat" with payment timing. Side-by-side programme comparison (price, setoran awal, waiting time*, estimated year*, days, hotels, payment and quota notes, facilities). Requirements, Haji FAQ, Mujamalah on a separate sand band, legal, closing band |
| `/jadwal-keberangkatan` | Dark month lists, no filters | Ivory two-column page: sticky filter card (month, city, type) synced to the URL, months as headings, compact date-tile rows with status and quad price linking to `?d=` |
| `/faq` | Single column of boxed accordions | Topic navigation (chips on phones, sticky list on desktop), grouped disclosure lists, contextual consultation card |
| `/tentang` | Single column | Editorial: star-window photo intro, "why metres" with the distance diagram, "what we show as it is" with photo, guide note, full legal block, closing band |
| `/kontak` | Three link rows | Two primary consultation cards (Umrah, Haji Khusus), two secondary (Badal Umrah, other questions), each with "Lihat isi pesan" preview. Office and hours (labelled as demo), a note pointing studio enquiries to the demo panel, account and anti-fraud block |
| Mobile sticky bar | Fixed bar with an `h-20` spacer after the footer; covered content; no safe area | One shared `StickyBar` shell: hides over page CTAs, the closing band and the footer; `inert` when hidden; `env(safe-area-inset-bottom)`; `scroll-padding-bottom` while shown; no spacer |

## 2. Shared pieces (reuse, not a new system)

- `components/public/ui.tsx` contains:
  - `PageIntro`, the forest intro. Variants: `lengkung` (arched photo, catalogue/about), `lebar` (photo strip,
    detail/Haji) and text-only (schedule/FAQ/contact). The photo credit is printed automatically.
  - `JudulBagian` (gold star rule + heading), `PenutupKonsultasi` (closing band, a sticky-hide zone),
    `CatatanDemo` (one demo line per page), `KreditFoto`.
  - `LABEL_TIPE` (Umrah Reguler/Plus/Ramadhan), `labelKursi` / `StatusKursi` (Tersedia · Sisa n kursi · Penuh).
  - `fotoPaket` (destination photo by package id), `tanggalPendek`.
- `components/PackageCard.tsx` is shared by the homepage and the catalogue. The markup is identical to the
  approved homepage card. The homepage `FeaturedDepartures` now renders it, keeping `data-departure-card`, its
  photos and its swipe row.
- `components/StickyBar.tsx` is the single sticky-action shell, used by `MobileConsultBar` and the detail page.
- Tokens, bands (`.band-light`, `.band-sand`) and the three motifs from PUBLIC-02A-R are used as they are. The
  only CSS added is the sticky scroll-padding rule.

## 3. Catalogue (`/paket-umroh`)

- **Filters:** type, month, departure city, duration and budget per person (room for 4), plus sort. All are read
  from and written to the URL with the existing keys (`tipe`, `bulan`, `kota`, `durasi`, `maks`, `sort`), so
  homepage finder links and shared links keep working. On phones the filter card opens behind a
  "Filter (n aktif)" toggle.
- **Discovery hierarchy:**
  - The results header shows the count ("n paket cocok dengan pilihan Anda").
  - Active-filter chips each remove one filter, and "Hapus semua filter" resets everything.
  - Sort sits on the right.
- **Cards:**
  - Destination photo and duration · type chip.
  - Name, then date and city with seats.
  - Makkah hotel distance and walking minutes.
  - Quad price as the headline, with triple and double beneath.
  - "Lihat detail".
- **Sold out:** a sold-out matching date shows a "Tanggal ini penuh" badge, "Penuh" status, and either "Pilih
  salah satu dari n tanggal lain di halaman detail" or a prompt to ask about the next schedule. The package
  stays explorable.
- **Logic:** filtering is unchanged (`lib/katalog.ts`), and so are PUBLIC-01 date rules (server ISR plus
  browser re-check).
- **Empty state:** explains the next step, with "Hapus semua filter" and "Lihat jadwal keberangkatan".
- **Photo credits:** the card photos are credited at the bottom of the page.

## 4. Package detail (`/paket-umroh/[slug]`)

- **State:** a `DetailProvider` (client) holds the selected departure for the intro "Mulai" price, date picker,
  price table, desktop summary, mobile sticky bar and closing band. Server sections are passed in as children.
  `?d=` handling is unchanged: past or unknown dates are explained, the nearest open date is shown, and the URL
  is corrected.
- **Hierarchy:**
  1. Intro: photo strip, breadcrumb, name, type · duration, and the key facts (duration, both hotel distances,
     price from).
  2. Pilih keberangkatan: date buttons with city and seat label, plus a summary (date, city, airline, seats).
  3. Harga per orang: three room types in full rupiah.
  4. Hotel dan jarak ke masjid.
  5. Yang termasuk dan tidak, plus the guide note.
  6. Rencana perjalanan: three stages (Berangkat dan Madinah / Makkah dan ibadah Umrah / Pulang ke Tanah Air),
     first stage open. Every day keeps its title and description; stages are detected from day titles, with a
     single-stage fallback.
  7. Syarat pendaftaran.
  8. FAQ.
  9. Legal (compact).
  10. Closing consultation band.
- **One action at a time:**
  - Desktop (≥ 1024 px): the sticky sidebar holds the consultation button.
  - Below 1024 px: the date-aware sticky bar holds it.
  - The closing band has its own button, and the sticky bar hides while the band is on screen.
  - The in-flow price section no longer carries a duplicate button.
- **Sold-out date:**
  - A "sudah penuh" notice says details can be browsed but registration needs a date with seats.
  - Up to two open alternatives are offered as buttons.
  - The action becomes "Tanya tanggal lain".

## 5. Haji Khusus (`/haji-khusus`)

- The intro explains that Haji Khusus is registered as a queue, not booked by date. Its CTAs are "Bandingkan
  program" and "Tanya masa tunggu".
- **Registration and payment stages:**
  1. Setoran awal & nomor porsi (deposit amounts from data).
  2. Masa tunggu & cicilan.
  3. Pelunasan & keberangkatan.

  Each stage is supported by the existing `installmentNote` / `quotaNote` text.
- **Programme comparison:** two cards side by side (stacked on phones), each showing:
  - Price and setoran awal.
  - "± n tahun*" and estimated year*.
  - Days, both hotels with distance, payment and quota notes, and facilities (expandable).
  - Its own WhatsApp action.

  The footnote states the figures are demo estimates and that no travel can promise a departure year.
- **FAQ:** `faqHaji` in `content/haji.ts` has four questions. The answers only restate text already in the data
  and on the page (quota, USD and exchange rate, instalments, the Mujamalah difference); no new regulatory claim.
- **Mujamalah:** a separate sand band keeps its heading ("Haji Mujamalah — jalur terpisah"), the "Contoh
  tampilan" note, its own card (no porsi number, visa not guaranteed) and its own WhatsApp message.
- **Haji detail routes:** none added. Recommendation for PUBLIC-02C: `/haji-khusus/[slug]` only if programmes
  grow beyond two or need itineraries.

## 6. Schedule (`/jadwal-keberangkatan`)

- Filters: month, departure city and package type, in the URL (`bulan`, `kota`, `tipe`, the same keys as the
  catalogue). On phones they open behind a "Saring" toggle.
- Grouped by month.
- **Rows:** a date tile (day number, weekday), the package, then "dari {city} · airline · duration · distance",
  the seat label and the quad price. Each links to `/paket-umroh/{slug}?d={date}`; the detail page opens with
  that date selected (tested).
- Past dates are never listed; the server filter and browser re-check are unchanged. Full dates stay visible as
  "Penuh".

## 7. FAQ, About, Contact

- **FAQ:**
  - Five topic groups from the existing `topik` field. Topic chips or sidebar link to each group.
  - Disclosure accordions using native `<details>`, which work with the keyboard.
  - Consultation card with WhatsApp and a link to the catalogue.
- **About:**
  - Same facts as before, re-laid out. "Sold Out" became "Penuh".
  - No team, office photos, achievements or testimonials.
  - Licence text is still marked "contoh fiktif".
- **Contact:**
  - Umrah, Haji Khusus, Badal Umrah and "Pertanyaan lain" each send their own operator message. A new `lainnya`
    WhatsApp context was added to `lib/whatsapp.ts`; the existing contexts are unchanged apart from the wording
    update in §8.
  - Each card can preview its message.
  - Studio (Kalsara) sales stay in the footer demo panel; the page only points to it.
  - The address appears once (the legal block hides its duplicate via `tanpaKantor`).

## 8. Terminology and copy

| Item | Before | After |
|---|---|---|
| Navigation / footer / 404 / catalogue title | "Paket Umroh", "Lihat paket Umroh" | "Paket Umrah", "Lihat paket Umrah" (route `/paket-umroh` unchanged) |
| Type labels | "Umroh Reguler / Plus / Ramadhan" (uppercase eyebrow) | "Umrah Reguler / Plus / Ramadhan"; chip "12 hari · Reguler" |
| Seat status | "Sold Out", "Sisa n seat", "sold out" | "Penuh", "Sisa n kursi", "Tersedia" (`LABEL_STATUS["sold-out"]` → "Penuh"; public-only) |
| Room types | "Sekamar berempat (quad)" | "Kamar ber-4 (quad)" etc. |
| Detail CTA | "Tanya paket ini via WhatsApp" + "Tanya paket ini" (sticky) | "Konsultasi paket ini" (sidebar and closing) / "Konsultasi" (sticky); sold-out: "Tanya tanggal lain" |
| Catalogue budget filter | "Harga maksimum (quad)" | "Anggaran per orang (kamar ber-4)" |
| FAQ | "mengunci seat", "ketersediaan seat", "Badal Umroh", "paket umroh biasa" | "mengunci kursi", "ketersediaan kursi", "Badal Umrah", "paket Umrah biasa" |
| WhatsApp templates | "konsultasi paket Umroh", "Badal Umroh" | "konsultasi paket Umrah", "Badal Umrah"; new "Assalamu'alaikum, saya ingin bertanya:" |
| Schedule intro | (none) | "Semua tanggal Umrah yang masih bisa didaftar, per bulan…" |
| Haji intro | "…halaman ini menampilkan perkiraan masa tunggu…" | "…menuliskan masa tunggu sebagai perkiraan, bukan janji." |

Not renamed (business data and identifiers):
- Package names ("Umroh Hemat 9 Hari" …) and itinerary day titles ("Umroh Pertama") from
  `content/packages.ts` and `content/itinerary.ts`.
- Slugs and the `/paket-umroh` route.
- The demo footer line inside WhatsApp messages ("bukan biro perjalanan umroh/haji"), which a PUBLIC-01 test
  asserts.

## 9. Assets

No new image files. All images are reused from `content/photos.ts` (sources and licences in
`docs/public_02a_r/asset-metadata.json`):

| Photo | Licence | Used on (new in 02B) |
|---|---|---|
| Kubah Hijau (TheHadiRahim) | CC0 | Catalogue intro (arched); package cards |
| Pintu Ka'bah (Richard Mortel) | CC BY 2.0 | Package cards; detail intros (by package id) |
| Pelataran Nabawi (King Eliot) | CC BY-SA 4.0 | Package cards; detail intros; About |
| Tenda Mina (Arisdp) | CC BY-SA 3.0 | Haji intro |
| Nabawi dari jendela bintang (Adli Wahid) | CC BY-SA 4.0 | About intro (arched) |

Each page credits its photos:
- Intro photos are credited by `PageIntro`.
- Card photos are credited in the catalogue's "Kredit foto" line (and the homepage's, as before).
- The About-page photo has a caption.

Destination photos never stand in for a partner hotel.

## 10. Mobile sticky action

| Requirement | Implementation |
|---|---|
| No overlapping bottom actions | One bar per page: `MobileConsultBar` returns nothing on package detail, which renders its own `StickyDetail`. Both use `StickyBar`. |
| Safe area | `viewport-fit=cover` (exported from the public layout only) + `pb-[env(safe-area-inset-bottom)]` |
| Scroll clearance | While shown: `html { scroll-padding-bottom: 5.5rem/6rem + safe area }`, so keyboard focus and anchors stop above the bar (tested: a focused schedule row ends above the bar). |
| No covered page end / no spacer | The bar hides over `[data-sticky-hide]`: footer, homepage hero CTAs and closing, detail closing band, Haji intro CTAs, contact cards, FAQ closing card. The old `h-20` spacer below the footer is gone (tested: the footer ends at the document end). The footer's `mt-16` gap was removed too. |
| Focus when hidden | `inert` + `aria-hidden`; moved off-screen with a 200 ms transform (disabled under reduced motion by the global rule) |
| Context | Detail bar: short date · city · seat label, quad price "/orang · ber-4", and "Konsultasi" (or "Tanggal lain" when the date is full). The WhatsApp text carries the package, date and city. |

Evidence: `after/sticky-1…7*.png`. The run printed these states:

| Situation | Bar state |
|---|---|
| Schedule, mid-page | shown |
| Schedule, footer in view | hidden |
| Detail, top | shown |
| Detail, itinerary stage open | shown |
| Detail, closing band in view | hidden |
| Homepage hero | hidden |
| FAQ at 390×600 | shown |

## 11. Tests

Production build (`next build`) served by `next start -p 3100` with the test-only session secret.

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npx eslint app components lib tests` | pass |
| `npm run build` | pass |
| `node lib/katalog.check.ts` / `node lib/format.check.ts` | `katalog.ts OK` / `format.ts OK` |
| `public_02b` + `public` + `home` specs, `--repeat-each=3` | **99 passed** — `docs/public_02b/test-public-repeat3.log` |
| Full Playwright suite (admin regression + all public), run 1 | **74 passed** — `docs/public_02b/test-run-1.log` |
| Full Playwright suite, run 2 | **74 passed** — `docs/public_02b/test-run-2.log` |
| `git status docs/samples` | clean (invoice/receipt PDF samples unchanged) |

The suite grew from 62 to 74 tests. None were skipped: the fixtures contain an open sold-out departure and an
impossible Plus-under-30 jt combination, so the sold-out and empty-state tests ran their full paths.

New `tests/public_02b.spec.ts` (12 tests):

1. Catalogue filter combinations from the URL match `saring()` on the fixtures (card order included). Removing a
   chip updates the URL. Sort is written to the URL and orders by the departure quad price. Reload keeps it.
2. Impossible combination → empty state with a working reset and schedule link.
3. Price consistency: catalogue card = detail table (quad/triple/double) = desktop summary = mobile sticky bar =
   `hargaKeberangkatan` for that date.
4. Sold-out date: honest notice, "Penuh" in the summary, "Tanya tanggal lain", and an alternative date updates
   the URL and the action.
5. Itinerary: 3 stages, first open, every day present with its title, a stage opens by keyboard. Date chips
   work by keyboard. WhatsApp text in the sidebar, sticky bar and closing band follows the selected date and city.
6. Haji Khusus vs Mujamalah separation, the "*" qualification, the footnote, and no guarantee wording.
7. Schedule: city/type filters in the URL, counts match the fixtures, empty state reset, and a row opens the
   detail with that date selected.
8. Contact: four operator messages with distinct context, the preview text equals the message, and the studio
   CTA only appears in the demo panel.
9. Terminology: "Paket Umrah" in navigation; no "Sold Out" / "seat" in public page bodies.
10. Mobile sticky: viewport-fit, one bar, focused row clears the bar, hidden + inert at the footer, no spacer.
    On detail: one bar, hidden over the closing band, never covering an opened itinerary day.
11. Homepage bar waits until the hero CTAs scroll away.
12. No horizontal overflow at 390 / 768 / 1440 on the refined pages with filters applied.

Updated in `tests/public.spec.ts`: navigation label "Paket Umrah"; 404 link "Lihat paket Umrah"; catalogue
type check uses the new chip ("n hari · Plus"); the date-chip label parser accepts the two-part chip.

## 12. Page heights (CSS px)

| Page | Desktop before → after | Mobile before → after |
|---|---|---|
| Catalogue | 3,522 → 5,333 | 8,579 → 10,706 |
| Package detail | 4,742 → 5,778 | 7,490 → 7,840 |
| Haji Khusus | 3,441 → 5,478 | 5,668 → 8,196 |
| Schedule | 5,493 → 5,161 | 8,556 → 7,570 |
| FAQ | 2,067 → 2,338 | 2,918 → 3,329 |
| About | 3,207 → 3,368 | 4,380 → 5,124 |
| Contact | 2,103 → 2,583 | 3,306 → 4,388 |

Pages grew mainly from photography and added content: Haji comparison, payment stages and FAQ; contact message
previews; catalogue photo strips. The schedule got shorter. On phones the catalogue uses a shorter 16:7 photo
strip and tighter padding.

## 13. Known limitations

- The catalogue on phones is still long with all 18 packages (10.7k px). Filters and sort sit above the list;
  pagination or "load more" is a PUBLIC-02C option.
- Package names and itinerary titles still read "Umroh" (business data, deliberately not renamed).
- Destination photos rotate across three images by package id; there are no package- or hotel-specific photos
  (client assets needed).
- The Haji FAQ answers restate existing demo content. A real operator must review them before production.
- `viewport-fit=cover` is set for public pages only; the admin workspace keeps the default viewport.
- The detail sidebar appears at ≥ 1024 px. Tablets (768) use the sticky bar, like phones.

## 14. Recommendations for PUBLIC-02C

1. Catalogue: "Muat lebih banyak" after 9 cards on phones, or a compact list/grid toggle.
2. Decide whether package names in data move to "Umrah" (requires a data migration note for the workspace).
3. Hotel detail content per partner hotel (photos, room types) once client assets exist.
4. Optional `/haji-khusus/[slug]` pages if programmes gain itineraries.
5. A pre-registration step (PUBLIC-03) can attach to the detail sidebar and sticky bar without layout changes;
   both already carry the selected departure.
