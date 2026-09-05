// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { CONSENT_STORAGE_KEY, hasConsent, readConsent, writeConsent } from '@/lib/consent'

describe('lib/consent', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('CONSENT_NoStorage_ReadsNull', () => {
    expect(readConsent()).toBeNull()
    expect(hasConsent()).toBe(false)
  })

  it('CONSENT_WriteAccepted_ReadsAccepted', () => {
    writeConsent('accepted')
    expect(readConsent()).toBe('accepted')
    expect(hasConsent()).toBe(true)
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('accepted')
  })

  it('CONSENT_WriteRejected_ReadsRejectedAndNotGranted', () => {
    writeConsent('rejected')
    expect(readConsent()).toBe('rejected')
    expect(hasConsent()).toBe(false)
  })

  it('CONSENT_InvalidValue_TreatedAsNull', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'yes')
    expect(readConsent()).toBeNull()
  })
})