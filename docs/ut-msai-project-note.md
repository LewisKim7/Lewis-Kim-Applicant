# Graduate Study Preparation Note

## Purpose

This independent project was created by Yoochan Kim (Lewis Kim · 김유찬) while preparing an application for graduate study in artificial intelligence. It connects his finance and deep-tech investment context with Korean-language preprocessing, classification, information retrieval, model evaluation, interpretation, and responsible-use boundaries.

Korea IPO & CB Risk Screener is an educational prototype, not a claim of professional machine-learning engineering mastery. The application is deliberately small and inspectable: five fictional Korean KOSPI/KOSDAQ documents, 30 Korean passages, seven primary labels, two classification baselines, lexical evidence retrieval, and deterministic memo generation. The interface is English so an international reviewer can follow the work; the source passages remain Korean because Korean text is the actual NLP subject.

## Why this problem

Convertible-bond decisions and IPO prospectuses combine structured terms with dense narrative risk language. An analyst may need to connect `전환가액 조정`, put and call options, overhang, lockups, use of proceeds, related parties, and going-concern language to the passages supporting an interpretation.

That workflow creates a useful learning sequence:

1. define a passage as the unit of analysis;
2. design a seven-label risk taxonomy;
3. preserve metadata and evidence identifiers;
4. implement an auditable rule baseline;
5. train a simple text classifier with document-level holdout;
6. distinguish classification from retrieval; and
7. analyze errors and responsible-use limits.

The project page is only the demonstration layer. The substantive artifact is the checked-in synthetic corpus, frozen public-market snapshot, rules, trained baseline, evaluation protocols, error analysis, and documentation.

## Evidence of graduate-study preparation

| Topic | Checked-in evidence |
| --- | --- |
| Domain-to-problem formulation | Korean IPO and CB workflows expressed as structured screening, passage classification, evidence retrieval, and memo assembly |
| NLP | Unicode normalization, Korean tokenization, stop words, and limited particle stripping |
| Classification | Seven primary labels, transparent weighted rules, and multinomial logistic regression |
| Information retrieval | TF-IDF cosine lexical ranking plus 12 graded Korean query judgments |
| Evaluation | Classification accuracy and recall, document folds, exact errors, and retrieval Precision@3, Recall@3, MRR@3, and nDCG@3 |
| Interpretation | Matched phrases, rule contributions, leading ML terms, source passage IDs, and explicit score semantics |
| Transparency and ethics | Synthetic-data disclosure, AI-assistance disclosure, non-use boundaries, and documented failure modes |
| Reproducibility | Local TypeScript implementation, frozen tests, and no required API key |

## What the experiments show

The transparent rule baseline produces 25 correct labels out of 30 on the same closed corpus used during development: 83.33% accuracy and 82.14% macro recall, with five errors. This is a deterministic sanity check, not a held-out estimate.

The unigram TF-IDF multinomial logistic-regression baseline uses five leave-one-document-out folds. Each fold has 24 training passages and 6 test passages, with vocabulary and IDF fitted on training text only. Its combined out-of-fold result is 26 of 30, or 86.67% accuracy, with 85.71% macro recall and four errors.

The percentages are not a controlled head-to-head ranking because the protocols differ. Both results are also limited by synthetic data, repeated wording, AI-assisted non-independent labels, and only five documents. Their value lies in making vocabulary gaps, negation failure, category overlap, and sparse-data behavior inspectable. In particular, the document-held-out ML recall for Liquidity Risk is only 25% (1 of 4).

A separate 12-query, closed-corpus retrieval diagnostic reports mean Precision@3 of 69.45%, mean Recall@3 of 77.78%, MRR@3 of 91.67%, and nDCG@3 of 85.51%. Its queries and graded relevance judgments are also AI-assisted and non-independent. A deliberately paraphrased query returns no result, visibly demonstrating the limits of lexical overlap.

## Learning reflected in the build

### Taxonomy precedes modeling

