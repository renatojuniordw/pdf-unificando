import { describe, expect, it } from 'vitest'
import {
  MAX_FILE_SIZE,
  MAX_TOTAL_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  checkUploadBatch,
} from '@/lib/limits'

describe('lib/limits', () => {
  it('deve expor os limites padrão', () => {
    expect(MAX_FILE_SIZE).toBe(52_428_800)
    expect(MAX_TOTAL_UPLOAD_BYTES).toBe(52_428_800)
    expect(MAX_UPLOAD_FILES).toBe(20)
  })

  it('checkUploadBatch: aceita batch dentro dos limites', () => {
    const current = [{ size: 1_000_000 }, { size: 2_000_000 }]
    const incoming = [{ size: 3_000_000 }]
    expect(checkUploadBatch(current, incoming, 20, 50_000_000)).toEqual({
      ok: true,
      nextCount: 3,
      nextTotalSize: 6_000_000,
      exceedsCount: false,
      exceedsTotal: false,
    })
  })

  it('checkUploadBatch: rejeita quando excede a quantidade', () => {
    const current = Array.from({ length: 19 }, () => ({ size: 100 }))
    const incoming = Array.from({ length: 2 }, () => ({ size: 100 }))
    const check = checkUploadBatch(current, incoming, 20, 50_000_000)
    expect(check.ok).toBe(false)
    expect(check.exceedsCount).toBe(true)
    expect(check.nextCount).toBe(21)
  })

  it('checkUploadBatch: rejeita quando excede o tamanho total', () => {
    const current = [{ size: 40_000_000 }]
    const incoming = [{ size: 15_000_000 }]
    const check = checkUploadBatch(current, incoming, 20, 50_000_000)
    expect(check.ok).toBe(false)
    expect(check.exceedsTotal).toBe(true)
    expect(check.nextTotalSize).toBe(55_000_000)
  })

  it('checkUploadBatch: rejeita listas vazias sem quebrar', () => {
    expect(checkUploadBatch([], [], 20, 50_000_000).ok).toBe(true)
  })
})