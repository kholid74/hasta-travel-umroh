# antislop audit 001, follow-up (2026-09-19)

Fixes for `audit-001-2026-09-18.md`. Nothing is committed.

## Result per finding

| # | Rule | Status | What changed |
|---|------|--------|--------------|
| 1 | R-02 | Fixed | All 22 user-facing em dashes replaced (titles, `DEMO_NOTICE`, package names, WhatsApp closing line, page copy). Only code comments still contain one. |
| 2 | R-03 | Fixed | Nav, footer, and inline "lihat semua" links are 44px tall. Mobile menu wraps instead of scrolling. Header WhatsApp button shows on phones. Distance badge can wrap. Footer gets bottom padding when the sticky CTA bar is present (`globals.css`). Logo link and Haji expand rows raised to 44px. |
| 3 | R-25 | Fixed | Hero photo credit sits on a solid `bg-background` chip, 12px, muted text (6.7:1 or better). |
| 4 | R-27 | Fixed | Added `app/not-found.tsx` and `app/error.tsx` (this Next version passes `retry`, not `reset`). Empty states for Jadwal and the Home "Tiga paket" section. |
| 5 | R-18 | Kept (owner) | Recorded in `docs/DECISIONS.md` section 11. |
| 6 | R-36 | Kept (owner) | Recorded in `docs/DECISIONS.md` section 11. |
| 7 | R-36/38 | Fixed | Kontak and TrustSection labelled "(contoh)"; "Silakan datang tanpa janji" removed. |
| 8 | R-35 | Done | See verification below. |
| 9 | R-04 | Kept (owner) | Per-icon reasons written in `docs/DECISIONS.md` section 11. |
| 10 | R-08 | Fixed | `ArrowRight` removed from all buttons and links. |
| 11 | R-06 | Fixed | Uppercase wide-tracked labels replaced by normal-case text (Home, cards, filters, detail). |
| 12 | R-20 | Fixed | Hero now leads with "Hotel 180 meter dari masjid, bukan sekadar "dekat"". `PenandaMeter` is back on Home. Generic "niat" copy removed from Home. |
| 13 | R-05/14 | Partly fixed | Requirement list on detail page and final home CTA are no longer boxed; demo notice removed from FAQ. **Not changed:** the notice stays on Kontak, Tentang, Katalog, Detail, Haji and Jadwal because those pages show fictional prices or data (R-38), and accordions/list rows keep their boxes. |
| 14 | R-15 | Fixed | "Lihat 18 paket umroh", "Buka detail dan pilih tanggal", "Alasan kami menulis jarak dalam meter", "Baca semua 9 pertanyaan", "Bandingkan 18 paket umroh". |
| 15 | C-4 | Fixed | Key facts raised one size step: availability, price label, hotel meta, date/airline labels, filter controls, Haji labels. |
| 16 | Block 3 | Fixed | Dial and Design Read added to `docs/DECISIONS.md` section 11. |
| 17 | C-4 | Fixed | `+`/`−` marker on every `<details>`; "Lewati ke konten" skip link with `#main` target. |

## Verification (R-35)

Method: `npm run build` (passes, 28 pages), `npx tsc --noEmit` and `npm run lint` (clean), then headless Chrome driven over the DevTools protocol against `next start`.

- **Overflow:** 9 routes at 320, 360, 768, and 1280px, 36 cases, no horizontal overflow.
- **Tap targets at 360px:** no visible link, button, or summary under 44px, except the package-card title links (31px), which sit above a 44px full-width button to the same URL, and the visually hidden skip link.
- **Console:** no errors or warnings on any page. The one logged error is the deliberate request to `/xyz`.
- **Routes:** all 8 pages return 200, unknown slug and unknown path return 404 and render the new not-found page inside the dark layout.
- **Catalog:** "Ramadhan" filter -> `?tipe=umroh-ramadhan`, 3 of 18. "Hapus semua filter" -> URL cleared, 18 of 18. "Plus" plus max 30 jt -> empty state shown; its reset button restores 18 of 18.
- **Detail:** date button 2 -> `?d=2026-11-11`, `aria-pressed=true`. WhatsApp link resolves with no em dash in its message text.
- **Accordions:** a closed `<details>` opens on click and the marker switches to `−`.
- **Home:** every internal link returns 200. Mobile header WhatsApp button is 126 x 44px. No em dash in visible text on any of the 7 pages checked.
- **Visual:** screenshots reviewed at 360px (home top, cards, detail bottom with sticky bar, 404) and 1280px (hero, meter section). The meter label collision found during review was fixed.

Not exercised: the Jadwal and Home empty states (all demo dates are in the future, so they cannot trigger today), the `error.tsx` boundary, and external links (WhatsApp, SISKOPATUH, Wikimedia), which were checked by `href` only.