A classifier can only express the categories it is given. The single-label scheme keeps the confusion matrices readable, but passages about cash, repayment rights, and conversion terms can support more than one legitimate risk interpretation. A future version should test multi-label annotation.

### Evaluation protocol changes the claim

The closed-corpus rule result answers an implementation question. Leave-one-document-out ML answers a narrower transfer question across five synthetic documents. Describing those protocols separately is more important than highlighting the small difference between their percentages.

### Korean preprocessing is a modeling choice

Unicode tokenization and light particle stripping make the local implementation transparent, but they are not morphological analysis. The weakest liquidity recall and several Korean wording errors show why tokenization and corpus design should be tested, not treated as neutral plumbing.

### Retrieval and classification are different tasks

Classification selects a configured primary risk label. TF-IDF retrieval ranks passages by lexical overlap with a query. The latter is not semantic understanding, and its closed-corpus ranking diagnostic is not independent validation. Neither output verifies the financial truth of a passage.

## Production-tool evidence and independent NLP evaluation

The market overview uses a dated snapshot from two workflows already present in the applicant's portfolio:

- [CB Zero Finder](https://cb-zero-finder.vercel.app/): captured 11 Aug 2026, 118 filing rows, with a strict numeric `0.0% / 0.0%` screen returning 41 rows across 40 issuers and 17,898.6억원; and
- [IPO Market Report](https://ipo-market-report.vercel.app/): public PDF data through 7 Aug 2026, generated 8 Aug 2026, covering 52 firms, 19.5 trillion KRW in offer market capitalization, +111.4% average first-day return, −5.1% average current return, and 36 of 52 below offer.

The embedded source tools may update independently, but the portfolio snapshot remains fixed. Missing CB values shown as `-` are excluded rather than treated as zero. The real structured facts are display context only and never enter the synthetic five-document, 30-passage NLP corpus or receive a risk label. No private workbook, API key, full copyrighted filing, or private dataset was imported.

## Official UT Austin context

The following official sources informed the description of broad academic fit and current application context:

1. [MSAI curriculum/program page](https://cdso.utexas.edu/msai)
2. [Graduate Catalog, Artificial Intelligence](https://catalog.utexas.edu/graduate/areas-of-study/natural-sciences/artificial-intelligence/)
3. [current linked MSAI Application Guide PDF](https://cdso.utexas.edu/sites/default/files/2025-01/MSAI_Application_Guide.pdf)
4. [CDSO FAQ](https://cdso.utexas.edu/faq)

The project broadly relates to NLP, information retrieval, classification, evaluation, interpretation, transparency, and ethics. It does not claim alignment with a precise required-course distribution because current official pages can describe curricular structure differently.

The current linked application materials do not list a portfolio as a formal required item. This project is optional supporting evidence only. It cannot replace prerequisites, required application materials, or the applicant's responsibility to verify the latest instructions directly from UT Austin before submission.

## AI-assisted development disclosure

The applicant selected the domain, project objective, feature requirements, and application purpose. Codex assisted with synthetic-corpus drafting, implementation, documentation, and automated verification. All reference labels and rationales were drafted within the same AI-assisted process and are not independent annotations.

Before using the project in an application, the applicant should personally review every passage, label, rationale, rule, prediction, and error; be able to explain the implementation and limitations; and follow the current application policy for disclosing AI assistance.

## Independence and non-affiliation

Korea IPO & CB Risk Screener is an independent personal project. The University and program names are used only to identify the intended application. The project uses an original `Evidence Signal` mark and no official UT Austin logo, wordmark, seal, supporting mark, or university visual identity. It is not affiliated with, sponsored by, reviewed by, or endorsed by The University of Texas at Austin, the MSAI program, the College of Natural Sciences, CDSO, DART, KRX, or any admissions office. It contains no university or admissions data; its dated public-market snapshot is independent supporting context.

## Appropriate application use

If linked in an application, the project should be described as evidence of problem framing, directed AI-assisted development, evaluation discipline, and willingness to document limitations. It should not be presented as a required submission, a production system, proof of professional ML mastery, or proof that prerequisites have been satisfied.
