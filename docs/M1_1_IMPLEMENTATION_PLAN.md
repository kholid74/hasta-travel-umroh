# M1.1 — audit and implementation plan

## Existing capabilities

- Next.js 16.3.4 App Router, React 19, TypeScript, Tailwind 4 and scoped admin CSS. Installed UI tools: Lucide and Recharts. No new dependency is needed.
- `/admin/[...path]` dispatches modules through `AdminScreen`; `navigation.ts` supplies desktop/mobile navigation and the route allowlist.
- `Store.tsx` owns a typed, transactional React context seeded by `createSeed()`. Changes currently live only in memory. Reset already exists in the profile menu.
- Umrah packages, departures, identities, bookings, verified/pending payments and expenses already share records. Public catalog data is intentionally independent of simulated admin edits.
- HPP already uses exact bigint arithmetic, explicit per-line IDR/USD/SAR rates, paying/FOC allocation, fixed/unit costs, simulations, package templates and immutable finalized revisions. Retain these behaviors.
- Reusable components: PageHeader, Panel, Fields, DataTable (search/sort/export/pagination), Modal, Confirm, Empty, Badge, Stat and Tabs.
- Existing signed demo login is retained. Users/roles are illustrative; the demo session remains Owner. No production authentication or backend is being added.

## Gaps and proposed changes

- Introduce explicit `UMRAH` / `HAJJ_SPECIAL` classification. Hajj has its own configuration and lifecycle, optional departure date, departure year, configurable document requirements and payment milestones. Keep Umrah operational departures separate from Hajj planning.
- Add a dedicated Haji Khusus list/detail/editor, registration and planning summaries. Hajj registrations reuse the existing identity, booking and payment collections, with a Hajj package association instead of a fabricated Umrah departure.
- Reuse the HPP editor/calculator for Hajj package planning and Umrah departures. Add assumption dates, product/package snapshots, commission/contingency/operational examples, product filters and version comparison. Finalization means a saved, locked scenario, not finalized accounting.
- Persist the complete demo workspace in a versioned localStorage entry; restore before mounting workspace children, handle unavailable/corrupt storage explicitly, and reset storage plus React state together.
- Resolve package names/links for both product types in shared booking, finance, identity, search and report views. Preserve existing Umrah links and workflows.

## Files

- Extend `content/admin/{types,costing,seed,navigation}.ts` and `lib/admin/{costing,model}.ts`.
- Add `content/admin/hajj.ts`, `lib/admin/hajj.ts`, `lib/admin/persistence.ts`, `components/admin/Hajj.tsx` and `components/admin/CostingComparison.tsx`.
- Extend `components/admin/{Store,AdminScreen,Costing,Finance,Jamaah,Shell,Reports}.tsx`, admin route allowlist and responsive CSS as needed. Update stale demo persistence copy in affected documentation/UI.
- Extend existing Playwright tests; add `tests/m1_1.spec.ts` for calculation, validation, persistence, Hajj and version history regressions.
- Deliver `docs/M1_1_REPORT.md` with actual checks, screenshot references, assumptions and M1.2 recommendations.

## Data flow

Seed → DemoProvider → clone/validate transaction → write versioned browser storage → publish shared state. Failed writes must not claim a successful save. Hajj package → booking IDR contract snapshot → existing payment records → shared financial totals. HPP assumptions → existing exact calculator → saved revision snapshot → comparison and package summary. Editing a package never rewrites existing booking contracts or saved HPP versions.

## Regression risks and verification

- Shared booking consumers must recognize a Hajj registration without assuming an Umrah departure/date. Hajj planning must not be evaluated using Umrah manifest/readiness rules.
- Restoring browser data must finish before local form state initializes. Never overwrite stored changes during hydration; invalid storage requires an explicit reset.
- Saved HPP metadata and rates must remain independent of later package/template changes.
- Validate finite integers, capacities, dates, costs, currencies, missing rates, milestones and references. Exercise zero pilgrims and negative/incomplete inputs.
- Run lint, typecheck, build and the existing Playwright suite. Add desktop/mobile navigation, refresh/reset, blocked storage and history tests; capture key screens. Report failures accurately.

M1.2 invoice/payment PDF, inventory expansion and advanced commissions are outside this implementation.
