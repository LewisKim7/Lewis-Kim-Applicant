# Model Card: Transparent Disclosure-Risk Baseline

## Model details

| Field | Description |
| --- | --- |
| Name | AI Disclosure Risk Screener rule-based baseline |
| Type | Deterministic, single-label, weighted phrase classifier |
| Domain | Fictional English disclosure-style passages |
| Input | One passage of text with source metadata |
| Output | One of seven labels, matched phrases, raw scores, a signal score, and an explanation |
| Training | None; the system has no learned parameters |
| Runtime | Local TypeScript in a React/Vite application |
| External service | None |
| API key | Not required |

This model card describes the classification baseline. TF-IDF retrieval and deterministic memo generation are adjacent pipeline components, not part of the classifier itself.

## Intended purpose

The baseline was built to:

- demonstrate how a disclosure-analysis problem can be expressed as a text-classification task;
- make every phrase match and score contribution inspectable;
- provide a reproducible reference point for later trained models;
- support error analysis on a small synthetic corpus with fixed reference labels; and
- help a human reader locate passages for further review.

## Out-of-scope uses

The baseline should not be used for:

- investment, financing, trading, or portfolio decisions;
- legal, regulatory, accounting, or compliance review;
- automated screening of issuers or individuals;
- risk scoring without reading the underlying passage and document context;
- claims about performance on public filings or unseen documents; or
- replacing human analyst judgment.

## Data

### Corpus composition

- 5 fictional synthetic documents
- 30 passages with fixed reference labels
- 6 passages per document
- English-language text
- 7 primary labels
- 1 AI-assisted annotation draft; no independent annotator

The document types are Convertible Bond Disclosure, IPO Prospectus Excerpt, Funding Announcement, Use of Proceeds Disclosure, and Risk Factor Excerpt. Company names, dates, transactions, and passages were created for this project.

No copyrighted full document or copied prospectus is included. The corpus was designed to exercise the taxonomy and demonstrate the pipeline; it is not a representative sample of disclosure language.

### Label distribution

| Label | Count |
| --- | ---: |
| Dilution Risk | 5 |
| Refinancing Risk | 4 |
| Liquidity Risk | 4 |
| Governance Risk | 4 |
| Execution Risk | 5 |
| Market Risk | 4 |
| Low Risk / Informational | 4 |
| **Total** | **30** |

Each record includes an annotation rationale. These rationales explain the intended primary label but do not constitute independent expert review.

## Taxonomy

| Label | Definition |
| --- | --- |
| Dilution Risk | Possible ownership dilution from issuance, conversion, warrants, or reset terms |
| Refinancing Risk | Pressure to repay, roll over, or replace near-term financing obligations |
| Liquidity Risk | Constraints on cash, working capital, covenants, or continued operations |
| Governance Risk | Board, control, related-party, audit, voting-right, or conflict concerns |
| Execution Risk | Uncertainty around delivery, approvals, construction, commercialization, or scale-up |
| Market Risk | Exposure to demand, competition, pricing, rates, currencies, commodities, or broader conditions |
| Low Risk / Informational | Routine or contextual text with no configured primary risk signal |

The task is intentionally single-label. A passage with several genuine risk signals is reduced to one primary label, so label overlap is a known source of error.

## Preprocessing

The preprocessing layer:

1. applies Unicode NFKC normalization;
2. standardizes selected quotation marks and dashes;
3. cleans tabs, spaces, and paragraph boundaries;
4. lowercases English text for matching;
5. splits hyphenated terms into phrase tokens; and
6. applies a small, explicit lexical-normalization map.

The map covers selected variants relevant to the demonstration. It is not a full stemmer or lemmatizer, and its limited coverage makes the baseline wording-sensitive.

## Classification logic

Each non-informational label has a declared set of phrases and integer weights. The baseline normalizes each phrase, counts exact token-sequence occurrences, caps the number of counted repetitions, and adds contributions by label.

The highest-scoring risk label is selected using a stable label order to break ties. When no configured risk phrase is present, the system returns `Low Risk / Informational`. Informational phrases can explain the fallback but do not override a matched risk category.

The application exposes:

- matched phrase;
- label associated with the phrase;
- configured weight;
- counted occurrences;
- score contribution;
- raw totals by label; and
- the resulting explanation.

### Signal score

The displayed signal score is a deterministic rule-strength heuristic calculated from the winning raw score, normalized to a 0–1 display range and capped at 1. It is **not**:

- a probability;
- a statistically calibrated certainty estimate;
- predicted severity;
- a measure of financial materiality; or
- an assurance of correctness.

Passages with different evidence can receive the same score, and a high score can still correspond to a false positive.

## Retrieval and memo context

The application separately represents passages with TF-IDF and ranks them against a user query using cosine similarity. This is lexical evidence retrieval, not semantic understanding. Retrieval scores are ranking values within the current query and corpus; they are not classification scores.

The memo generator uses deterministic templates and analyzed passage records. It keeps document and passage identifiers attached to evidence. It does not use a generative model, make an independent prediction, or verify facts outside the synthetic corpus.

## Evaluation

The baseline is evaluated against the fixed primary reference labels on the complete 30-passage corpus.

| Metric | Result |
| --- | ---: |
| Accuracy | 90.0% |
| Correct | 27 of 30 |
| Macro recall | 89.3% |
| Errors | 3 |

The application also presents the seven-by-seven confusion matrix, per-label counts and recall, correct examples, and error examples. Full definitions and the interpretation boundary are documented in [Evaluation Notes](evaluation-notes.md).

These figures are descriptive results on the fixed synthetic corpus. They are not a held-out estimate and should not be used to infer behavior on other text.

## Limitations and risks

### Data limitations

- The sample is very small.
- All passages are synthetic.
- All passages are in English.
- The reference labels and rationales were drafted within the same AI-assisted build process.
- The class distribution is designed, not naturally occurring.

### Baseline limitations

- Exact phrase rules miss implicit risk and unfamiliar wording.
- A phrase may be present in a negated, historical, or low-materiality context.
- The baseline has limited handling of negation and cross-passage context.
- A single label suppresses secondary risks.
- Tie-breaking is deterministic but not evidence that one tied category is intrinsically more important.
- The signal score is uncalibrated rule strength.

### Use risks

- False positives can direct attention to routine language.
- False negatives can hide important passages.
- A retrieved passage can be lexically similar yet irrelevant to the analyst's intent.
- A concise memo can create a misleading impression of completeness unless its evidence and limitations are read.

## Transparency and reproducibility

The corpus, annotations, taxonomy, phrase rules, weights, preprocessing, evaluation logic, and memo templates are stored in the repository. The same deterministic functions support the interface and evaluation. No external API key or remote model is required.

Run the complete local verification sequence with:

```bash
npm ci
npm run verify
```

Any change to the corpus, labels, preprocessing, taxonomy, rules, tie-breaking, or evaluation code should trigger a fresh evaluation and model-card update.

## Recommended next evaluations

1. Add an independently annotated set and calculate agreement.
2. Freeze a development set before authoring additional rules.
3. Evaluate on a separate, legally permitted held-out corpus.
4. Add multi-label evaluation for overlapping risks.
5. Test paraphrases, negation, distractor phrases, and missing context.
6. Compare the baseline with TF-IDF logistic regression using the same split.
7. Evaluate retrieval with independent relevance labels and ranking metrics.
