# Hasta Travel Workspace V2 — Milestone Roadmap (M3.0)

> Dependency-ordered plan from the role gateway to executive polish. Each milestone is shippable on its own, keeps all existing features and tests green, and bumps the storage version only through a tested migration.

Related: [Audit](HASTA_V2_REPOSITORY_AUDIT.md) · [Role matrix](HASTA_V2_ROLE_MATRIX.md) · [Architecture](HASTA_V2_ARCHITECTURE.md) · [Data contracts](HASTA_V2_DATA_CONTRACTS.md)

## Sequence

| Order | Milestone | Depends on | Storage version |
|---|---|---|---|
| 1 | M3.1 Role-Based Demo Gateway | — | v3 |
| 2 | M3.2 Agent Career Foundation | M3.1 | v4 |
| 3 | M3.3 Commission, Rewards & Payout | M3.2, `cancelBooking` extraction | v5 |
| 4 | M4.1 Departure Command Center & Document Tracking | M3.1 | v6 |
| 5 | M4.2 Rooming & Tour Leader Operations | M4.1 | v7 |
| 6 | M5.1 Pilgrim Portal | M3.1, M4.1, M4.2 (timeline data) | — (no new keys) |
| 7 | M5.2 CRM & Compliance Readiness | M3.2 (lead attribution), M4.1 | v8 |
| 8 | M6 Executive Intelligence & Showcase Polish | M3.3, M4.1, M4.2, M5.2 | — |

M4.1 can run in parallel with M3.2/M3.3 if two people work on it; the plan assumes sequential delivery.

**Gate for every milestone:** `npm run typecheck` · `npm run lint` · full `npm run test:admin` green · migration test from the previous version's frozen fixture · README + `Guide.tsx` updated for new routes · a short `docs/M*_REPORT.md` like previous milestones.

---

## M3.1 — Role-Based Demo Gateway

**Current code dependencies:** `app/admin/login/page.tsx`, `app/admin/actions.ts`, `lib/admin/auth.ts`, `lib/admin/session-token.ts`, `app/admin/(workspace)/layout.tsx`, `[...path]/page.tsx`, `components/admin/Shell.tsx`, `Store.tsx` (actor), `content/admin/navigation.ts`, `System.tsx` (users/roles screen), `Guide.tsx`, all spec `login()` helpers.

**Scope**
- "Pilih Akses Demo" gateway at `/admin/login` with 8 role cards, persona selectors for Agent/Pilgrim/Tour Leader, demo disclaimer, reset-data action.
- Session token v2 (role + persona), legacy token compatibility, new cookie `hasta_demo_session` at `/`.
- `content/admin/roles.ts` + `lib/admin/access.ts` (matrix, `can`, `canAccessRoute`, `navigationFor`).
- Role-filtered sidebar, AccessDenied screen, role pill + "Ganti akses demo" in profile menu.
- Actor injection into `transact` (activity log + inventory operator for staff personas).
- Portal skeleton: `/portal` layout, `PortalShell` (top bar, bottom tabs, demo pill), placeholder home per portal role stating what arrives in which milestone (clearly labelled, no fake data).
- Four staff dashboard variants: minimal versions reusing existing `Stat/Panel` selectors (Owner, Sales, Finance, Ops); Superadmin keeps `Dashboard.tsx` unchanged.
- System › User & Roles shows the code-defined matrix read-only (decision D3); `permissions` key kept in state.

**Routes and screens:** `/admin/login` (gateway), `/admin/login?switch=1`, `/admin/*` guarded, `/portal/agen`, `/portal/tour-leader`, `/portal/jamaah` (skeleton homes), optional `/demo` redirect.

**Data changes (v3):** `Staff.roleId?`; persona users `USR-4` (Owner), `USR-5` (Operations), `USR-6` (Tour Leader) added by migration when absent; map existing users to role ids. No other schema change.

**Demo scenarios**
1. Visitor opens `/admin/login`, picks Finance → lands on finance dashboard, sidebar shows only finance-relevant groups.
2. Finance opens `/admin/rooming` by URL → AccessDenied with "Ganti akses".
3. Sales records a payment → switches to Finance → verifies it → activity log shows both personas.
4. Switch to Agent → mobile portal skeleton; data created earlier still exists after switching back to Superadmin.

