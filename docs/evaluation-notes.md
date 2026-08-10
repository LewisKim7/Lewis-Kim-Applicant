# Evaluation Notes

## Evaluation question

The evaluation asks a narrow question:

> On the fixed 30-passage synthetic corpus, how often does the transparent rule-based baseline return the same primary label as the stored reference annotation?

It does not ask whether the baseline is ready for public filings, whether the signal score is calibrated, or whether the system improves investment decisions.

## Evaluation set

The evaluation set contains exactly 30 passages with fixed reference labels from five fictional synthetic documents. Each document contributes six passages. The seven reference labels are distributed as follows:

| Reference label | Passage count |
| --- | ---: |
| Dilution Risk | 5 |
| Refinancing Risk | 4 |
| Liquidity Risk | 4 |
| Governance Risk | 4 |
| Execution Risk | 5 |
| Market Risk | 4 |
| Low Risk / Informational | 4 |
| **Total** | **30** |

Each passage includes a brief annotation rationale. The annotation identifies one primary category even when the text could support a secondary risk.

## Protocol

1. Load the five bundled synthetic documents.
2. Flatten them into 30 passage records while preserving metadata.
3. Run the same deterministic classifier used by the interface on every passage.
4. Compare each prediction with its stored reference label.
5. Count correct and incorrect predictions.
6. Build a seven-by-seven confusion matrix in the taxonomy's fixed order.
7. Calculate recall for each reference label and the unweighted macro recall.
8. retain passage-level correct and error examples for inspection.

No sample is excluded after prediction. No external model, API call, random seed, or remote dataset is involved.

## Metrics

### Accuracy

Accuracy is the number of exact label matches divided by 30:

```text
accuracy = correct classifications / 30
```

Because the task is single-label, a prediction counts as correct only when it exactly matches the stored primary reference label.

### Per-label recall

For each label:

```text
recall(label) = correct predictions for label / reference-labeled passages for label
```

Recall answers: of the passages assigned this reference category, what share did the baseline recover?

### Macro recall

Macro recall is the arithmetic mean of the seven per-label recall values. Each label receives equal weight regardless of whether it has four or five examples.

### Confusion matrix

Rows represent reference labels and columns represent predictions. The fixed row and column order is:

1. Dilution Risk
2. Refinancing Risk
3. Liquidity Risk
4. Governance Risk
5. Execution Risk
6. Market Risk
7. Low Risk / Informational

The matrix shows which categories are confused with one another. With only four or five examples per row, a single mistake can move a label's recall substantially.

## Current result

| Metric | Result |
| --- | ---: |
| Accuracy | 90.0% |
| Correct classifications | 27 of 30 |
| Macro recall | 89.3% |
| Error count | 3 |

The interface is the canonical display for the per-label table, confusion matrix, and passage-level examples. These values are produced by the checked-in implementation and describe only this fixed synthetic corpus.

## How to reproduce

From the repository root:

```bash
npm ci
npm run verify
npm run dev
```

`npm run verify` runs linting, automated tests, TypeScript checks, and the production build. The live evaluation uses the same corpus and deterministic classification functions, so repeated runs on the same revision should return the same result.

When reporting a result, record the repository revision and confirm that all 30 passages are present. Changes to text, reference labels, rules, weights, preprocessing, or tie-breaking can change the metrics.

## Interpretation

### What the evaluation supports

- The evaluation verifies that the pipeline can compare predictions with stored reference labels.
- It makes label-level successes and errors visible.
- It provides a reproducible baseline for future changes on the same corpus.
- It helps identify missing phrases, competing rules, and taxonomy ambiguity.

### What the evaluation does not support

- It does not measure performance on unseen documents.
- It does not establish behavior on actual filing language.
- It does not validate the reference labels through independent agreement.
- It does not show that the rule set is robust to paraphrase, negation, or context changes.
- It does not measure ranking quality for TF-IDF retrieval.
- It does not show investment, legal, or operational usefulness.

## Error-analysis framework

Every incorrect passage should be reviewed under at least one of these categories:

| Error type | Diagnostic question | Possible next step |
| --- | --- | --- |
| Missing vocabulary | Was the intended risk expressed without any configured phrase? | Add a narrowly justified phrase using development data only |
| Competing signals | Did phrases from several labels appear in one passage? | Consider multi-label annotation or refine primary-label guidance |
| Weighting issue | Did a lower-value phrase outweigh the intended evidence? | Revisit weights and document the rationale |
| Negation or context | Was a risk term negated, historical, conditional, or attributed to another party? | Add explicit context handling and adversarial tests |
| Annotation ambiguity | Could two labels reasonably be primary? | Seek an independent annotation and refine the taxonomy |
| Informational fallback | Did the baseline miss an implicit risk because no phrase matched? | Add paraphrase tests or compare a trained baseline |

The purpose of error analysis is not to patch every one of the 30 passages until the score is perfect. Repeatedly tuning rules against the same evaluation set would make the displayed result less informative. A better next step is to freeze a development corpus, create a separate held-out set, and document rule changes before evaluating again.

## Retrieval evaluation is separate

The classifier evaluation does not validate TF-IDF search. A future retrieval study should create query-passage relevance judgments and report ranking metrics such as precision at k or reciprocal rank. A classification match is not evidence that a passage is relevant to every query about that label.

## Annotation limitations

The annotations were drafted within the same AI-assisted build process as the educational synthetic corpus. There is no independent annotator, adjudication protocol, or agreement statistic. The rationales improve traceability but do not remove subjective judgment or benchmark leakage.

Future work should define label instructions before annotation, recruit an independent annotator with relevant domain knowledge, measure agreement, document disagreements, and keep the final evaluation set separate from rule development.

## Reporting checklist

Before citing the evaluation:

- [ ] Run `npm ci` and `npm run verify` on the cited revision.
- [ ] Confirm there are 5 documents and exactly 30 passages.
- [ ] Confirm all seven labels appear in the reference annotations.
- [ ] Confirm the documented metrics match the checked-in implementation.
- [ ] Inspect every error, not only the aggregate score.
- [ ] State that the corpus is fictional and synthetic.
- [ ] State that the evaluation is fixed-sample and not held out.
- [ ] Avoid describing the signal score as a probability or statistically calibrated value.
- [ ] Avoid making claims about public filings or external performance.
