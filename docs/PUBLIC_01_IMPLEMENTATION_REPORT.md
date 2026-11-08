# PUBLIC-01 — Critical Public Website Fixes · Implementation Report

> These are P0 fixes from the [public audit](HASTA_V2_PUBLIC_AUDIT.md) and [refinement plan](HASTA_V2_PUBLIC_REFINEMENT_PLAN.md). The visual identity is unchanged (dark editorial theme, Hasta logo, Instrument Serif and Manrope, amber accents, package cards, photography and attribution).
>
> Not implemented here: PUBLIC-02 (visual direction / copy), PUBLIC-03 (registration), M3.2, M3.3. No payment, invoice, HPP, inventory or commission rules were touched. No `lib/admin`, `content/admin`, `components/admin` or `app/admin` file was edited in this milestone.

## 1. Results

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ exit 0, no findings | [lint-output.txt](public_01/lint-output.txt) |
| `npm run typecheck` | ✅ exit 0 | [typecheck-output.txt](public_01/typecheck-output.txt) |
| `npm run build` | ✅ exit 0. `/`, `/paket-umroh`, `/jadwal-keberangkatan` and all 18 `/paket-umroh/[slug]` pages are ISR with **Revalidate 1h**; admin and portal stay dynamic | [build-output.txt](public_01/build-output.txt) |
| Node checks (`lib/*.check.ts`) | ✅ format, katalog, departures OK | [node-checks.txt](public_01/node-checks.txt) |
| New `tests/public.spec.ts` | ✅ 14 passed | included in the runs below |
| `npm run test:admin` — full suite, **run 1** | ✅ **55 passed** (2.6 min), 0 failed, 0 skipped | [test-run-1.txt](public_01/test-run-1.txt) |
| `npm run test:admin` — full suite, **run 2** | ✅ **55 passed** (2.3 min), 0 failed, 0 skipped | [test-run-2.txt](public_01/test-run-2.txt) |
| `docs/samples` after runs | ✅ unchanged | `git status` |

**Environment.** The user's own `next dev` was running for this project on port 3000, and Next.js 16 allows only one dev server per project, so it was left alone. Tests ran against the production build (`next start -p 3100`, test-only session secret) with `PLAYWRIGHT_BASE_URL=http://localhost:3100`. This also exercises ISR as deployed. "Before" screenshots came from the dev server (pre-change code); "after" screenshots came from the production build.

## 2. Mobile navigation

- `components/SiteNav.tsx` (client) provides `DesktopNav`, `HeaderConsultButton` and `MobileMenu`. `components/Header.tsx` composes them.
- **Below 1024 px:** a **Menu** button opens a native modal `<dialog>`.
  - The dialog keeps focus inside and makes the page behind it inert. **Escape** closes it, and focus returns to the Menu button.
  - It has a "Tutup" button, all six destinations as 56 px rows with `aria-current="page"` on the active route, and an operator consultation CTA with the demo note.
  - Under **Tentang demo ini** it adds "Coba workspace demo → /admin/login" with "Akses demo, bukan login sungguhan".
  - The page behind is scroll-locked while the menu is open.
- **From 1024 px:** the original horizontal navigation and branding, now with an active-page underline. From 1280 px a small "Workspace demo" text link appears, with a tooltip stating it is demo access.
- The old horizontally-scrolling nav, which hid four of six destinations at 390 px, is gone. Tests confirm no horizontal overflow on every public route at 390, 768 and 1440 px.

## 3. WhatsApp CTAs — two audiences

| Audience | Where | Message |
|---|---|---|
| **Operator** (prospective pilgrim → fictional Hasta) | Header (follows the route: Haji page → Haji Khusus message), hero, closing CTA, mobile menu, mobile consult bar, package detail and its sticky bar, Haji cards, FAQ, Kontak routes, footer operator column, 404 | Starts "Assalamu'alaikum…"; structured prefill; package detail carries **package, selected date and city**; every message ends with "[Pesan contoh dari situs demo Hasta Travel. Nomor tujuan adalah kontak demonstrasi Kalsara Digital Studio, bukan biro perjalanan umroh/haji.]" |
| **Studio** (business owner → Kalsara) | Only inside the footer's separate dashed **"Tentang demo ini · untuk pemilik travel"** panel (`data-area="demo-showcase"`) | "Halo Kalsara Digital Studio, saya pemilik travel…" |

