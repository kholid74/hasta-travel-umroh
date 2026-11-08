# Hasta Travel Workspace V2 — Repository Audit (M3.0)

> Planning milestone. No application source was modified. Every finding below cites the file that proves it; nothing is claimed from a menu label alone.

| | |
|---|---|
| Branch / commit | `feature/hasta-finance-inventory` @ `79bad09` (2026-11-05) |
| Stack | Next.js 16.3.4 (App Router), React 19.2.8, Tailwind 4, `pdf-lib` + `@pdf-lib/fontkit`, `recharts`, `lucide-react`, Playwright 1.63 |
| Baseline health (this audit) | `npm run typecheck` passes · `npx eslint` passes with no findings · last recorded Playwright run `test-results/.last-run.json` = **passed, 29 tests** (3.3 min). The Playwright suite was **not** re-run during this audit. |
| Companion docs | [Role matrix](HASTA_V2_ROLE_MATRIX.md) · [Architecture](HASTA_V2_ARCHITECTURE.md) · [Data contracts](HASTA_V2_DATA_CONTRACTS.md) · [Roadmap](HASTA_V2_ROADMAP.md) |

Status legend used throughout:

| Code | Meaning |
|---|---|
| **FUNCTIONAL** | Implemented and works end-to-end in the demo (state changes, validation, persistence) |
| **INCOMPLETE** | Implemented, but key rules/flows are missing or partly hard-coded |
| **UI-ONLY** | Screen exists; data is static, simulated text, or the setting is not enforced anywhere |
| **MISSING** | No code exists |
| **REFACTOR** | Works today but its model blocks V2 requirements and must be restructured first |

---

## 1. App Router structure

```
app/
├─ layout.tsx                       root: Instrument Serif + Manrope fonts, <html lang="id">
├─ globals.css
├─ icon.png
├─ (public)/                        marketing site (static content from content/*.ts)
│  ├─ layout.tsx                    Header/Footer
│  ├─ page.tsx · faq · haji-khusus · jadwal-keberangkatan · kontak · tentang
│  └─ paket-umroh/ page.tsx · [slug]/page.tsx
└─ admin/
   ├─ layout.tsx                    imports admin.css, robots noindex
   ├─ page.tsx                      redirect → /admin/dashboard or /admin/login
   ├─ login/page.tsx                credential form (LoginForm)
   ├─ actions.ts                    server actions: login(), logout()
   ├─ error.tsx · not-found.tsx
   └─ (workspace)/
      ├─ layout.tsx                 requireSession() → <DemoProvider><Shell>
      ├─ loading.tsx
      └─ [...path]/page.tsx         single catch-all for every module
```

