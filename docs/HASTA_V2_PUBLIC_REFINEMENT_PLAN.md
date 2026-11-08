# Hasta Travel V2 — Public Refinement Plan (M3.0-B)

> Prioritised findings with evidence, followed by implementation phases. No performance metrics or conversion uplift figures are claimed; impact is described qualitatively. Complexity: **S** ≤ 1 day, **M** 2–4 days, **L** ≥ 1 week (one developer, including tests).

Related: [Audit](HASTA_V2_PUBLIC_AUDIT.md) · [Sitemap](HASTA_V2_PUBLIC_SITEMAP.md) · [Copy](HASTA_V2_PUBLIC_COPY_AUDIT.md) · [Journeys](HASTA_V2_PUBLIC_JOURNEY.md) · [Design direction](HASTA_V2_PUBLIC_DESIGN_DIRECTION.md) · Workspace [Roadmap](HASTA_V2_ROADMAP.md)

---

## P0 — Critical journey, misleading information, broken functionality

| # | Page / component | Current issue | Evidence | User impact | Proposed solution | Cx | Dependencies |
|---|---|---|---|---|---|---|---|
| P0-1 | `TrustSection`, homepage licence strip, footer | Main verification CTA points to `https://simpu.kemenag.go.id`, which did not resolve from the audit environment. Coverage says licensing moved to Kemenhaj, and `haji.go.id` identifies as Kementerian Haji dan Umrah. | `components/TrustSection.tsx:5`; DNS failure (curl exit 6) on 2026-11-07; Audit §2.10 | The core trust promise ("cek sendiri") may dead-end or send people to the wrong institution | Client confirms the official verification portal from an Indonesian network; centralise the URL and institution name in `content/company.ts`; neutral wording until confirmed (Copy §8) | S | Client confirmation |
| P0-2 | `/haji-khusus`, `lib/whatsapp.ts` | Mujamalah/Furoda presented as a Haji Khusus product. Its WhatsApp text reads "…paket Haji Khusus Haji Mujamalah (Visa Furoda), terutama masa tunggu…" for a no-queue product. | `content/haji.ts` h03; `lib/whatsapp.ts` `haji` case; facts capture (Audit §2.5) | Conflates two regulated routes; contradictory message to the operator | Separate the Mujamalah section (or remove it if not offered); a product-specific WhatsApp template (Copy §7) | S | Client confirms whether Mujamalah is offered |
| P0-3 | Catalogue, detail, schedule, homepage | "Today" is evaluated at build time, so past departures stay listed and selectable until a redeploy. The live build will list **11 November 2026** dates after they pass. | `paket-umroh/page.tsx:14-16`, `[slug]/page.tsx`, `jadwal-keberangkatan/page.tsx`; `X-Nextjs-Prerender: 1` | Visitors can enquire about a departure that already left | Time-based revalidation (e.g. daily) **or** a client-side guard that hides/labels past dates after hydration while keeping the static HTML. Check the caching approach against `node_modules/next/dist/docs` (Next 16) before implementing. | S–M | — |
| P0-4 | `Header` (mobile) | No menu button; nav scrolls horizontally (441 px in 240 px), hiding Jadwal/FAQ/Tentang/Kontak; operator WhatsApp hidden below `md` | `Header.tsx`; facts `mobile-390:nav`; `mobile-390/01-home-fold.jpg` | Mobile visitors can't see most destinations | Menu button + sheet (`<dialog>`) with all links and the operator WhatsApp; keep the desktop nav | S | — |
| P0-5 | Mobile listing/schedule/FAQ/Tentang | The only visible WhatsApp button on these mobile pages is the **studio sales** CTA | Facts: WhatsApp sources per page; `Footer.tsx` | Pilgrims may message the studio thinking it is the operator | Persistent mobile "Konsultasi" bar on product pages; move the studio CTA into a labelled "Tentang demo ini" strip | S | Design token for the bar |
| P0-6 | 404 | Default Next.js 404: white, English, no header/footer or recovery | `09-not-found.jpg` (all widths) | Any broken or guessed link dead-ends | `app/(public)/not-found.tsx` in Indonesian with links (Copy §3). Check the App Router not-found conventions in the bundled Next docs. | S | — |
| P0-7 | Requirements, FAQ, Haji notes | Regulatory/document rules stated as fixed facts and inconsistent with the workspace (passport 8 vs 6 months; mahram letter; porsi "diterima Kemenag") | `content/packages.ts` `SYARAT`, `content/faq.ts`, `content/haji.ts`; `lib/admin/model.ts` `validPassport` | Risk of misinforming pilgrims; inconsistent advice between site and workspace checks | Mark as "contoh persyaratan" until the operator supplies its written rules; one shared constant for passport validity used by site copy and workspace check | S | Client input |
| P0-8 | Journey D (registration) | No registration, confirmation or payment-instruction flow; WhatsApp is the only path | Audit §1, Journey D | The core conversion journey is missing; nothing reaches the workspace CRM | `/daftar` → `/daftar/terima-kasih` creating a `PublicInquiry` + Lead via the same-browser bridge (Journey §6) | L | Workspace migration pipeline (Roadmap M3.1), lead attribution fields (M3.2), catalogue unification (P1-4) |