- Every operator CTA shows (or sits next to) **"Demo: pesan dikirim ke nomor demonstrasi Kalsara Digital Studio, bukan ke biro perjalanan sungguhan."**
- No operator number was invented; the destination stays the existing demo number.
- Anchors carry `data-wa-audience` so tests can assert the separation.
- **Encoding:** `encodeURIComponent` for the full text, with newlines as `%0A` and `&` as `%26`. Tested by round-trip decode.
- **Sticky CTAs:** a new mobile consult bar appears on listing, schedule, FAQ, about, contact and Haji pages. It does **not** render on package detail pages, which keep their own date-aware sticky bar, so exactly one sticky CTA shows per page (tested). A spacer keeps the footer from being covered.

## 4. Departure date correctness

**Audit of `new Date()` in public pages (before):** `/`, `/paket-umroh`, `/paket-umroh/[slug]` and `/jadwal-keberangkatan` each computed "today" in UTC at **build time** of fully static pages. Past departures therefore stayed listed and selectable until a redeploy, and the date boundary was UTC, not Indonesian.

**Strategy** (checked against `node_modules/next/dist/docs`):
- This project does not enable Cache Components, so the route segment `export const revalidate` is valid. See `02-guides/caching-without-cache-components.md` and the route-segment-config history note that `revalidate` is removed only *with* Cache Components.
- **Server:** ISR with `revalidate = 3600` on the four pages. `lib/departures.ts` computes the business date in **Asia/Jakarta** (`businessToday()`).
- **Client:** ISR serves the stale page once after expiry and only regenerates on a request, with no scheduler. So `useBusinessToday()` re-computes the Jakarta date after hydration (and when the tab becomes visible again). `KatalogClient`, `FeaturedPackages`, `DetailClient` and `JadwalClient` re-filter with it. The first client render uses the server's date, so hydration matches.
- **Rule:** a departure is open for registration only if its date is **after** today in Jakarta. The departure day itself is closed. Fixture dates are never shifted, and price, seat and status rules are unchanged.
- **Stale direct links:**
  - `?d=<past date>` shows "Keberangkatan 7 Oktober 2026 sudah lewat dan tidak bisa didaftar lagi."
  - An unknown date shows "Tanggal … tidak ada dalam jadwal paket ini."
  - In both cases the page shows the nearest open date, the remaining dates as alternatives, and a link to the full schedule. The URL is updated to the date actually shown, and the WhatsApp text never mentions the stale date.
  - A package with no open dates shows a clear empty state with a consultation CTA.
- The selected date persists in `?d=` across chip clicks and reloads (tested). Catalogue month and duration options are recomputed from open departures.
- **Tests** freeze the browser clock: 9 Feb 2027 23:59 WIB → the 10 Feb departure is open; 10 Feb 00:01 WIB → closed. At 1 Mar 2027 the catalogue, homepage, filters and schedule hide everything earlier. Unit checks cover the 16:59/17:00 UTC boundary.

## 5. Public 404

- `components/NotFoundContent.tsx` holds the Indonesian body:
  - heading "Halaman ini tidak tersedia" and an explanation;
  - **Lihat paket Umroh**, **Kembali ke beranda**, a schedule link, and an operator consultation with the demo note.
- `app/not-found.tsx` handles unmatched URLs. It renders inside the root layout only, so it includes the header and footer.
- `app/(public)/not-found.tsx` handles `notFound()` in public pages, such as an unknown package slug. The `(public)` layout already supplies the header and footer.
  - The first test run caught a **duplicated header and footer** on unknown slugs before this boundary existed. The test now asserts exactly one of each.
- Both paths return **HTTP 404**. Admin keeps `app/admin/not-found.tsx`.

## 6. Haji Khusus accuracy

- Public data model: `HajiPackage.kategori = "khusus" | "mujamalah"`. All three public records are kept, and the workspace Haji records (`content/admin/hajj.ts`) are untouched.
- `/haji-khusus` now shows **Haji Khusus** (Reguler, Eksekutif: perkiraan masa tunggu, perkiraan berangkat, setoran awal; each figure footnoted "Perkiraan contoh … dapat berubah mengikuti kuota") and a separate section, **"Haji Mujamalah — jalur terpisah"**:
  - Card fields: "Nomor porsi: Tidak memerlukan", "Rencana musim … (bergantung pada penerbitan visa; tidak dapat dijamin)".
  - A labelled **"Contoh tampilan"** note says availability and terms need confirmation from the real operator and no visa certainty is promised.
