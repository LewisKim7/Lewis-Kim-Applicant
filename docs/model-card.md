# System and Model Card: Korea IPO & CB Risk Screener

## System summary

Korea IPO & CB Risk Screener is an independent React/TypeScript/Vite prototype created by Yoochan Kim (Lewis Kim · 김유찬) for Korean convertible-bond and IPO analysis. The interface is English, while the source passages are Korean. It combines a frozen public production-tool evidence layer with synthetic passage classification, TF-IDF cosine lexical retrieval, and a deterministic evidence-linked memo.

| Field | Description |
| --- | --- |
| Domain | Frozen real-market IPO/CB context plus fictional Korean disclosure-style NLP materials |
| Text corpus | 5 fictional documents; 30 Korean passages; 7 primary labels |
| Rule baseline | Deterministic weighted Korean/English phrase rules |
| Trained baseline | Unigram TF-IDF + multinomial logistic regression |
| Retrieval | TF-IDF cosine lexical ranking over the bundled corpus |
| Memo | Deterministic template with document and passage identifiers |
| Runtime | Local TypeScript in a React/Vite application |
| External service | Optional embedded views of the applicant's two public tools; core NLP runs locally |
| API key | Not required |

This card covers the complete analytical system and distinguishes its two classification baselines. Neither model is a production risk model.

## Development and annotation provenance

The applicant selected the domain, objective, feature requirements, and application purpose. Codex assisted with synthetic-data drafting, implementation, documentation, and automated verification.

All passage labels and annotation rationales were created within that same AI-assisted development process. They have not been independently annotated, adjudicated, or reviewed by a Korean capital-markets expert. The evaluation results are therefore development diagnostics, not independent validation.

## Intended purpose

The system was built to:

- translate a Korean capital-markets workflow into explicit NLP tasks;
- compare an inspectable rules baseline with a small trained baseline;
- retain a source trail from classification and retrieval to memo evidence;
- expose errors, score semantics, and protocol limitations; and
- support personal learning before graduate study in artificial intelligence.

## Out-of-scope uses

The system should not be used for:

- investment, trading, underwriting, financing, or portfolio decisions;
- legal, accounting, regulatory, or compliance review;
- automated NLP risk scoring or classification of actual issuers or individuals;
- claims about performance on DART filings, KRX data, or unseen text;
- probability, severity, materiality, or credit-risk estimates; or
- replacing human analyst judgment.

## Data

### Korean passage corpus

The corpus contains two convertible-bond documents and three IPO documents, with six passages per document. Every company, identifier, date, transaction, amount, and passage is fictional and synthetic.

| Document | Market and type | Passages |
| --- | --- | ---: |
| `DOC-KR-CB-ISSUE-001` | KOSDAQ, DART-style CB Issuance Decision | 6 |
| `DOC-KR-CB-RESET-001` | KOSDAQ, DART-style CB Terms Amendment | 6 |
| `DOC-KR-IPO-PROSPECTUS-001` | KOSDAQ IPO Prospectus Excerpt | 6 |
| `DOC-KR-IPO-PROCEEDS-001` | KOSPI IPO Use-of-Proceeds Excerpt | 6 |
| `DOC-KR-IPO-RISK-001` | KOSDAQ IPO Risk-Factor Excerpt | 6 |
| **Total** | **5 fictional documents** | **30** |

The text includes terms such as `전환가액 조정`, `리픽싱`, `풋옵션`, `콜옵션`, `오버행`, `구주매출`, `보호예수`, `공모자금`, `수요예측`, `특수관계인`, and `계속기업`. These are newly written passages, not excerpts from copyrighted filings.

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

The task assigns one primary label to each passage. This makes evaluation inspectable but suppresses secondary risks and creates legitimate category overlap.

### Frozen production-tool evidence

The repository contains selected real structured facts from the applicant's two public production tools. They are strictly separate from the text-classification corpus:

- **IPO snapshot:** public PDF data through 7 Aug 2026, generated 8 Aug 2026; 52 firms, 19.5 trillion KRW total offer market capitalization, +111.4% average first-day return, −5.1% average current return, and 36 of 52 below offer price.
- **CB snapshot:** captured 11 Aug 2026 for 14 May–11 Aug 2026; 118 filing rows. A strict numeric `0.0%` coupon and `0.0%` maturity-yield screen returns 41 rows across 40 issuers totaling 17,898.6억원. Missing `-` values do not qualify.
- **Largest qualifying CB rows:** Hyundai Engineering & Construction (5,000억원), LigaChem Biosciences (1,700억원), Sungho Electronics (1,000억원), TSE (1,000억원), and Won Tech (750억원).

The linked embedded tools may update independently; the portfolio snapshot does not. These facts provide dated workflow context only. No real issuer is placed in the synthetic corpus, scored by either classifier, retrieved as NLP evidence, or assigned a risk label.

## Preprocessing

The shared preprocessing layer applies:

1. Unicode NFKC normalization;
2. typography and whitespace cleanup;
3. Unicode-aware tokenization;
4. a small Korean stop-word list; and
5. limited Korean particle stripping.

This is intentionally lightweight. It is not a Korean morphological analyzer and can fragment or conflate Korean forms.

## Baseline A: transparent weighted rules

