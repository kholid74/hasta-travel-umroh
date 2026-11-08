# M3.1-R — Role UX & Test Stability Refinement · Report

> This refines M3.1 without rebuilding the gateway or changing business logic. Financial calculations, PDF layouts, storage format and permission rules are unchanged. Related: [M3.1 report](M3_1_IMPLEMENTATION_REPORT.md) · [Role matrix](HASTA_V2_ROLE_MATRIX.md).

## 1. Results at a glance

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ exit 0, no findings | [lint-output.txt](m3_1_r/lint-output.txt) |
| `npm run typecheck` | ✅ exit 0 | [typecheck-output.txt](m3_1_r/typecheck-output.txt) |
| `npm run build` | ✅ exit 0; `/admin`, `/admin/[...path]`, `/admin/login`, `/portal/[[...path]]` dynamic | [build-output.txt](m3_1_r/build-output.txt) |
| Full suite — **run 1** (41 tests) | ✅ **41 passed** (2.4 min), 0 failed, 0 skipped | [test-run-1.txt](m3_1_r/test-run-1.txt) |
| Full suite — **run 2** (41 tests) | ✅ **41 passed** (1.9 min), 0 failed, 0 skipped | [test-run-2.txt](m3_1_r/test-run-2.txt) |
| Final confirmation — **run 3** on the final code (after a last CSS fix, rebuilt) | ✅ **41 passed** (1.9 min) | [test-run-3-final.txt](m3_1_r/test-run-3-final.txt) |
| Earlier full runs right after the PDF fix (39 tests, before the 2 new M3.1-R tests) | ✅ 39 passed · ✅ 39 passed | [pre-1](m3_1_r/test-run-pre-1-39tests.txt) · [pre-2](m3_1_r/test-run-pre-2-39tests.txt) |
| Migration tests (v1→v2→v3 unit, frozen v2 fixture, saved v2 in browser) | ✅ 3 passed | [migration-tests.txt](m3_1_r/migration-tests.txt) |
| `docs/samples/` after each full run | ✅ unchanged (0 modified files) | `git status` checked after every run |
| Opt-in sample refresh (`UPDATE_SAMPLES=1`, m1_2b spec) | ✅ passed and rewrote the 8 samples; restored afterwards | — |

**Test environment note.** A separate `next dev` started by the user was already running for this project on port 3000. Next.js 16 refuses a second dev server for the same project, so it was left alone. The regression runs therefore used the **production build** served with `next start -p 3100` and `PLAYWRIGHT_BASE_URL=http://localhost:3100`, plus the test-only session secret from `playwright.config.ts`. Every session test, including expired and legacy cookies, executed with no skips. Screenshots were captured from the user's dev server.

## 2. Read-only UX consistency

### Approach
- A new hook, `useModuleAccess()` in `components/admin/Store.tsx`, returns `writable` (the role can change the module on screen), `canOpen(module)` (for cross-links) and `can(permission)`.
- It is presentation only. **Enforcement is unchanged:** every mutation still passes through `transact`, which refuses actions the role lacks. Hiding a button is not treated as security.
- Rules applied:
  - Actions with no purpose in read-only mode are **hidden**.
  - Forms that are useful to *read* (settings values, visa details, lead stage and follow-up date, HPP inputs) are shown inside a disabled fieldset so the values stay visible.
  - Buttons stay **disabled with a stated reason** only where the reason helps a writer: "Daftarkan jamaah" (package not Open / capacity full) and "Pratinjau broadcast" (no recipients / empty message).
  - Search, filters, tabs, detail links, PDF previews and **Ekspor Excel/CSV** stay available.
- The read-only banner now says what *is* possible: "…Anda tetap dapat mencari, memfilter, membuka detail, dan mengekspor data."

### Audit result per module