**UX requirements:** gateway works at 360 px and desktop; cards keyboard-accessible; portal shell bottom tabs ≥ 44 px targets; persistent "AKSES DEMO" labelling on every screen; brand tokens unchanged.

**Acceptance criteria**
- Each of 8 roles can enter without credentials and lands on its home.
- Navigation per role exactly matches `HASTA_V2_ROLE_MATRIX.md` §3/§7 (unit test over `navigationFor`).
- Forbidden admin slugs show AccessDenied; portal roles cannot reach `/admin/*`; staff cannot reach `/portal/*` (redirects per §6.4).
- Legacy cookie/token still grants Superadmin; logout clears both cookies.
- Switching roles never changes `localStorage` demo data (asserted by comparing the stored JSON before/after).
- All 33 existing routes and detail routes still render for Superadmin.
- Saved v2 workspace loads after upgrade without reset.

**Regression tests:** entire existing suite via new `enterAs(page, "SUPERADMIN")` helper; `admin.spec.ts` session-token test extended for v2 + legacy; new `tests/m3_1_gateway.spec.ts` (matrix, redirects, role switch persistence, mobile portal shell at 390×844); migration v2→v3 test.

**Out of scope:** real authentication, per-field PII enforcement beyond portal skeletons, agent/pilgrim/TL features, editable permission matrix.

**Risks:** test helpers coupled to "Masuk ke workspace" (7 specs) — centralise first; cookie path change leaving stale cookies — new cookie name; persona ids validated only client-side — persona-missing state required; Guide coverage test needs any new nav slug.

---

## M3.2 — Agent Career Foundation

**Current code dependencies:** `Partners.tsx`, `types.ts` (`Agent`, `Booking`, `Lead`), `model.ts` (`convertLead`, `addBooking`, `verifyPayment`), `hajj.ts` (`registerHajj`), `Jamaah.tsx` (agent select), `CRM.tsx`, `CreateForm.tsx`, `Reports.tsx` (agent performance), `persistence.ts`.

**Scope**
- Agent master V2: referral code, upline, join date, account status, level id; agent create/edit form.
- Booking attribution (snapshot + lock on first verified payment) for Umrah and Hajj bookings; lead attribution; `convertLead` carries attribution.
- Hierarchy: move agent with audit event, cycle/depth validation, network tree view.
- Career rule set + levels (configurable fixtures), live `careerProgress`, period lock creating `CareerSnapshot`s, level history.
- Admin: `/admin/agen` tabs Daftar · Jaringan · Level karier · Analitik (period leaderboard); agent detail tabs Profil · Jaringan · Jamaah · Booking · Karier · Aktivitas.
- Agent portal (first real screens): Beranda (code, share, progress), Jamaah (own, masked), Leads (submit referral lead), Tim (downline), Karier.

**Routes and screens:** `/admin/agen` (tabs), `/admin/agen/<id>`, `/portal/agen`, `/portal/agen/{jamaah,leads,tim,karier,paket}`.

**Data changes (v4):** see Data Contracts §2–3 and §11 (codes, parentId, levelId, attribution backfill with `source: "MIGRATED"`, rule set fixture, empty snapshots/events).

**Demo scenarios**
1. Agent portal: copy referral link, submit a lead with code → Sales converts → booking attributed to the agent.
2. Finance verifies first payment → attribution locks (upline snapshot visible on booking).
3. Owner moves an agent to another upline → event logged; locked booking keeps its old upline.
4. Owner locks Q4 → snapshots created; an agent is promoted; portal shows new level and gaps to next.

**UX requirements:** tree readable on mobile (indented list, collapsible); masked phones with explanation; level badges using existing badge tones (gold for top levels); "contoh konfigurasi demo" labels on rule editors.

**Acceptance criteria**
- Every active booking has an attribution after migration; agent totals in Reports equal the pre-migration numbers for unchanged data.
- Lead → booking conversion keeps the agent.
- Cycles and over-depth moves are rejected with readable errors.
- Re-locking a period is impossible; snapshot `bookingIds` match the metrics.
- Career code never writes money; commission screens are unchanged in this milestone.

**Regression tests:** existing suite; new `tests/m3_2_agents.spec.ts` (attribution lock, convertLead, hierarchy rules, metrics: personal vs team, cancellation exclusion, period lock, migration v3→v4 from fixture, portal screens at mobile width, PII masking).

