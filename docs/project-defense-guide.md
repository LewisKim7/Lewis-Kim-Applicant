# Project Defense Guide

> **Preparation aid only:** This guide is not evidence that the applicant has completed a personal review. Use the script or answers only after understanding and verifying them against the repository. The checklist at the end is intentionally unchecked.

## Truthful two-minute walkthrough

### 0:00–0:20 — Problem and scope

“I directed the AI-assisted development of this project while preparing for graduate study in AI. I framed the Korean capital-markets problem and product requirements, while Codex assisted with corpus drafting, implementation, documentation, and verification. The project asks how a transparent Korean-language NLP workflow could support first-pass review of IPO and convertible-bond materials while keeping every conclusion connected to evidence. The interface is English for an international reviewer, but the 30 source passages are Korean.”

### 0:20–0:40 — Domain lineage and independence

“The new TypeScript CB module implements the same kind of rate-and-size screening behavior as an existing tool in my portfolio, but only on four fictional rows. The IPO module implements analogous calculations inspired by another portfolio report over six fictional observations as of 2026-07-31. Neither existing repository nor any production data was imported.”

### 0:40–1:10 — Corpus and pipeline

“The corpus has five fictional KOSPI/KOSDAQ documents, six passages per document, and seven primary labels. The pipeline applies lightweight Korean preprocessing, then exposes a weighted-rule classification trace. It also includes unigram TF-IDF logistic regression, TF-IDF cosine lexical retrieval, and a deterministic memo that retains document and passage IDs.”

### 1:10–1:40 — Evaluation

“The rules produce 25 of 30 correct labels, or 83.33% accuracy with 82.14% macro recall, on the same closed corpus used during development. That is an implementation check, not a held-out estimate. The trained baseline holds out one entire document per fold, trains on 24 passages, fits vocabulary and IDF on training text only, and produces 26 of 30 out-of-fold predictions, or 86.67% accuracy with 85.71% macro recall.”

### 1:40–2:00 — Limits and learning

“I do not treat the two percentages as a controlled model ranking because their protocols differ. The corpus and labels are synthetic, AI-assisted, and not independently annotated. The errors show vocabulary gaps, negation failure, overlapping labels, and sparse Korean training data. My next steps would be personal and independent annotation review, a permitted held-out corpus, and a Korean morphological baseline.”

## Module map

| Module | What it does | What to be ready to explain |
| --- | --- | --- |
| `src/data/documents.json` | Stores five fictional Korean documents and 30 passages with AI-assisted reference labels | Synthetic provenance, document IDs, and one primary label per passage |
| `src/data/corpus.ts` | Loads and validates corpus structure | Why corpus dimensions and label coverage are frozen |
| `src/data/market-samples.ts` | Stores four fictional CB rows and six IPO observations | Why these rows are separate from the text corpus |
| `src/lib/cb-analytics.ts` | Normalizes, filters, and aggregates CB rows | The `0.0%` surface-rate and 200억원 screen |
| `src/lib/ipo-analytics.ts` | Computes offer-band and return summaries | How medians, total offer market cap, and below-offer share are calculated |
| `src/lib/preprocessing.ts` | Normalizes and tokenizes Korean/English text | NFKC, stop words, limited particle stripping, and why this is not morphology |
| `src/lib/classifier.ts` | Runs the transparent weighted-rule baseline | Phrase weights, tie order, informational fallback, and signal-score semantics |
| `src/lib/retrieval.ts` | Ranks corpus passages using TF-IDF cosine similarity | Why this is lexical retrieval rather than semantic understanding |
| `src/lib/ml-classifier.ts` | Fits TF-IDF multinomial logistic regression by document fold | Training-only vocabulary/IDF, L2 normalization, and uncalibrated softmax |
| `src/lib/evaluation.ts` | Produces metrics, confusion matrices, and error records | Accuracy versus recall and why protocols must remain separate |
| `src/lib/memo.ts` | Builds a deterministic evidence-linked memo | Templates, passage citations, and absence of generated external facts |
| `src/components/*` | Presents the English project interface | How UI traces connect back to Korean data and deterministic modules |

## Likely reviewer questions

### What did you personally do, and what did AI do?

Suggested answer after confirming it is true: “I selected the domain, objective, feature requirements, and application purpose. Codex assisted with synthetic-data drafting, implementation, documentation, and verification. The labels and rationales came from that same AI-assisted process, so I do not call them independent annotations.”

### Why use synthetic data?

The project avoids copying copyrighted full documents or presenting production data as a benchmark. Synthetic data makes the complete artifact shareable and inspectable. The cost is limited realism and no claim of performance on actual DART filings.

### Why implement both rules and logistic regression?

Rules provide an auditable reference point: every phrase and weight is visible. Logistic regression adds a genuinely trained baseline and creates an experiment about document-level transfer. Neither is presented as a final model.

### Why leave one document out?

Random passage splits could place passages from the same synthetic document in both train and test data. Holding out an entire document creates a stronger boundary. It is still only five synthetic folds, not an external test set.

