# Graduate Study Preparation Note

## Purpose

This project was built as part of my preparation for graduate study in Artificial Intelligence. As a finance and deep-tech investment professional, I wanted to explore how NLP, information retrieval, classification, model evaluation, and transparent interpretation can be applied to disclosure analysis.

AI Disclosure Risk Screener is an educational exercise in developing foundational AI/NLP skills—not a claim of professional machine-learning engineering mastery. The work is intentionally small enough to inspect: five fictional synthetic documents, exactly 30 passages with fixed reference labels, seven risk labels, a transparent rule-based baseline, TF-IDF cosine lexical retrieval, a deterministic evidence-linked memo, and explicit limitations.

## Why this problem

My professional context involves turning dense technical and financial material into decision-useful analysis. Disclosure review is therefore a natural domain in which to practice translating an open-ended task into an AI/NLP system:

1. define the unit of analysis;
2. design a risk taxonomy;
3. build a reproducible baseline;
4. preserve a source trail;
5. measure the baseline against fixed reference labels; and
6. explain the errors and responsible-use boundary.

This framing matters more to me than presenting a polished interface alone. The project page is the demonstration layer; the corpus, rules, retrieval method, evaluation, and documentation are the substantive work.

## Connection to graduate-study preparation

The project creates a practical setting in which to study several topics that are relevant to advanced AI coursework:

| Topic | Project evidence |
| --- | --- |
| NLP | Cleaning, tokenization, passage construction, and light lexical normalization |
| Classification | A declared seven-label taxonomy and an auditable weighted-rule baseline |
| Information retrieval | TF-IDF vectors and cosine ranking over citable passages |
| Evaluation | Fixed reference labels, accuracy, per-label recall, macro recall, confusion matrix, and error inspection |
| Interpretation | Matched phrases, rule contributions, passage identifiers, and explicit score semantics |
| Transparency and ethics | Synthetic-data disclosure, non-use boundaries, and documented failure modes |

The rule-based classifier is a starting point rather than a final modeling choice. Building it first helped separate taxonomy errors, annotation ambiguity, retrieval behavior, and wording sensitivity before considering trained models.

## Official UT Austin context

The following official materials informed how I described the academic connection:

- [MSAI curriculum/program page](https://cdso.utexas.edu/msai)
- [Graduate Catalog, Artificial Intelligence](https://catalog.utexas.edu/graduate/areas-of-study/natural-sciences/artificial-intelligence/)
- [current linked MSAI Application Guide PDF](https://cdso.utexas.edu/sites/default/files/2025-01/MSAI_Application_Guide.pdf)
- [CDSO FAQ](https://cdso.utexas.edu/faq)

I use these sources only to understand the program and current application guidance. I do not treat this portfolio as a substitute for the program's prerequisites or required application materials. The current official application materials do not list a portfolio as a formal required item; this project is optional supporting evidence that may be linked where appropriate in a CV or statement of purpose.

The program and catalog pages are most relevant to the project's broad fit with NLP, information retrieval, classification, evaluation, interpretation, transparency, and ethics. I avoid making a more precise course-distribution claim because current official pages can describe curricular structure differently. Applicants should verify the latest program, catalog, application-guide, and FAQ pages directly before submitting.

## Learning questions exposed by the build

### Taxonomy precedes modeling

A classifier can only be as coherent as its labels. A central challenge is defining categories that are distinct enough to evaluate while still recognizable in financing and operating disclosures. The resulting single-label scheme is easy to inspect, but it also shows why a future version should support overlapping labels.

### Retrieval and classification answer different questions

The classifier asks, “Which configured risk category best matches this passage?” The TF-IDF component asks, “Which passages share the strongest lexical relationship with this query?” Keeping those outputs separate prevents a ranked search result from being misrepresented as a risk prediction.

### Evaluation changes the project

Writing reference labels and annotation rationales exposed ambiguous passages and wording gaps that a demo alone would hide. The resulting metrics remain limited to this fixed synthetic corpus, but the confusion matrix and error cases make the weaknesses concrete and create a basis for the next experiment.

### Transparent output needs careful language

The classifier's signal score is a normalized rule-strength heuristic. It is not a probability, statistically calibrated value, severity estimate, or assurance that the passage is correctly labeled. Recording this distinction in the interface and documentation is part of the project, not a footnote.

## AI-assisted development disclosure

The applicant selected the domain, objective, and project requirements. Codex assisted with synthetic-corpus drafting, implementation, documentation, and automated verification. The fixed reference labels were drafted within that same AI-assisted process and are not independent expert annotations. Before using this project in an application, the applicant should personally review the passages, rules, predictions, and error cases and follow any applicable application policy on disclosing AI assistance.

## Independence and non-affiliation

AI Disclosure Risk Screener is an independent personal project. It is not affiliated with, sponsored by, reviewed by, or endorsed by The University of Texas at Austin, the MSAI program, the College of Natural Sciences, CDSO, or any admissions office. The repository uses fictional entities and synthetic passages and does not contain university or admissions data.

## Application use

If included in an application, I intend to link the live demonstration and repository as concise supporting evidence. I would describe which decisions I directed, what was implemented with AI assistance, what the fixed evaluation shows, which errors remain, and what I would test next. I would not present the project as a required submission, a production system, or proof that prerequisites have been satisfied.