The deterministic classifier has no learned parameters. Each non-informational label has declared Korean and English phrases with fixed integer weights. It normalizes phrases, counts token-sequence occurrences, caps repetitions, sums contributions by label, and uses a stable label order for ties. With no risk phrase match, it returns `Low Risk / Informational`.

The interface exposes matched phrases, weights, occurrences, score contributions, raw label totals, and the selected label.

### Rule signal score

The displayed 0–1 signal score is a normalized rule-strength heuristic. It is not:

- a probability or calibrated confidence;
- a severity or materiality estimate;
- a measure of investment attractiveness; or
- an assurance that the label is correct.

### Rule evaluation

| Protocol | Correct | Accuracy | Macro recall | Errors |
| --- | ---: | ---: | ---: | ---: |
| Closed corpus; no holdout | 25 / 30 | 83.33% | 82.14% | 5 |

The rules were authored and inspected on this same corpus. The result is an implementation sanity check, not a held-out generalization estimate.

## Baseline B: TF-IDF multinomial logistic regression

The trained baseline uses unigram TF-IDF, L2-normalized sparse vectors, and full-batch multinomial logistic regression. Its fixed settings are 400 epochs, learning rate `0.4`, and L2 penalty `0.01`.

Evaluation uses five leave-one-document-out folds. Each fold trains on 4 documents and 24 passages, then tests on the remaining document and 6 passages. The vocabulary and inverse-document-frequency values are fitted only on the 24 training passages for that fold.

| Protocol | Correct | Accuracy | Macro recall | Errors |
| --- | ---: | ---: | ---: | ---: |
| 5-fold leave-one-document-out | 26 / 30 | 86.67% | 85.71% | 4 |

The softmax output is not calibrated. It must not be presented as a real-world risk probability or severity estimate.

Liquidity Risk is the weakest ML category: 1 of 4 reference passages is correct, for 25% document-held-out recall.

### Comparison boundary

The roughly 3.3-percentage-point difference between the two accuracy figures is not evidence that the trained model is superior. The rule score is closed-corpus, whereas the ML predictions are out of fold. Both still draw from only five synthetic documents generated and labeled in one AI-assisted development process.

## Retrieval and memo

The retrieval component builds TF-IDF vectors and ranks passages by cosine similarity to a Korean or English query. It is lexical search, not semantic understanding. Similarity is a query-relative ranking value and not a classification score.

A separate closed-corpus diagnostic uses 12 AI-assisted Korean queries with graded relevance judgments and reports mean Precision@3 of 69.45%, mean Recall@3 of 77.78%, MRR@3 of 91.67%, and nDCG@3 of 85.51%. The query and relevance set was drafted against the same 30 passages, so the result is inspectable and reproducible but not independent. One deliberate paraphrase query returns no match and remains visible as a lexical-search failure.

The memo generator deterministically organizes analyzed passages into an executive summary, key signals, evidence, implications, open questions, and limitations. It retains source document and passage IDs. It does not generate new facts, verify external information, or make an independent model prediction.

## Production workflow lineage

The market layer preserves selected public outputs from the applicant's [CB Zero Finder](https://cb-zero-finder.vercel.app/) and [IPO Market Report](https://ipo-market-report.vercel.app/). The source applications are linked and embedded for context, but the portfolio uses a fixed dated snapshot for reproducibility. No source repository, private workbook, API key, full copyrighted filing, or private dataset was imported.

## Limitations and risks

### Data and annotation

- Thirty passages are too few for a stable performance estimate.
- Every NLP passage, label, and rationale is synthetic; the separate market snapshot contains dated real structured facts.
- The public market snapshot can become stale and is not an evaluation set.
- Annotations are AI-assisted and not independent.
- The class distribution and wording were intentionally designed.
- No inter-annotator agreement or adjudication result exists.

### Modeling

- Exact rules miss implicit, unfamiliar, and negated language.
- Limited particle stripping is wording-sensitive.
- One primary label suppresses secondary risks.
- Logistic regression learns from only 24 examples in each fold.
- Model settings were explored during development.
- Repeated structure across five synthetic documents can make out-of-fold results optimistic.
- Neither displayed model score is calibrated.

### Retrieval and presentation

- The 12-query relevance set is AI-assisted, closed-corpus, and not independently judged.
- Lexical overlap can rank an irrelevant passage highly.
- Paraphrases with no shared vocabulary can return no result.
- A concise memo can create a false impression of completeness unless the evidence and limitations are read.

## Transparency and reproducibility

The synthetic corpus, frozen market-snapshot metadata, labels, rationales, taxonomy, phrase rules, preprocessing, retrieval, model implementation, fold construction, evaluation, and memo templates are checked into the repository. No API key or remote model is required for the core NLP runtime.

```bash
npm ci
npm run verify
npm run dev
```

Changes to data, labels, rules, preprocessing, fold construction, training settings, or evaluation logic require fresh metrics and documentation.

## Recommended next evaluations

1. Conduct an applicant-led passage and rationale review before any application use.
2. Write a labeling guide and obtain independent Korean-language annotations.
3. Freeze a development set before modifying rules or model settings.
4. Evaluate on a separate, legally permitted Korean disclosure corpus.
5. Compare the lightweight tokenizer with a Korean morphological baseline.
6. Add multi-label evaluation for overlapping risks.
7. Repeat retrieval evaluation with independently judged external queries.