- **Removed:**
  - "Tanpa antre" and any waiting-time wording for Mujamalah;
  - the "Haji Khusus Haji Mujamalah (Visa Furoda)… masa tunggu" WhatsApp text;
  - "Nomor porsi terbit setelah setoran awal diterima Kemenag" (now "melalui sistem pemerintah");
  - the unconditional refund promise (now "disepakati tertulis … (contoh ketentuan demo)");
  - "Pengurusan visa mujamalah" (now "Pendampingan pengajuan … (penerbitan tidak dijamin)").
- **WhatsApp:** Haji Khusus asks about "perkiraan masa tunggu, setoran awal, dan skema pelunasan". Mujamalah asks about "ketersediaan, ketentuan pendaftaran, dan pengembalian dana bila visa tidak terbit".

## 7. Document requirements and legal references

| # | Hard-coded claim (before) | Location | Action |
|---|---|---|---|
| 1 | "Paspor berlaku minimal 8 bulan" | Umrah requirements, FAQ, all Haji requirements | Centralised in `content/requirements.ts` as `PASSPORT_MIN_MONTHS = 6`, aligned with the workspace readiness check (180 days); FAQ prefixed "Contoh ketentuan" |
| 2 | "Kartu vaksin meningitis … termasuk syarat masuk" / FAQ "Ya, wajib" | Requirements, FAQ | Qualified: "Vaksinasi sesuai ketentuan kesehatan terbaru (misalnya meningitis)", confirmed at consultation |
| 3 | "Surat mahram untuk jamaah perempuan sesuai ketentuan yang berlaku" | Umrah requirements | Removed; replaced by "Dokumen tambahan untuk kondisi tertentu dikonfirmasi saat konsultasi" |
| 4 | "Visa umroh dan pengurusan Nusuk" | Umrah facilities | "Pengurusan visa umroh" |
| 5 | "Uang muka …, pelunasan 40 hari …" as a rule | Umrah requirements | Labelled "Contoh ketentuan pembayaran" (matches the FAQ examples) |
| 6 | Kemenag porsi issuance; Mujamalah visa and refund wording | Haji content | See §6 |
| 7 | "Izin PPIU/PIHK DEMO-000 TAHUN 2026" presented like approvals | Homepage strip, footer, trust section | Shown as "Izin PPIU (contoh fiktif): …" plus "situs demo, bukan izin sungguhan" |
| 8 | "Cek legalitas di SISKOPATUH" → `simpu.kemenag.go.id` (did not resolve during the audit) | Homepage, footer, trust section (4 pages) | **Button removed.** `company.licenseCheckUrl = null` (render the button only once a verified URL is configured). Neutral text: "dicocokkan melalui kanal resmi kementerian yang membidangi penyelenggaraan haji dan umrah". Homepage and footer link to `/tentang#legalitas` |
| 9 | "Cocokkan … dengan hasil pencarian di SISKOPATUH" | Trust section checklist | Neutral wording as in row 8 |

- Detail pages and Haji cards show `REQUIREMENT_NOTE`: "Contoh persyaratan pada situs demo. Ketentuan resmi dapat berubah dan dikonfirmasi saat konsultasi."
- DEMO disclosures (`DEMO_NOTICE`, footer "DATA DEMO") are kept.
- Tests assert that no `simpu`/`kemenag` links, "Surat mahram" or "minimal 8 bulan" text remain on public pages, and that "contoh fiktif" is visible.

## 8. Screenshots

Folders: `docs/public_01/screenshots/before/` (dev server, pre-change) and `docs/public_01/screenshots/after/` (production build).

| Screen | Before | After |
|---|---|---|
| Mobile header 390 | [before](public_01/screenshots/before/mobile-header.png) | [after](public_01/screenshots/after/mobile-header.png) |
| Mobile menu open | — (did not exist) | [after](public_01/screenshots/after/mobile-menu-open.png) |
| Tablet header 768 | [before](public_01/screenshots/before/tablet-header.png) | [after](public_01/screenshots/after/tablet-header.png) |
| Desktop header 1440 | [before](public_01/screenshots/before/desktop-header.png) | [after](public_01/screenshots/after/desktop-header.png) |
| Homepage mobile (full) | [before](public_01/screenshots/before/mobile-home.png) | [after](public_01/screenshots/after/mobile-home.png) |
| Catalogue mobile (full) | [before](public_01/screenshots/before/mobile-catalogue.png) | [after](public_01/screenshots/after/mobile-catalogue.png) |
| Package detail mobile | [before](public_01/screenshots/before/mobile-detail.png) | [after](public_01/screenshots/after/mobile-detail.png) |
| Package detail desktop (full) | [before](public_01/screenshots/before/desktop-detail.png) | [after](public_01/screenshots/after/desktop-detail.png) |
| Stale/unknown `?d=` link | [before](public_01/screenshots/before/mobile-detail-stale-date.png) (silent fallback) | [after](public_01/screenshots/after/mobile-detail-stale-date.png) · [past date](public_01/screenshots/after/mobile-detail-past-date.png) |
| Haji Khusus mobile / desktop | [mobile](public_01/screenshots/before/mobile-haji.png) · [desktop](public_01/screenshots/before/desktop-haji.png) | [mobile](public_01/screenshots/after/mobile-haji.png) · [desktop](public_01/screenshots/after/desktop-haji.png) |
| 404 mobile / desktop | [mobile](public_01/screenshots/before/mobile-404.png) · [desktop](public_01/screenshots/before/desktop-404.png) (default English page) | [mobile](public_01/screenshots/after/mobile-404.png) · [desktop](public_01/screenshots/after/desktop-404.png) |
| Footer with demo area (Kontak, full) | [before](public_01/screenshots/before/desktop-kontak-footer.png) | [after](public_01/screenshots/after/desktop-kontak-footer.png) |

