# PUBLIC-02C — Final Public UX, Content & Showcase Polish

Status: **implemented and tested** (2026-11-08). This is a focused refinement on top of PUBLIC-02B; the
"Sacred Journey — Warm Islamic Editorial" system is unchanged. No business, pricing, date, WhatsApp-destination,
admin or PDF logic was touched.

Screenshots:
- `docs/public_02c/screenshots/before/` (PUBLIC-02B state) and `after/`, named `{page}-{width}-{fold|full}.png`.
- Widths: catalogue 360/390/768/1440; About 390/1440; Haji 360/390/1440; detail 360/1440; schedule,
  contact, FAQ and homepage at 360.
- Metrics: `before/metrics.txt` and `after/metrics.txt`.

## 1. Catalogue: progressive disclosure on phones

- **Below 640 px:** the first **9** packages of the *filtered and sorted* result set are shown. "Muat lebih
  banyak (n lagi)" reveals the next 9, and "Menampilkan x dari y paket" gives the visible and total counts.
- **Tablet and desktop:** every match is shown, with no button.
- **Client-side only:** the full filtered list stays in the DOM and in the static HTML (indexable). Cards past
  the limit are hidden with `max-sm:hidden`. No backend pagination.
- **Reset rules:** changing a filter starts again at 9. Changing only the sort keeps what the visitor already
  opened, re-ordered.
- **URL:** filters and sort stay in the URL exactly as in PUBLIC-02B. The visible count is not stored in the URL.
- **Accessibility:** a polite live region announces "n paket lagi ditampilkan. Sekarang x dari y paket."
  Keyboard focus moves to the first newly shown package.
- **Sold-out matches:** stay in the list with "Tanggal ini penuh" and "Penuh", and remain explorable (tested,
  including after loading more).

Catalogue height: 360 px **11,026 → 6,523**; 390 px **10,706 → 6,119**; 768 px 7,018 → 5,878 (shorter cards);
1440 px 5,333 → 4,569.

## 2. Catalogue: package differentiation

Catalogue cards (`PackageCard varian="katalog"`) no longer carry a destination photo. Three photos rotated across
18 packages read as eighteen different hotels. Cards now lead with what actually differs between packages, all
from the package data:

| Element | Source |
|---|---|
| Header band "Umrah Reguler · 9 hari" (+ "Tanggal ini penuh") | `type`, `duration`, seat status |
| Service tags (max. 2), e.g. "Rute bebas tangga", "3 hari Istanbul", "10 malam terakhir", "Durasi singkat" | `tags` in `content/packages.ts` |
| "1500 m ke Masjidil Haram · ±30 menit jalan" + a 0–1,500 m ruler | `makkahHotel.distanceMeters`, existing walking formula |
| Hotel name · stars · "bebas tangga" | `makkahHotel` |
| Date, city, seat label, "+n tanggal lain yang cocok" | filtered departure |
| "Harga per orang · kamar ber-4" headline + triple/double | `hargaKeberangkatan` |

Not shown publicly: the tags **"Termurah"** and **"Paling banyak dipilih"**. They are unverifiable on a demo, so
they are filtered by `tagLayanan()`. The data was not changed.

The homepage keeps its approved photo cards (`varian="foto"`, three featured packages with three different
photos), and the intro photos keep their credits.

## 3. About: operator profile