## P1 — High-impact clarity, conversion, mobile UX and trust

| # | Page / component | Current issue | Evidence | Impact | Solution | Cx | Dependencies |
|---|---|---|---|---|---|---|---|
| P1-1 | Homepage hero | No value proposition; the differentiator (metres, elderly walking time, three room prices) is not in the hero | `page.tsx` hero copy | Visitors don't learn why Hasta is different | New supporting line + "Lihat paket Umrah" (Copy §4) | S | — |
| P1-2 | Homepage | Haji Khusus has no section; no date-driven entry; testimonial is fictitious; closing CTA is feature talk | `page.tsx` sections | Haji researchers and date-driven visitors lack a path | Implement the homepage blueprint (Sitemap §3) | M | P1-4 for live departures |
| P1-3 | All pages | Demo meta-commentary inside customer copy (Pembimbing, Trust note) and `DEMO_NOTICE` repeated under every H1 | `[slug]/page.tsx` Pembimbing; `TrustSection.tsx` demo paragraph; `DEMO_NOTICE` usages | Confuses pilgrims about whether the operator is real; weakens the showcase | One site-wide demo banner + `/tentang#demo` disclosure section; customer copy written as for a real operator | S–M | — |
| P1-4 | Public ↔ workspace catalogue | Public 47 departures/seat fixtures vs workspace 8 departures; public Haji products ≠ workspace Hajj packages | `content/packages.ts`, `content/haji.ts`, `content/admin/seed.ts`, `content/admin/hajj.ts` | Demo inconsistency when presenting site + workspace; blocks registration mapping | One catalogue: workspace seed derives all public departures (with `publicRef`); one Hajj catalogue (Journey §6.3) | M | Workspace storage migration (new version) |
| P1-5 | Detail page | No payment terms (DP, deadline, verification); sold-out selectable without alternative; itinerary fully open | `DetailClient.tsx`, `[slug]/page.tsx` | Key decision information is missing; long mobile page (≈ 6,900 px) | Payment-terms block; "Penuh — pilih tanggal lain / daftar tunggu"; collapsed itinerary with "Buka semua" | M | Copy approval |
| P1-6 | `/haji-khusus` | No process explanation; no detail pages; USD-only without guidance | `haji-khusus/page.tsx`; unused `hajiBySlug` | High-consideration product with low guidance | Process timeline + `/haji-khusus/[slug]` + Haji consultation form | M | P0-2, P1-4 |
| P1-7 | Referral / agents | `?ref=` ignored; no partner page; the only agent mention is a warning | Journey §7 | Agent-referred visitors lose attribution; no recruitment path | Referral capture (sessionStorage → WhatsApp text + form) and `/mitra` without income claims | M | Workspace M3.2 (`Agent.code`), decision D6 |
| P1-8 | WhatsApp messages | Generic prefill gives the operator nothing to act on; salutation spelling inconsistent | `lib/whatsapp.ts`; facts WhatsApp list | Slower first response | Structured templates with placeholders + optional referral code (Copy §9) | S | — |
| P1-9 | Listing | No departure-city filter; Madinah distance missing on cards; filter panel pushes content on mobile | `KatalogClient.tsx`, `PackageCard.tsx` | Harder comparison for non-Jakarta visitors | City filter (URL param), dual-distance badge, sticky mobile filter summary | M | — |
| P1-10 | Terminology | "Umroh" (site) vs "Umrah" (workspace/PDF); English "seat", "Sold Out" | Copy §2 | Inconsistent brand voice across site → invoice → portal | Adopt the agreed term set everywhere | S | Client decision |
| P1-11 | Forms & controls | Component borders 1.26:1 vs surface | Contrast calculation (Audit §3) | Inputs hard to distinguish (affects V2 forms) | Border token ≥ 3:1 (part of Direction B) | S | Design direction |
| P1-12 | FAQ | `<summary>` without visible expand affordance; no Haji or Mitra topics | `faq/page.tsx`, `content/faq.ts` | Content looks static; gaps for Haji/agents | Chevron indicator; add topics | S | Copy |
| P1-13 | Kontak | No form; office address repeated twice | `kontak/page.tsx` + `TrustSection` | Duplicate content; no option besides WhatsApp | Short consultation form (`PublicInquiry`), `ringkas` trust variant | S–M | P0-8 bridge |
| P1-14 | Returning customers | No path to booking status, payments or invoices | Journey E | Pilgrims depend on staff for documents | Header "Masuk" + confirmation-page link to the pilgrim portal demo | S (link) | Workspace M3.1 gateway, M5.1 portal |

## P2 — Visual polish and secondary enhancements