## 9. Regression coverage

`tests/public.spec.ts` (14 tests) covers:
- Jakarta date boundaries;
- WhatsApp audiences, wording and encoding;
- 200 status and no overflow for 8 routes × 3 widths;
- mobile menu destinations, active state, Escape, focus return, close button and gateway link;
- desktop/tablet navigation;
- operator vs studio CTAs;
- a single sticky CTA per page;
- selected-date persistence;
- stale and unknown `?d=` links;
- departure-day cutoff on detail, catalogue, homepage and schedule;
- catalogue filters synced with the URL;
- Haji separation and wording;
- qualified legal claims;
- branded 404 with real 404 status and a single header and footer.

The existing admin, portal, PDF and migration specs (41 tests) all pass unchanged.

## 10. Known limitations

- **ISR + client guard** relies on JavaScript for the exact cutoff. With JavaScript disabled, a cached page can show a departure that passed within the last hour, or longer on a low-traffic site, until the next request regenerates it.
- **Fixture horizon:** the latest demo departure is 23 Jun 2027. After that, the catalogue and schedule will be empty and detail pages will show the "no open dates" state until fixtures are extended (on purpose, they are not shifted).
- **Not yet handled (P1/PUBLIC-02):**
  - sold-out dates are still selectable, with no waitlist wording;
  - "Umroh" vs "Umrah" spelling is unresolved (the site keeps "Umroh");
  - "seat" / "Sold Out" wording;
  - hero value proposition, homepage restructure, and the fictitious testimonial (it remains labelled as fictitious);
  - the itinerary text still mentions Raudhah access "sesuai jadwal aplikasi Nusuk" (operational itinerary detail, not a requirement; left for operator confirmation).
- **Licence verification** shows no official link until a client confirms the correct portal (`company.licenseCheckUrl`).
- The workspace's own "Persiapan SISKOPATUH" export naming (admin) was not changed in this public milestone.
- The mobile consult bar adds about 80 px of spacer under the footer on phones.

## 11. PUBLIC-02 readiness recommendations

1. **Decisions still open:** Umroh vs Umrah spelling; whether Haji Mujamalah is actually offered (hide the section if not); the official licence-check URL; real document and payment policies to replace the "contoh" items.
2. **Design tokens first:** if Direction B "Dua Waktu" (dark frame, light reading surfaces) is approved, add light-band tokens and component border contrast of at least 3:1 in `globals.css` before restyling pages. The new menu, consult bar, notices and 404 already use tokens only.
3. **Reuse the new seams:**
   - `consultContextForPath` and `pesanWa` for any new CTA;
   - `REQUIREMENT_NOTE` and `content/requirements.ts` for requirement copy;
   - `useBusinessToday` and `openDepartures` for any date-driven UI, such as a homepage "Keberangkatan terdekat" strip;
   - `labelIzin` for licence text.
4. **Homepage blueprint:** implement the section order from `HASTA_V2_PUBLIC_SITEMAP.md` §3. Featured departures can use `FeaturedPackages` with an "upcoming" variant.
5. **Sold-out/waitlist state** on detail chips, plus Madinah distance and departure-city filter on cards (refinement plan P1-5, P1-9).
6. **Before/after protocol:** reuse the capture script pattern (same pages and widths) and add visual checks to `tests/public.spec.ts` where layout regressions matter.
7. **PUBLIC-03 (registration)** can attach to the detail page's selected departure (`?d=`), which is now always a valid, open date.