### How did you prevent TF-IDF leakage?

For each fold, vocabulary and inverse-document-frequency values are fitted only on the 24 training passages. The 6 held-out passages are transformed with that training representation.

### Can the two accuracy numbers be compared?

Only descriptively, not as a controlled ranking. The rules are measured on their development corpus; ML predictions are out of fold. The roughly 3.3-percentage-point difference does not prove superiority.

### Is the ML score a confidence probability?

No. It is an uncalibrated softmax output from a tiny synthetic fold. The rule signal is also only normalized rule strength. Neither expresses severity, materiality, or real-world probability.

### Why is Liquidity Risk weak?

Liquidity language in the corpus often relies on numerical relationships or indirect cash-timing descriptions. Exact rules miss variants, and a 24-passage training fold provides too few stable liquidity examples for a sparse unigram model. The document-held-out ML recall for Liquidity Risk is 25%: 1 of 4 passages is correct.

### Is the search semantic?

No. It is unigram TF-IDF cosine lexical retrieval. A high score indicates relative token overlap within the current corpus and query, not semantic equivalence or relevance validation.

### What came from the existing CB and IPO tools?

The CB module implements the same kind of screening behavior in new TypeScript on fictional rows. The IPO module performs analogous calculations inspired by the report workflow. Neither existing repository nor production data was imported, and no API response, key, private workbook, or generated report was copied.

### What would you do next?

First complete an applicant-led review, then create a labeling guide, obtain independent Korean annotations, freeze development choices, evaluate a legally permitted held-out corpus, compare Korean morphological processing, and test multi-label classification and retrieval separately.

## Five closed-corpus rule errors

| Passage | Reference → prediction | Category | What failed |
| --- | --- | --- | --- |
| `DOC-KR-CB-ISSUE-001-P03` | Liquidity → Informational | Vocabulary coverage gap | Cash, spending, a conditional credit line, and a seven-month runway do not match a configured liquidity phrase. |
| `DOC-KR-CB-ISSUE-001-P04` | Governance → Informational | Korean wording variation | A representative's sibling and absent external review are expressed without the configured related-party terms. |
| `DOC-KR-CB-RESET-001-P02` | Liquidity → Refinancing | Label overlap | Put and early-repayment language outweighs the passage's cash-availability mismatch. |
| `DOC-KR-CB-RESET-001-P05` | Market → Dilution | Label overlap | Refixing, conversion-price, and overhang phrases outweigh volatility and selling-pressure framing. |
| `DOC-KR-IPO-PROSPECTUS-001-P06` | Informational → Governance | Negation failure | The rule matches `특수관계인` even though the passage says proceeds are not paid to related parties. |

## Four document-held-out ML errors

| Passage | Reference → prediction | Leading terms | What failed |
| --- | --- | --- | --- |
| `DOC-KR-CB-ISSUE-001-P03` | Liquidity → Execution | `분기`, `매출` | Generic operating terms resemble execution examples more than the sparse cash-runway examples. |
| `DOC-KR-CB-RESET-001-P02` | Liquidity → Dilution | `발행`, `행사할`, `전액` | Generic CB vocabulary dominates in a fold with limited liquidity language. |
| `DOC-KR-CB-RESET-001-P05` | Market → Dilution | `오버행`, `물량`, `전환가액`, `전환` | Conversion vocabulary overwhelms the market-supply interpretation. |
| `DOC-KR-IPO-RISK-001-P03` | Liquidity → Market | `고객`, `서비스`, `핵심` | Customer terms resemble market passages even though timing mismatches drive the reference liquidity label. |

## Applicant personal-review checklist

Do not change an item to checked until the applicant has personally completed it.

- [ ] Read all 30 Korean passages without relying on the UI summaries.
- [ ] Review every reference label and annotation rationale; record disagreements.
- [ ] Explain all seven taxonomy labels and at least two overlap cases in my own words.
- [ ] Trace one rule prediction from preprocessing through phrase contributions and tie-breaking.
- [ ] Explain why the rule signal is not probability, confidence, severity, or materiality.
- [ ] Trace one ML fold, including the 24/6 split and training-only vocabulary and IDF.
- [ ] Explain unigram TF-IDF, multinomial logistic regression, L2 regularization, and uncalibrated softmax at an interview-appropriate level.
- [ ] Reproduce both metric sets with `npm ci` and `npm run verify` on the submitted revision.
- [ ] Inspect the five rule errors and four ML errors in the application.
- [ ] Verify the structured CB and IPO calculations by hand.
- [ ] Confirm the CB/IPO lineage statement: neither existing repository nor production data, APIs, keys, workbooks, or reports were imported.
- [ ] Review the repository history and understand every file linked in the module map.
- [ ] Rewrite the CV entry and SOP paragraph in my own voice where needed.
- [ ] Verify the current UT Austin instructions and AI-assistance disclosure policy before submission.
- [ ] Confirm that the submitted links, screenshots, metrics, and project name match the cited revision.
