# Korea IPO & CB Risk Screener

> A transparent Korean-language NLP prototype for convertible-bond and IPO disclosure analysis.

[Live demo](https://ai-disclosure-risk-screener.vercel.app/) · [Public source snapshot](https://github.com/LewisKim7/Korea-IPO-CB-Risk-Screener)

| Applicant context | Detail |
| --- | --- |
| Created and directed by | **김유찬 (Yoochan Kim · Lewis)** |
| Professional context | Finance and deep-tech investment professional |
| Program of interest | [Master of Science in Artificial Intelligence](https://cdso.utexas.edu/msai), The University of Texas at Austin |
| Applicant direction | Korean capital-markets problem framing, risk taxonomy, product requirements, and evaluation questions |

This is optional supporting evidence for an application, not an official UT Austin
submission or a required application item. It is not affiliated with or endorsed by
The University of Texas at Austin.

![Korea IPO and CB Risk Screener interface](docs/assets/portfolio-preview.png)

Korea IPO & CB Risk Screener is an independent educational project created by 김유찬 (Yoochan Kim · Lewis) while preparing an application for graduate study in artificial intelligence. It connects Korean capital-markets workflows with structured screening, Korean passage classification, lexical evidence retrieval, a trained text baseline, explicit evaluation, and deterministic memo generation.

The interface is English so an international reviewer can follow the methodology. The disclosure-style source passages are Korean because Korean-language processing is the substantive problem being explored.

> **AI-assisted development disclosure:** 김유찬 defined the domain problem, project objective, risk taxonomy, feature requirements, evaluation questions, and application purpose. Codex assisted with synthetic-data drafting, implementation, documentation, and automated verification. All reference labels and rationales were drafted within the same AI-assisted project and have not been independently annotated or adjudicated. The reported results are development diagnostics, not independently validated performance.

## Reviewer fast path

| Time | Suggested path |
| --- | --- |
| 90 seconds | Open the [live demo](https://ai-disclosure-risk-screener.vercel.app/), select a document, run a Korean query, open one rule trace, and inspect the visible Q12 retrieval failure in Evaluation. |
| 5 minutes | Read the research question, document-held-out protocol, exact ML errors, retrieval diagnostic, and limitations on this page. |
| Reproduce | Run `npm ci && npm run verify`; no API key, backend, network model, or private dataset is required. |

김유찬 contributed the Korean capital-markets framing, product objective, risk taxonomy, feature requirements, evaluation questions, interpretation, and intended graduate-study narrative. AI assistance in corpus drafting, implementation, documentation, and QA is disclosed rather than presented as solo engineering work.

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
| Retrieval diagnostic | 12 AI-assisted Korean queries; graded relevance; Precision@3, Recall@3, MRR@3, nDCG@3 |
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

### Closed-corpus retrieval diagnostic

| Queries | Precision@3 | Recall@3 | MRR@3 | nDCG@3 |
| ---: | ---: | ---: | ---: | ---: |
| 12 | 69.45% | 77.78% | 91.67% | 85.51% |

The relevance set uses grades 1–2 and was drafted with AI assistance over the same 30-passage corpus. It is therefore an inspectable development diagnostic, not an independent retrieval benchmark. Q12 deliberately uses the paraphrase `남은 청약대금 관리 보고`; TF-IDF returns no lexical match even though two unused-proceeds passages were judged relevant. The failure is retained to show the baseline's synonym and context limits. See [Retrieval Evaluation](docs/retrieval-evaluation.md) for the query set, definitions, and per-query results.

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

`npm run verify` runs linting, 42 deterministic tests, TypeScript checks, and a production build. Tests freeze the five-document corpus, classification and retrieval diagnostics, the CB screen, and the IPO summary.

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
  annotation-guide.md
  data-card.md
  design-note.md
  evaluation-notes.md
  model-card.md
  retrieval-evaluation.md
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
- The 12-query retrieval relevance set is closed-corpus, AI-assisted, and not independently judged.
- Structured CB and IPO rows are fictional demonstrations, not current market data.

## Responsible use and independence

This project is educational. It is not investment advice, legal or regulatory analysis, issuer due diligence, or a substitute for human judgment. It does not establish performance on DART filings or other unseen text.

The project is not affiliated with or endorsed by The University of Texas at Austin, DART, KRX, Apple, getdesign.md, or any admissions office. The University and program names are used only to identify the intended application. The interface uses an original `Evidence Signal` mark and contains no official UT Austin logo, wordmark, seal, supporting mark, or university visual identity. The visual direction was inspired by the independent [Design System Analysis: Apple](https://getdesign.md/apple/design-md), but no Apple assets, logos, trademarks, proprietary fonts, source code, or product identity are used. See [Design Note](docs/design-note.md).

## Documentation

- [Evaluation notes](docs/evaluation-notes.md)
- [Retrieval evaluation](docs/retrieval-evaluation.md)
- [System and model card](docs/model-card.md)
- [Synthetic corpus data card](docs/data-card.md)
- [Annotation guide](docs/annotation-guide.md)
- [Design note](docs/design-note.md)

## Completed scope and next research phase

This completed prototype includes structured IPO/CB calculations, a transparent rule baseline, a document-held-out trained baseline, lexical retrieval, a deterministic evidence memo, classification error analysis, and a closed-corpus retrieval diagnostic. The next research phase would:

1. complete the applicant's personal review of every passage, label, rationale, prediction, and error;
2. create a permitted Korean disclosure set independent of rule and model development;
3. obtain independent annotations, adjudication, and agreement analysis;
4. compare the Unicode token baseline with a Korean morphological analyzer; and
5. repeat classification and retrieval evaluation on independently judged external examples.

## Rights

Copyright (c) 2026 김유찬 (Yoochan Kim · Lewis). All rights reserved. This review snapshot is
`UNLICENSED`; see [NOTICE.md](NOTICE.md) for the permitted review boundary.
