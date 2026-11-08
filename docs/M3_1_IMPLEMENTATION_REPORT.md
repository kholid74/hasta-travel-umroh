# M3.1 — Role-Based Demo Gateway & Workspace Access · Implementation Report

> `/admin/login` is now **Pilih Akses Demo**: eight roles, no credentials, a role-aware workspace, mobile-first portal shells, and a v2 → v3 storage migration. **This is demo access, not production security.**

Related: [Role matrix](HASTA_V2_ROLE_MATRIX.md) · [Architecture](HASTA_V2_ARCHITECTURE.md) · [Data contracts](HASTA_V2_DATA_CONTRACTS.md) · [Roadmap](HASTA_V2_ROADMAP.md) · [Audit](HASTA_V2_REPOSITORY_AUDIT.md)

## 1. Verification results

All commands were executed on 2026-11-08. Raw outputs are in `docs/m3_1/`.

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | ✅ exit 0, no findings | [lint-output.txt](m3_1/lint-output.txt) |
| `npm run typecheck` | ✅ exit 0 | [typecheck-output.txt](m3_1/typecheck-output.txt) |
| `npm run build` | ✅ exit 0; `/admin`, `/admin/[...path]`, `/admin/login` and `/portal/[[...path]]` are dynamic (ƒ) | [build-output.txt](m3_1/build-output.txt) |
| `npm run test:admin` (full, 39 tests) | ✅ **38 passed**. 1 failed with a Windows file-system error writing a PDF sample (`UNKNOWN … open docs/samples/payment-history/UMRAH-statement.pdf`), not an assertion; an immediate re-run of that spec passed 2/2. | [final-test-results.txt](m3_1/final-test-results.txt) |
| Re-check after final UI polish (`m3_1_gateway` + `admin` specs) | ✅ **16 passed**, 0 skipped | [m3_1-and-admin-recheck.txt](m3_1/m3_1-and-admin-recheck.txt) |

The full run initially had three failures, all fixed:
1. Two 390 px horizontal-overflow assertions (`admin.spec`, `m2.spec`) failed because of the new role pill in the admin top bar. The pill now drops its prefix below 760 px and hides below 480 px, where the role is still shown in the workspace bar and navigation.
2. `m2.spec` asserted the storage version was exactly 2. M3.1 intentionally bumps it, so the assertion now uses `CURRENT_DEMO_VERSION`, and the test still proves v1 data migrates and re-saves.

A build check also caught that `/admin` had become statically prerendered. `getSession()` now reads cookies before the secret check, so the route is dynamic again.

Test runs regenerate the committed sample PDFs/PNGs under `docs/samples`, which embed the generation date. These were restored with `git checkout` so the diff contains only M3.1 changes.

**Acceptance criteria**

| # | Criterion | Status |
|---|---|---|
| 1 | `/admin/login` displays the Role Selection Gateway | ✅ |
| 2 | All eight roles selectable without credentials | ✅ tested |
| 3 | Superadmin accesses all existing modules | ✅ every sidebar route + detail deep links tested |
| 4 | Staff roles see appropriate dashboards and navigation | ✅ |
| 5 | Portal roles enter their own mobile-first shells | ✅ tested at 390 px |
| 6 | "Ganti Akses Demo" works consistently | ✅ |
| 7 | Switching roles does not reset or mutate business data | ✅ storage byte-identical across a switch |
| 8 | Existing v2 demo data loads in v3 | ✅ frozen fixture, unit and browser |
| 9 | Invoices, payments, HPP, bookings and inventory intact | ✅ 23 collections deep-equal; balances and invoice model checked |
| 10 | Regression tests, typecheck, lint and build pass | ✅ (see the file-lock note above) |

## 2. Baseline (before any application change)

1. All seven login-dependent specs were moved to one helper, `tests/helpers/session.ts` → `enterAs(page, role?, persona?)`, which then still drove the old credential form.
2. The full suite was run with that helper and no other change. Raw output: [`docs/m3_1/baseline-test-results.txt`](m3_1/baseline-test-results.txt).
3. Result: **28 passed, 1 failed** in 13.9 min on a cold dev server.
   - The failure was `payment_history.spec.ts:87`, where the "Unduh Statement of Account PDF" link did not appear within 20 s.
   - Re-running that spec alone gave **2/2 passed** in 15.8 s, so it is a PDF-render timing flake, not a regression.