**Out of scope:** commission ledger, payouts, rewards, public-site referral capture (unless D9 approved — then only the WhatsApp text).

**Risks:** client's real level names/rules unknown (fixtures + editor); qualifying-event choice changes numbers (D7); MLM perception (D6); attribution on legacy data is inferred from `jamaah.agentId`.

---

## M3.3 — Commission, Rewards & Payout

**Current code dependencies:** M3.2 outputs; `Finance.tsx:29` cancellation (must be extracted to `cancelBooking` first, with its own tests), `verifyPayment`, departure status change in `Departures.tsx`, `financial-pdf.ts` (new payout slip kind), `Partners.tsx` komisi screen, `Reports.tsx`.

**Scope**
- Versioned commission policies (editor), `reconcileCommissions` hooked into payment verification, cancellation, departure, re-attribution; manual "Sinkronkan".
- Append-only ledger with idempotency keys, reversals, adjustments (reason + approver).
- Reward programmes evaluated from locked snapshots; cash rewards → BONUS entries; non-cash fulfilment tracking.
- Payout batches: prepare (Finance) → approve (Owner) → mark paid (Finance, simulated) → void rules; payout slip PDF; commission statement PDF per agent/period.
- Replace legacy agent-level approve button; legacy `Agent.status` frozen (D4).
- Agent portal: Komisi, Payout, Reward.

**Routes and screens:** `/admin/komisi` (Ledger · Payout · Kebijakan · Reward), `/admin/komisi/<payoutId>`, agent detail tabs Komisi · Payout · Reward, `/portal/agen/{komisi,payout,reward}`.

**Data changes (v5):** `commissionPolicies`, `commissionLedger`, `rewardPrograms`, `rewardAchievements`, `payouts`; fixtures per Data Contracts §13.

**Demo scenarios**
1. Pilgrim pays in full → personal + override entries appear for the agent chain.
2. Finance prepares payout → Owner approves → Finance marks paid → agent downloads slip in portal.
3. Booking cancelled after payout → reversal deducted from the agent's next payout; unpaid overrides net to zero.
4. Quarter locked → reward eligible → Owner approves → bonus appears in next payout.

**UX requirements:** ledger rows explain themselves (basis snapshot shown); derived states as badges; approval screens show preparer/approver; money via existing `rupiah`/`documentMoney`; every "paid" action states no funds move.

**Acceptance criteria**
- Running reconcile N times yields the same ledger (idempotency test).
- No entry appears in two non-void payouts; payout `net` equals the sum of its entries; PAID payouts immutable.
- Cancellation produces exactly one reversal per earned entry; paid reversals are netted per clawback policy.
- Policy edits create versions; existing entries unchanged.
- Rewards granted at most once per programme period per agent.
- Legacy commission numbers are no longer shown as "Dibayar" unless backed by a payout.

**Regression tests:** existing suite (especially `payment_history`, `m2` cancellation/kit release, PDFs); new `tests/m3_3_commission.spec.ts` (maths flat/bps/cap with BigInt, overrides by depth and min rank, triggers, reversals, payout lifecycle, voids, rewards, PDF slip geometry, migration v4→v5).

**Out of scope:** real bank transfers, tax (PPh) withholding calculations (only a placeholder note — decision), partial refunds of single payments.

**Risks:** clawback policy (D8); legacy "Dibayar" interpretation (D4); legal review of multi-level overrides (D6); complexity creep — keep the ledger as the only money source.

---

## M4.1 — Departure Command Center & Document Tracking

**Current code dependencies:** `readiness`, `manifestReady`, `validPassport`, `documentPercent` (`model.ts`), `Departures.tsx`, `Documents.tsx`, `DocumentChecklist`/`VisaPanel` (`Jamaah.tsx`), `Dashboard.tsx` alerts, `Communication.tsx` (reminder templates), `kitReady`.

**Scope**
- `departureReadiness` with rules, severity, deadlines and blockers; `readiness()` delegates (shape unchanged).
- Departure detail → Command Center tabs (Ringkasan, Blocker, Manifest, Dokumen, Keuangan; Kamar & Bus, Tim, Insiden appear in M4.2).
- Flight segments (outbound/return) replacing hard-coded times.
- Document audit events, rejection reasons, configurable requirements (fixture = current 8), expiry warnings.
- Visa applications per booking with history; `Jamaah.visa*` mirror.
- Ops dashboard uses blockers.

