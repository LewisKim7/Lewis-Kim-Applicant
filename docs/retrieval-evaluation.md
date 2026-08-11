# Retrieval Evaluation: Korean TF-IDF Evidence Search

## Question and boundary

This diagnostic asks whether the lexical retrieval baseline places passages judged relevant to a Korean analyst query within the top three results. It is evaluated separately from passage classification.

The 12 queries and graded relevance judgments were drafted with AI assistance after the same 30-passage synthetic corpus was available. They were not created by independent reviewers, were not held out during interface development, and do not estimate performance on real DART filings. The purpose is to make retrieval behavior and failure modes reproducible.

## Protocol

- Corpus: 30 synthetic Korean passages from five fictional IPO/CB documents
- Queries: 12 Korean queries covering dilution, refinancing, liquidity, governance, execution, market, and informational evidence
- Relevance grade `2`: directly relevant evidence
- Relevance grade `1`: supporting or secondary evidence
- Ranking: unigram TF-IDF cosine similarity
- Cutoff: top three results (`k=3`)
- Empty lexical overlap: no result is returned

## Aggregate result

| Queries | Precision@3 | Recall@3 | MRR@3 | nDCG@3 |
| ---: | ---: | ---: | ---: | ---: |
| 12 | 69.45% | 77.78% | 91.67% | 85.51% |

### Definitions

- **Precision@3:** relevant passages among three result slots, averaged across queries. Empty or shorter result lists still use a denominator of three.
- **Recall@3:** judged-relevant passages retrieved in the top three divided by all judged-relevant passages for that query.
- **MRR@3:** reciprocal rank of the first relevant result within the top three, averaged across queries; zero when none is returned.
- **nDCG@3:** discounted cumulative gain from the graded top-three results divided by the ideal graded ordering for that query.

## Per-query trace

| ID | Korean query | Relevant returned / judged | First relevant rank | Top passage |
| --- | --- | ---: | ---: | --- |
| Q01 | `전환가액 리픽싱 희석` | 2 / 2 | 1 | `DOC-KR-CB-RESET-001-P01` |
| Q02 | `조기상환청구권 현금 상환` | 1 / 2 | 1 | `DOC-KR-CB-RESET-001-P02` |
| Q03 | `공모자금 차입금 상환 차환` | 3 / 3 | 1 | `DOC-KR-IPO-PROCEEDS-001-P02` |
| Q04 | `운전자금 부족 현금 회수` | 3 / 3 | 1 | `DOC-KR-IPO-RISK-001-P03` |
| Q05 | `특수관계인 이해상충 이사회` | 2 / 3 | 1 | `DOC-KR-IPO-RISK-001-P04` |
| Q06 | `생산설비 증설 인허가 시험가동` | 2 / 3 | 1 | `DOC-KR-IPO-PROCEEDS-001-P04` |
| Q07 | `고객사 승인 양산 지연` | 3 / 3 | 1 | `DOC-KR-IPO-PROSPECTUS-001-P04` |
| Q08 | `오버행 매도 물량 주가 변동성` | 2 / 2 | 1 | `DOC-KR-CB-RESET-001-P05` |
| Q09 | `가격 경쟁 고객 수요 둔화` | 3 / 3 | 1 | `DOC-KR-IPO-RISK-001-P06` |
| Q10 | `구주매출 신주모집 지분 희석` | 1 / 2 | 1 | `DOC-KR-IPO-PROSPECTUS-001-P01` |
| Q11 | `발사 일정 지연 시스템 통합` | 3 / 3 | 1 | `DOC-KR-IPO-RISK-001-P05` |
| Q12 | `남은 청약대금 관리 보고` | 0 / 2 | — | No lexical match |

## Visible failure analysis

Q12 requests evidence about custody and reporting of remaining subscription proceeds using words that do not overlap sufficiently with the two unused-proceeds passages. The index therefore returns no result. This is not treated as a data bug or hidden from the interface: it demonstrates that TF-IDF can fail when a useful paraphrase shares little surface vocabulary with the corpus.

The high MRR is also easy to overstate. Eleven of twelve queries place a relevant passage first, but the queries were written with knowledge of a tiny corpus whose explicit finance vocabulary repeats. The result cannot establish robust Korean semantic retrieval.

## Reproduction and change control

The judgments are versioned in `src/data/retrieval-judgments.ts`; calculation is implemented in `src/lib/retrieval-evaluation.ts`; and a deterministic snapshot is frozen in `src/lib/retrieval-evaluation.test.ts`.

```bash
npm ci
npm run verify
```

Any change to corpus text, preprocessing, query text, relevance grades, retrieval scoring, or cutoff requires rerunning the diagnostic and updating the interface and documentation. A future confirmatory evaluation should use independently written queries and relevance judgments over a legally permitted external corpus.