4. A frozen v2 workspace was generated from the **pre-M3.1 code** and committed as [`tests/fixtures/demo-v2.json`](../tests/fixtures/demo-v2.json) (318 KB). It contains:
   - a newly verified installment and a referenced cash payment;
   - a final HPP plus a draft revision;
   - a new Haji Khusus registration;
   - a stock receipt with a kit allocation and a partial handover;
   - a cancelled booking with refunded payments;
   - an agent commission status change and an activity written by the old hard-coded actor.

   The one-off generator was deleted after use.

## 3. What was built

### 3.1 Gateway (`/admin/login`)
- `components/admin/DemoGateway.tsx` replaces `LoginForm.tsx`, which was removed. There are no username or password inputs.
- The layout reuses the existing login split, now titled "Satu perjalanan, dilihat dari setiap peran".
- Roles are grouped into **Tim kantor** (5) and **Portal ponsel** (3). Each card shows an icon, a description, the destination ("Dashboard eksekutif", "Portal jamaah · ponsel"…), the persona, and a single **Masuk sebagai …** button.
- **Persona selection** for Agen, Tour Leader and Jamaah is read client-side from this browser's demo data. The server never sees `localStorage`. If stored data is unreadable, the cards fall back to seed personas and show a notice.
- The page includes "← Kembali ke Website", a "Data demo" disclaimer, and an "Akses demo · bukan keamanan produksi" badge.
- **Reset data demo** asks for confirmation (Batal / Ya, lanjutkan) and keeps the current role.
- `/admin/login?switch=1` keeps the gateway visible for a signed-in user, shows "Saat ini Anda masuk sebagai …" and marks the current card "Akses saat ini". Without `switch`, a signed-in user is redirected to their home.
- Accessibility: every card is a labelled `<form>` (`aria-label="Akses <Peran>"`) with a real `<button>`, giving keyboard access. Focus rings are visible, buttons are at least 46 px tall, the pending state reads "Menyiapkan akses…", and the grid becomes one column below 900 px.

### 3.2 Access model (centralised)

| File | Responsibility |
|---|---|
| `content/admin/roles.ts` | 8 `RoleDefinition`s: label, home, shell, default persona, module access (`read`/`write`) per nav slug, sensitive actions, portal tabs; persona staff fixtures; legacy label → role id |
| `lib/admin/access.ts` | Pure `can`, `canAccessRoute`, `canWriteModule`, `navigationFor`, `homeFor`, `isPortalRole` — used by server guards, the sidebar, the store and the tests |
| `components/admin/Store.tsx` | `transact(fn, message, module, permission?)` refuses any mutation the role lacks. The default check is write access to the module on screen; sensitive actions pass an explicit permission. Exposes `can()` and the resolved `actor` |

Sensitive actions wired to explicit permissions, with their buttons hidden when not allowed:

| Action | Where |
|---|---|
| Verify payment (`payment.verify`) | Finance verification table, `PaymentHistory` |
| Record payment (`payment.record`) | `CreateForm`, invoice/booking page |
| Cancel booking (`booking.cancel`) | Booking/invoice page |
| Finalize HPP (`hpp.finalize`) | Costing editor |
| Approve commission (Owner) / mark paid (Finance) | Agen & Komisi; the table shows "Menunggu persetujuan Owner" / "Menunggu pembayaran Finance" otherwise |
| Upload vs verify/reject documents | `DocumentChecklist`, Documents batch actions |
| Update visa (`visa.update`) | `VisaPanel`, Documents batch |
| Mark notifications read (`notification.read`) | Notification centre |
| Reset demo (`demo.reset`) | Profile menu, Superadmin only. Anyone may reset from the gateway, with confirmation |

Each quick-create entry ("Tambah …") is shown only to roles with its permission.

- Modules a role can only read show a **"Mode lihat saja"** notice. Any write attempt is refused with a toast that suggests "Ganti akses demo".
- **System › User & Roles** now shows the *real* matrix, read-only, from `roles.ts`. The old editable checkbox matrix was never enforced. The `permissions` key stays in `DemoState` for storage compatibility. New users and role changes now also set `roleId`.

