# Application Language

**Applicant:** Yoochan Kim (Lewis Kim · 김유찬)

**Application context:** Independent, optional supporting evidence for graduate applications in artificial intelligence and data science at The University of Texas at Austin. The public top ribbon intentionally does not name MSAI or MSDS so the same evidence link can accompany either application.

Use these drafts only after personally reviewing the corpus, labels, rules, model, predictions, and error cases. Confirm that the wording matches the applicant's actual contribution and follow the current application instructions and any applicant-facing AI-use attestation.

## Placement and prerequisite boundary

Place this project in a **Selected Projects** section of the CV/resume and link the public live demo plus an admissions-accessible source revision. Do not present the project as a separate required application item.

Use the current program-specific application guide for each submission. The [MSAI program page](https://cdso.utexas.edu/msai) and [MSDS program page](https://cdso.utexas.edu/msds) are separate official references. Keep prerequisite evidence separate from this project entry. The prototype may support a narrative of preparation, but it does not prove that prerequisite coursework has been completed or waive any program requirement.

For MSAI, emphasize natural language processing, classification, retrieval, evaluation, and responsible AI. For MSDS, emphasize reproducible preprocessing, statistical evaluation, error analysis, data visualization, and evidence quality. Do not describe the project as affiliated with UT Austin, reviewed by either program, endorsed by an admissions office, or created to satisfy a formal portfolio requirement.

## Applicant profile evidence

- [Coolidge Corner Investment](https://ccvc.co.kr/) describes a 15-year focus on Series A investments in early-stage startups and social ventures. The public profile condenses this context to “an influential early-stage venture capital firm in Korea” without adding a visible citation inside the biography.
- [Hanwha Asset Management](https://www.hanwhafund.co.kr/en) identifies the employer. The [2026 Fair Trade Commission designation](https://m.korea.kr/news/policyNewsView.do?newsId=156759051) records Hanwha's move from seventh to fifth by assets among Korea's large business groups. The public profile states the rank briefly and dates it to 2026.
- The [FSS DART investment prospectus filed on 26 August 2025](https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20250826000004&dcmNo=10784143&keyword=%EA%B9%80%EC%9C%A0%EC%B0%AC) lists Yoochan Kim as a fund manager (`부책임운용전문인력`) for the Hanwha IPO Plus fund. This is a dated Korean-language public filing, not proof of uninterrupted present employment or employer endorsement.
- The external [Lewis Kim profile](https://personal-sns-beta.vercel.app/) provides broader background and selected work. The application portfolio bundles its illustrated profile asset locally so the page is not dependent on a cross-site image request.

## Concise CV entry

**Korea IPO & CB Risk Screener** — [Live demo](https://lewis-kim-applicant.vercel.app/) · [GitHub](https://github.com/LewisKim7/lewis-kim-applicant)

Directed development of an AI-assisted React/TypeScript NLP prototype for Korean IPO and convertible-bond analysis. Built around 5 fictional documents, 30 Korean passages, and 7 risk labels, the repository includes transparent weighted rules, a unigram TF-IDF multinomial logistic-regression baseline with leave-one-document-out evaluation, a 12-query closed-corpus retrieval diagnostic, deterministic source-linked memos, and documented error analysis. All labels, rationales, and retrieval judgments are synthetic, AI-assisted, and not independently reviewed.

## SOP paragraph

To prepare for graduate study in artificial intelligence and data science, I directed the development of Korea IPO & CB Risk Screener, an independent prototype that connects my finance and deep-tech investment background with Korean text preprocessing, classification, information retrieval, and model evaluation. I framed the domain problem, objectives, and feature requirements, while Codex assisted with synthetic-data drafting, implementation, documentation, and verification. The project compares a transparent rule system with a unigram TF-IDF logistic-regression baseline evaluated by holding out one of five fictional documents at a time, then evaluates lexical retrieval separately with 12 Korean queries. More important than the small metrics were the visible failures: Korean vocabulary gaps, negation, overlapping risk categories, sparse liquidity examples, and a paraphrase query that returned no lexical match. Because the labels and retrieval judgments were produced within the same AI-assisted process and were not independently reviewed, I present the results as development diagnostics rather than validated performance. The project clarified what I need to study next: stronger Korean language processing, independent annotation, careful experimental design, and responsible interpretation.

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
