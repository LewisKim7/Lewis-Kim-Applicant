# Annotation Guide: Korean IPO and CB Passage Risk

## Purpose and current status

This guide defines how one primary risk label should be assigned to each Korean disclosure-style passage in the educational corpus. Its purpose is to make the reference-label process inspectable and to support a future independent annotation exercise.

The current labels and rationales were drafted within the same AI-assisted project that created the synthetic passages. They are not independent ground truth, have not been adjudicated, and have not been reviewed by a Korean capital-markets expert. This guide documents the intended decision logic; it does not retroactively make the existing labels independent.

## Annotation unit and permitted context

The annotation unit is one passage identified by a unique `passageId`. Annotators may inspect the passage's checked-in document metadata and nearby passages from the same fictional document to resolve references. They must not use model predictions, rule matches, search rankings, generated memos, or outside facts when assigning the initial label.

Each annotation record should contain:

- `documentId` and `passageId`;
- one primary label from the seven-label taxonomy;
- the shortest sufficient evidence span from the passage;
- a one- or two-sentence rationale describing the mechanism and consequence;
- an optional secondary-label candidate for disagreement analysis; and
- a note when the passage is ambiguous, negated, or context-dependent.

## Primary-label decision process

Apply these steps in order:

1. **Identify the asserted mechanism.** Determine what event, obligation, relationship, operating dependency, or external exposure the passage actually describes.
2. **Identify the principal consequence.** Ask whether the mechanism primarily changes ownership, repayment pressure, cash availability, control or conflicts, operational delivery, or exposure to external market conditions.
3. **Use the passage, not a keyword.** A finance term is evidence only in its grammatical and factual context. Do not assign a label merely because a configured rule phrase appears.
4. **Choose one dominant label.** When several labels are defensible, select the category that best represents the passage's main causal mechanism. Record a secondary candidate and the boundary reason rather than hiding the overlap.
5. **Use Informational conservatively.** Assign `Low Risk / Informational` only when the passage supplies routine context or an explicit risk negation without a remaining configured risk mechanism.
6. **Cite the evidence.** The rationale must point to words or a numerical relationship in the passage. It must not introduce external issuer facts or investment conclusions.

## Label definitions and decision cues

### Dilution Risk

Use when the primary mechanism increases or could increase shares, conversion rights, option exercise, ownership dilution, or overhang through issuance terms.

Typical evidence includes conversion-price resets, an increase in convertible shares, new-share issuance, warrants, call-option allocation that changes ownership exposure, or a quantified potential dilution ratio.

Do not use merely because a security is a CB. If the passage centers on repayment timing or cash required for a put, consider Refinancing or Liquidity instead.

### Refinancing Risk

Use when the primary mechanism is the need to repay, extend, replace, roll over, or renegotiate financing obligations.

Typical evidence includes maturity walls, early-redemption rights, put-option exercise, refinancing dependence, covenant-triggered repayment, or uncertainty about replacing existing debt.

Distinguish this from Liquidity Risk by asking whether the central issue is the financing obligation itself or the issuer's near-term cash capacity.

### Liquidity Risk

Use when the primary mechanism is insufficient or constrained cash, working capital, cash runway, covenant headroom, operating cash timing, or continued-operation capacity.

Typical evidence may be indirect: available cash compared with a payment amount, receivable delays combined with supplier prepayments, restricted cash, or dependence on an uncommitted credit line.

Do not require the literal terms `유동성` or `운전자금`. Numerical cash relationships can be sufficient evidence.

### Governance Risk

Use when the primary mechanism concerns control, board oversight, voting rights, related parties, conflicts of interest, founder influence, or the fairness of a transaction process.

Typical evidence includes related-party transactions, concentrated voting control, a representative's family relationship, absent independent review, or option allocation that creates a conflict.

Do not assign Governance solely because a related-party term appears inside an explicit denial or prohibition.

### Execution Risk

Use when the primary mechanism is uncertainty about completing an internal plan or milestone.

Typical evidence includes permits, construction, production ramp, yield improvement, product approval, customer qualification, commercialization, hiring, delivery, or schedule dependencies.

