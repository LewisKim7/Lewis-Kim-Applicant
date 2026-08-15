# Korea IPO & CB Risk Screener

A transparent Korean-language NLP portfolio project for screening IPO and convertible-bond disclosures, retrieving passage-level evidence, and making model behavior inspectable.

**Live demo:** https://lewis-kim-applicant.vercel.app/  
**Canonical repository name:** `lewis-kim-applicant`

![Korea IPO and CB Risk Screener interface](docs/assets/portfolio-preview.png)

## Project summary

Korea IPO & CB Risk Screener explores a practical question at the intersection of capital markets and applied AI:

> Can transparent Korean-language NLP help an analyst move from a filing-level screening signal to the exact passage that supports the signal?

Korean IPO prospectuses and convertible-bond disclosures often distribute financially important information across dense narrative sections, structured terms, and repeated legal language. A first-pass analyst may need to connect conversion-price resets, put and call options, lockups, use of proceeds, related-party relationships, liquidity pressure, and execution milestones to the source passages that matter.

This project turns that workflow into an inspectable prototype. It combines:

- dated evidence from two real public-market tools;
- a synthetic Korean disclosure corpus;
- a transparent weighted-rule baseline;
- a trained TF-IDF + multinomial logistic-regression baseline;
- lexical evidence retrieval;
- passage-level explanations;
- deterministic memo generation;
- explicit evaluation and error inspection; and
- an English reviewer interface around Korean source text.

The objective is not to automate investment judgment. The objective is to demonstrate problem framing, data boundaries, model design, evaluation discipline, and explainable evidence retrieval in a domain where both source language and professional context matter.

## Applicant context

This is an independent portfolio project created and directed by **Yoochan Kim (Lewis Kim · 김유찬)** as supporting evidence for graduate study in artificial intelligence and data science.

