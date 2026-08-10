# Design Note

## Design objective

The interface is intended to help a skeptical reviewer move from the project's question to its evidence without decorative distraction. It combines a quiet editorial landing page with dense research views for passages, model traces, confusion matrices, and limitations.

The visual direction was inspired by the independent [Design System Analysis: Apple](https://getdesign.md/apple/design-md): generous whitespace, restrained typography, strong hierarchy, and alternating light and dark sections. The project does not reproduce an Apple product page or claim Apple design authorship.

## Independence and asset provenance

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

The interface uses color and spacing to separate information roles, but methodology claims are carried by text, tables, IDs, and labels rather than visual polish alone.

## Language architecture

Navigation, headings, explanations, controls, evaluation notes, and limitations are in English. The synthetic source passages remain Korean. This deliberately lets an international admissions reviewer understand the project structure while seeing that the preprocessing and evidence task operate on Korean-language inputs.

Korean passages are not translated inside the evidence trail because a translation could become a second, unverified source. English metadata and explanations provide orientation without replacing the original synthetic text.

## Interaction and information hierarchy

1. **Hero and problem framing** establish the narrow research question and responsible-use boundary.
2. **Workflow bridge** connects structured CB/IPO calculations to the text corpus while stating that the behavior was newly implemented on fictional rows without importing an existing repository or production data.
3. **Methodology** separates preprocessing, rules, trained classification, retrieval, and memo generation.
4. **Dashboard** lets the reviewer inspect Korean passages, rule traces, evidence ranking, and memo citations.
5. **Evaluation** presents the trained document-held-out experiment separately from the closed-corpus rule check.
6. **Limitations** ends the page with annotation provenance, non-affiliation, and non-use claims.

## Accessibility and responsive intent

The implementation includes semantic page regions and headings, a skip link, visible keyboard focus, labeled controls, and responsive grids. Wide evaluation tables and confusion matrices are contained so they can scroll rather than force the page beyond the viewport.

The CSS is designed down to a 320-pixel viewport, but this note does not claim complete WCAG conformance. A formal assistive-technology and cross-browser audit has not been performed.

## Content-integrity constraints

- Do not use visual confidence to imply calibrated model confidence.
- Keep protocol labels adjacent to evaluation metrics.
- Keep passage and document IDs visible wherever evidence is summarized.
- Keep synthetic-data, AI-assistance, and non-affiliation disclosures discoverable without opening the repository.
- Do not describe lexical TF-IDF retrieval as semantic search.
- Do not add real issuer logos, copied filing screenshots, or Apple-branded assets.

The design succeeds only if the reviewer can distinguish what the artifact implements, what the evaluation supports, and what remains unverified.
