import { describe, expect, it } from 'vitest'
import { DOCUMENT_TYPES, RISK_LABELS } from '../domain'
import { classifyPassage, evaluateClassifier } from '../lib'
import { ALL_PASSAGES, DOCUMENTS, REFERENCE_LABEL_COUNTS, parseCorpus } from './corpus'

describe('bundled synthetic corpus', () => {
  it('contains exactly five documents and 30 unique passages', () => {
    expect(DOCUMENTS).toHaveLength(5)
    expect(ALL_PASSAGES).toHaveLength(30)
    expect(new Set(ALL_PASSAGES.map((passage) => passage.passageId)).size).toBe(30)
  })

  it('covers every declared document type and risk label', () => {
    expect(new Set(DOCUMENTS.map((document) => document.documentType))).toEqual(
      new Set(DOCUMENT_TYPES),
    )

    for (const label of RISK_LABELS) {
      expect(REFERENCE_LABEL_COUNTS[label]).toBeGreaterThan(0)
    }
  })

  it('keeps passage metadata aligned with its parent document', () => {
    for (const document of DOCUMENTS) {
      for (const passage of document.passages) {
        expect(passage.documentId).toBe(document.documentId)
        expect(passage.companyName).toBe(document.companyName)
        expect(passage.documentType).toBe(document.documentType)
        expect(passage.date).toBe(document.date)
      }
    }
  })

  it('rejects a corpus that is not explicitly synthetic', () => {
    expect(() =>
      parseCorpus([
        {
          documentId: 'DOC-TEST',
          companyName: 'Test Co.',
          documentType: 'Funding Announcement',
          date: '2026-01-01',
          synthetic: false,
          passages: [],
        },
      ]),
    ).toThrow(/synthetic/)
  })

  it('reproduces the documented closed-set baseline result', () => {
    const evaluation = evaluateClassifier(ALL_PASSAGES, classifyPassage)

    expect(evaluation.total).toBe(30)
    expect(evaluation.correct).toBe(27)
    expect(evaluation.accuracy).toBe(0.9)
    expect(evaluation.macroRecall).toBe(0.8929)
    expect(evaluation.errorExamples).toHaveLength(3)
  })
})