| # | Page / component | Issue | Evidence | Solution | Cx | Dependencies |
|---|---|---|---|---|---|---|
| P2-1 | Hero image | Construction cranes visible in the hero photo | `01-home.jpg` | Re-crop or choose another licensed photo (asset change needs approval) | S | Asset approval |
| P2-2 | Jadwal headings | Accessible name "November 20265 keberangkatan" | Facts H2 list | Separator text between month and count | S | — |
| P2-3 | Nav links, photo credits | Text-link targets < 24 px tall; 11 px credits | Facts `smallTargets`; `page.tsx` credit `text-[11px]` | Padding on nav links; 12–13 px credits | S | — |
| P2-4 | Jadwal | No filters or month chips; ≈ 8,100 px on mobile | `05-jadwal.jpg` | Month chips + city/type filters reusing catalogue query logic | M | — |
| P2-5 | Listing | 18 cards on one page | `02-paket-umroh.jpg` | "Tampilkan lebih banyak" after 9 on mobile | S | — |
| P2-6 | Catalogue deep links | Full list flashes before URL filters apply (intentional for SEO) | `KatalogClient.tsx:51-58` | Short skeleton/opacity transition on filtered deep links only | S | — |
| P2-7 | Package imagery | No visual per package | Detail screenshots | Hotel/route diagrams (meter motif) rather than stock photos | M | Design direction |
| P2-8 | Homepage count | "Lihat semua 18 paket" uses `packages.length`, not packages with upcoming dates | `page.tsx` | Count rows with upcoming departures | S | P0-3 |
| P2-9 | WhatsApp source tracking | `data-wa-source` exists but nothing consumes it | All WhatsApp anchors | If the client wants analytics, add privacy-respecting event tracking. No metrics are claimed until then. | S | Client analytics decision |
| P2-10 | Visual system | Two palettes across site/portal/PDF | Design direction | Direction B token layer, applied page by page | M–L | Approval of direction |

## Implementation phases

| Phase | Scope | Items | Depends on | Exit criteria |
|---|---|---|---|---|
| **0 — Corrections** (no redesign) | Make the current site accurate and navigable | P0-1…P0-7, P2-2, P2-8 | Client confirmations (portal URL, Mujamalah, document rules) | No dead trust link; no past departures after a date passes; mobile menu with operator WhatsApp; branded 404; existing tests green; before/after screenshots |
| **1 — Copy & IA on existing pages** | Homepage blueprint, demo disclosure layer, detail payment terms, Haji process, FAQ topics, terminology, contact cleanup | P1-1, P1-2 (without live data), P1-3, P1-5, P1-6 (overview part), P1-8, P1-10, P1-12, P1-13 (layout) | Copy approval | Copy audit items marked ✏️/⚠️ resolved or explicitly deferred |
| **2 — Connected journeys** | Catalogue unification, `/daftar` + confirmation, referral capture, `/mitra`, Haji detail pages, contact form | P0-8, P1-4, P1-6, P1-7, P1-9, P1-13 (form) | Workspace M3.1 (migration pipeline, gateway) and M3.2 (agent codes, attribution); new storage version for `publicInquiries` | A public submission appears as a Website lead in the workspace (same browser), converts with the existing flow, and keeps the referral agent |
| **3 — Visual direction** | Direction B tokens, light reading bands, card refresh, border contrast, polish | P1-11, P2-1, P2-3…P2-7, P2-10 | Direction approval; asset approval | Before/after screenshot set at 1440/768/390 for all Audit §9 pages |
| **4 — Returning customer** | "Masuk" menu, confirmation → portal link | P1-14 | Workspace M5.1 pilgrim portal | Pilgrim persona reaches payments/invoices from the public site via demo access |

## Dependencies on V2 workspace modules

| Public capability | Workspace dependency (roadmap) |
|---|---|
| Registration request → Lead | Migration pipeline (M3.1), lead fields (M3.2), `createPublicInquiry` (new, after M3.2) |
| Referral codes, agent-attributed booking | `Agent.code`, booking attribution (M3.2) |
| Partner application, partner portal demo | Agent portal (M3.2/M3.3), gateway (M3.1) |
| Live seat availability | Unified departures (this plan P1-4) |
| Haji programme detail with payment stages | `HajjPackage.milestones` (exists); Hajj catalogue unification |
| Payment instructions consistent with invoices | `settings.bank/account/accountHolder` (exists) |
| Returning customer | Gateway (M3.1), Pilgrim portal (M5.1) |
| Terminology across site/PDF/portal | `productLabels` in `content/admin/types.ts`, PDF templates |

## Decisions needed from the client

1. Official licence-verification portal and institution name (P0-1).
2. Whether Haji Mujamalah is offered, and how to describe it (P0-2).
3. Written document requirements and passport validity rule (P0-7).
4. "Umrah" vs "Umroh" (P1-10).
5. Real DP, payment deadline and cancellation terms, or keep them labelled *contoh* (P1-5).
6. Partner programme wording and legal review before `/mitra` is public (P1-7; workspace D6).
7. Design Direction B approval (P2-10) and any hero image change (P2-1).
8. Whether analytics may be added (P2-9).
