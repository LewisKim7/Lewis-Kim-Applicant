# Evaluation Notes

## Purpose

This document separates two different evaluation questions:

1. **Rule sanity check:** How does the transparent phrase baseline behave on the same 30-passage corpus used during development?
2. **Trained-baseline diagnostic:** How does a TF-IDF multinomial logistic-regression model behave when one entire synthetic document is excluded from training?

The protocols differ. Their accuracy percentages must not be presented as a controlled head-to-head comparison.

## Evaluation corpus

- 5 fictional Korean KOSPI/KOSDAQ documents
- 30 Korean passages
- 6 passages per document
- 7 primary labels
- 2 convertible-bond documents
- 3 IPO documents
- AI-assisted reference labels and rationales
- no independent annotator, adjudication, or agreement statistic

| Reference label | Count |
| --- | ---: |
| Dilution Risk | 5 |
| Refinancing Risk | 4 |
| Liquidity Risk | 4 |
| Governance Risk | 4 |
| Execution Risk | 5 |
| Market Risk | 4 |
| Low Risk / Informational | 4 |
| **Total** | **30** |

The labels identify one primary category even when a passage supports several interpretations.

## Metric definitions

### Accuracy

```text
accuracy = exact primary-label matches / 30
```

### Per-label recall

```text
recall(label) = correct predictions for label / reference passages for label
```

### Macro recall

Macro recall is the unweighted mean of recall across all seven represented labels. Each category therefore receives equal weight even though it has four or five examples.

## 1. Closed-corpus rule sanity check

The weighted Korean/English phrase rules are rerun on all 30 passages. No document is held out. The same corpus was visible while the taxonomy and rules were developed, so this result verifies deterministic implementation behavior rather than unseen-document performance.

| Metric | Result |
| --- | ---: |
| Correct | 25 of 30 |
| Accuracy | 83.33% |
| Macro recall | 82.14% |
| Errors | 5 |

### Rule per-label recall

| Label | Actual | Correct | Recall |
| --- | ---: | ---: | ---: |
| Dilution Risk | 5 | 5 | 100% |
| Refinancing Risk | 4 | 4 | 100% |
| Liquidity Risk | 4 | 2 | 50% |
| Governance Risk | 4 | 3 | 75% |
| Execution Risk | 5 | 5 | 100% |
| Market Risk | 4 | 3 | 75% |
| Low Risk / Informational | 4 | 3 | 75% |

### Five rule errors

| Passage | Reference → prediction | Error category | Interpretation |
| --- | --- | --- | --- |
| `DOC-KR-CB-ISSUE-001-P03` | Liquidity → Informational | Vocabulary coverage gap | The passage describes cash, spending, conditional borrowing, and a seven-month runway without matching a configured multi-token liquidity phrase. |
| `DOC-KR-CB-ISSUE-001-P04` | Governance → Informational | Korean wording variation | A representative's sibling and absent external review imply a conflict, but the passage does not use the exact configured terms `특수관계인`, `이해상충`, or `공정성 의견`. |
| `DOC-KR-CB-RESET-001-P02` | Liquidity → Refinancing | Label overlap | `조기상환청구권` and `풋옵션` receive refinancing weights even though the passage's central comparison is cash available versus cash required. |
| `DOC-KR-CB-RESET-001-P05` | Market → Dilution | Label overlap | `리픽싱`, `전환가액 조정`, and `오버행` outweigh the passage's market-volatility and selling-pressure framing. |
| `DOC-KR-IPO-PROSPECTUS-001-P06` | Informational → Governance | Negation failure | `특수관계인에게 지급되지 않으며` is a negative statement, but exact phrase matching treats `특수관계인` as positive governance evidence. |

These errors should not be patched away one by one against the same evaluation set. Doing so would make the closed-corpus score less informative.

## 2. Document-held-out trained baseline

The trained baseline uses:

- unigram TF-IDF;
- training-fold vocabulary and IDF only;
- L2-normalized sparse vectors;
- full-batch multinomial logistic regression;
- 400 epochs;
- learning rate `0.4`;
- L2 penalty `0.01`; and
- deterministic label ordering and optimization.

Five folds are defined by document ID. In every fold, four documents provide 24 training passages and the remaining unseen document provides 6 test passages. No passage from the held-out document contributes to that fold's vocabulary, IDF values, or learned parameters.

| Metric | Result |
| --- | ---: |
| Out-of-fold correct | 26 of 30 |
| Out-of-fold accuracy | 86.67% |
| Macro recall | 85.71% |
| Document folds | 5 |
| Errors | 4 |

### Fold results

| Held-out document | Vocabulary | Correct | Accuracy |
| --- | ---: | ---: | ---: |
| `DOC-KR-CB-ISSUE-001` | 394 | 5 / 6 | 83.33% |
| `DOC-KR-CB-RESET-001` | 393 | 4 / 6 | 66.67% |
| `DOC-KR-IPO-PROCEEDS-001` | 394 | 6 / 6 | 100% |
| `DOC-KR-IPO-PROSPECTUS-001` | 395 | 6 / 6 | 100% |
| `DOC-KR-IPO-RISK-001` | 398 | 5 / 6 | 83.33% |

### ML per-label recall

| Label | Actual | Correct | Recall |
| --- | ---: | ---: | ---: |
| Dilution Risk | 5 | 5 | 100% |
| Refinancing Risk | 4 | 4 | 100% |
| Liquidity Risk | 4 | 1 | 25% |
| Governance Risk | 4 | 4 | 100% |
| Execution Risk | 5 | 5 | 100% |
| Market Risk | 4 | 3 | 75% |
| Low Risk / Informational | 4 | 4 | 100% |

### Four out-of-fold ML errors

