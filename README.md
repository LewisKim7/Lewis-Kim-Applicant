# AI Disclosure Risk Screener

> An NLP prototype that classifies disclosure-style passages into financial and operating risk categories, retrieves relevant evidence, and assembles an evidence-linked risk memo.

[Live demo](https://ai-disclosure-risk-screener.vercel.app/) · [Repository](https://github.com/LewisKim7/AI-Disclosure-Risk-Screener)

AI Disclosure Risk Screener is a standalone educational project built while preparing for graduate study in artificial intelligence. It connects a finance and deep-tech investment background with a small, inspectable NLP pipeline: text preparation, rule-based classification, TF-IDF cosine lexical retrieval, closed-set evaluation, and deterministic memo generation.

The project deliberately favors transparency over scale. It runs without an external model, remote inference service, or API key. Every entity and passage in the bundled corpus is fictional and synthetic.

> **AI-assisted development disclosure:** The applicant selected the domain, objective, and project requirements. Codex assisted with synthetic-corpus drafting, implementation, documentation, and automated verification. The checked-in reference labels are part of that same AI-assisted build process; they are not independent expert annotations. Anyone using this project in an application should first review the corpus, logic, and errors closely enough to explain and defend them.

## At a glance

| Item | Implementation |
| --- | --- |
| Application | React, TypeScript, and Vite |
| Corpus | 5 fictional synthetic documents |
| Evaluation set | Exactly 30 passages with fixed reference labels |
| Taxonomy | 7 single-label risk categories |
| Classification | Transparent weighted phrase rules |
| Evidence retrieval | TF-IDF vectors with cosine similarity |
| Memo | Deterministic template linked to retrieved passages |
| External services | None required |

## Problem

Public disclosures often contain a mix of routine facts, financing terms, operating dependencies, and forward-looking risk language. An analyst must identify the passages that matter, distinguish among different kinds of risk, and retain a clear link from each conclusion back to the underlying text.

This prototype turns that workflow into a bounded NLP problem:

1. represent documents as traceable passages with metadata;
2. assign one primary label from a declared risk taxonomy;
3. retrieve passages that are lexically relevant to an analyst's question;
4. expose the phrases and scores behind each classification;
5. compare baseline predictions with fixed reference labels; and
6. assemble a repeatable memo that cites its evidence.

The goal is not automated investment judgment. The goal is to show how a domain problem can be translated into explicit data, classification, retrieval, evaluation, and responsible-use decisions.

## Motivation

Financial analysis provides the project context, but the learning objective is broader. The application explores several foundational AI/NLP questions:

- How should unstructured text be split into units that remain citable?
- How can a risk taxonomy be defined before selecting a model?
- What does an interpretable baseline reveal about wording sensitivity?
- How should retrieval and classification be kept conceptually separate?
- What can a very small evaluation set establish—and what can it not establish?
- How can generated output preserve an evidence trail?

## What the application does

The interface supports a complete, local workflow:

- browse five disclosure-style sample documents;
- inspect document, company, date, and passage metadata;
- view a predicted label, matched phrases, raw rule scores, and an explanation;
- search the corpus with TF-IDF cosine lexical retrieval;
- compare reference and predicted labels;
- inspect summary metrics, label counts, a confusion matrix, and error cases; and
- produce a deterministic memo whose evidence items point back to passage IDs.

## Dataset

The bundled corpus contains five document types, one fictional company per document, and six passages per document.

| Document type | Passages | Data status |
| --- | ---: | --- |
| Convertible Bond Disclosure | 6 | Fictional and synthetic |
| IPO Prospectus Excerpt | 6 | Fictional and synthetic |
| Funding Announcement | 6 | Fictional and synthetic |
| Use of Proceeds Disclosure | 6 | Fictional and synthetic |
| Risk Factor Excerpt | 6 | Fictional and synthetic |
| **Total** | **30** | **Fixed reference labels** |

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

The corpus was written for this project. It contains no copied prospectus, filing, or copyrighted full document. Synthetic data makes the demonstration safe to distribute, but it also sharply limits what the evaluation can establish.

## Risk taxonomy

The task is single-label classification. Each passage stores one primary reference label and receives one baseline prediction.

| Label | Reference count | Working definition |
| --- | ---: | --- |
| Dilution Risk | 5 | Potential ownership dilution from issuance, conversion, warrants, or reset terms |
| Refinancing Risk | 4 | Pressure to repay, roll over, or replace financing obligations |
| Liquidity Risk | 4 | Constraints on cash, working capital, covenants, or continuing operations |
| Governance Risk | 4 | Board, control, audit, related-party, voting-right, or conflict concerns |
| Execution Risk | 5 | Uncertainty around delivery, approval, construction, commercialization, or scale-up |
| Market Risk | 4 | Exposure to demand, competition, pricing, rates, currencies, or commodities |
| Low Risk / Informational | 4 | Routine or contextual text with no configured primary risk signal |

A single primary label keeps the baseline and confusion matrix easy to inspect. It also compresses passages that contain overlapping risks; this is a known design limitation, not an assertion that disclosures contain only one risk at a time.

## Methodology

### 1. Text preparation

The preprocessing layer normalizes Unicode and punctuation, cleans whitespace, tokenizes text, and applies a small declared lexical-normalization map. Passage records preserve source metadata throughout the pipeline.

The lexical map is intentionally narrow. It handles selected variants such as singular/plural and financing-related forms without presenting itself as a general-purpose stemmer.

### 2. Transparent rule-based baseline

The classifier uses label-specific phrase dictionaries with fixed integer weights. For each passage it:

1. normalizes the text and configured phrases;
2. counts exact token-sequence matches, with repeated contributions capped;
3. adds the declared weights by label;
4. selects the highest-scoring risk label in a deterministic order; and
5. falls back to `Low Risk / Informational` when no configured risk phrase is present.

The output includes the matched phrases, their contributions, raw label scores, the selected label, and a plain-language explanation. A displayed **signal score** summarizes deterministic rule strength. It is not a probability, a statistically calibrated value, or an estimate of severity.

This is a baseline, not a trained machine-learning classifier. Its value is that every decision can be audited before more complex alternatives are considered.

### 3. TF-IDF cosine lexical retrieval

The retrieval layer builds TF-IDF representations for the query and passage corpus, then ranks passages with cosine similarity. The interface returns the highest-scoring passages with their source metadata.

This is lexical retrieval. It can work well when queries and passages share normalized terms, but it has limited paraphrase and contextual understanding. Its score should be interpreted only as an overlap-based ranking value within the current query and corpus.

### 4. Deterministic evidence-linked memo

The memo generator uses fixed templates and analyzed passage data to assemble:

- Executive Summary
- Key Risk Signals
- Evidence
- Investment Implications
- Open Questions
- Limitations

It does not call a language model or invent supporting text. Evidence items retain document and passage identifiers so the reader can return to the exact synthetic source passage.

### 5. Closed-set evaluation

The rule baseline is compared with the fixed reference label on all 30 passages. The application reports accuracy, label counts, a seven-by-seven confusion matrix, per-label recall, macro recall, correct examples, and error examples.

| Metric | Current result |
| --- | ---: |
| Accuracy | 90.0% |
| Correct classifications | 27 of 30 |
| Macro recall | 89.3% |
| Errors | 3 |

These results describe this fixed synthetic corpus only. The passages are not a held-out sample, the rules are not evaluated on an external dataset, and the AI-assisted reference annotations have not been independently reviewed. See [Evaluation Notes](docs/evaluation-notes.md) for the protocol and interpretation boundary.

## Technical design

```text
Synthetic JSON documents
        │
        ▼
Cleaning, tokenization, and light lexical normalization
        │
        ├──► Weighted phrase rules ──► label + matched evidence ──► deterministic memo
        │
        ├──► TF-IDF + cosine similarity ──► ranked passages
        │
        └──► Predictions + reference labels ──► metrics + confusion matrix + error cases
```

All analysis runs locally in the application. There is no backend dependency, external inference call, credential, or required environment variable.

## Run locally

### Requirements

- Node.js 22 or later
- npm

### Install and verify

```bash
npm ci
npm run verify
```

`npm run verify` runs linting, tests, TypeScript checks, and a production build.

### Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite.

## Repository guide

```text
src/
  components/   Interface sections and analysis views
  data/         Five synthetic disclosure-style documents
  domain/       Passage, document, and risk-taxonomy types
  lib/          Preprocessing, classification, retrieval, evaluation, and memo logic
docs/
  application-language.md
  evaluation-notes.md
  model-card.md
  ut-msai-project-note.md
```

## Limitations

- The corpus contains only 30 synthetic English-language passages.
- The reference labels were drafted within the same AI-assisted build process.
- The fixed phrase rules are sensitive to wording and can miss implicit risks.
- Exact-term matches can create both false positives and false negatives.
- A single primary label cannot represent every overlapping signal.
- TF-IDF has limited paraphrase and contextual understanding.
- The evaluation is a demonstration on a fixed sample, not evidence of external performance.
- The signal score is a rule-strength heuristic, not a statistically calibrated value.
- The memo summarizes baseline outputs; it does not perform independent reasoning.

## Responsible use

This project is educational. It is not investment advice, legal analysis, due diligence, or a substitute for human analyst judgment. It should not be used to make financing, trading, compliance, or admissions decisions. A user should expect missed risks, spurious matches, and incomplete context.

## Future improvements

1. Build a legally permitted corpus of public-document excerpts with a documented sampling policy.
2. Add independent annotators and measure inter-annotator agreement.
3. Support multi-label annotations for overlapping risk signals.
4. Create separate development and held-out evaluation sets.
5. Compare the rules with TF-IDF logistic regression and carefully selected language-model baselines.
6. Evaluate retrieval separately with query-relevance judgments and ranking metrics.
7. Add robustness checks for paraphrases, negation, and absent context.

## Documentation

- [Graduate-study project note](docs/ut-msai-project-note.md)
- [Model card](docs/model-card.md)
- [Evaluation notes](docs/evaluation-notes.md)
- [CV and SOP language](docs/application-language.md)

## Project status

This is an independent, standalone project and repository. It was informed by prior experience reviewing financing and IPO materials, but its corpus, taxonomy, preprocessing, classifier, retrieval, evaluation, and interface are organized here as a new implementation.