| Module (read-only roles) | Hidden / changed in read-only mode |
|---|---|
| Rooming List (Owner, Sales) | Tambah kamar, Auto Assign, drag & drop, remove (×), "Atur"; occupants shown as plain names; panel text "Penempatan kamar diatur oleh tim Operasional"; stat hint "Menunggu penempatan oleh tim Operasional" |
| Keberangkatan (Owner, Sales, Finance) | Buat keberangkatan, Tandai berangkat/Selesaikan, checklist checkboxes (status badges remain, sized to their content); "Atur kamar" → "Lihat kamar"; HPP/Manifest/Rooming links hidden when the role can't open them |
| Manasik / Transportasi (Owner, Sales / Owner) | Buat kegiatan; Check-in column removed; bus selection and "Alokasikan pilihan" |
| CRM / Leads website (Owner, Operations) | Tambah lead; kanban drag; stage and follow-up shown disabled; note form; lead conversion replaced by "Konversi … dilakukan oleh tim Sales" |
| Booking / Invoice / Pembayaran / Pengeluaran | Create buttons follow their permission (`booking.create`, `payment.record`); Tambah pengeluaran; "Tandai dibayar" → "Menunggu pembayaran"; "Lengkapi data jamaah" → "Lihat data jamaah" when the role can only read Jamaah |
| Jamaah (Owner, Finance) | Impor JSON, Tambah jamaah, Unduh format impor, Edit data, "Lengkapi / edit", "Ubah grup"; visa form disabled; document notice explains who updates statuses; Rooming/Invoice links hidden when not openable |
| Dokumen & Visa / Manifest (Owner / Owner, Sales) | Row selection only when the role can run the batch action; "Tinjau" → "Lihat" without document permissions; manifest print/export and SISKOPATUH-prep export kept |
| Paket / Paket website (Sales, Finance / Owner) | Buat paket, Edit paket, Duplikat / Terbitkan / Tutup / Arsipkan, Publish & Unggulan; HPP and expense links hidden for roles without those modules |
| Haji Khusus (Finance) | Buat/Edit paket Haji, Daftarkan jamaah; registration and planning selects shown as badges; "Buka HPP" hidden for roles without HPP |
| HPP & Kalkulasi (Operations) | Buat draft costing, Simpan draft, Finalisasi, Buat revisi, Jadikan template, Tambah/Edit/Hapus komponen, Simpan skenario; inputs disabled (values visible); the what-if simulation stays usable because it is not saved |
| Perlengkapan (Owner, Sales, Finance) | Catat stok masuk/koreksi, Catat retur, Tambah/Edit barang, Tambah/Edit template, Alokasikan kit, Serahkan, Rilis sisa; navigation to tabs, receipts (PDF) and CSV export kept |
| Broadcast (Owner) | Pratinjau/kirim simulasi replaced by "broadcast dikirim oleh tim Sales atau Operasional"; templates and audience counts still viewable |
| Artikel / Testimoni / Galeri (Owner) | Tambah, Edit, Terbitkan/Sembunyikan; title opens the preview instead of the editor |
| User & Roles (Owner) | Tambah pengguna, role selector (shown as text), Aktifkan/Nonaktifkan |
| Settings (Finance) | Fields disabled; Simpan pengaturan and Reset data demo hidden (reset requires `demo.reset`) |
| Supplier / Vendor (Owner, Operations) | "Tambah pengeluaran →" link hidden without expense write access |

Covered by the new test *"M3.1-R: read-only roles see no mutation controls…"*:
- Owner: Rooming, Keberangkatan, Perlengkapan, Booking, Users.
- Finance: Jamaah list and detail, Settings.
- Operations: HPP, Invoice link.
- Sales: Paket.
- Superadmin: still sees Auto Assign and no banner.

## 3. Demo date context

### Audit

| Aspect | Finding |
|---|---|
| Business clock | `DEMO_TODAY = "2026-10-02"` (`content/admin/seed.ts`) drives overdue status (`paymentStatus`), upcoming departures, follow-ups due, manasik schedule, and default dates for new bookings, leads, payments, expenses and Hajj registrations |
| Fixture span | Business dates run 2026-09-01 → 2026-11-25 (bookings, payments, expenses, departures, manasik) |
| Real-clock writers | Activity log timestamps (`Store.transact`), `payment.verifiedAt`, `costing.finalizedAt`, and the PDF "Dibuat" generation date. These record *when the user acted* |
| Previous labels | Superadmin: bare "2 Okt 2026". Role dashboards: "2 Okt 2026 · data demo". Nothing told users this differs from today (2026-11-08 at audit time) |