| Area | Detail |
| --- | --- |
| Professional context | Finance and deep-tech investment professional |
| Domain focus | Korean IPO, convertible-bond, disclosure, and capital-markets workflows |
| Applicant contribution | Problem definition, risk taxonomy, product requirements, evaluation questions, finance interpretation, reviewer narrative, and QA direction |
| Technical artifact | React/TypeScript interface with deterministic NLP baselines and reproducible evaluation |
| Intended audience | Graduate admissions reviewers and technical reviewers who may not read Korean |
| Applicant profile | [Background and selected work](https://personal-sns-beta.vercel.app/) |
| Public role evidence | [FSS DART filing: Hanwha IPO Plus fund manager, 26 Aug 2025](https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250826000004&dcmNo=10784143&keyword=%EA%B9%80%EC%9C%A0%EC%B0%AC) |

This repository is optional supporting evidence. It is not an official submission of, affiliated with, or endorsed by The University of Texas at Austin, Georgia Tech, or any other university.

## Why this project exists

The project is designed to expose the full reasoning chain from domain problem to measurable prototype:

1. **Start from an analyst workflow.** Identify disclosure terms that commonly require follow-up review.
2. **Define an explicit taxonomy.** Map passages into financially interpretable risk categories.
3. **Keep real and synthetic data separate.** Use real public-market observations only as contextual evidence while model evaluation runs on a fictional corpus.
4. **Build an interpretable baseline first.** Make every matched phrase and score contribution visible.
5. **Add a trained text baseline.** Evaluate behavior under document-level holdout rather than presenting only an in-sample result.
6. **Retrieve evidence, not only labels.** Preserve passage IDs and source text so a reviewer can inspect why a result appeared.
7. **Show errors and limitations.** Keep vocabulary gaps, overlap, negation failures, and sparse-data behavior visible instead of hiding them behind a single accuracy number.

## Reviewer fast path

| Time | Suggested review path |
| --- | --- |
| 90 seconds | Open the live demo, review the frozen market snapshot, run the Korean evidence search, and inspect the rule trace. |
| 5 minutes | Review the risk taxonomy, model comparison, retrieval metrics, exact errors, and limitations. |
| Reproduce | Run `npm ci && npm run verify` locally. No API key, private dataset, or remote inference service is required for the core NLP pipeline. |

## System overview

```text
Public market tools
    |
    +-- IPO Market Report --------+
    |                              |
    +-- CB Zero Finder ------------+--> Frozen evidence snapshot
                                           |
                                           v
Synthetic Korean disclosure corpus --> preprocessing
                                           |
                  +------------------------+-----------------------+
                  |                        |                       |
                  v                        v                       v
          weighted phrase rules      TF-IDF + logistic       TF-IDF retrieval
                  |                    regression                  |
                  v                        v                       v
          interpretable trace       held-out evaluation      ranked passages
                  |                        |                       |
                  +------------------------+-----------------------+
                                           |
                                           v
                              deterministic evidence memo
                                           |
                                           v
                              English reviewer interface
```

## Data boundary

The project deliberately separates **real market evidence** from **model-evaluation data**.

### Real public-market evidence

The portfolio includes dated, read-only snapshots from two separate operational tools:

- [IPO Market Report](https://ipo-market-report.vercel.app/)
- [CB Zero Finder](https://cb-zero-finder.vercel.app/)

These observations provide professional context, but real issuers are not inserted into the synthetic NLP evaluation corpus and are not assigned model-generated risk labels.

### Synthetic NLP corpus

The evaluation corpus contains five fictional Korean KOSPI/KOSDAQ disclosure-style documents with six passages each.

| Document ID | Fictional issuer | Type | Passages |
| --- | --- | --- | ---: |
| `DOC-KR-CB-ISSUE-001` | Hanbit Quantum Motion | CB issuance decision | 6 |
| `DOC-KR-CB-RESET-001` | Serim Neurochip | CB terms amendment | 6 |
| `DOC-KR-IPO-PROSPECTUS-001` | Gaon BioCompute | IPO prospectus excerpt | 6 |
| `DOC-KR-IPO-PROCEEDS-001` | Daon GreenCell | IPO use-of-proceeds excerpt | 6 |
| `DOC-KR-IPO-RISK-001` | Mir Orbital Link | IPO risk-factor excerpt | 6 |
| **Total** | **5 fictional issuers** |  | **30** |

Every issuer, identifier, date, amount, transaction, and passage in this corpus is fictional. The text was created for this project and is not copied from an actual filing.

## Risk taxonomy

| Label | Passages | Working definition |
| --- | ---: | --- |
| Dilution Risk | 5 | Ownership dilution from issuance, conversion, options, or reset terms |
| Refinancing Risk | 4 | Pressure to repay, extend, replace, or roll over financing obligations |
| Liquidity Risk | 4 | Cash, working-capital, covenant, or going-concern constraints |
| Governance Risk | 4 | Control, board, related-party, voting-right, or conflict concerns |
| Execution Risk | 5 | Uncertainty around approvals, delivery, construction, commercialization, or scale-up |
| Market Risk | 4 | Demand, competition, pricing, rate, currency, or market-condition exposure |
| Low Risk / Informational | 4 | Routine context with no configured primary risk signal |

A single-label taxonomy simplifies confusion-matrix inspection but necessarily compresses passages that contain overlapping financial risks. That is treated as a limitation rather than hidden as a modeling assumption.

## NLP pipeline

### 1. Korean text preparation

The preprocessing layer performs Unicode normalization, punctuation and whitespace cleanup, Unicode-aware tokenization, a small Korean stop-word list, and limited particle stripping. It intentionally does not claim to be a full Korean morphological analyzer.

### 2. Transparent weighted-rule baseline

The rule engine uses declared Korean and English phrases with fixed integer weights. For every passage, the interface can expose matched phrases, label-level contributions, raw scores, the selected primary label, and an explanation trace.

The displayed 0 - 1 rule-strength indicator is a normalized heuristic. It is **not** a calibrated probability or a measure of financial severity.

### 3. Trained TF-IDF baseline

The trained experiment uses unigram TF-IDF, L2-normalized sparse vectors, multinomial logistic regression, deterministic optimization, and leave-one-document-out evaluation.

```text
training: 4 documents / 24 passages
test:     1 unseen document / 6 passages
```

Vocabulary and IDF are fitted only on the training documents in each fold. The model softmax output is uncalibrated and must not be interpreted as a real-world financial-risk probability.

### 4. Evidence retrieval

A TF-IDF cosine retriever ranks Korean passages by lexical overlap with a Korean or English query. The retrieval layer retains passage IDs and source text so a reviewer can inspect the evidence directly.

### 5. Deterministic memo generation

The memo layer converts model and retrieval outputs into a stable structure with an executive summary, risk signals, supporting evidence, implications, follow-up questions, and limitations. Passage IDs remain attached to the evidence chain rather than being replaced by unsupported prose.

## Evaluation

### Classification diagnostics

| Baseline | Protocol | Correct | Accuracy | Macro recall | Errors |
| --- | --- | ---: | ---: | ---: | ---: |
| Weighted rules | Closed corpus | 25 / 30 | 83.33% | 82.14% | 5 |
| TF-IDF logistic regression | Leave one document out | 26 / 30 | 86.67% | 85.71% | 4 |

These results are **not a controlled head-to-head model ranking**. The rule set was developed against the same small corpus on which it is reported. The trained baseline is out-of-fold at the document level, but all five documents still come from the same synthetic, AI-assisted data-generation process.

The most informative result is the error pattern. Liquidity Risk remains the weakest trained category at 25% recall, exposing how unstable sparse Korean vocabulary can be with only 24 training examples in each fold.

Detailed fold results, confusion matrices, exact errors, and metric definitions are in [docs/evaluation-notes.md](docs/evaluation-notes.md).

### Retrieval diagnostic

| Queries | Precision@3 | Recall@3 | MRR@3 | nDCG@3 |
| ---: | ---: | ---: | ---: | ---: |
| 12 | 69.45% | 77.78% | 91.67% | 85.51% |

One deliberately retained paraphrase case fails because the relevant passages do not share enough literal vocabulary with the query. This failure shows exactly where a lexical TF-IDF baseline stops being sufficient.

See [docs/retrieval-evaluation.md](docs/retrieval-evaluation.md) for the query set and per-query trace.

## Frozen market evidence

| Workflow | Snapshot | Frozen observation |
| --- | --- | --- |
| IPO Market Report | Data through 7 Aug 2026; report generated 8 Aug 2026 | 52 firms; KRW 19.5tn offer market cap; +111.4% average first-day return; -5.1% average current return; 36 of 52 below offer price |
| CB Zero Finder | Captured 11 Aug 2026; 14 May - 11 Aug 2026 | 118 filing rows; 41 rows across 40 issuers met the strict numeric 0% / 0% screen |

The CB screen only treats numeric zero in both the coupon and maturity-yield fields as a match. A `-` placeholder is treated as missing rather than zero.

These values are contextual portfolio evidence only. They are not NLP training labels and no real issuer receives a synthetic risk prediction.

## Technical stack

| Layer | Implementation |
| --- | --- |
| UI | React + TypeScript |
| Build | Vite |
| Testing | Vitest + Testing Library |
| Rule baseline | Deterministic weighted phrase matching |
| Trained baseline | Unigram TF-IDF + multinomial logistic regression |
| Retrieval | TF-IDF cosine similarity |
| Memo | Deterministic template generation |
| Data | Checked-in synthetic corpus + frozen public-market metadata |
| Deployment | Vercel |

The core NLP workflow requires no API key, private dataset, backend database, or remote model call.

## Repository structure

```text
src/
  components/   Reviewer interface, evidence views, evaluation panels
  config/       Graduate-application profile configuration
  data/         Synthetic Korean corpus and frozen market snapshot
  domain/       Types for documents, passages, taxonomy, and workflows
  lib/          Preprocessing, rules, TF-IDF, classification, retrieval, memo logic

docs/
  annotation-guide.md
  application-language.md
  data-card.md
  design-note.md
  evaluation-notes.md
  model-card.md
  project-defense-guide.md
  retrieval-evaluation.md
  ut-austin-project-note.md
public/
  Static assets and metadata
```

## Run locally

### Requirements

- Node.js 22
- npm

### Install and verify

```bash
npm ci
npm run verify
```

The verification pipeline runs **64 deterministic tests**, linting, TypeScript checks, and a production build.

### Start development server

```bash
npm run dev
```

## Application profile switch

The default production profile uses UT Austin-level graduate-application wording rather than claiming affiliation or admission to a specific degree program.

The same project can be previewed with the bundled Georgia Tech OMSA context:

```bash
VITE_APPLICATION_PROFILE=georgia-tech-omsa npm run dev
```

The switch changes applicant-context copy and official institution links. It does not change the corpus, model, evaluation, or evidence claims.

## What this project demonstrates

For an admissions or technical reviewer, the intended evidence is not simply the accuracy number. The project is meant to demonstrate:

- translating a finance-domain workflow into an AI problem;
- designing an explicit Korean risk taxonomy;
- maintaining clean boundaries between real public data and synthetic evaluation data;
- building both interpretable and trained baselines;
- using document-level holdout rather than only in-sample metrics;
- evaluating retrieval separately from classification;
- preserving passage-level evidence and provenance;
- exposing model errors instead of optimizing them away after inspection;
- communicating Korean-domain results to an English-speaking reviewer; and
- documenting AI-assisted development rather than presenting assisted implementation as unaided work.

## Limitations

This prototype does **not** establish performance on actual DART or KRX filings, generalization to unseen issuers or filing templates, independent validity of reference labels, calibrated financial-risk probabilities, investment or legal utility, superiority of one baseline over another, or semantic retrieval performance.

The corpus is intentionally small and synthetic. Reference labels and rationales were created within the same AI-assisted project and were not independently annotated or adjudicated.

## AI-assisted development disclosure

Yoochan Kim defined and directed the domain problem, product objective, risk taxonomy, feature requirements, evaluation questions, finance interpretation, application framing, and acceptance criteria.

AI-assisted coding tools were used for portions of synthetic-data drafting, implementation, documentation, refactoring, and automated verification. The repository discloses this explicitly so reviewers can distinguish domain ownership and project direction from assisted implementation.

## Further documentation

- [Annotation Guide](docs/annotation-guide.md)
- [Data Card](docs/data-card.md)
- [Model Card](docs/model-card.md)
- [Evaluation Notes](docs/evaluation-notes.md)
- [Retrieval Evaluation](docs/retrieval-evaluation.md)
- [Design Note](docs/design-note.md)
- [Project Defense Guide](docs/project-defense-guide.md)
- [Application Language](docs/application-language.md)

## Disclaimer

This is an independent educational and portfolio project. It is not investment advice, legal advice, regulatory advice, or an official publication of any employer, university, exchange, or regulator.