| Passage | Reference → prediction | Leading observed terms | Interpretation |
| --- | --- | --- | --- |
| `DOC-KR-CB-ISSUE-001-P03` | Liquidity → Execution | `분기`, `매출` | Sparse vocabulary links generic operating terms to execution examples rather than to a cash-runway concept. |
| `DOC-KR-CB-RESET-001-P02` | Liquidity → Dilution | `발행`, `행사할`, `전액` | The fold lacks enough stable Korean liquidity language, and generic CB terms dominate. |
| `DOC-KR-CB-RESET-001-P05` | Market → Dilution | `오버행`, `물량`, `전환가액`, `전환` | Conversion vocabulary overwhelms the market-supply interpretation. |
| `DOC-KR-IPO-RISK-001-P03` | Liquidity → Market | `고객`, `서비스`, `핵심` | Customer-related terms resemble market passages even though receivable timing and supplier prepayments create the cash mismatch. |

The model's softmax score is an uncalibrated output from a tiny synthetic training fold. It is not a probability of financial risk, a severity score, or evidence of performance on DART filings.

## Protocol interpretation

The ML baseline's 86.67% is about 3.3 percentage points above the rule baseline's 83.33%, but that difference does not show that logistic regression is superior:

- the rule score is closed-corpus while the ML score is out of fold;
- all documents were drafted in the same AI-assisted project;
- similar structure and wording recur across documents;
- labels were not independently annotated;
- model settings were explored during development; and
- five documents are too few for a stable performance estimate.

Both results are best treated as current development diagnostics, not as a frozen
confirmatory evaluation.

## Frozen production-tool evidence checks

Separate deterministic tests freeze selected public facts from the two production tools:

| Check | Source date | Frozen result |
| --- | --- | --- |
| IPO coverage | Data through 7 Aug 2026; PDF generated 8 Aug 2026 | 52 firms |
| IPO offer market capitalization | Same | 19.5 trillion KRW |
| IPO average returns | Same | +111.4% first day; −5.1% current |
| IPO below offer | Same | 36 of 52, or 69.2% |
| CB filing rows | Captured 11 Aug 2026 | 118 |
| Strict CB zero screen | Same | 41 rows across 40 issuers; 17,898.6억원 |

The CB screen admits only numeric `0.0%` in both coupon and maturity-yield fields; a `-` placeholder is missing and excluded. The largest qualifying rows are Hyundai Engineering & Construction (5,000억원), LigaChem Biosciences (1,700억원), Sungho Electronics (1,000억원), TSE (1,000억원), and Won Tech (750억원). These dated facts are display context, not an NLP benchmark. The linked tools may update independently while the portfolio snapshot remains fixed, and no real issuer receives a model output or risk label.

## 3. Closed-corpus retrieval diagnostic

The classification metrics do not validate TF-IDF search, so retrieval is evaluated separately with 12 Korean queries and graded query-passage relevance judgments. Grades use `2` for directly relevant evidence and `1` for supporting evidence. The same 30-passage corpus was visible while the AI-assisted query set and judgments were drafted; this is not a held-out or independently judged benchmark.

| Metric | Result |
| --- | ---: |
| Queries | 12 |
| Cutoff | 3 results |
| Mean Precision@3 | 69.45% |
| Mean Recall@3 | 77.78% |
| MRR@3 | 91.67% |
| nDCG@3 | 85.51% |

Eleven queries return a relevant passage at rank 1. Q12, `남은 청약대금 관리 보고`, is a deliberate paraphrase for unused-proceeds custody and reporting; it returns no lexical match even though two passages were judged relevant. That failure is retained as evidence of TF-IDF's synonym and context limitations rather than repaired by tuning the query set.

See [Retrieval Evaluation](retrieval-evaluation.md) for metric definitions, the per-query trace, and the exact interpretation boundary.

## Reproduction

From the repository root:

```bash
npm ci
npm run verify
npm run dev
```

`npm run verify` runs linting, 60 deterministic tests, TypeScript checks, and a production build. The tests freeze the corpus dimensions, English-summary contract, label coverage, rule metrics, plain-language review-priority thresholds, ML fold structure, ML metrics, retrieval judgments and ranking metrics, dated market-snapshot facts, source-tool tab behavior, application-profile switch, and applicant-profile evidence links.

Changes to passages, labels, preprocessing, rules, optimization settings, fold construction, or snapshot metadata can change the documented results.

## What the evaluation supports

- Both pipelines are implemented and deterministic on the checked-in revision.
- Vocabulary gaps, label overlap, negation failure, and sparse-data behavior are inspectable.
- TF-IDF vocabulary and IDF are fitted only on training documents in the ML folds.
- Every prediction can be traced back to a synthetic passage and reference label.
- Retrieval rankings can be reproduced for the 12 checked-in query judgments.

## What the evaluation does not support

- Performance on actual DART or KRX documents
- Generalization to unseen issuers, time periods, or document templates
- Independent validity of the reference labels
- Investment, legal, compliance, or admissions usefulness
- Calibrated risk probabilities or severity estimates
- Superiority of one baseline over the other
- Independent validity or external generalization of the retrieval metrics

## Before quoting a metric

- [ ] Run `npm ci` and `npm run verify` on the cited revision.
- [ ] Confirm 5 documents, 30 passages, and all 7 labels.
- [ ] Confirm 25/30 and 82.14% macro recall for the closed-corpus rules.
- [ ] Confirm 26/30 and 85.71% macro recall for document-held-out ML.
- [ ] State which evaluation protocol produced the number.
- [ ] State that the corpus and labels are synthetic and AI-assisted.
- [ ] State that there was no independent annotation or external evaluation.
- [ ] If quoting retrieval, state 12 AI-assisted closed-corpus queries at `k=3`.