**Routes and screens:** `/admin/keberangkatan/<id>` (tabs), `/admin/dokumen` (adds history drawer, expiry filter), `/admin/manifest` (blockers column).

**Data changes (v6):** `documentEvents`, `documentRequirements`, `visaApplications`; `Departure.flightSegments?`, `hotels?`.

**Demo scenarios:** open the October departure → see blockers (missing passport, visa in process, unpaid balance, kit not handed over) → click each → fix → blocker disappears → status "Berangkat" becomes allowed.

**UX requirements:** blockers first, sorted by severity then deadline; each links to the fixing screen; date-relative wording ("H-14").

**Acceptance criteria:** existing readiness percentages unchanged for the seed (test); `Berangkat` still requires 100 %; every blocker has a working link; document events appended for every upload/verify/reject; visa mirror stays consistent; migration v5→v6 passes.

**Regression tests:** `admin.spec.ts` documents/rooming/manasik flow, manifest export, Hajj specs (Hajj requirements still added); new `tests/m4_1_command_center.spec.ts`.

**Out of scope:** real visa/airline integrations; Hajj command center (D12) beyond a summary card.

**Risks:** changing readiness semantics could break departure status tests — keep old shape; document requirement rules must not imply real regulations.

---

## M4.2 — Rooming & Tour Leader Operations

**Current code dependencies:** `Rooming.tsx`, `assignRoom`/`autoAssign`, `Operations.tsx` (transport, manasik), `Departures.tsx`, M4.1 command center, `cancelBooking`.

**Scope**
- Vehicles per departure with allocation and capacity checks; migrate `jamaah.bus`.
- Room type vs booking warning; hotel names from package snapshot.
- Tour leader / muthawwif assignments (replacing hard-coded names); Command Center "Tim" tab.
- Attendance sessions (manasik write-through, airport, bus boarding, itinerary days).
- Incidents with append-only updates; admin `/admin/insiden`.
- Tour Leader portal: Hari ini, Rombongan (scoped manifest), Presensi, Itinerary, Kamar & Bus, Insiden.

**Routes and screens:** `/admin/transportasi` (vehicles), `/admin/rooming`, `/admin/insiden`, `/admin/keberangkatan/<id>` (Kamar & Bus, Tim, Insiden tabs), `/portal/tour-leader/**`.

**Data changes (v7):** `vehicles`, `tourLeaderAssignments`, `attendanceSessions`, `incidents`; `Room.hotelName?`, `roomType?`.

**Demo scenarios:** Ops assigns TL persona → TL portal shows the departure → TL takes bus-boarding attendance on mobile → reports a lost-item incident → Ops sees it in Command Center and resolves.

**UX requirements:** attendance as large toggle rows with sticky save; offline-like optimistic feel (local state, single transact on save); incident form with chips.

**Acceptance criteria:** no jamaah in two vehicles/rooms per departure/hotel; capacity enforced; cancellation releases vehicle seats; TL sees only assigned departures and permitted fields; manasik attendance from TL equals admin view.

**Regression tests:** rooming/manasik/transport parts of `admin.spec.ts`; new `tests/m4_2_operations.spec.ts` incl. mobile TL flow and migration v6→v7.

**Out of scope:** GPS/location, push notifications, real driver contacts.

**Risks:** `jamaah.bus` migration across multiple historical bookings; TL persona name collisions (choose unique fixture names).

---

## M5.1 — Pilgrim Portal

**Current code dependencies:** `PaymentHistory.tsx` (needs `readOnly`), `FinancialDocuments.tsx`, `DocumentChecklist` (self mode), `HandoverReceipt.tsx`, M4.1/M4.2 data, `lib/admin/scopes.ts`.

**Scope:** Beranda (booking summary, countdown, next action), Pembayaran (history + PDFs), Dokumen (checklist + simulated upload + rejection reasons), Perjalanan (timeline: payments, docs, visa, manasik, flights, itinerary), Perlengkapan (kit allocation + handover PDFs), Profil; optional Superadmin "Lihat sebagai jamaah" preview.

