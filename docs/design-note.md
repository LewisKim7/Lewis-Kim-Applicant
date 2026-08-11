# Design Note

## Design objective

The interface is intended to help a skeptical reviewer move from the project's question to its evidence without decorative distraction. It combines a compact editorial opening, visible market and model diagnostics, and dense research views for passages, model traces, confusion matrices, and limitations.

The visual direction was inspired by the independent [Design System Analysis: Apple](https://getdesign.md/apple/design-md): generous whitespace, restrained typography, strong hierarchy, and alternating light and dark sections. The project does not reproduce an Apple product page or claim Apple design authorship.

## Independence and asset provenance

- The applicant identity uses an original `Evidence Signal` mark created for Yoochan Kim (Lewis Kim · 김유찬). Its paired brackets represent inspectable passages; the blue path represents a traceable risk signal.
- The application ribbon uses an original `Application Check` badge: a document, check, and small destination point. The UT Austin profile uses a restrained burnt-orange accent so the application context is immediately legible; it does not reproduce a Longhorn, shield, tower, seal, wordmark, official lockup, or other protected university asset.
- The University and program names appear only as text identifying the intended application. No official UT Austin logo, wordmark, seal, supporting mark, font, or copied university artwork is used.
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
| Navigation and identity | One compact project header, a profile action, a separate applicant/program ribbon, and a concise applicant biography directly below the hero actions | Establish the applicant before the prototype while avoiding a second large profile section |
| Fictional-document risk signals | Five synthetic documents, each with six transparent-rule predictions | Six equal passage blocks per document, exact flagged count, plain-language leading signals, and High/Watch/Low reading priority |
| Analytical figures | Semantic HTML/CSS bars with direct values, text labels, and one blue accent | Add visual comparison without a charting dependency or color-only meaning |

The interface uses color and spacing to separate information roles, but methodology claims are carried by text, tables, IDs, and labels rather than visual polish alone.

## Figure map and data contracts

| Figure | Bundled input and measure | Encoding | Interpretation boundary |
| --- | --- | --- | --- |
| Fictional-document flag overview | Transparent-rule predictions for 5 fictional documents × 6 passages | Filled versus open passage blocks, exact flagged count, and direct High/Watch/Low reading-priority labels | More flags raise reading priority only; they do not rate company quality, predict returns, or represent probability |
| CB strict-zero principal | Public CB Zero Finder snapshot captured 11 Aug 2026: 41 qualifying filing rows, 40 issuers, and 17,898.6억원 | Horizontal bars for the five largest rows plus exact aggregate counts | Only numeric `0.0%` in both coupon and maturity-yield fields qualifies; `-` is missing and excluded; zero stated rates do not establish low effective financing cost or verified proceeds |
| IPO current return vs offer | Public IPO Market Report PDF data through 7 Aug 2026, generated 8 Aug 2026: 52 firms | Signed bars around a symmetric `0%` offer-price baseline for selected positive and negative observations; summary metrics remain visible | The portfolio freezes the report values: 19.5 trillion KRW offer market cap, +111.4% average first day, −5.1% average current, and 36 of 52 below offer |
| Recall by risk label | 30 synthetic passages across 7 labels | Solid bars for document-held-out TF-IDF logistic regression; outlined bars for closed-corpus weighted rules; exact percentages and label counts remain visible | Liquidity recall is 25% (1 of 4) for the held-out baseline; the protocols differ, so the chart is diagnostic rather than a model ranking |

The IPO and CB figures are dated public-tool evidence, not live feeds. The embedded source applications may update independently, while this portfolio snapshot remains fixed for reproducible admissions review. Real issuer rows are never joined to the five-document synthetic NLP corpus or assigned a risk label.

## Language architecture

Navigation, headings, explanations, controls, evaluation notes, and limitations are in English. The synthetic source passages remain Korean. Each displayed Korean passage is followed by its concise AI-assisted `annotationRationale` as an English summary, and each Korean rule phrase shown under `Matched terms` carries a finance-context gloss.

The summary is not a literal or independently verified translation and does not replace the Korean source. Keeping the original, the short English orientation, the matched terms, and the rule trace together lets an international reviewer inspect the evidence boundary without presenting a machine translation as a second source.

## Switchable application context

The production default identifies only `Prepared for graduate applications to UT Austin`; it does not name MSAI or MSDS in the top ribbon. The original document-check badge uses a custom copper and project-blue palette rather than an official university logo or exact UT brand color. School, program-link, badge colors, and non-affiliation copy are centralized in `src/config/application-profile.ts`. Setting `VITE_APPLICATION_PROFILE=georgia-tech-omsa` swaps the visible application context to the bundled Georgia Tech analytics profile while leaving all research and evaluation claims unchanged.

## Interaction and information hierarchy

1. **Header and applicant ribbon** keep the project navigation thin, provide a persistent Profile action, and pair the applicant with the intended school context and non-affiliation boundary.
2. **Hero, signal trace, and compact applicant profile** state the objective, introduce Yoochan Kim directly below the primary actions, and show a bilingual Korean rule trace.
3. **Risk-signal overview** compares five fictional documents through exact flagged-passage counts and explains that the output is only a reading priority.
4. **Production-tool bridge** uses compact tabs to pair a frozen real-market summary with one lazy-loaded source application at a time, then explicitly separates that evidence from the synthetic NLP workflow.
5. **Problem and methodology** separate the research question from preprocessing, rules, trained classification, retrieval, and memo generation.
6. **Dashboard and taxonomy** let the reviewer inspect Korean passages, English summaries, rule traces, evidence ranking, memo citations, and label definitions.
7. **Evaluation** leads with per-label recall, then preserves fold details, confusion matrices, errors, and retrieval diagnostics under their respective protocols.
8. **Limitations** ends the page with annotation provenance, non-affiliation, and non-use claims.

## Accessibility and responsive intent

The implementation includes semantic page regions and headings, a skip link, visible keyboard focus, labeled controls, and responsive grids. The desktop opening uses a single-row header, editorial left-aligned section headings, a compact applicant profile, and direct-labeled risk rows. Detailed evaluation artifacts are collapsed behind labeled native disclosure controls. Mobile condenses the header, stacks the applicant material, keeps the five-document risk view in compact rows, preserves 44-pixel primary control targets, and converts dense repeated content into cards or intentional horizontal scrollers. Wide evaluation tables and confusion matrices are contained so they can scroll rather than force the page beyond the viewport.

The CSS is designed down to a 320-pixel viewport, but this note does not claim complete WCAG conformance. A formal assistive-technology and cross-browser audit has not been performed.

## Content-integrity constraints

- Do not use visual confidence to imply calibrated model confidence.
- Keep exact values and protocol labels on analytical figures; do not rely on color alone.
- Keep protocol labels adjacent to evaluation metrics.
- Keep passage and document IDs visible wherever evidence is summarized.
- Keep synthetic-data, AI-assistance, and non-affiliation disclosures discoverable without opening the repository.
- Do not describe lexical TF-IDF retrieval as semantic search.
- Do not add real issuer logos, copied filing screenshots, or Apple-branded assets.
- Do not attach a classifier output or risk label to any real issuer in the frozen market layer.

The design succeeds only if the reviewer can distinguish what the artifact implements, what the evaluation supports, and what remains unverified.