### Decision
- **No dates were shifted.** Moving fixtures to "now" would break the link between bookings, payments, invoices, HPP revisions and departures, and change every status. Real-clock event timestamps are kept and explained instead.
- New shared component `SimulationDate` (`components/admin/ui.tsx`) shows **"Periode simulasi · 2 Okt 2026 | Tanggal Anda: 8 Nov 2026"**. The visitor's date is read after mount, so server and client markup match. A tooltip explains that due dates, upcoming departures and follow-ups are computed from the simulation date.
- It is used on:
  - the Superadmin dashboard and the four role dashboards;
  - the Activity log, which also notes that new actions use the device clock and may be dated after the period;
  - Reports ("Tentang angka ini" panel);
  - portal home heroes (Agent, Tour Leader, Pilgrim);
  - the gateway disclaimer ("periode simulasi Oktober 2026").
- The dashboard month selector is now labelled "Bulan pada periode simulasi".
- Covered by the new test *"M3.1-R: dashboards label the simulated business period…"*.

## 4. Gateway visual polish (no redesign)

- **Panel balance:** the dark story column stretches the full page height with sticky content and gains a short three-step "how the demo works" list (Pilih peran · Jelajahi tugasnya · Ganti kapan saja). This fills the previously empty lower half.
- **Card alignment:**
  - At ≥ 1180 px the five office roles use a **3 + 2** grid, so there is no empty slot.
  - Between 561 and 900 px (tablet) the grid has 2 columns, and a trailing odd card spans the row instead of leaving a half-width orphan.
  - Below 560 px it is a single column.
- **Rhythm:** consistent spacing between heading, group labels (36/14 px), cards (16 px gap, 22 px padding) and footer (36 px). Content width is capped at 1120 px on wide screens.
- **Long persona names:** options read "Ahmad Hidayat (AGT-001)". Details such as city · level or package · booking appear *below* the select, so long names aren't cut off by the native control. Static persona names wrap safely.
- **Mobile footer:** "Kembali ke Website" and "Reset data demo" become two equal buttons.

## 5. PDF test reliability

### Investigation
- The specs that render PDFs wrote their output to **tracked files under `docs/samples/`** on every run: `payment_history`, `invoice_layout` and `m1_2b` (PDFs + PNGs), and `m2` (handover). The other specs wrote to **fixed shared paths** under `test-results/`.
- The intermittent failure (`UNKNOWN: unknown error, open 'docs\samples\payment-history\UMRAH-statement.pdf'`) happened while overwriting one of those committed files. It passed on immediate re-run.
- This is consistent with Windows briefly holding a just-written file (for example a search indexer, antivirus, or an editor preview of the committed sample). The exact external process could not be identified from the test output.
- Rewriting committed samples also dirtied the git tree on every run.

### Fix (no change to calculations or layouts)
- New `tests/helpers/artifacts.ts` provides `saveArtifact(testInfo, relative, data, { sample })`.
  - Every file goes to `testInfo.outputPath(...)`, which Playwright makes **unique per test, retry and worker**, so no two tests or parallel workers share a path.
  - Writes retry with backoff only on transient lock codes (`EBUSY`, `EPERM`, `EACCES`, `UNKNOWN`, `EMFILE`, max 5 attempts). Any other error fails immediately.
  - The committed `docs/samples/` are refreshed **only on request**: `UPDATE_SAMPLES=1 npm run test:admin`. This is documented in `docs/ADMIN_SHOWCASE.md`.
- Applied to all PDF/PNG writes in `payment_history`, `invoice_layout`, `m1_2`, `m1_2b` and `m2`. Every `page.screenshot` that used a fixed `test-results/...` path in `admin`, `costing`, `m1_1`, `m2` and `m3_1_gateway` now uses `testInfo.outputPath`.
- A repository scan confirms no spec writes to `docs/samples` or a fixed `test-results/` path any more.
- **Outcome:** five consecutive full runs (39, 39, 41, 41, 41 tests) passed with zero failures, and `docs/samples` stayed unmodified after each.