**Routes:** `/portal/jamaah/**`.

**Data changes:** none (reads existing + M4 data). Optional `Payment` proof metadata if D-proof is approved (would be v8 addition).

**Demo scenarios:** pilgrim with pending installment sees "Menunggu verifikasi" → Finance verifies → pilgrim downloads receipt; pilgrim uploads passport → Ops rejects with reason → pilgrim sees reason and re-uploads.

**UX requirements:** single-column, large type, plain-language statuses, PDF download buttons full-width, no staff jargon.

**Acceptance criteria:** pilgrim can only reach own records (scope tests); PDFs identical to staff-generated ones; no verify/edit controls rendered; works at 360 px.

**Regression tests:** PDF specs (`m1_2`, `payment_history`, `m2` handover); new `tests/m5_1_pilgrim.spec.ts` (mobile).

**Out of scope:** real payment gateway, real file storage, notifications.

**Risks:** cancelled booking has no PDFs (current rule) — portal must explain; Hajj pilgrims have fewer timeline items.

---

## M5.2 — CRM & Compliance Readiness

**Current code dependencies:** `CRM.tsx`, `CreateForm.tsx` (Lead), `convertLead`, `Documents.tsx` SISKOPATUH-prep modal, `export.ts`, `Reports.tsx`.

**Scope:** lead owner as user reference, timestamped notes with author, multiple follow-ups with outcomes, overdue follow-up queue for Sales dashboard, lost reasons, agent attribution visible; cancellation *request* by Sales → executed by Finance; Compliance page with internal reporting checklists and documented exports (manifest, document completeness, payment register, commission register, incident log).

**Routes:** `/admin/crm`, `/admin/kepatuhan` (new slug → nav, guide, matrix).

**Data changes (v8):** lead extensions; optional `cancellationRequests`.

**Demo scenarios:** Sales works today's follow-up queue → converts an agent-referred lead; Ops opens Kepatuhan → sees manifest 38/45 complete → exports register.

**UX requirements:** queues before boards for daily use; exports state "format demo — petakan ke format resmi".

**Acceptance criteria:** `sales` text mirrors `ownerUserId`; existing kanban/conversion behaviour unchanged; every export uses the formula-safe exporter; no claim of official format compliance.

**Regression tests:** CRM parts of `admin.spec.ts`; new `tests/m5_2_crm.spec.ts`; migration v7→v8.

**Out of scope:** WhatsApp/email sending, government submission, website form backend.

**Risks:** stakeholders reading "compliance" as legal compliance — wording and disclaimers must be explicit.

---

## M6 — Executive Intelligence & Showcase Polish

**Current code dependencies:** `Reports.tsx`, `Dashboard.tsx`, `costing.ts` (final HPP, actual expenses), M3.3 ledger, M4 blockers, M5.2 CRM data, `Guide.tsx`.

**Scope:** Owner executive dashboard / `/admin/eksekutif` (D14): departure profitability (planned HPP vs actual expenses vs revenue vs accrued commission), receivables aging, agent performance (ledger + snapshots), operational risk roll-up; report types updated to use the new sources; guided demo tours per role in `Panduan`; gateway "story mode" suggestions; visual QA across roles and breakpoints; README and showcase docs refreshed.

**Data changes:** none (derived selectors only).

**Demo scenarios:** Owner sees a departure trending below planned margin → drills into expenses and commission → sees the risky departure's blockers.

**Acceptance criteria:** every executive figure reconciles with the module it comes from (tests compare selectors against module totals); no new stored data; all roles pass a visual smoke at 390 px and 1440 px.

**Regression tests:** full suite; new `tests/m6_insights.spec.ts`.

**Out of scope:** accounting/journal, tax, forecasting models, backend.

**Risks:** definition disputes (revenue = contract vs collected) — label every metric's definition on screen.

---

## Decisions required (register)