Before, the page explained how the website presents data ("Kenapa kami menulis jarak dalam meter", "Yang kami
tampilkan apa adanya"). After:

1. **Intro:** "Biro perjalanan Umrah dan Haji Khusus yang mendampingi jamaah beserta keluarganya, dari
   konsultasi pertama sampai kembali ke Tanah Air." The demo note states that Hasta Travel is a fictitious operator.
2. **Cara kami menyiapkan perjalanan:** needs-first consultation, hotels chosen by distance (with the distance
   diagram), documents checked early, manasik.
3. **Pendampingan selama di Tanah Suci:** Indonesian-speaking guide, meals, AC bus, equipment, elderly and
   wheelchair users, Badal Umrah.
4. **Komitmen yang bisa Anda periksa:** metres, three room prices per date, full dates shown, cancellation terms
   before payment, company account only.
5. **Profil operator:**
   - Name "(operator fiktif)", services, office "(contoh)" and hours "(contoh)".
   - The legal block: fictitious licence numbers, demo account, anti-fraud steps.
   - The `#legalitas` anchor is kept.
6. **Consultation:** operator WhatsApp, catalogue, and Haji Khusus.

Every service statement restates `FASILITAS` in `content/packages.ts` or the FAQ. Not invented: history,
founder, pilgrim counts, testimonials, permits, certifications, team photos (a test checks for these words). The
Kalsara showcase CTA stays in the footer panel.

## 4. Haji Khusus on small screens

- **"Di halaman ini" jump list** (Alur · Program · Syarat · FAQ · Mujamalah): horizontally scrollable on phones,
  with 44 px targets.
- **Phone comparison table** (`md:hidden`): Reguler vs Eksekutif side by side, covering
  - price per person and setoran awal
  - waiting time* and estimated year*
  - days in the Holy Land
  - Makkah hotel distance

  Values never wrap at 360 px.
- **Cards:**
  - Visible: price and deposit at the top, both hotels, and the payment note.
  - In a "Kuota dan fasilitas" disclosure: the quota note and the facilities list. Nothing was deleted.
  - The phone card hides its duplicate waiting-time grid, since it is in the table; desktop shows it.
- **Unchanged:**
  - The waiting-time asterisk and the footnote ("Tidak ada travel yang bisa menjanjikan tahun keberangkatan").
  - The Mujamalah band ("jalur terpisah", "Contoh tampilan" note, visa note).
  - Requirements, FAQ and the legal block.
- Height at 360 px: 8,432 → 8,371 (the jump list and table add navigation; folded details offset them).

## 5. Demo disclosure hierarchy

| Level | Where | Implementation |
|---|---|---|
| **A**: short identification | Exactly one per page, in the intro | `CatatanDemo` (`data-demo-note="umum"`): "Situs demo: Hasta Travel adalah operator fiktif. Paket, harga, jadwal, dan nomor izin di sini adalah contoh." The homepage hero line plays the same role. |
| **B**: contextual | Next to operator WhatsApp CTAs; in the legal and financial block | `WaDemoNote` beside each main CTA cluster (detail sidebar, closing bands, FAQ card). The sticky bar says "Demo · nomor contoh Kalsara". The Haji and Contact intros, where the WhatsApp buttons sit next to the general note, use one merged line (`CatatanDemo wa`) instead of two stacked notes. `TrustSection` labels licence numbers "contoh fiktif" and the account as demo. |
| **C**: full explanation | Footer panel "Tentang demo ini · untuk pemilik travel" | Unchanged: Kalsara showcase, studio WhatsApp (only studio link on the site), workspace demo link |

Corrections:
- The old level-A text said "data perusahaan, harga, dan **testimoni** … fiktif". The site has had no
  testimonials since PUBLIC-02A, so the line now states what is actually fictitious.
- Operator enquiries never go to studio sales: every `wa.me` link outside the footer panel is
  `data-wa-audience="operator"` and its message ends with the demonstration-number line (tested on all public pages).

## 6. Cross-page copy summary

| Preferred term | Applied in 02C |
|---|---|
| Umrah | Card headers "Umrah Reguler/Plus/Ramadhan · n hari"; About; contact and FAQ (from 02B) |
| Haji Khusus | Unchanged; About CTA "Tentang Haji Khusus" |
| Jamaah | About ("jamaah beserta keluarganya", "jamaah lansia") |
| Keberangkatan | Card date line, schedule, finder |
| Sisa kursi / Penuh / Tersedia | Homepage finder now uses the shared label ("· Sisa 4 kursi", "· Penuh"; was lower-case "· penuh" / "· sisa 4 kursi") |
| Konsultasi | Haji programme button "Tanya masa tunggu & pembayaran" → "Tanya program ini" (shorter on 360 px; the message still asks about waiting time and payment) |
| Harga per orang | Cards (homepage and catalogue) "Mulai, per orang · kamar ber-4" → "Harga per orang · kamar ber-4"; detail sidebar "Per orang · kamar ber-4" → "Harga per orang · kamar ber-4" |
| Filter | Schedule toggle "Saring" → "Filter" (same word as the catalogue) |

Other copy:
- Demo line (level A) rewritten.
- About fully rewritten (§3).
- Haji card section "Fasilitas yang termasuk" → "Kuota dan fasilitas".

Unchanged identifiers:
- Slugs, `/paket-umroh`, and package names in data ("Umroh …").
- Itinerary day titles.
- Tag values in `content/packages.ts`. Only the public display is filtered, and no records were renamed.

## 7. Responsive QA

Automated (Playwright, `tests/public_02c.spec.ts`): no horizontal overflow on all eight public routes and a
filtered catalogue URL at **360, 390, 768 and 1440 px**. Screenshot metrics (`after/metrics.txt`):

| Page @ width | Height (px) | Overflow | Notes |
|---|---|---|---|
| Catalogue @360 / @390 | 6,523 / 6,119 | no | 9 of 18 cards visible; load-more below the grid |
| Catalogue @768 / @1440 | 5,878 / 4,569 | no | 18 of 18 visible, no button |
| About @390 / @1440 | 6,811 / 4,632 | no | |
| Haji @360 / @390 / @1440 | 8,371 / 8,115 / 5,502 | no | Table at 360/390 only |
| Detail @360 / @1440 | 8,177 / 5,778 | no | |
| Schedule / Contact / FAQ / Home @360 | 8,500 / 4,497 / 3,462 / 12,580 | no | |

Checklist:

| Check | Result |
|---|---|
| Filter visibility and usability | The "Filter (n aktif)" toggle opens the panel on phones; selects are 48 px tall |
| Load-more behaviour | Tested: counts, reset on filter, kept on sort, focus, announcement |
| Sticky CTA clearance | The load-more button is never under the bar at 360×640 and is clickable (tested). PUBLIC-02B clearance rules unchanged. |
| Image cropping | Intro crops unchanged; the catalogue no longer crops destination photos into cards |
| Typography hierarchy | Fixed: About step titles were picked up by the global serif `h3` rule (it outranks the layered `font-sans` utility). They are now bold body-text lines, matching the homepage pattern. |
| Card readability | Ruler, distance and price legible at 360 (see `after/katalog-360-full.png`) |
| Accordions | FAQ open/close by Enter/Space; Haji "Kuota dan fasilitas" opens; detail itinerary unchanged (tested in 02B) |
| Focus and keyboard | Topic links jump to `#topik-…`; load-more moves focus; hidden sticky bar is `inert` |
| Hidden controls under fixed elements | None found; the bar hides over page CTAs and the footer |
| Page endings | No spacer under the footer (02B test still passes) |

## 8. Tests

Commands as named in the brief, against the production build (`next start -p 3100`, test-only session secret).

| Command | Result |
|---|---|
| `npm run lint` | pass (exit 0) — `docs/public_02c/lint.log` |
| `npm run typecheck` (`next typegen && tsc --noEmit`) | pass (exit 0) — `docs/public_02c/typecheck.log` |
| `npm run build` | pass (exit 0) — `docs/public_02c/build.log` |
| `npm run test:admin` (full Playwright suite), run 1 | **86 passed** — `docs/public_02c/test-run-1.log` |
| `npm run test:admin`, run 2 | **86 passed** — `docs/public_02c/test-run-2.log` |
| Public specs (`public_02c`, `public_02b`, `public`, `home`) `--repeat-each=3` | **135 passed** (45 tests × 3) — `docs/public_02c/test-public-repeat3.log` |
| `node lib/katalog.check.ts` / `node lib/format.check.ts` | `katalog.ts OK` / `format.ts OK` |
| `git status docs/samples` | clean (PDF samples unchanged) |

The full suite grew from 74 to 86 tests, with none skipped (the fixtures contain a sold-out nearest date and more than 18 phone-page matches).

New `tests/public_02c.spec.ts` (12 tests):
1. Mobile load-more: 9 → 18 visible, counts, "(n lagi)", announcement, focus on the first new card.
2. Sorting after disclosure keeps the opened cards; a filter change resets to 9 and counts the filtered set; the
   URL keeps both.
3. URL state restored on phones (`tipe` + `sort`, card order = `saring()`); desktop shows every match and no button.
4. Sold-out match stays visible after loading more, is labelled, and opens the detail with the "penuh" notice.
5. Differentiation: no photos in catalogue cards; distance and duration from data; no "Termurah" / "Paling
   banyak dipilih"; homepage photo cards intact.
6. Detail continuity from a card beyond the first mobile page (`?d=` selected, sticky bar shown).
7. FAQ keyboard: topic link → anchor; summary opens with Enter and closes with Space.
8. Disclosure hierarchy: one level-A note per page; no "testimoni" or licensed/certified claims; footer panel
   present; legal block says "contoh fiktif".
9. WhatsApp audiences on every public page: operator messages carry the demo line; exactly one studio link,
   inside the demo panel.
10. About: the four operator sections, "operator fiktif", none of the invented-claim words, `#legalitas` present.
11. Haji at 360: comparison table (price, deposit, waiting time*), disclosure, jump to Mujamalah, no overflow;
    table hidden at 1440.
12. Responsive overflow at 360/390/768/1440, and the load-more button clear of the sticky bar.

Updated assertions (intentional copy changes): the catalogue type check in `public.spec.ts` and `public_02b.spec.ts`
now reads the card header "Umrah Plus · n hari" / "Umrah Reguler · 12 hari".

## 9. Known limitations

- **Load-more threshold:** applies below 640 px. Tablets show all matches in two columns, which is the intended
  trade-off.
- **Visible count is not in the URL:** a shared link opens at the first 9 on phones, with the same filters and sort.
- **Catalogue cards have no imagery:** package- or hotel-specific photos need client-owned assets.
- **"Umroh" in data:** package names and itinerary titles still say "Umroh". Renaming them needs a data
  migration note for the workspace (see PUBLIC-03 list).
- **Haji FAQ and About wording:** both restate demo content; a real operator must review them before
  production.
- **Phone-only Haji table:** the comparison table is `md:hidden`. Tablets see the two cards side by side instead.

## 10. PUBLIC WEBSITE V2 — completion checklist

| Item | Status |
|---|---|
| Brand identity (logo, Instrument Serif + Manrope, forest/ivory/sand/gold/emerald, three motifs) on every public page | Done (02A-R, 02B) |
| Homepage: hero, legal strip, quick finder, featured packages, Haji entry, services, journey, hotels, FAQ, closing | Done (02A, 02A-R) |
| Catalogue: URL filters, sort, empty state, honest sold-out, mobile progressive disclosure, data-led differentiation | Done (02B, 02C) |
| Package detail: date selection in `?d=`, stale and unknown dates explained, prices per room type, staged itinerary, desktop summary, single mobile action | Done (02B) |
| Haji Khusus: queue explanation, payment stages, programme comparison (+ phone table), qualified waiting times, separate Mujamalah | Done (02B, 02C) |
| Schedule: month/city/type filters in the URL, past dates excluded, links keep the date | Done (02B) |
| FAQ, About (operator profile), Contact (four operator paths + message preview) | Done (02B, 02C) |
| Jakarta business-date rules on server and browser | Done (PUBLIC-01), unchanged |
| WhatsApp: operator vs studio separated; demo line on every operator message | Done (PUBLIC-01), verified on all pages (02C) |
| Demo disclosure hierarchy A / B / C; no fictitious testimonials or licences presented as real | Done (02C) |
| Mobile sticky action: one per page, safe area, scroll padding, hides over CTAs and footer, no spacer | Done (02B) |
| Licensed, self-hosted, credited photography | Done (02A-R) |
| Terminology: Umrah, Penuh, Sisa kursi, Harga per orang, Konsultasi in visible UI | Done (02B, 02C); data names excepted |
| Responsive (360/390/768/1440), keyboard, no overflow | Done; automated |
| Admin workspace, PDFs, finance, inventory unaffected | Verified by the full suite and an unchanged `docs/samples` |

### Remaining work: PUBLIC-03 (needs connected registration, booking or CRM data; not started)

- Online pre-registration or booking from the detail sidebar and sticky bar (selected departure is already in
  context).
- Live seat availability and pricing from the workspace instead of static fixtures.
- Lead capture into CRM, with consent, instead of WhatsApp-only consultation.
- Pilgrim portal entry from the public site.
- Haji Khusus registration intake (porsi workflow) connected to the workspace Hajj module.
- A migration plan if package names in data move from "Umroh" to "Umrah".
- Client-owned photography (hotels, manasik, departures) and a verified licence-check URL for the real operator.