### 3.3 Session and routes
- **Token v2:** `hasta-demo.v2.<ROLE>.<personaId>.<expires>.<hmac>` (`lib/admin/session-token.ts`), signed with `ADMIN_SESSION_SECRET`. The secret never reaches the client, and the cookie is `httpOnly`.
- **Cookies:**
  - New: `hasta_demo_session`, `path=/`, valid for both `/admin` and `/portal`, with an 8-hour lifetime.
  - Legacy: a valid `hasta_admin_session` (`path=/admin`, `hasta-demo-owner` token) is still accepted and maps to **Superadmin / USR-1**.
  - Entering a role clears the legacy cookie; logout clears both.
- **Guards:** `requireSession("staff" | "portal")` runs in the layouts **and** in each page, because the Next 16 guide notes that layouts don't re-render on navigation.
  - Invalid or expired sessions redirect to the gateway.
  - Staff opening `/portal/*` go to `/admin/dashboard`; portal roles opening `/admin/*` go to their portal home.
  - A portal role opening another role's portal goes to its own portal.
  - An admin slug the role may not use renders **AccessDenied** (HTTP 200) with "Kembali ke dashboard" and "Ganti akses demo".
- **Deep links** that existed before (`/admin/<slug>`, `/admin/<slug>/<id>`, `?departure=`) still work for every role allowed to open them.
- Next.js 16 docs consulted in `node_modules/next/dist/docs`: `cookies` (set/delete only in Server Functions), `redirect` (outside try/catch; push in Server Actions), the authentication guide (page-level checks, DAL pattern), `forbidden` (experimental, not used).

### 3.4 Staff dashboards (`components/admin/RoleDashboards.tsx`)
All figures come from existing selectors: `paid`, `outstanding`, `paymentStatus`, `readiness`, `members`, `documentPercent`, `validPassport`, `kitReady`, `calculateCosting`, `latestCosting`. Nothing is invented.

| Role | Shows |
|---|---|
| Superadmin | Original dashboard, unchanged |
| Owner | Booking value, verified cash, receivables, pending verifications, departures in preparation, draft HPP count; departure readiness; "Perlu keputusan" queue; estimated profit/margin per latest costing, labelled as a scenario estimate |
| Sales & CS | New leads, follow-ups due, lead→booking rate, bookings this month; prioritised follow-ups; pipeline by stage; recent bookings; unpaid/DP, missing documents, active Hajj registrations |
| Finance | Pending verifications (count/amount), received this month, receivables, overdue, unpaid expenses, simulated refunds; verification queue (oldest first); largest receivables; document availability |
| Operations | Departures, documents to verify, passports to review, visas in process, incomplete kits, upcoming events; readiness per departure and in detail for the nearest one; work queue; manasik schedule |

The "Komisi menunggu" figure on the Owner queue uses the existing per-agent model and is labelled as such. It will be replaced by the M3.3 ledger.

### 3.5 Portal shells (`/portal/agen`, `/portal/tour-leader`, `/portal/jamaah`)
- `app/portal/layout.tsx` uses the same single `DemoProvider` and `DemoState`. `PortalShell` provides:
  - a dark top bar with the role, persona name, and a "Demo · Ganti" pill;
  - a **bottom navigation** with 5 tabs, 56 px targets and safe-area padding on mobile;
  - a top tab bar from 760 px up;
  - a centred 560 px content column.
- Home screens use only existing data, read-only:
  - Agent: linked pilgrims and active bookings.
  - Pilgrim: booking, package, departure, payment status and outstanding balance.
  - Tour Leader: states honestly that no assignment exists yet; that arrives in M4.2.
- Other tabs show **"Segera hadir · M3.2 / M3.3 / M4.2 / M5.1"** with no fabricated numbers.
- "Lainnya" shows the demo account, "Ganti akses demo" and "Keluar".
- If the persona no longer exists in this browser's data, a "Persona demo tidak ditemukan — pilih ulang" screen appears.

### 3.6 Role switching
- "Ganti akses demo" is available in the profile menu, the sidebar, the top-bar role pill, the portal pill and portal "Lainnya". Each leads to `/admin/login?switch=1`.
- Switching only replaces the signed cookie. Tests verify that `localStorage` is **byte-identical** before and after a switch. No activity or business event is written, and the provider remounts per `role:persona`, so identity, navigation and guards update together.

