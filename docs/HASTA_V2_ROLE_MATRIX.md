# Hasta Travel Workspace V2 — Role Matrix & Routing Map (M3.0)

> **Demo access, not security.** The "Pilih Akses Demo" gateway lets a visitor pick a role without credentials. Permissions shape navigation and the demo story; they are enforced in the UI and in server route guards for consistency, but they are **not** a production authorisation model. Production authorisation must be re-implemented server-side per `docs/FUTURE_BACKEND.md`.

Related: [Audit](HASTA_V2_REPOSITORY_AUDIT.md) · [Architecture](HASTA_V2_ARCHITECTURE.md) · [Data contracts](HASTA_V2_DATA_CONTRACTS.md) · [Roadmap](HASTA_V2_ROADMAP.md)

---

## 1. Role catalogue

| # | Role ID | Label (UI) | Demo persona (fixture) | Home route | Shell | Device priority |
|---|---|---|---|---|---|---|
| 1 | `SUPERADMIN` | Superadmin | Ahmad · `USR-1` (existing account, keeps today's full-access experience) | `/admin/dashboard` | Admin sidebar (all groups) | Desktop |
| 2 | `OWNER` | Owner / Direktur | New staff `USR-4` (name fixture; must not collide with seed jamaah names) | `/admin/dashboard` (executive variant) | Admin sidebar (filtered) | Desktop + tablet |
| 3 | `SALES_CS` | Sales & Customer Service | Rina Amelia · `USR-2` (existing) | `/admin/dashboard` (sales variant) | Admin sidebar (filtered) | Desktop |
| 4 | `FINANCE` | Finance | Fajar Hidayat · `USR-3` (existing) | `/admin/dashboard` (finance variant) | Admin sidebar (filtered) | Desktop |
| 5 | `OPERATIONS` | Operasional | New staff `USR-5` | `/admin/dashboard` (operations variant) | Admin sidebar (filtered) | Desktop + tablet |
| 6 | `AGENT` | Agen / Mitra | Selectable agent, default `AGT-001` | `/portal/agen` | Mobile portal shell | **Mobile-first** |
| 7 | `TOUR_LEADER` | Tour Leader | New staff `USR-6`, assigned to the first Umrah departure | `/portal/tour-leader` | Mobile portal shell | **Mobile-first** |
| 8 | `PILGRIM` | Jamaah | Selectable jamaah, default `JMH-10288` (has a pending installment, good demo) | `/portal/jamaah` | Mobile portal shell | **Mobile-first** |

Notes
- Superadmin keeps persona "Ahmad" so the existing dashboard greeting and every existing UI test path keep working after the login helper is updated.
- Persona IDs for Agent / Pilgrim / Tour Leader are resolved **client-side** against `DemoState` (the server cannot read `localStorage`). If the persona no longer exists (after reset or deletion), the portal shows "Persona demo tidak ditemukan — pilih ulang" with a link to the gateway.
- The current Fajar Hidayat double use (Finance user **and** hard-coded tour leader) ends when the tour leader becomes a real assignment (M4.2).

## 2. Permission vocabulary

Permissions are strings `resource:action`. Actions:

| Action | Meaning |
|---|---|
| `read` | View list/detail |
| `write` | Create/edit records |
| `approve` | Approve a state transition owned by someone else (separation of duties) |
| `execute` | Perform an irreversible/financial step (verify payment, mark payout paid, cancel booking) |
| `self` | Access restricted to the persona's own records (portal roles) |

Resources map 1:1 to existing nav slugs where possible, plus a few action-level resources: `payment`, `booking.cancel`, `hpp.finalize`, `commission.policy`, `payout`, `reward`, `document.verify`, `visa`, `demo.reset`, `role.switch`.

Matrix code legend: **RW** read+write · **R** read · **A** approve · **X** execute · **S** self-scoped · **—** no access (route shows "Akses demo tidak mencakup modul ini" with a Switch Role action).

## 3. Module × role matrix (admin workspace)

| Group | Slug | Super | Owner | Sales&CS | Finance | Ops | Agent | TL | Pilgrim |
|---|---|---|---|---|---|---|---|---|---|
| OVERVIEW | `dashboard` | RW | R (executive) | R (sales) | R (finance) | R (ops) | — | — | — |
| | `panduan` | R | R | R | R | R | — | — | — |
| SALES | `crm` | RW | R | RW | — | R | — | — | — |
| | `booking` | RW | R | RW | R | R | — | — | — |
| | `jamaah` | RW | R | RW | R | RW | — | — | — |
| OPERASIONAL | `paket` | RW | RW | R | R | RW | — | — | — |
| | `haji-khusus` | RW | RW | RW (register) | R | RW (planning) | — | — | — |
| | `keberangkatan` | RW | R | R | R | RW | — | — | — |
| | `manifest` | RW | R | R | — | RW | — | — | — |
| | `dokumen` | RW | R | RW (upload/request) | — | RW (verify) | — | — | — |
| | `rooming` | RW | R | R | — | RW | — | — | — |
| | `manasik` | RW | R | R | — | RW | — | — | — |
| | `transportasi` | RW | R | — | — | RW | — | — | — |
| FINANCE | `hpp` | RW | RW + A (finalize) | — | RW | R | — | — | — |
| | `pembayaran` | RW | R | RW (record only) | RW + X (verify) | — | — | — | — |
| | `invoice` | RW | R | R | RW | — | — | — | — |
| | `pengeluaran` | RW | R | — | RW + X | R | — | — | — |
| | `komisi` | RW | R + A | — | RW + X | — | — | — | — |
| PARTNERS | `agen` | RW | R + A (hierarchy, level override) | R | R | — | — | — | — |
| | `vendor` | RW | R | — | RW | R | — | — | — |
| INVENTORY | `perlengkapan` | RW | R | R | R | RW | — | — | — |
| COMMUNICATION | `broadcast` | RW | R | RW | — | RW | — | — | — |
| | `notifikasi` | RW | R | R | R | R | — | — | — |
| REPORTS | `laporan` | RW | R | R (sales set) | R (finance set) | R (ops set) | — | — | — |
| | `analytics` | RW | R | R | R | R | — | — | — |
| WEBSITE | `website-paket`, `artikel`, `testimoni`, `galeri`, `leads-website` | RW | R | RW | — | — | — | — | — |
| SYSTEM | `users` | RW | R | — | — | — | — | — | — |
| | `aktivitas` | R | R | — | R | — | — | — | — |
| | `settings` | RW | RW (business profile, bank) | — | R | — | — | — | — |
| NEW (M4–M6) | `insiden` (incidents, admin view) | RW | R | — | — | RW | — | — | — |
| | `kepatuhan` (compliance checklist & exports) | RW | R | R | R | RW | — | — | — |
| | `eksekutif` (executive insights) | R | R | — | R | — | — | — | — |

Portal roles never enter `/admin/*`; they are redirected to their own home.

## 4. Sensitive action matrix

| Action | Domain function (existing or planned) | Super | Owner | Sales&CS | Finance | Ops | Agent | TL | Pilgrim |
|---|---|---|---|---|---|---|---|---|---|
| Create lead | `CreateForm` (Lead) | ✓ | | ✓ | | | ✓ (own, attributed) | | |
| Convert lead → booking | `convertLead` | ✓ | | ✓ | | | | | |
| Create booking / register Hajj | `addBooking`, `registerHajj` | ✓ | | ✓ | | | | | |
| Record payment (Menunggu) | `recordPayment` | ✓ | | ✓ | ✓ | | | | upload proof (simulated) M5.1 |
| Verify payment | `verifyPayment` | ✓ | | | ✓ | | | | |
| Cancel booking + refund | `cancelBooking` (to extract) | ✓ | ✓ | request only (M5.2) | ✓ | | | | |
| Finalize HPP / create revision | `saveCosting(finalize)`, `reviseCosting` | ✓ | ✓ | | prepare draft | | | | |
| Change booking attribution after lock | `reattributeBooking` (M3.2) | ✓ | ✓ (A) | | | | | | |
| Move agent in hierarchy | `moveAgent` (M3.2) | ✓ | ✓ | | | | | | |
| Lock career period snapshot | `lockCareerPeriod` (M3.2) | ✓ | ✓ | | ✓ | | | | |
| Edit commission policy / reward programme | `saveCommissionPolicy`, `saveRewardProgram` (M3.3) | ✓ | ✓ | | | | | | |
| Prepare payout batch | `preparePayout` (M3.3) | ✓ | | | ✓ | | | | |
| Approve payout batch | `approvePayout` (M3.3) | ✓ | ✓ | | | | | | |
| Mark payout paid (simulated) | `markPayoutPaid` (M3.3) | ✓ | | | ✓ | | | | |
| Verify / reject document | `verifyDocument` | ✓ | | | | ✓ | | | |
| Upload document (simulated) | `DocumentChecklist` | ✓ | | ✓ | | ✓ | | | ✓ (self) |
| Update visa status | `VisaPanel` | ✓ | | | | ✓ | | | |
| Assign room / vehicle | `assignRoom`, `assignVehicle` (M4.2) | ✓ | | | | ✓ | | R | |
| Assign tour leader | `assignTourLeader` (M4.2) | ✓ | | | | ✓ | | | |
| Take attendance / report incident | `recordAttendance`, `reportIncident` (M4.2) | ✓ | | | | ✓ | | ✓ (assigned departures) | |
| Post stock / handover kit | inventory functions | ✓ | | | | ✓ | | confirm receipt (M4.2, optional) | |
| Edit settings | `System` | ✓ | ✓ | | | | | | |
| Reset demo data | `reset()` | ✓ (profile menu) + anyone from the gateway (with confirm) | | | | | | | |
| Switch role | gateway / `switchDemoRole` | everyone | | | | | | | |

Separation-of-duties stories the demo should show: Sales records → Finance verifies; Finance prepares payout → Owner approves → Finance marks paid; Operations verifies documents that Sales/Pilgrim uploaded.

## 5. Field-level visibility (PII scoping)

| Data | Staff (admin) | Agent (self) | Tour Leader (assigned departures) | Pilgrim (self) |
|---|---|---|---|---|
| Name, gender, city | ✓ | ✓ own attributed pilgrims | ✓ | ✓ |
| Phone | ✓ | masked `0800****123` until a configurable rule allows (decision) | ✓ (operational contact) | ✓ |
| NIK, birth date, address | ✓ | — | birth date only (age for care) | ✓ |
| Passport number / expiry | ✓ | — | number last 4 + status | ✓ |
| Emergency contact | ✓ | — | ✓ | ✓ |
| Document statuses | ✓ | summary % only | summary + missing list | ✓ |
| Booking value, payments, balance | ✓ | contract value + payment *status* (no transactions) | — | ✓ |
| Commission | Finance/Owner/Super | own ledger only | — | — |
| Room, bus, manasik | ✓ | — | ✓ | ✓ |
| Incidents | Ops/Super | — | own reports + departure incidents | — |

All visibility is implemented by **selector functions** (`lib/admin/scopes.ts`, M3.1), never by hiding columns ad hoc.

## 6. Routing map

### 6.1 Gateway and session routes

| Route | Purpose | Notes |
|---|---|---|
| `/admin/login` | **"Pilih Akses Demo"** gateway (replaces credential form) | URL kept for README, bookmarks and backward compatibility |
| `/admin` | Redirect → role home if a session exists, else gateway | existing behaviour generalised |
| `/admin/login?switch=1` | Gateway in "Ganti akses" mode (shows current role) | |
| `/demo` (optional alias) | `next.config.ts` redirect → `/admin/login` | no new page |
| Server action `enterDemo(role, personaId?)` | Sets demo session, redirects to role home | replaces `login()` |
| Server action `logout()` | Clears session, back to gateway | kept |

### 6.2 Staff roles (Superadmin, Owner, Sales & CS, Finance, Operations)

All existing routes stay under `/admin/*` with the same catch-all. Changes:

| Route | Change |
|---|---|
| `/admin/<slug>` (33 existing) | Guarded by `canAccessRoute(role, slug)`; unauthorised → in-page `AccessDenied` (HTTP 200 page, not 404) with Switch Role CTA |
| `/admin/dashboard` | Renders a role-specific dashboard variant (same route) |
| `/admin/agen` | Tabs: Daftar · Jaringan · Level karier · Analitik (M3.2) |
| `/admin/agen/<agentId>` | Existing detail, extended tabs (M3.2/M3.3) |
| `/admin/komisi` | Tabs: Ledger · Payout · Kebijakan · Reward (M3.3) |
| `/admin/komisi/<payoutId>` | Payout batch detail (M3.3) — add `komisi` to detail whitelist |
| `/admin/keberangkatan/<id>` | Becomes Departure Command Center (tabs; M4.1) |
| `/admin/insiden` | New slug (M4.2) |
| `/admin/kepatuhan` | New slug (M5.2) |
| `/admin/eksekutif` | New slug (M6) — or Owner dashboard tab (decision) |

Every new slug must be added to `navigation.ts`, `AdminScreen.tsx`, the role matrix constant, and `Guide.tsx` (enforced by `tests/admin.spec.ts:116`).

### 6.3 Portal roles (mobile-first)

| Role | Route | Screen |
|---|---|---|
| Agent | `/portal/agen` | Beranda: kode referral, share, ringkasan komisi, progres level |
| | `/portal/agen/jamaah` | Own attributed pilgrims & booking/payment status |
| | `/portal/agen/leads` | Submit/view referral leads |
| | `/portal/agen/komisi` | Own commission ledger |
| | `/portal/agen/payout` | Payout history, payout slip PDF |
| | `/portal/agen/karier` | Level, qualification progress, history |
| | `/portal/agen/tim` | Network tree (own downline only) |
| | `/portal/agen/reward` | Milestone progress |
| | `/portal/agen/paket` | Catalog with share link incl. referral code |
| Tour Leader | `/portal/tour-leader` | Assigned departures (today first) |
| | `/portal/tour-leader/<departureId>` | Departure hub: jadwal, rombongan |
| | `/portal/tour-leader/<departureId>/presensi` | Attendance sessions |
| | `/portal/tour-leader/<departureId>/itinerary` | Day-by-day itinerary |
| | `/portal/tour-leader/<departureId>/kamar` | Rooming & bus (read) |
| | `/portal/tour-leader/<departureId>/insiden` | Incident list + report form |
| Pilgrim | `/portal/jamaah` | Beranda: booking, countdown, next action |
| | `/portal/jamaah/pembayaran` | Payment history, invoice/receipt/statement PDFs |
| | `/portal/jamaah/dokumen` | Checklist + simulated upload |
| | `/portal/jamaah/perjalanan` | Departure timeline: manasik, flight, itinerary |
| | `/portal/jamaah/perlengkapan` | Kit allocation & handover receipts |
| | `/portal/jamaah/profil` | Profile (read; limited edits) |

`/portal/*` does not collide with public routes (`/`, `/paket-umroh`, `/haji-khusus`, `/jadwal-keberangkatan`, `/faq`, `/tentang`, `/kontak`).

### 6.4 Cross-role redirect rules

| Session | Visits | Result |
|---|---|---|
| none | `/admin/*`, `/portal/*` | → `/admin/login` |
| staff role | `/portal/*` | → `/admin/dashboard` (Superadmin may preview portals via "Lihat sebagai" — M5.1, optional) |
| portal role | `/admin/*` | → own portal home |
| portal role | other portal (`/portal/jamaah` as Agent) | → own portal home |
| legacy cookie (`hasta-demo-owner`) | any | treated as `SUPERADMIN` / `USR-1` (backward compatible) |

## 7. Role-specific information architecture

Staff roles keep the existing sidebar component, filtered by the matrix — no duplicated shells.

| Role | Sidebar groups (in order) | Dashboard focus |
|---|---|---|
| Superadmin | All 10 groups + new items | Today's dashboard (unchanged) |
| Owner | Overview · Eksekutif · Finance (HPP, komisi approvals) · Partners · Operasional (read) · Reports · Settings | Profitability, receivables, agent performance, departure risk, pending approvals |
| Sales & CS | Overview · Sales · Haji Khusus · Dokumen (upload) · Pembayaran (record) · Broadcast · Website · Reports (sales) | Leads due today, conversions, unpaid DPs of own bookings, docs missing |
| Finance | Overview · Finance · Booking/Jamaah (read) · Vendor · Reports (finance) · Activity | Verification queue, receivables aging, payouts to prepare, expenses due |
| Operations | Overview · Operasional · Perlengkapan · Insiden · Broadcast · Reports (ops) | Departures by readiness, blockers, document verification queue, kit handovers |

Portal roles use a bottom tab bar (max 5 tabs):

| Role | Tabs |
|---|---|
| Agent | Beranda · Jamaah · Komisi · Tim · Lainnya (Karier, Reward, Paket, Payout, Ganti akses) |
| Tour Leader | Hari ini · Rombongan · Presensi · Insiden · Lainnya |
| Pilgrim | Beranda · Pembayaran · Dokumen · Perjalanan · Lainnya (Perlengkapan, Profil, Ganti akses) |

## 8. Switch Role behaviour

1. Entry points: profile menu ("Ganti akses demo") in the admin shell, "Lainnya → Ganti akses" in portals, and the gateway itself.
2. Switching calls `enterDemo(newRole, persona)` → new signed session cookie → redirect to the new role's home.
3. **Demo data is never touched**: role/session lives in a cookie; `DemoState` stays under its own `localStorage` key. Only the explicit "Reset data demo" action (with confirm) re-seeds.
4. Activity log entries written after the switch carry the new persona as actor.
5. A persistent banner/pill shows "AKSES DEMO · {Role} · bukan keamanan produksi" on every screen.
6. Unsaved local form drafts are lost on switch (same as navigation today); the switch confirm says so if a modal is open.
