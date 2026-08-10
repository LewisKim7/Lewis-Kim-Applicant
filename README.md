# Korea IPO & CB Risk Screener

> A transparent Korean-language NLP prototype for convertible-bond and IPO disclosure analysis.

[Live demo](https://ai-disclosure-risk-screener.vercel.app/) · [Repository](https://github.com/LewisKim7/AI-Disclosure-Risk-Screener)

Korea IPO & CB Risk Screener is an independent educational project created while preparing for graduate study in artificial intelligence. It connects Korean capital-markets workflows with structured screening, Korean passage classification, lexical evidence retrieval, a trained text baseline, explicit evaluation, and deterministic memo generation.

The interface is English so an international reviewer can follow the methodology. The disclosure-style source passages are Korean because Korean-language processing is the substantive problem being explored.

> **AI-assisted development disclosure:** The applicant selected the domain, project objective, feature requirements, and application purpose. Codex assisted with synthetic data drafting, implementation, documentation, and automated verification. All reference labels and rationales were drafted within the same AI-assisted project and have not been independently annotated or adjudicated. The reported results are development diagnostics, not independently validated performance.

## At a glance

| Item | Implementation |
| --- | --- |
| Application | React, TypeScript, and Vite |
| Source language | Korean passages; English interface |
| Corpus | 5 fictional KOSPI/KOSDAQ documents |
| Evaluation set | 30 synthetic passages across 7 labels |
| Transparent baseline | Korean/English weighted phrase rules |
| Trained baseline | Unigram TF-IDF + multinomial logistic regression |
| ML protocol | 5-fold leave-one-document-out; 24 train / 6 test per fold |
| Retrieval | TF-IDF cosine lexical ranking |
| Memo | Deterministic template with passage-ID citations |
| External services | No API key, remote model, or backend required |

## Research question

Korean convertible-bond issuance decisions and IPO prospectuses contain structured terms, but their implications are distributed across tables and dense Korean text. A first-pass analyst must connect terms such as conversion-price resets, put and call options, use of proceeds, lockups, related-party relationships, cash runway, and execution milestones to the passages that support a risk assessment.

This project asks:

> Can a transparent Korean-language NLP workflow connect structured IPO and CB screening with passage-level risk triage while keeping every conclusion linked to inspectable evidence?

The objective is not automated investment judgment. It is to make the problem formulation, data, rules, learned baseline, evidence trail, errors, and limitations visible.

## Domain workflow lineage

The project was informed by two workflows already present in the applicant's portfolio:

- [CB Zero Finder](https://cb-zero-finder.vercel.app/) — the new TypeScript module reproduces the same kind of rate-and-size screening behavior on four fictional CB rows.
- [IPO Market Report](https://ipo-market-report.vercel.app/) — analogous IPO aggregation calculations were inspired by the report workflow and reimplemented over six fictional observations.

The relationship is conceptual only. Neither existing repository nor any production data was imported. This project also does **not** copy API responses, API keys, private workbooks, or generated reports from either tool.

### Fictional structured demonstrations

| Workflow | Bundled sample | Deterministic result |
| --- | --- | --- |
| CB screen | 4 fictional rows; surface rate `0.0%`; minimum issue size 200억원 | 2 matches totaling 520억원 |
| IPO snapshot | 6 fictional observations as of 2026-07-31 | Total offer market capitalization 42,000억원 |
| IPO returns | Same 2026-07-31 snapshot | Median first-day return 12.5%; median current return 1.47% |
| IPO downside count | Same 6 observations | 3 of 6, or 50%, below offer price as of 2026-07-31 |

These values validate the local screening and aggregation functions. They are not market statistics.

## Synthetic Korean corpus

The corpus contains two convertible-bond documents and three IPO documents. Every issuer, identifier, date, transaction, amount, and passage is fictional.

| Document ID | Fictional issuer | Market | Document type | Passages |
| --- | --- | --- | --- | ---: |
| `DOC-KR-CB-ISSUE-001` | 한빛퀀텀모션 | KOSDAQ | DART-style CB Issuance Decision | 6 |
| `DOC-KR-CB-RESET-001` | 세림뉴로칩 | KOSDAQ | DART-style CB Terms Amendment | 6 |
| `DOC-KR-IPO-PROSPECTUS-001` | 가온바이오컴퓨트 | KOSDAQ | KOSDAQ IPO Prospectus Excerpt | 6 |
| `DOC-KR-IPO-PROCEEDS-001` | 다온그린셀 | KOSPI | KOSPI IPO Use-of-Proceeds Excerpt | 6 |
| `DOC-KR-IPO-RISK-001` | 미르오비탈링크 | KOSDAQ | KOSDAQ IPO Risk-Factor Excerpt | 6 |
| **Total** | **5 fictional issuers** |  |  | **30** |

The passages include Korean capital-markets signals such as `전환가액 조정`, `리픽싱`, `조기상환청구권`, `풋옵션`, `콜옵션`, `오버행`, `구주매출`, `보호예수`, `공모자금`, `수요예측`, `특수관계인`, and `계속기업`. They are newly written synthetic passages, not excerpts from copyrighted filings.

Each passage stores:

```text
documentId
passageId
companyName
documentType
date
text
referenceLabel
annotationRationale
```

## Risk taxonomy

The task uses one primary label per passage.

| Label | Count | Working definition |
| --- | ---: | --- |
| Dilution Risk | 5 | Ownership dilution from issuance, conversion, options, or reset terms |
| Refinancing Risk | 4 | Pressure to repay, extend, replace, or roll over financing obligations |
| Liquidity Risk | 4 | Constraints on cash, working capital, covenants, or continued operations |
| Governance Risk | 4 | Board, control, related-party, voting-right, or conflict concerns |
| Execution Risk | 5 | Uncertainty around approvals, delivery, construction, commercialization, or scale-up |
| Market Risk | 4 | Exposure to demand, competition, pricing, rates, currencies, or market conditions |
| Low Risk / Informational | 4 | Routine context with no configured primary risk signal |

Single-label classification keeps the confusion matrices inspectable, but it compresses passages with overlapping risks. That is a limitation rather than a claim that one passage can contain only one risk.

## Pipeline

### 1. Structured screening

The CB functions normalize issue amounts and rates, filter by a declared rate condition, company or stock-code query, and minimum issue size, then aggregate matching issue value. The IPO functions calculate offer-band position, first-day and current returns, total offer market capitalization, medians, and below-offer frequency.

### 2. Korean text preparation

The preprocessing layer applies Unicode normalization, typography and whitespace cleanup, Unicode tokenization, a small Korean stop-word list, and limited particle stripping. It is intentionally lightweight and is not a Korean morphological analyzer.

### 3. Transparent rule baseline

The rule engine uses declared Korean and English phrases with fixed integer weights. It exposes every matched phrase, contribution, raw label score, selected label, and explanation. Its 0–1 signal score is a normalized rule-strength heuristic, not a probability, calibrated value, or measure of financial severity.

### 4. Trained baseline

The trained experiment uses unigram TF-IDF, L2-normalized sparse vectors, and full-batch multinomial logistic regression. Evaluation holds out one entire document at a time:

```text
5 folds
each fold: 4 documents / 24 passages for training
           1 unseen document / 6 passages for testing
TF-IDF vocabulary and IDF: fitted on training passages only
```

The softmax model score is uncalibrated and must not be treated as real-world risk probability.

### 5. Lexical retrieval and memo

TF-IDF cosine retrieval ranks passages by lexical overlap with a Korean or English query. It does not claim semantic understanding. The deterministic memo generator organizes rule outputs into an executive summary, risk signals, evidence, implications, questions, and limitations while retaining passage IDs.

## Evaluation

| Baseline | Protocol | Correct | Accuracy | Macro recall | Errors |
| --- | --- | ---: | ---: | ---: | ---: |
| Weighted rules | Closed corpus; no holdout | 25 / 30 | 83.33% | 82.14% | 5 |
| TF-IDF logistic regression | Leave one document out | 26 / 30 | 86.67% | 85.71% | 4 |

These percentages are **not a head-to-head model ranking**. The rules were authored and checked on the same corpus used during project development. The logistic-regression predictions are out of fold, but all five documents share the same small, synthetic, AI-assisted data-generation process. Repeated wording and development choices can therefore make both results optimistic.

The main value of the evaluation is diagnostic:

- rules expose exact vocabulary gaps, negation failures, and label overlap;
- document holdout prevents one document's passages from entering their own training fold;
- the ML errors expose sparse Korean vocabulary and unstable learning from only 24 training examples per fold; and
- both methods show that Liquidity Risk remains the weakest category; the document-held-out ML recall for that label is 25% (1 of 4).

See [Evaluation Notes](docs/evaluation-notes.md) for fold results, per-label recall, exact errors, and metric definitions.

## Interface

The English interface includes:

- structured CB and IPO workflow summaries;
- a five-document Korean source library;
- document-level key facts and transaction metadata;
- Korean TF-IDF evidence search;
- a passage-level rule trace and annotation rationale;
- an evidence-linked deterministic memo;
- a trained-baseline fold table and confusion matrix;
- the closed-corpus rule confusion matrix and five visible rule errors; and
- limitations, AI-assistance disclosure, and non-affiliation language.

## Run locally

### Requirements

- Node.js 22
- npm

### Install and verify

```bash
npm ci
npm run verify
```

`npm run verify` runs linting, tests, TypeScript checks, and a production build. Tests freeze the five-document corpus, both evaluation results, the CB screen, and the IPO summary.

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite.

## Repository guide

```text
src/
  components/   English interface and evaluation views
  data/         Korean corpus plus fictional CB and IPO rows
  domain/       Document, passage, market, workflow, and taxonomy types
  lib/          Screening, preprocessing, rules, retrieval, ML, evaluation, and memo logic
docs/
  application-language.md
  design-note.md
  evaluation-notes.md
  model-card.md
  project-defense-guide.md
  ut-msai-project-note.md
```

## Limitations

- The corpus has only 30 synthetic Korean passages.
- The reference labels and rationales are AI-assisted and not independently reviewed.
- The rule result is a closed-corpus implementation check, not a held-out estimate.
- Five document folds are still only five synthetic documents from one development process.
- Lightweight particle stripping is not morphological analysis.
- Exact phrase rules miss implicit, negated, or unfamiliar risk expressions.
- One primary label suppresses secondary risks.
- TF-IDF has limited Korean context and paraphrase understanding.
- Logistic-regression hyperparameters were explored during development.
- Retrieval has no independent query-relevance evaluation.
- Structured CB and IPO rows are fictional demonstrations, not current market data.

## Responsible use and independence

This project is educational. It is not investment advice, legal or regulatory analysis, issuer due diligence, or a substitute for human judgment. It does not establish performance on DART filings or other unseen text.

The project is not affiliated with or endorsed by UT Austin, DART, KRX, Apple, getdesign.md, or any admissions office. The visual direction was inspired by the independent [Design System Analysis: Apple](https://getdesign.md/apple/design-md), but no Apple assets, logos, trademarks, proprietary fonts, source code, or product identity are used. See [Design Note](docs/design-note.md).

## Documentation

- [Evaluation notes](docs/evaluation-notes.md)
- [System and model card](docs/model-card.md)
- [Graduate-study preparation note](docs/ut-msai-project-note.md)
- [Project defense guide](docs/project-defense-guide.md)
- [Design note](docs/design-note.md)
- [CV and SOP language](docs/application-language.md)

## Recommended next work

1. Have the applicant personally review every passage, label, rationale, prediction, and error.
2. Create a permitted Korean disclosure set that is independent of rule and model development.
3. Add independent annotators, a labeling guide, adjudication, and agreement analysis.
4. Compare the lightweight tokenizer with a Korean morphological baseline.
5. Evaluate multi-label classification and Korean retrieval ranking separately.