- There is **no `proxy.ts`** (Next 16's renamed middleware). Route protection is done in server layouts/pages via `requireSession()`.
- `[...path]/page.tsx:9` whitelists the first segment against `adminRoutes` and allows a second segment only for `jamaah, paket, booking, invoice, keberangkatan, agen, hpp, haji-khusus`. Anything deeper is `notFound()`.
- `components/admin/AdminScreen.tsx` is a client-side dispatcher mapping slugs to 18 lazily loaded module components (`next/dynamic`). Several slugs share a component (e.g. `booking/invoice/pembayaran/pengeluaran` → `Finance`).
- The public site does **not** read `DemoState`; admin edits never reach public pages (`content/packages.ts` is static).

## 2. Login / admin entry and session

| Element | Evidence | Behaviour |
|---|---|---|
| Login form | `components/admin/LoginForm.tsx` | Prefilled `demo@hasta.example` / `HastaDemo2026!`, "Ingat saya", password toggle, demo notice |
| Credential check | `app/admin/actions.ts:6` | Hard-coded single credential |
| Session token | `lib/admin/session-token.ts` | HMAC-SHA256 over fixed payload `hasta-demo-owner.<expires>`; regex-validated; `timingSafeEqual`; max 30 days |
| Cookie | `lib/admin/auth.ts:14,29-31` | `hasta_admin_session`, `httpOnly`, `sameSite=lax`, **`path: "/admin"`**, 8 h or 30 days |
| Secret | `lib/admin/auth.ts:9-13` | `ADMIN_SESSION_SECRET` ≥ 32 chars; random per-process fallback outside production; production without secret = login refused |
| Session identity | `lib/admin/auth.ts:18` | Always returns `{ name: "Ahmad", role: "Owner" }` — no role concept in the token |

**Classification:** FUNCTIONAL for a single demo account; **REFACTOR** for V2 (token carries no role/persona; cookie path excludes any non-`/admin` portal).

## 3. Navigation, sidebar and layout

- `content/admin/navigation.ts` — 10 groups, **33 slugs** (`OVERVIEW, SALES, OPERASIONAL, FINANCE, PARTNERS, INVENTORY, COMMUNICATION, REPORTS, WEBSITE, SYSTEM`). `adminRoutes` and `moduleTitle` are derived from it.
- `components/admin/Shell.tsx` provides: collapsible desktop sidebar, mobile nav in a `<dialog>`, breadcrumb, ⌘K global search (jamaah, Hajj packages, packages, bookings, invoices, departures, agents), quick-create menu (Jamaah, Booking, Lead, Paket, Pembayaran, Pengeluaran), notification bell, profile menu (settings, **reset demo data**, logout), a "Demo" tag and footer.
- Profile is hard-coded: avatar "Ahmad Fauzi", label "Ahmad · Owner" (`Shell.tsx:41`). Note "Ahmad Fauzi" is also seed jamaah `JMH-10281`.
- The sidebar is the same for everybody; there is no per-role filtering.
- Breakpoints in `app/admin/admin.css`: 380, 480, 760, 1000, 1100, 1250, 1600 px. Tokens: `--a-bg #f5f6f3`, `--a-surface #fff`, `--a-ink #202d28`, `--a-muted #738079`, `--a-line #e4e8e2`, `--a-green #245b45`, `--a-amber #f0a62b`.
- Shared UI kit `components/admin/ui.tsx`: `PageHeader, Badge (tone by regex), Stat, Panel, Progress, Tabs, Avatar, Person, Empty, Modal (<dialog>), Confirm, DataTable (search/sort/paginate/select/Excel export), SelectFilter, Fields`. `DataTable` is a desktop table with horizontal scroll — not a mobile card list.

**Classification:** FUNCTIONAL (single-persona); needs role-aware navigation (REFACTOR).

## 4. Existing role / account simulation

| Item | Evidence | Status |
|---|---|---|
| `users: Staff[]` (3 users: Ahmad Owner, Rina Amelia Sales, Fajar Hidayat Finance) | `content/admin/seed.ts:68` | UI-ONLY |
| `permissions: Record<string,string[]>` for 7 roles × 7 coarse permissions | `seed.ts:69`, `System.tsx:23` | UI-ONLY — editable checkbox matrix, **not enforced anywhere**; the screen itself says "Akun demo tetap berperan Owner" |
| Activity log actor | `Store.tsx:48` | Always `"Ahmad"` |
| Inventory operator | `lib/admin/inventory.ts` (`operatorId: "USR-1"` everywhere) | Hard-coded; `validateInventory` requires `operatorId ∈ users` |
| Tour leader / muthawwif | `Departures.tsx:18` | Hard-coded strings "Fajar Hidayat" / "Ust. Abdullah Karim" (Fajar Hidayat is also the Finance user **and** jamaah `JMH-10299`) |
| Sales person on lead | `Lead.sales: string` (`types.ts:34`) | Free-text name, not a user reference |

**Conclusion:** there is no working role model. V2 role gating is greenfield, but the `users`/`permissions` keys must stay in `DemoState` for storage-shape compatibility (see §6).

## 5. DemoStore (`components/admin/Store.tsx`)

- One React context, initialised from `createSeed()`, hydrated from `localStorage` in an effect; renders a status message until ready; renders an explicit "Reset data demo" screen if stored data cannot be decoded.
- `transact(fn, message, module)`:
  1. `structuredClone` of current state → `fn(draft)` (domain functions throw `Error` with Indonesian messages);
  2. `assertInventoryHistory(before, after)` — append-only guard for stock movements/handovers and immutable allocation snapshots;
  3. `validateInventory(after)` — full ledger re-validation;
  4. prepend an `Activity` (user `"Ahmad"`);
  5. `localStorage.setItem` — failure aborts the commit;
  6. commit + toast.
- `reset()` re-seeds and bumps `resetVersion`.
- **The whole state is serialised on every mutation.** Cheap today; grows with ledgers (see Architecture §7).

**Classification:** FUNCTIONAL; good foundation — the transactional, validate-then-commit pattern should be reused for commission/payout ledgers.

## 6. localStorage schema and migrations (`lib/admin/persistence.ts`)

| Aspect | Current |
|---|---|
| Key | `hasta-workspace-m1.1` |
| Envelope | `{ version: 2, state: DemoState }` |
| Accepted versions | 1, 2 |
| v1 → v2 migration | `initializeInventory()` converts legacy `{id,name,stock,minimum}` items + `jamaah.equipment[]` into the M2 ledger (`content/admin/inventory.ts:176`) |
| Ad-hoc in-version backfill | `settings.accountHolder = ""` when missing (`persistence.ts:25`) |
| Shape guard | `sameShape(state, createSeed())` — every key present in the **seed** (and in the seed's **first array element**) must exist with the same `typeof` in stored data |
| Referential checks | unique IDs, booking→jamaah/departure/hajj package, payment→booking, positive safe integers, costing validity, Hajj package validity, full inventory validation |
| Size guard | 10,000,000 characters; arrays ≤ 10,000 items |

**Critical implication for V2:** adding *any* new top-level key or a new required field on the first element of a seeded array makes every existing stored workspace fail `sameShape` and forces a reset — unless `decodeDemo` runs an explicit migration **before** the shape check (as v1→v2 does). Empty seeded arrays (`costScenarios`, `broadcasts`) skip element checks. `null` values are unsafe in the shape check (`typeof null === "object"`); use `""`/omitted optional fields.

**Classification:** FUNCTIONAL; migration pipeline must be generalised (REFACTOR) before V2 schema work.

## 7. Data inventory (`DemoState`, `content/admin/types.ts:43`)

| Key | Type source | Seed volume (from `seed.ts`) | Notes |
|---|---|---|---|
| `packages` | `AdminPackage` (public `Package` minus departures + status) | 20 | From `content/packages.ts` |
| `departures` | `Departure` | 8 | One per selected package; `checks` = 6 manual booleans |
| `jamaah` | `Jamaah` | 48 Umrah + 3 Hajj | Carries documents, visa, `agentId`, `family`, legacy `equipment[]`, `bus` |
| `bookings` | `Booking` | 48 + 3 | One active booking per jamaah enforced |
| `payments` | `Payment` | DP for all + 2nd installment for 36, some `Menunggu`; 3 Hajj | |
| `leads` | `Lead` | 24 | Stages `Lead Baru…Lost` |
| `agents` | `Agent` | 10 | `level` string, flat `commission`, `status` (commission status) |
| `rooms` | `Room` | 64 (8 dep × 2 hotels × 4) | Capacity 4/4/3/2, gender-specific |
| `expenses` | `Expense` | 80 | Vendors derived from here |
| `manasik` | `Manasik` | 5 (departure 0 only) | `attendees: string[]` |
| `activities`, `notifications`, `cms`, `broadcasts` | — | 3 / 6 / 6 / 0 | |
| `users`, `permissions`, `settings` | — | 3 / 7 roles / 17 keys | |
| `hajjPackages` | `HajjPackage` | 2 | `content/admin/hajj.ts` |
| `costings`, `costTemplates`, `costScenarios` | `content/admin/costing.ts` | 5 / 5 / 0 | |
| `inventory, warehouses, stockMovements, kitTemplates, kitAllocations, handovers` | `content/admin/inventory.ts` | 9 items / 2 warehouses / … | M2 ledger |

`DEMO_TODAY = "2026-10-02"` (`seed.ts:8`) drives due dates and statuses, while `payment.verifiedAt` uses the **real clock** (`model.ts:93`) — dates are mixed.

## 8. Booking and pilgrim models

- `Jamaah` (`types.ts:16`): identity, passport, `documents: Record<string, DocumentStatus>`, visa fields (one visa per person, **not per booking/trip**), `agentId`, `family` (free-text group name), `equipment[]` (legacy, superseded by kit ledger), `bus` (free text, **global**, not per departure).
- `Booking` (`types.ts:24`): `productType UMRAH | HAJJ_SPECIAL`, `departureId` (Umrah) or `hajjPackageId` (Hajj), `roomType`, `total` (IDR integer, snapshot at booking), `contractDescription` and `priceAssumption` snapshots, `status Aktif | Batal`. **No agent attribution on the booking.**
- Domain functions (`lib/admin/model.ts`): `addBooking` (package published, departure in preparation, one active booking, capacity), `convertLead` (creates jamaah + booking, **drops agent attribution** because `newJamaah` sets `agentId: ""`), `members`, `bookingFor`, `packageForBooking`.
- **FUNCTIONAL**, with gaps: attribution lives on the person (re-assignable at any time via `Jamaah.tsx:64`), documents/visa are person-level, a returning pilgrim's old visa carries over.

## 9. Payments, refunds, invoices, receipts

| Capability | Evidence | Status |
|---|---|---|
| Record payment (`Menunggu`), guards against exceeding balance incl. pending | `model.ts:78` `recordPayment` | FUNCTIONAL |
| Verify payment | `model.ts:87` `verifyPayment`; lead → `Won` when fully paid | FUNCTIONAL |
| Balance maths with `BigInt`, strict mode blocks over-collection before PDF | `model.ts:12` `financialBalance` | FUNCTIONAL |
| Payment status labels | `model.ts:24` — `DP` = paid ≤ Rp 10.000.000 (hard-coded heuristic, Umrah only) | INCOMPLETE |
| Payment history panel (shared by booking and jamaah pages) | `PaymentHistory.tsx` | FUNCTIONAL — contains a **Verify** button (must become read-only for portals) |
| Invoice screen | `Finance.tsx:27` | FUNCTIONAL |
| Invoice / Statement / Receipt PDFs | `financial-documents.ts`, `financial-pdf.ts`, `FinancialDocuments.tsx` | FUNCTIONAL — real A4 PDFs, logo + Lato, pagination, Latin-glyph guard |
| Refund | `Finance.tsx:29` — "Batalkan booking" sets booking `Batal`, **all** payments (incl. `Menunggu`) → `Dikembalikan`, rooms released for that departure, lead → `Lost` | INCOMPLETE — no partial refund, no refund record/date/amount, no refund document; does **not** release kit reservations, bus seat, manasik attendance, or touch commission; logic lives inline in a component |
| Documents for cancelled bookings | `financial-documents.ts:11` | Blocked ("hanya booking aktif") |
| Payment reminders | Simulated toast | UI-ONLY |
| Hajj payment milestones | `HajjPackage.milestones` validated to sum 100 % | INCOMPLETE — plan only, not linked to invoices/due dates |

## 10. HPP, packages, departures, Haji Khusus

- **HPP / costing** (`lib/admin/costing.ts`, `Costing.tsx`, `CostingComparison.tsx`): exact decimal maths with `BigInt`, per-person / per-group / per-unit lines, IDR/SAR/USD with stored rates, FOC allocation, margin vs markup, break-even, Draft→Final with immutable finals and revisions, package templates, saved scenarios, version comparison, "actual expenses" panel. **FUNCTIONAL** and well tested (`tests/costing.spec.ts`). Contains a "Komisi agen" cost category (planned commission) that is not linked to any actual commission.
- **Packages** (`Packages.tsx`): list, detail tabs (Overview, Itinerary, Harga, Hotel, Penerbangan, Jamaah, Dokumen, Finance), edit, copy as draft, archive; `website-paket` reuses it. **FUNCTIONAL** (admin-only; public site unaffected).
- **Departures** (`Departures.tsx`): list with readiness %, create, detail with readiness breakdown, manual checklist, status `Persiapan → Berangkat` gated on 100 % readiness → `Selesai`. Tour leader / muthawwif are hard-coded text. **INCOMPLETE**.
- **Readiness** (`model.ts:34`): equal-weight mean of 7 derived checks (confirmed, payment, passport, visa, room in both hotels, any manasik attendance, kit complete) + 6 manual booleans. No severity, no dates/deadlines, no blockers list; `"Tour leader"` is a checkbox, not an assignment.
- **Haji Khusus** (`Hajj.tsx`, `lib/admin/hajj.ts`, `content/admin/hajj.ts`): package editor with validation, FX-snapshotted contract price, registration creating a shared `Booking`, registration/planning statuses, HPP link. **FUNCTIONAL** for planning; Hajj bookings are excluded from manifest, rooming, transport and departure readiness (they have no `departureId`).

## 11. Agents and commission (`components/admin/Partners.tsx`)

| Aspect | Current implementation | Assessment |
|---|---|---|
| Master record | `Agent { id, name, phone, city, level, commission, status }` | `level` is free text ("Agent", "Senior Agent", "Coordinator"); no referral code, hierarchy, join date, active flag |
| Attribution | `jamaah.agentId` (`Partners.tsx:16`) | Person-level, mutable, not snapshotted; lead conversion loses it |
| Commission formula | `activeBookings × agent.commission` (`Partners.tsx:17`) | Flat per pilgrim; counts **unpaid** and Hajj bookings; recalculated live |
| Approval / payout | `approve()` toggles **agent-level** `status` `Menunggu → Disetujui → Dibayar` (`Partners.tsx:18`) | No per-booking ledger, no period, no batch; once `Dibayar`, new bookings are silently shown as "paid"; cancellation silently lowers an already-"paid" total |
| Reversal | None (implicit by recomputation) | Duplicate/phantom payouts are possible |
| Agent detail tabs | Profil, Jamaah, Booking, Komisi, Pembayaran (same panel as Komisi), Aktivitas (matched by name substring) | INCOMPLETE |
| Reports | "Performa agen" in `Reports.tsx:29` (same flat formula) | INCOMPLETE |
| Agent portal | — | MISSING |

**Classification: REFACTOR.** The client feedback in `new_feature_instruction.md` (item 4, "Advanced agent commissions with milestone-based incentives") is still open.

## 12. Inventory / Pilgrim kit (M2)

`lib/admin/inventory.ts`, `content/admin/inventory.ts`, `Inventory.tsx` (tabs: Overview, Master Barang, Barang Masuk/Keluar, Template Perlengkapan, Distribusi, Riwayat Serah Terima, Laporan), `HandoverReceipt.tsx`.

- Append-only stock ledger (`OPENING, RECEIPT, HANDOVER, RETURN, ADJUSTMENT_IN/OUT`), warehouses, item snapshots, kit templates per product type, allocation-as-reservation, partial/multiple handovers, release of remaining reservation, returns with damaged-goods disposal, CSV report, handover PDF.
- `validateInventory` + `assertInventoryHistory` enforce invariants on every transaction and on load.
- **FUNCTIONAL** (strongest module). Gap: booking cancellation does not auto-release reservations (manual release; tested in `m2.spec.ts:49-55`). `operatorId` is always `USR-1`.

## 13. Operations modules

| Module | Evidence | Status | Gaps |
|---|---|---|---|
| Dokumen & Visa | `Documents.tsx`, `DocumentChecklist`/`VisaPanel` in `Jamaah.tsx` | FUNCTIONAL (simulated upload; file never stored) | No history/audit of verification, no rejection reason, only passport has expiry, visa per person, required documents are the fixed `documentNames` list (8 incl. "Buku nikah", "Akta kelahiran" for everyone) — `settings.documents` is stored but unused |
| Manifest | `Documents.tsx` (manifest mode) | FUNCTIONAL | Umrah only; `manifestReady` requires 100 % of all 8 docs; print via popup; SISKOPATUH-prep checklist + XML-spreadsheet export (explicitly simulated) |
| Rooming | `Rooming.tsx`, `assignRoom`/`autoAssign` | FUNCTIONAL | Booking `roomType` not checked against room capacity; hotel is `"Makkah" \| "Madinah"` label; seed intentionally under-capacity; cancellation releases rooms |
| Manasik | `Operations.tsx` | FUNCTIONAL | Attendance toggle only; not cleared on cancellation; default departure = first in list |
| Transportasi | `Operations.tsx:24` | INCOMPLETE / partly UI-ONLY | Flight times, terminal, driver, route hard-coded; buses `Bus 01/02` hard-coded with capacity 45; `jamaah.bus` is a global string so it leaks across departures; only outbound flight |
| Tour Leader workspace | — | MISSING | |
| Incidents | — | MISSING | |
| Pilgrim portal | — | MISSING | |

## 14. CRM, communication, CMS, reports, dashboard, system

| Module | Evidence | Status | Notes |
|---|---|---|---|
| CRM / Leads | `CRM.tsx` | FUNCTIONAL | Kanban + table, drag stages, notes, follow-up date, conversion to jamaah+booking; `sales` is a name string; no agent link, no timestamps/authors on notes, no lost reason |
| Leads website | `CRM.tsx` (`website` flag) | UI-ONLY variant | Filter preset; the public site is not connected |
| Broadcast | `Communication.tsx` | UI-ONLY (simulated send, recorded history) | Personalisation preview uses first recipient only |
| Notification center | `Communication.tsx` | UI-ONLY | Static seed; nothing generates notifications |
| CMS (artikel/testimoni/galeri) | `CMS.tsx` | FUNCTIONAL inside workspace | Not published to public site (by design) |
| Dashboard | `Dashboard.tsx` | FUNCTIONAL (derived) | Greeting "Selamat pagi, Ahmad" hard-coded; period selector limited to 3 months |
| Laporan / Analytics | `Reports.tsx` | FUNCTIONAL (derived) | 10 report types; analytics = same component; profitability uses expenses only (no HPP); agent performance uses flat formula |
| Panduan Admin | `Guide.tsx` | FUNCTIONAL | `tests/admin.spec.ts:116` asserts the guide links **every** nav slug — adding nav items requires guide updates |
| Users & Roles | `System.tsx` | UI-ONLY | See §4 |
| Activity log | `System.tsx` | FUNCTIONAL | Actor hard-coded; per-entity filters by name substring (name collisions between staff and jamaah exist) |
| Settings | `System.tsx` | INCOMPLETE | Only bank/account/accountHolder are consumed (invoice + PDFs); others stored only |
| Global search / quick create | `Shell.tsx` | FUNCTIONAL | |

## 15. Shared PDF components and templates

- `lib/admin/financial-pdf.ts` — `renderFinancialPDF(model, assets?)`: A4 pages, dark-green header band with logo, gold accent, Lato embedded with subset, Latin-glyph guard (throws on unsupported characters), table pagination, totals that never split. Assets fetched in-browser from `/logo-mark.png`, `/fonts/Lato-*.ttf`; tests pass assets explicitly.
- Models: `financialDocument()` → invoice / receipt / statement (`lib/admin/financial-documents.ts`); `handoverDocument()` → kit handover (`lib/admin/inventory.ts`).
- Preview components: `FinancialDocuments.tsx` (key = `JSON.stringify(state)` — heavy re-render key), `HandoverReceipt.tsx`.
- Other output: `exportExcel` (SpreadsheetML `.xml`), `exportCSV` (formula-injection guarded, used by Inventory), `printTable` (popup print).
- **Reusable for V2:** commission statement, payout slip, manifest PDF, pilgrim itinerary — all can be new `kind`s on the same renderer.

## 16. Tests and scripts

| Script | Command |
|---|---|
| `dev` / `build` / `start` | Next defaults |
| `lint` | `eslint` |
| `typecheck` | `next typegen && tsc --noEmit` |
| `test:admin` | `playwright test` (single worker, Chrome channel, 1440×1000, dev server on port 3100, base URL overridable by `PLAYWRIGHT_BASE_URL`) |

| Spec | Tests | Kind |
|---|---|---|
| `admin.spec.ts` | 6 | model invariants, session token, every sidebar route, guide coverage, lead→booking→payment→inventory, ops actions |
| `costing.spec.ts` | 6 | HPP maths + UI |
| `m1_1.spec.ts` | 4 | Hajj + storage corruption/quotas |
| `m1_2.spec.ts`, `m1_2b.spec.ts` | 3 | PDF content, pagination, branding |
| `invoice_layout.spec.ts` | 2 | bank placement, pagination 4/10/25 |
| `payment_history.spec.ts` | 2 | installment history in PDFs and UI |
| `m2.spec.ts` | 6 | inventory ledger, v1→v2 migration, handover PDF, UI |

Coupling to note: every UI spec logs in through `/admin/login` by clicking **"Masuk ke workspace"** (7 spec files, several private `login()` helpers) and some assert the heading **"Selamat pagi, Ahmad"**. `m2.spec.ts` imports `@napi-rs/canvas`, which is only a transitive dev dependency of `pdfjs-dist` — fragile.

## 17. Feature classification summary

| Feature | Status | Evidence |
|---|---|---|
| Public catalog site | FUNCTIONAL | `app/(public)` |
| Demo login (single credential, signed cookie) | FUNCTIONAL → REFACTOR for roles | `auth.ts`, `session-token.ts` |
| Role-based access | MISSING (matrix is UI-ONLY) | `System.tsx:23` |
| Workspace shell, search, quick create | FUNCTIONAL | `Shell.tsx` |
| DemoStore + transactional persistence | FUNCTIONAL | `Store.tsx` |
| Versioned storage + migration | FUNCTIONAL (v1→v2) → REFACTOR to pipeline | `persistence.ts` |
| Dashboard | FUNCTIONAL (single persona) | `Dashboard.tsx` |
| CRM / leads / conversion | FUNCTIONAL | `CRM.tsx`, `convertLead` |
| Booking (Umrah) | FUNCTIONAL | `addBooking` |
| Haji Khusus registration & planning | FUNCTIONAL | `lib/admin/hajj.ts` |
| Jamaah master + detail tabs | FUNCTIONAL | `Jamaah.tsx` |
| Payments record/verify/history | FUNCTIONAL | `model.ts` |
| Refund / cancellation | INCOMPLETE | `Finance.tsx:29` |
| Invoice / receipt / statement PDF | FUNCTIONAL | `financial-*.ts` |
| Expenses / vendors | FUNCTIONAL (vendors derived only) | `Finance.tsx`, `Partners.tsx` |
| HPP & pricing simulation | FUNCTIONAL | `costing.ts` |
| Packages admin | FUNCTIONAL | `Packages.tsx` |
| Departures + readiness | INCOMPLETE | `Departures.tsx`, `readiness()` |
| Manifest + SISKOPATUH prep export | FUNCTIONAL (simulated) | `Documents.tsx` |
| Documents & visa | INCOMPLETE | `Jamaah.tsx`, `Documents.tsx` |
| Rooming | FUNCTIONAL | `Rooming.tsx` |
| Manasik attendance | FUNCTIONAL | `Operations.tsx` |
| Transport / flights | INCOMPLETE (hard-coded) | `Operations.tsx:24` |
| Inventory & pilgrim kits | FUNCTIONAL | M2 files |
| Agents | REFACTOR | `Partners.tsx` |
| Commission | REFACTOR | `Partners.tsx:17-18` |
| Agent career / network / rewards / payouts | MISSING | — |
| Agent / Tour Leader / Pilgrim portals | MISSING | — |
| Tour leader assignment, attendance, incidents | MISSING | — |
| Broadcast / notifications | UI-ONLY | `Communication.tsx` |
| CMS | FUNCTIONAL (workspace-only) | `CMS.tsx` |
| Reports / analytics | FUNCTIONAL (derived) | `Reports.tsx` |
| Executive insights (profitability vs HPP, aging, risk) | MISSING | — |
| Users & roles | UI-ONLY | `System.tsx` |
| Settings | INCOMPLETE | `System.tsx` |
| Activity log | FUNCTIONAL (actor hard-coded) | `Store.tsx:48` |

## 18. Gaps and technical debt (ranked for V2 impact)

1. **No role in the session** — `getSession()` returns a constant; cookie path `/admin` (`auth.ts:18,31`).
2. **`sameShape` makes schema growth reset-prone** without a migration step (`persistence.ts:27`).
3. **Commission is a live aggregate, not a ledger**; approval is per agent, not per earning (`Partners.tsx:17-18`).
4. **Attribution on `Jamaah`, not on `Booking`**; lead conversion drops it (`model.ts:71`, `seed.ts:14`).
5. **Cancellation logic inline in a component** and partial (no kit release, bus, manasik, commission) (`Finance.tsx:29`).
6. **Hard-coded people and logistics**: actor "Ahmad", tour leader, muthawwif, driver, flight times, bus list/capacity (`Store.tsx:48`, `Departures.tsx:18`, `Operations.tsx:24`).
7. **Visa and documents are person-level** with no history; required docs not configurable per product/profile (`types.ts:16-21`, `seed.ts:9`).
8. **`jamaah.bus` is global**, not per departure.
9. **Readiness is an unweighted mean** without blockers, severity or deadlines (`model.ts:34`).
10. **Hajj is outside all departure operations** (no `departureId`).
11. **Mixed clocks**: `DEMO_TODAY` vs real `new Date()` in `verifiedAt`, activities, finalisation timestamps.
12. **Name collisions** between staff and jamaah ("Ahmad Fauzi", "Rina Amelia", "Fajar Hidayat", "Nadia Putri", "Dimas Pratama"), while activity filters match by name substring.
13. **`DataTable` is not mobile-first**; portals need a card/list primitive.
14. **Duplicated status vocabularies as string literals** across components (filters repeat union values).
15. **Whole-state JSON per keystroke-level transaction** and `JSON.stringify(state)` as a React key in PDF preview.
16. **`DP` threshold Rp 10 jt hard-coded** in `paymentStatus`.
17. **Tests depend on login button text and dashboard greeting**; guide test requires every nav slug to appear in `Guide.tsx`.
18. **`@napi-rs/canvas` imported by tests without a direct devDependency.**
19. **Notifications and settings are mostly inert.**

## 19. Invariants V2 must preserve (regression contract)

- Exact money: integers in IDR for bookings/payments; `BigInt` maths for balances and HPP; only `Terverifikasi` payments reduce balance; strict mode blocks PDFs on over-collection.
- One active booking per jamaah; departure capacity; Hajj capacity ≥ registrations.
- Final HPP is immutable; revisions are new records; templates/scenarios are independent snapshots.
- Inventory ledger is append-only; allocation snapshots are immutable; derived allocation status must match the ledger.
- Every mutation passes through `transact` (validate → persist → commit); failed storage writes do not commit.
- Corrupt storage requires an explicit reset; reset is deterministic.
- Existing deep links: `/admin/<slug>` for all 33 slugs and `/admin/{jamaah,paket,booking,invoice,keberangkatan,agen,hpp,haji-khusus}/<id>`; `?departure=` query on manifest and rooming.
- PDF output: A4, branded, paginated, Latin-glyph guard, "DEMO" labelling, bank details from settings.
- All simulations stay explicitly labelled (no real transfer, message, government or airline integration).