If the passage instead centers on external demand, pricing, competition, currency, or interest rates, consider Market Risk.

### Market Risk

Use when the primary mechanism is exposure to external demand, competition, pricing, investor supply and demand, interest rates, foreign exchange, volatility, or market conditions outside the issuer's direct control.

For an overhang passage, distinguish external selling pressure from the contractual creation of additional shares. The former may be Market Risk; the latter is usually Dilution Risk.

### Low Risk / Informational

Use when a passage provides routine factual context, a completed administrative step, or an explicit negation without a remaining primary risk mechanism.

This label does not mean the issuer or transaction is safe. It means the passage does not contain a configured primary risk signal under this taxonomy.

## Common overlap rules

| Boundary | Primary decision rule |
| --- | --- |
| Dilution vs. Market | Additional shares, conversion rights, or ownership change → Dilution. External price pressure, volatility, or demand → Market. |
| Refinancing vs. Liquidity | Repayment, maturity, replacement financing, or creditor option → Refinancing. Cash runway, working-capital timing, or cash sufficiency → Liquidity. |
| Governance vs. Dilution | Conflict, control, or allocation fairness → Governance. Ownership dilution caused by issuance or conversion mechanics → Dilution. |
| Governance vs. Execution | Oversight, related parties, or control → Governance. Ability to complete an operating milestone → Execution. |
| Execution vs. Market | Internal delivery, approval, construction, or scale-up dependency → Execution. External demand, competition, or pricing exposure → Market. |
| Informational vs. any risk | Use Informational only if the asserted meaning does not leave a configured risk mechanism. Negated keywords alone are not positive risk evidence. |

When the causal mechanism and consequence point to different labels, annotate the mechanism that dominates the passage's purpose and record the other label as a secondary candidate.

## Negation and uncertainty

- Read the full clause containing a risk term and check for Korean negation such as `아니다`, `없다`, `않다`, `제외`, `미해당`, or `지급되지 않다`.
- Do not treat a negated keyword as positive evidence. For example, `특수관계인에게 지급되지 않는다` does not by itself establish Governance Risk.
- Preserve uncertainty expressed by terms such as `가능성`, `예정`, `조건부`, or `의존`. Uncertainty can support a risk label when the underlying mechanism is present.
- Distinguish a statement that a risk control exists from evidence that the control is ineffective. A control description alone may be Informational.
- If the scope of negation is unclear, mark the passage ambiguous and route it to adjudication rather than resolving it from a keyword count.

## Evidence and rationale rules

- Select the shortest span that still contains both the mechanism and its material consequence.
- Keep amounts, dates, ratios, and conditional terms when they are necessary to interpret the risk.
- Do not cite a document title or metadata as the sole evidence for a passage label.
- Do not infer issuer quality, fraud, expected return, legal breach, or investment attractiveness.
- Write the rationale as a traceable explanation, not a recommendation.
- If no passage-only rationale can be written, choose Informational or flag the example as unsuitable for this passage-level task.

## Independent review and adjudication plan

The following plan describes future work; none of these steps has been completed for the current labels.

1. Freeze the corpus by file hash before distributing it to annotators.
2. Provide this guide without rule dictionaries, model outputs, confusion matrices, or existing rationales.
3. Have the applicant and at least one independent Korean-language reviewer annotate every passage separately.
4. Preserve both raw label sets, evidence spans, rationales, secondary candidates, and ambiguity flags.
5. Report raw agreement and Cohen's kappa with the sample size and label distribution. Do not report an agreement statistic if independence was compromised.
6. Review disagreements only after the independent pass is locked. Discuss the cited evidence and taxonomy boundary, not which label improves a model score.
7. Record the adjudicated label, adjudicator, date, original labels, and written decision reason in a versioned disagreement log.
8. Keep the original AI-assisted labels available for provenance and rerun all metrics against any newly adjudicated reference set.

No checklist item or agreement claim should be marked complete until the underlying human work and records exist.

## Version boundary

This guide applies to the corpus whose integrity record is documented in [Data Card](data-card.md). A change to label definitions, corpus text, annotation scope, or adjudication rules creates a new annotation version and requires fresh metrics and documentation.