### 3.7 Storage v3 and activity actor
- `lib/admin/migrations.ts` holds an ordered pipeline that runs **before** the shape check: v1→v2 (inventory, unchanged logic) then v2→v3.
- The storage key is unchanged (`hasta-workspace-m1.1`), and `encodeDemo` writes version 3.
- v2→v3 does three things:
  - sets `Staff.roleId` (USR-1 → `SUPERADMIN`, display label "Owner" → "Super Admin", because the demo account always had full access);
  - maps other legacy labels;
  - adds persona users USR-4 Zainal Abidin (Owner), USR-5 Wulan Sari (Operasional) and USR-6 Ust. Harun Rasyid (Tour Leader), unless the id or email already exists.

  No bookings, payments, HPP, Hajj, inventory, agents or activities are touched. No hierarchy, commission ledger or payout records are created.
- Decoding also validates that user ids are unique and every `roleId` is valid.
- A saved v2 workspace stays v2 in storage until the first real change, then is saved as v3.
- **Actor:** new activities record the current persona's name ("Rina Amelia", "Fajar Hidayat"…). Old records are not rewritten. Inventory `operatorId` is still `USR-1`; see §6.

## 4. Role-permission and migration test results

New spec `tests/m3_1_gateway.spec.ts` (10 tests):

| Test | Covers |
|---|---|
| role matrix | 8 roles, homes, `navigationFor` per role, portal roles have no admin modules, action permissions (verify, record, finalize, document verify, reset) |
| v2 session tokens | signature, expiry, tamper, invalid role, invalid persona, legacy owner token → Superadmin |
| frozen v2 → v3 migration | 23 business collections deep-equal to the fixture; balances unchanged for every booking; invoice model still builds; roleIds + 3 personas; old activity actor kept; v3 round-trip and idempotent re-run |
| all eight roles | enter without credentials from one page, correct home URL and heading, role pill, no page errors |
| navigation & AccessDenied | Finance sees Pembayaran but not Rooming; AccessDenied on `/admin/rooming`; Sales cannot verify ("Menunggu Finance") nor open HPP; Owner read-only notice and Finalisasi visible; staff→portal and portal→admin redirects; Superadmin deep links (Hajj detail, departure detail, agent detail, manifest `?departure=`) |
| sessions | garbage cookie, valid v2, expired v2, legacy cookie → Superadmin; entering clears the legacy cookie; logout leaves no session cookie; `/portal` then redirects to the gateway |
| role switching | Sales adds a lead (actor Rina Amelia) → switch (storage unchanged) → Finance nav replaced, CRM denied, verifies payment (actor Fajar Hidayat) → back to Superadmin, lead still present |
| saved v2 workspace in the browser | fixture loaded into `localStorage` opens without reset; stays v2 until a change, then saved as v3 with personas and handovers intact |
| persona & mobile portal | 390 px: chosen pilgrim persona, 5-tab bottom nav ≥ 44 px, no horizontal overflow, coming-soon tab, "Lainnya"; agent persona AGT-002; Tour Leader; desktop top nav |
| refresh & reset | refresh keeps the Finance session; gateway reset cancel keeps data; confirm restores the exact seed and keeps the role |

Existing specs: all login-dependent flows now enter through `enterAs`. `admin.spec.ts` asserts the gateway has no password or email inputs, and its existing session-token unit test still passes against the legacy functions.

## 5. Screenshots

All screenshots are in [`docs/m3_1/screenshots/`](m3_1/screenshots/). They were captured from the dev server on 2026-11-08, with the Next.js dev overlay hidden.