## 6. Before / after screenshots

Folders: `docs/m3_1_r/screenshots/before/` and `docs/m3_1_r/screenshots/after/`, same pages and widths.

| Screen | Before | After | What changed |
|---|---|---|---|
| Gateway desktop 1440 | [before](m3_1_r/screenshots/before/gateway-desktop.png) | [after](m3_1_r/screenshots/after/gateway-desktop.png) | Balanced story column with steps; 3 + 2 office grid; persona detail lines |
| Gateway tablet 768 | [before](m3_1_r/screenshots/before/gateway-tablet.png) | [after](m3_1_r/screenshots/after/gateway-tablet.png) | 2-column grid instead of 1; no orphan cards |
| Gateway mobile 390 | [before](m3_1_r/screenshots/before/gateway-mobile.png) | [after](m3_1_r/screenshots/after/gateway-mobile.png) | Spacing, footer buttons, readable personas |
| Owner · Rooming List (read-only) | [before](m3_1_r/screenshots/before/owner-rooming-readonly.png) | [after](m3_1_r/screenshots/after/owner-rooming-readonly.png) | No Tambah kamar / Auto Assign / × / Atur; neutral texts |
| Owner · Departure detail (read-only) | [before](m3_1_r/screenshots/before/owner-departure-readonly.png) | [after](m3_1_r/screenshots/after/owner-departure-readonly.png) | No checkboxes or "Tandai berangkat"; "Lihat kamar" |
| Owner dashboard · date context | [before](m3_1_r/screenshots/before/owner-dashboard-date-context.png) | [after](m3_1_r/screenshots/after/owner-dashboard-date-context.png) | "Periode simulasi · 2 Okt 2026 \| Tanggal Anda: …" |
| Finance dashboard · date context | [before](m3_1_r/screenshots/before/finance-dashboard-date-context.png) | [after](m3_1_r/screenshots/after/finance-dashboard-date-context.png) | same |
| Superadmin dashboard · date context | [before](m3_1_r/screenshots/before/superadmin-dashboard-date-context.png) | [after](m3_1_r/screenshots/after/superadmin-dashboard-date-context.png) | same; month selector labelled as simulation period |

## 7. Known limitations

- Read-only gating is applied to every module in the audit table. Deep sub-forms that only open from hidden buttons (for example inventory record forms) are unreachable, not individually gated. `transact` still refuses them if reached.
- The quick "Simulasi pengingat" on invoices remains visible to roles that can open invoices. It only shows a toast and changes no data.
- The Packages "Buat keberangkatan" shortcut (shown when a package has no departures) remains a plain link to the Keberangkatan list for read-only roles.
- Real-clock timestamps for new events are intentional and labelled, not converted to the simulation clock.
- The transient-lock retry in test writes covers Windows behaviour. If a different OS-level failure occurred, it would still surface immediately.

## 8. Files

| Kind | Files |
|---|---|
| New | `tests/helpers/artifacts.ts`, `docs/M3_1_R_REPORT.md`, `docs/m3_1_r/**` (outputs and before/after screenshots) |
| App (UI only) | `components/admin/{Store,ui,AdminScreen,Dashboard,RoleDashboards,DemoGateway,Rooming,Departures,Operations,CRM,Finance,Jamaah,Documents,Packages,Hajj,Costing,Inventory,Communication,CMS,System,Partners,Reports}.tsx`, `components/portal/PortalScreen.tsx`, `app/admin/admin.css` |
| Tests | `tests/{payment_history,invoice_layout,m1_2,m1_2b,m2,admin,costing,m1_1,m3_1_gateway}.spec.ts` |
| Docs | `docs/ADMIN_SHOWCASE.md` (sample refresh switch) |

Out of scope and not started: PUBLIC-01, M3.2, and any other module.