| ID | Decision | Recommendation | Needed by |
|---|---|---|---|
| D1 | Replace the credential form at `/admin/login` entirely, or keep it as a hidden legacy path | Replace; keep `login()` as an alias entering Superadmin for one milestone | M3.1 |
| D2 | New cookie `hasta_demo_session` at path `/` and portal prefix `/portal` | Approve (alternative `/admin/portal/*` keeps old cookie path but mixes "admin" into pilgrim URLs) | M3.1 |
| D3 | Owner vs Superadmin powers (settings, HPP finalize, approvals, reset) and whether the old editable permission matrix stays | As in Role Matrix; matrix becomes read-only | M3.1 |
| D4 | Treat legacy `Agent.status = "Dibayar"` as real paid history (opening payout) or ignore | Ignore with a visible "status lama" label — legacy totals were recomputed live and are not trustworthy | M3.3 |
| D5 | Default commission trigger, bases and rates | Use fixtures only; client supplies real policy | M3.3 |
| D6 | Multi-level overrides and recruitment-linked rewards | Legal review before showing to prospects; rewards and overrides must derive from actual pilgrim sales, never from recruitment alone. Indonesia's trade law prohibits pyramid schemes in distribution (UU 7/2014 Pasal 9) — applicability to travel services must be confirmed by counsel | M3.2 |
| D7 | Career period, qualifying event, demotion, late-cancellation handling | Quarter · fully paid · never demote · adjust next period | M3.2 |
| D8 | Clawback of paid commission on refund | Net against future payouts | M3.3 |
| D9 | Public-site referral link (`?ref=` added to WhatsApp text) | Approve as small optional change | M3.2 |
| D10 | Phone masking for agents | Mask by default | M3.2 |
| D11 | Hierarchy fixture for already-saved workspaces | Flat (no upline) on migration; fixture tree only on fresh seed/reset | M3.2 |
| D12 | Include Haji Khusus in command center/manifest/rooming | Summary card only until Hajj has departure entities | M4.1 |
| D13 | Visa per booking in M4.1 or later | M4.1 with mirror fields | M4.1 |
| D14 | Executive insights as `/admin/eksekutif` or Owner dashboard tab | Owner dashboard + dedicated route for depth | M6 |
| D15 | Self-referral rule (agent buys for self) | Allow but flag; no commission (configurable) | M3.3 |
| D16 | Status of pending payments on cancellation | Keep current `Dikembalikan` for compatibility; revisit with refund records | M3.3 |
| D17 | Tax withholding on commissions | Out of demo scope; show placeholder note | M3.3 |

---

## Recommended M3.1 implementation prompt outline

1. **Role & guardrails:** senior product engineer; incremental change; read `docs/HASTA_V2_*` and `node_modules/next/dist/docs` (auth, route groups, proxy) first; no new dependencies; do not touch commission/ops features; do not change the storage key.
2. **Pre-work:** create `tests/helpers/session.ts` (`enterAs`) and migrate every spec's `login()` to it while still using the old form — run the suite green *before* changing the gateway.
3. **Access model:** `content/admin/roles.ts` (8 roles, matrix from Role Matrix §3–4, portal tabs) and `lib/admin/access.ts` with unit tests.
4. **Session:** token v2 + legacy decode in `session-token.ts`; `auth.ts` (`getSession` → `DemoSession`, `requireSession(scope)`, new cookie at `/`, logout clears both); `enterDemo` server action; tests for forgery, expiry, legacy, invalid role/persona.
5. **Gateway UI:** `DemoGateway` at `/admin/login` (cards, persona selectors read client-side, disclaimer, reset with confirm, `?switch=1`); responsive 360 px → desktop.
6. **Admin shell:** pass session from layout; filter navigation; AccessDenied for forbidden slugs; role pill; "Ganti akses demo"; actor injected into `DemoProvider`/`transact`.
7. **Portal skeleton:** `app/portal/layout.tsx`, `[...path]` dispatcher, `PortalShell` (top bar, bottom tabs, demo pill), honest placeholder homes; redirect rules §6.4.
8. **Dashboards:** Owner/Sales/Finance/Ops variants from existing selectors; Superadmin unchanged ("Selamat pagi, Ahmad").
9. **Migration v3:** `lib/admin/migrations.ts` pipeline (run before `sameShape`), `Staff.roleId`, persona users; frozen v2 fixture test.
10. **System screen:** read-only matrix from code; keep `permissions` key.
11. **Docs:** update README, `Guide.tsx` (if nav changes), write `docs/M3_1_REPORT.md` with screenshots per role.
12. **Acceptance:** criteria from this roadmap's M3.1 section; `typecheck`, `lint`, full `test:admin` green; explicitly list anything deferred.