| # | Screen | File |
|---|---|---|
| 1 | Gateway — desktop 1440 | [01-gateway-desktop.png](m3_1/screenshots/01-gateway-desktop.png) |
| 2 | Gateway — mobile 390 | [11-gateway-mobile.png](m3_1/screenshots/11-gateway-mobile.png) |
| 3 | Gateway — switch mode ("Saat ini Anda masuk sebagai …") | [09-gateway-switch-mode.png](m3_1/screenshots/09-gateway-switch-mode.png) |
| 4 | Superadmin dashboard (unchanged) | [02-dashboard-superadmin.png](m3_1/screenshots/02-dashboard-superadmin.png) |
| 5 | Owner / Direktur dashboard | [03-dashboard-owner.png](m3_1/screenshots/03-dashboard-owner.png) |
| 6 | Sales & CS dashboard | [04-dashboard-sales.png](m3_1/screenshots/04-dashboard-sales.png) |
| 7 | Finance dashboard (desktop / mobile) | [05-dashboard-finance.png](m3_1/screenshots/05-dashboard-finance.png) · [17-dashboard-finance-mobile.png](m3_1/screenshots/17-dashboard-finance-mobile.png) |
| 8 | Operasional dashboard | [06-dashboard-operations.png](m3_1/screenshots/06-dashboard-operations.png) |
| 9 | AccessDenied (Finance → Rooming) | [07-access-denied-finance.png](m3_1/screenshots/07-access-denied-finance.png) |
| 10 | Read-only module (Owner → Rooming) | [08-readonly-owner-rooming.png](m3_1/screenshots/08-readonly-owner-rooming.png) |
| 11 | Role matrix (System › User & Roles) | [10-role-matrix-superadmin.png](m3_1/screenshots/10-role-matrix-superadmin.png) |
| 12 | Agent portal — mobile | [12-portal-agent-mobile.png](m3_1/screenshots/12-portal-agent-mobile.png) |
| 13 | Tour Leader portal — mobile | [13-portal-tour-leader-mobile.png](m3_1/screenshots/13-portal-tour-leader-mobile.png) |
| 14 | Pilgrim portal — mobile (home, coming soon, Lainnya) | [14-portal-pilgrim-mobile.png](m3_1/screenshots/14-portal-pilgrim-mobile.png) · [15-…coming-soon](m3_1/screenshots/15-portal-pilgrim-coming-soon-mobile.png) · [16-…more](m3_1/screenshots/16-portal-pilgrim-more-mobile.png) |

## 6. Known limitations and deferred work

- **Demo access only.** Role checks run in the browser store and in server route guards. There is no server-side data authorisation, because the data lives in `localStorage`.
- **Read-only modules still render some edit buttons** (for example "Tambah booking" for Owner). Writes are refused centrally with a clear toast, and the page shows "Mode lihat saja". Hiding every edit control module by module is deferred.
- **Inventory operator** stays `USR-1` in stock and handover records, to keep M2 ledger snapshots and their tests unchanged. Passing the persona into inventory domain functions is planned with M4.2.
- **Tour Leader** has no assignment data yet. The portal says so. Departure screens still show hard-coded TL/muthawwif text until M4.2.
- **Personas are validated on the client**, since the server cannot see demo data. A deleted persona produces the "pilih ulang" screen rather than a server error.
- **Pending payments on cancellation** keep the existing `Dikembalikan` behaviour (decision D16).
- Not started, by design: M3.2 (agent codes, hierarchy, attribution), M3.3 (commission ledger, payouts), M4.x, M5.x, the public website redesign.
- Deviations from `HASTA_V2_ROLE_MATRIX.md`, all minor:
  - Every staff role may mark its own notifications as read (personal state).
  - Owner "approve" on Agen and hierarchy actions are deferred to M3.2.
  - Sales "cancellation request" is deferred to M5.2.
- **Test-only secret:** `playwright.config.ts` passes a test-only `ADMIN_SESSION_SECRET` to the dev server it starts, so expired and legacy cookies can be crafted. When an already-running server uses another secret, those assertions skip instead of failing.

## 7. Files

| Kind | Files |
|---|---|
| New | `content/admin/roles.ts`, `lib/admin/access.ts`, `lib/admin/migrations.ts`, `components/admin/DemoGateway.tsx`, `components/admin/AccessDenied.tsx`, `components/admin/RoleDashboards.tsx`, `app/portal/layout.tsx`, `app/portal/[[...path]]/page.tsx`, `components/portal/PortalShell.tsx`, `components/portal/PortalScreen.tsx`, `tests/helpers/session.ts`, `tests/m3_1_gateway.spec.ts`, `tests/fixtures/demo-v2.json` |
| Changed | `lib/admin/session-token.ts`, `lib/admin/auth.ts`, `app/admin/actions.ts`, `app/admin/login/page.tsx`, `app/admin/page.tsx`, `app/admin/(workspace)/layout.tsx`, `app/admin/(workspace)/[...path]/page.tsx`, `components/admin/{Store,Shell,AdminScreen,CreateForm,System,Finance,PaymentHistory,Partners,Jamaah,Documents,Communication,Costing,Guide}.tsx`, `content/admin/{types,seed}.ts`, `lib/admin/persistence.ts`, `app/admin/admin.css`, `playwright.config.ts`, all login-dependent specs, `README.md`, `docs/ADMIN_SHOWCASE.md` |
| Removed | `components/admin/LoginForm.tsx` |
