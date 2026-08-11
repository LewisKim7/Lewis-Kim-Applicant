# Design Note

## Design objective

The interface is intended to help a skeptical reviewer move from the project's question to its evidence without decorative distraction. It combines a compact editorial opening, visible market and model diagnostics, and dense research views for passages, model traces, confusion matrices, and limitations.

The visual direction was inspired by the independent [Design System Analysis: Apple](https://getdesign.md/apple/design-md): generous whitespace, restrained typography, strong hierarchy, and alternating light and dark sections. The project does not reproduce an Apple product page or claim Apple design authorship.

## Independence and asset provenance

- The applicant identity uses an original `Evidence Signal` mark created for 김유찬 (Yoochan Kim · Lewis). Its paired brackets represent inspectable passages; the blue path represents a traceable risk signal.
- The University and program names appear only as text identifying the intended application. No official UT Austin logo, wordmark, seal, supporting mark, font, or university visual identity is used.
- No written permission to use a protected UT mark was assumed. The official [Permission to Use](https://trademarks.utexas.edu/permission-use) and [Outside Entities](https://trademarks.utexas.edu/outside-entities) guidance informed the text-only treatment.
- No Apple logo, image, icon, trademark, product identity, source code, or proprietary font is used.
- No asset was copied from Apple or getdesign.md.
- System font fallbacks are used rather than bundled Apple font files.
- The project is not affiliated with, sponsored by, reviewed by, or endorsed by Apple or getdesign.md.

## Implemented visual system

| Element | Implementation | Purpose |
| --- | --- | --- |
| Canvas | `#ffffff` | High-contrast reading surface |
| Primary ink | `#1d1d1f` | Main text and headings |
| Secondary ink | `#6e6e73` | Metadata and explanatory copy |
| Accent | `#0066cc` and `#2997ff` | Links, focus, and selected states |
| Dark panels | Near-black surfaces with white text | Separate methodology and evidence-heavy moments |
| Typography | Native system sans-serif stack; system monospace fallbacks for IDs and metrics | Fast loading and no external font asset |
| Layout | Wide whitespace, constrained reading widths, responsive grids, and horizontal table containment | Preserve editorial hierarchy while supporting technical density |
| Navigation and identity | One compact project header followed by a separate applicant/program ribbon | Keep the project name in navigation while consolidating top-of-page applicant context |
| Analytical figures | Semantic HTML/CSS bars with direct values, text labels, and one blue accent | Add visual comparison without a charting dependency or color-only meaning |

The interface uses color and spacing to separate information roles, but methodology claims are carried by text, tables, IDs, and labels rather than visual polish alone.

## Figure map and data contracts

| Figure | Bundled input and measure | Encoding | Interpretation boundary |
| --- | --- | --- | --- |
| CB principal by issuer | 4 fictional proposed issuances totaling 790억원 | Horizontal principal bars sorted by size; the only explicit coupon `0.0%` and maturity yield `0.0%` row is labeled in blue | The matching row is 220억원, or 27.8% of the sample; zero stated rates do not establish low effective financing cost or verified proceeds |
| IPO current return vs offer | 6 fictional price observations as of 2026-07-31 | Signed bars around a symmetric `0%` offer-price baseline; positive values are solid and negative values are outlined | The values are fixture calculations, not Korean IPO market statistics or a live performance feed |
| Recall by risk label | 30 synthetic passages across 7 labels | Solid bars for document-held-out TF-IDF logistic regression; outlined bars for closed-corpus weighted rules; exact percentages and label counts remain visible | Liquidity recall is 25% (1 of 4) for the held-out baseline; the protocols differ, so the chart is diagnostic rather than a model ranking |

The CB figure deliberately distinguishes the all-row principal view from the separate filter check in which a `0.0%` surface rate and 200억원 minimum return two rows totaling 520억원. Neither result is presented as a real-market screen.

## Language architecture

Navigation, headings, explanations, controls, evaluation notes, and limitations are in English. The synthetic source passages remain Korean. Each Korean rule phrase shown under `Matched terms` carries a concise English finance-context gloss so an international reviewer can understand the signal without losing the original text.

Full Korean passages are not translated inside the evidence trail because a full translation could become a second, unverified source. English term glosses, metadata, and explanations provide orientation without replacing the original synthetic text.

## Switchable application context

The production default identifies only a `UT Austin graduate application`; it does not name MSAI or MSDS in the top ribbon. School, program-link, and non-affiliation copy are centralized in `src/config/application-profile.ts`. Setting `VITE_APPLICATION_PROFILE=georgia-tech-omsa` swaps the visible application context to the bundled Georgia Tech analytics profile while leaving all research and evaluation claims unchanged.

## Interaction and information hierarchy

1. **Header and applicant ribbon** keep the project navigation thin, place the applicant name once in the top identity block, and pair it with the intended program and non-affiliation boundary.
2. **Hero and signal trace** state the narrow objective and show an inspectable Korean rule trace immediately.
3. **Market screen** visualizes the fictional CB principal and IPO return fixtures before handing a selected disclosure to the NLP workflow.
4. **Problem and methodology** separate the research question from preprocessing, rules, trained classification, retrieval, and memo generation.
5. **Dashboard and taxonomy** let the reviewer inspect Korean passages, rule traces, evidence ranking, memo citations, and label definitions.
6. **Evaluation** leads with per-label recall, then preserves fold details, confusion matrices, errors, and retrieval diagnostics under their respective protocols.
7. **Limitations** ends the page with annotation provenance, non-affiliation, and non-use claims.

## Accessibility and responsive intent

The implementation includes semantic page regions and headings, a skip link, visible keyboard focus, labeled controls, and responsive grids. The desktop opening uses a single-row header and side-by-side figures; mobile condenses the header, stacks the market figures, preserves 44-pixel control targets, and converts dense repeated content into compact cards or intentional horizontal scrollers. Wide evaluation tables and confusion matrices are contained so they can scroll rather than force the page beyond the viewport.

The CSS is designed down to a 320-pixel viewport, but this note does not claim complete WCAG conformance. A formal assistive-technology and cross-browser audit has not been performed.

## Content-integrity constraints

- Do not use visual confidence to imply calibrated model confidence.
- Keep exact values and protocol labels on analytical figures; do not rely on color alone.
- Keep protocol labels adjacent to evaluation metrics.
- Keep passage and document IDs visible wherever evidence is summarized.
- Keep synthetic-data, AI-assistance, and non-affiliation disclosures discoverable without opening the repository.
- Do not describe lexical TF-IDF retrieval as semantic search.
- Do not add real issuer logos, copied filing screenshots, or Apple-branded assets.

The design succeeds only if the reviewer can distinguish what the artifact implements, what the evaluation supports, and what remains unverified.
