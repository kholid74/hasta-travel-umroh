# Hasta Travel V2 — Public Design Direction (M3.0-B)

> Three directions for review. All keep the Hasta logo, Instrument Serif + Manrope, the amber/gold accent, the meter-distance motif, the "no gradient, no fake faces" rules, and photo attribution. No images were generated and no assets were modified.

Related: [Audit](HASTA_V2_PUBLIC_AUDIT.md) · [Sitemap](HASTA_V2_PUBLIC_SITEMAP.md) · [Refinement plan](HASTA_V2_PUBLIC_REFINEMENT_PLAN.md) · Workspace UX: [Architecture §9](HASTA_V2_ARCHITECTURE.md)

## Starting point (facts)

| Surface | Palette | Type | Feel |
|---|---|---|---|
| Public site | Dark "Malam Gurun": bg `#0c1210`, surface `#151c19`, ink `#f2efe8`, amber `#f0a62b` (only warm colour) | Instrument Serif display, Manrope UI | Calm, nocturnal, editorial |
| Workspace, PDFs, future portals | Light: bg `#f5f6f3`, white surfaces, forest green `#245b45`, amber `#f0a62b`; PDFs have a dark-green header band with gold label | Manrope (workspace), Lato (PDF) | Clean, operational |

Text contrast on the public site is strong (≥ 6.7:1). Component borders are faint (1.26:1). V2 introduces forms (`/daftar`, `/mitra`, `/kontak`) and a pilgrim portal, which will be light (workspace architecture).

---

## Direction A — "Malam Gurun, diperhalus" (evolve the current dark site)

| Aspect | Specification |
|---|---|
| Visual positioning | Quiet luxury after dark; continuity with the current site |
| Layout | Same 1200 px grid; stronger section rhythm with hairline dividers raised to ≥ 3:1 for components; denser cards |
| Typography | Unchanged families; larger body on reading pages (17 px); serif numerals for prices and metres |
| Photography | Night/dusk architecture of the two mosques; crop out construction; one photo per page |
| Colour | Dark base; amber for actions only; a second accent is not introduced |
| Cards | Dark surface, 10 px radius, meter badge top-left, both distances on cards |
| Trust | Text licence strip + verification link; anti-proxy warning in amber-outlined callout |
| Hero | Current full-bleed photo, refined crop, value-prop line, quick finder overlapping the hero bottom |
| Mobile | Menu sheet, sticky consultation bar on all pages, collapsible itinerary |
| Trade-off | Lowest change cost; forms and long legal/FAQ reading stay on dark; visual seam with light portal and PDFs remains |

## Direction B — "Dua Waktu" (dark frame, light reading) — **recommended**

| Aspect | Specification |
|---|---|
| Visual positioning | Hero and navigation keep the night identity. Content where people read, compare and fill forms moves to a warm light surface that matches the portal and PDFs. One brand from website to invoice. |
| Layout | Dark header, hero and footer (signature). Light ivory content bands (`#f5f6f3` family from the workspace) for listings, detail pages, FAQ, forms. Section transitions use a straight edge or a thin gold rule (no gradients). |
| Typography | Instrument Serif for H1–H2, prices and metres; Manrope 16–17 px body; tabular numerals for prices. Same scale on light and dark. |
| Photography | Existing licensed photos used only in dark bands (hero, Tentang). Light bands rely on typography, the meter motif and maps-like diagrams instead of more photos. |
| Colour | Dark: `#0c1210` / `#151c19`. Light: `#f5f6f3` / `#ffffff`. Forest green `#245b45` becomes the secondary on light surfaces (links, success, "terverifikasi"). Amber stays the single action colour on both. Component borders ≥ 3:1. |
| Cards | White cards on ivory, 10 px radius, 1 px border, the footprints meter badge in green-on-pale; price in serif; CTA amber. Same card renders inside the pilgrim portal. |
| Trust | Licence + verification link directly under the hero (dark band); on light pages a compact "Legalitas & rekening resmi" panel styled like the PDF header band (dark green with gold label). |
| Hero | Keep the current hero composition and H1; add the measurable value-prop line and the quick finder bar on the hero's lower edge. |
| Mobile | Dark top bar with menu sheet; light content; bottom bar (Konsultasi / Daftar) on all product pages; 44 px targets; itinerary collapsed; forms one column with step indicator. |
| Trade-off | Medium effort (token layer + page backgrounds), but it directly serves V2 forms, the portal and PDF continuity. |

## Direction C — "Peta & Meter" (data-forward editorial)

| Aspect | Specification |
|---|---|
| Visual positioning | Hasta as the operator that measures: distance and walking routes are the hero |
| Layout | Large schematic "distance ruler" hero (extending `PenandaMeter`); listing as a comparison table-first view with cards secondary |
| Typography | Serif display for numbers at very large sizes; Manrope for labels |
| Photography | Minimal; diagrams replace photos |
| Colour | Light base with dark ink; amber markers; green route lines |
| Cards | Row-based comparison (hotel, metres, minutes, route type, step-free, price) |
| Trust | Method page explaining how distances are measured |
| Hero | "180 m · 450 m · 950 m" ruler with interactive package markers |
| Mobile | Horizontal scroll rulers; comparison collapses to cards |
| Trade-off | Most distinctive. Weakest emotional tone for a spiritual journey, highest build cost, and risks reading as a tool rather than a trusted operator. |

---

## Recommendation: Direction B "Dua Waktu"

1. **It preserves what works.** The dark hero, typography and amber already give Hasta a premium, non-template identity. B keeps them where first impressions are formed.
2. **It solves audited problems.**
   - Forms, long FAQ/requirements text and payment information read better on light surfaces. This is a judgement, not measured legibility data: current contrast already passes.
   - Raising component borders to ≥ 3:1 is easier on light.
   - The faint input boundaries (1.26:1) would be fixed.
3. **It unifies V2.**
   - A pilgrim moves from the public detail page → `/daftar` → invoice PDF → `/portal/jamaah`.
   - B makes these one visual system: the same green secondary, amber action and card style.
   - The workspace architecture already specifies the light portal with these tokens.
4. **Cost is contained.** The change is a token layer and section backgrounds, not new components. The meter badge, cards, date selector and filters keep their structure.

Rules for implementation:
- Define both themes as CSS tokens in `globals.css` (`[data-band="dark"|"light"]`).
- Do not fork components.
- Before/after screenshots must use the widths and pages in the Audit §9 index.
- Keep "no gradients", one radius (10 px), at most two shadow levels, and no faces (DECISIONS.md §7).
