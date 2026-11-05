# M1.2 implementation plan

Audit: Finance uses shared booking totals, verified payments, paid/outstanding helpers and productForBooking associations. Invoice printing opens a landscape browser popup; receipts currently download text. Store persists the typed workspace in versioned localStorage. Haji contracts already snapshot original currency assumptions. Umrah contracts snapshot total, but not package description. Existing payments have transaction dates, without historical verification dates.

Reuse shared records, bigint HPP conventions, modal/buttons and product associations. Add optional contract description snapshots for future bookings and optional verification timestamp/reference; never fabricate dates for historical payments. Do not migrate/reprice old contracts.

Implement a shared document model and A4 renderer with invoice, receipt and statement templates. Use pdf-lib for real downloadable PDFs, wrapping, pagination, repeated DEMO headers/footers and embedded font. Preview the exact generated PDF bytes; revoke URLs and invalidate previews on state changes. Only verified payments on active consistent contracts qualify for receipts. Invalid/overpaid balances block export with an explanation. HPP is excluded.

Files: lib/admin/financial-documents.ts, components/admin/FinancialDocuments.tsx, Finance integration, optional model fields and snapshot writers, tests/m1_2.spec.ts, package dependencies, this plan and final report. Use one exact balance helper shared with existing finance; no second ledger or document persistence. Deterministic DEMO IDs derive from booking/payment IDs. Explicit fictional issuer; omit unconfigured instructions and legal/tax claims.

Risks: legacy contracts lack description snapshots; indicate current descriptive metadata fallback. PDFs already downloaded cannot be recalled after reversal; live previews must invalidate. Validate all monetary inputs as safe whole rupiah before bigint arithmetic. Verify actual PDF text/page structure, downloads, long content, both products, state persistence and existing regressions. Run lint, typecheck, build and Playwright. Inventory and commission changes are excluded.
