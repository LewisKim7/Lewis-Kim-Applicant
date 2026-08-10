# Application Language

Use these drafts only after personally reviewing the corpus, labels, rules, model, predictions, and error cases. Confirm that the wording matches the applicant's actual contribution and follow the current application policy on disclosing AI assistance.

## Concise CV entry

**Korea IPO & CB Risk Screener** — [Live demo](https://ai-disclosure-risk-screener.vercel.app/) · [GitHub](https://github.com/LewisKim7/AI-Disclosure-Risk-Screener)

Directed development of an AI-assisted React/TypeScript NLP prototype for Korean IPO and convertible-bond analysis. Built around 5 fictional documents, 30 Korean passages, and 7 risk labels, the repository includes transparent weighted rules, a unigram TF-IDF multinomial logistic-regression baseline with leave-one-document-out evaluation, lexical evidence retrieval, deterministic source-linked memos, and documented error analysis. All labels and rationales are synthetic, AI-assisted, and not independently annotated.

## SOP paragraph

To prepare for graduate study in artificial intelligence, I directed the development of Korea IPO & CB Risk Screener, an independent prototype that connects my finance and deep-tech investment background with Korean text preprocessing, classification, information retrieval, and model evaluation. I framed the domain problem, objectives, and feature requirements, while Codex assisted with synthetic-data drafting, implementation, documentation, and verification. The project compares a transparent rule system with a unigram TF-IDF logistic-regression baseline evaluated by holding out one of five fictional documents at a time. More important than the small metric difference were the visible failures: Korean vocabulary gaps, negation, overlapping risk categories, and sparse liquidity examples. Because the labels were produced within the same AI-assisted process and were not independently reviewed, I present the results as development diagnostics rather than validated performance. The project clarified what I need to study next: stronger Korean language processing, independent annotation, careful experimental design, and responsible interpretation.

## Optional short interview description

I used a familiar Korean capital-markets problem to practice turning domain judgment into an inspectable NLP pipeline. The strongest part of the project is not the reported accuracy; it is the separation of protocols, evidence-linked outputs, exact error analysis, and candid account of AI assistance and data limits.

## Language to avoid

Do not describe the project as:

- a production DART or KRX system;
- trained or validated on real filings;
- an independently labeled benchmark;
- a semantic-search engine;
- an investment recommendation model;
- proof of AI-engineering mastery; or
- a formal UT Austin application requirement.
