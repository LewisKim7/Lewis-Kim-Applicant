# Data Card: Synthetic Korean IPO and CB Corpus

## Summary

This repository contains a small, synthetic Korean-language corpus for an educational IPO and convertible-bond (CB) risk-screening prototype. It is designed to make passage classification, evidence retrieval, error analysis, and model limitations inspectable. It is not intended to represent the distribution, complexity, or legal meaning of actual DART filings.

| Field | Value |
| --- | --- |
| Corpus file | `src/data/documents.json` |
| Language | Korean source passages; English metadata and rationales |
| Documents | 5 fictional documents |
| Passages | 30 passages; 6 per document |
| Markets represented | Fictional KOSPI and KOSDAQ contexts |
| Document families | 2 CB documents and 3 IPO documents |
| Annotation scheme | One AI-assisted primary label and rationale per passage |
| Independent annotation | None |
| External or personal data | None |

Every issuer, identifier, date, amount, transaction, and passage is fictional. The corpus does not contain copied full filings, production API responses, private workbooks, personal information, or confidential issuer data.

## Development provenance and AI assistance

The applicant selected the Korean capital-markets domain, project objective, required features, and application purpose. Codex assisted with drafting the synthetic passages, structuring metadata, proposing labels and rationales, implementing the surrounding system, documenting the work, and running automated verification.

The passages, reference labels, and annotation rationales were created within the same AI-assisted development process. They were not produced by independent annotators and have not been adjudicated by a Korean capital-markets expert. Reported metrics are therefore development diagnostics against project-internal reference labels, not independently validated estimates.

## Corpus composition

| Document ID | Fictional scenario | Passages |
| --- | --- | ---: |
| `DOC-KR-CB-ISSUE-001` | KOSDAQ-style CB issuance decision | 6 |
| `DOC-KR-CB-RESET-001` | KOSDAQ-style CB terms amendment | 6 |
| `DOC-KR-IPO-PROSPECTUS-001` | KOSDAQ-style IPO prospectus excerpt | 6 |
| `DOC-KR-IPO-PROCEEDS-001` | KOSPI-style IPO use-of-proceeds excerpt | 6 |
| `DOC-KR-IPO-RISK-001` | KOSDAQ-style IPO risk-factor excerpt | 6 |
| **Total** | **5 fictional scenarios** | **30** |

### Label distribution

| Primary label | Count |
| --- | ---: |
| Dilution Risk | 5 |
| Refinancing Risk | 4 |
| Liquidity Risk | 4 |
| Governance Risk | 4 |
| Execution Risk | 5 |
| Market Risk | 4 |
| Low Risk / Informational | 4 |
| **Total** | **30** |

The label definitions and decision boundaries are documented in [Annotation Guide](annotation-guide.md). The near-balanced distribution was deliberately constructed for inspectability; it is not an estimate of risk prevalence in Korean disclosures.

## Inclusion criteria

A passage was eligible for the corpus when it:

- represented a newly written, fictional Korean IPO- or CB-style scenario;
- contained enough local context to support a passage-level interpretation;
- illustrated at least one financing, dilution, liquidity, governance, execution, market, or informational pattern;
- could be assigned a stable document ID and passage ID; and
- could be shared in full without an external API key, proprietary source, or copyright-dependent document bundle.

The corpus was also designed to include recurring Korean capital-markets terms such as `전환가액 조정`, `리픽싱`, `조기상환청구권`, `풋옵션`, `콜옵션`, `오버행`, `구주매출`, `보호예수`, `공모자금`, `수요예측`, `특수관계인`, and `계속기업`.

## Exclusion criteria

The corpus excludes:

- full or substantial excerpts from real DART, KRX, or issuer documents;
- real issuer names, securities identifiers, offering terms, prices, and dates;
- production outputs from the applicant's existing CB or IPO tools;
- private research notes, workbooks, API responses, credentials, or client information;
- passages that require external facts to understand the assigned primary label; and
- unlabeled text or text without a traceable document and passage identifier.

## Known biases and coverage gaps

- **Synthetic-author bias:** All passages share one AI-assisted drafting process, so structure and vocabulary can repeat across documents.
- **Annotation circularity:** Corpus wording, taxonomy design, labels, and model development occurred within the same project. Even document-level holdout does not create an external benchmark.
- **Designed class balance:** Four or five examples per label make the interface readable but do not match real-world class frequencies.
- **Single-label compression:** A passage may support several legitimate risk interpretations, but the corpus stores only one primary label.
- **Vocabulary bias:** Explicit Korean finance terms are overrepresented relative to implicit, indirect, colloquial, or issuer-specific language.
- **Scenario coverage:** Five fictional documents cannot cover the variety of prospectus formats, CB structures, sectors, issuers, or market regimes.
- **No temporal validity:** Fictional dates and market contexts do not describe current Korean capital markets.
- **No expert or inter-annotator evidence:** There is no independent agreement statistic, adjudication record, or expert validation.

## Intended use

The corpus may be used to:

- reproduce the repository's deterministic preprocessing, classification, retrieval, and memo behavior;
- inspect rule traces, document-held-out folds, confusion matrices, and exact errors;
- practice explaining how dataset design constrains model claims; and
- support educational discussion of Korean-language NLP and responsible evaluation.

## Non-use

The corpus and its labels must not be used to:

- make investment, trading, underwriting, financing, compliance, or legal decisions;
- claim performance on actual DART filings, KRX data, or unseen Korean issuers;
- train or validate a production risk, credit, or recommendation model;
- infer calibrated probability, severity, materiality, or expected return; or
- represent the labels as independently annotated ground truth.

## Freeze and integrity record

The current corpus freeze is defined by the exact bytes of `src/data/documents.json` at the reference revision below.

| Item | Frozen value |
| --- | --- |
| Corpus SHA-256 | `25aeca96f38a1f1fee9cf90f1a861f52911f5ac23f3a489021b8a997696070bd` |
| Freeze verification date | 2026-08-11 |
| Frozen dimensions | 5 documents, 30 passages, 7 represented labels |

The hash covers the raw corpus JSON file, including metadata, passage text, reference labels, and rationales. It does not cover preprocessing, rules, model settings, or evaluation code; those remain versioned by the repository revision. Any change to the corpus bytes requires a new hash, a fresh review of annotation provenance, rerunning all evaluations, and updating every quoted metric.

## Review status and change control

As of this freeze, no independent human annotation, adjudication, or Korean capital-markets expert review has been completed. Applicant review remains a separate personal completion gate and must not be represented as complete without personally verifying every passage, label, rationale, prediction, and documented error.

Future data revisions should preserve the prior frozen file or release tag, document each addition or relabeling, identify who made the decision, and separate development data from any genuinely held-out evaluation set before model or rule changes are made.
