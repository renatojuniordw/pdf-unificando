// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_STORAGE_KEY, CONSENT_EVENT } from '@/lib/consent'
import { ConsentBanner } from '@/components/analytics/ConsentBanner'
import { TrackingScripts } from '@/components/analytics/TrackingScripts'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

function consumeConsentEvent(): Promise<string> {
  return new Promise((resolve) => {
    const handler = (e: Event) => {
      window.removeEventListener(CONSENT_EVENT, handler as EventListener)
      resolve((e as CustomEvent<string>).detail)
    }
    window.addEventListener(CONSENT_EVENT, handler as EventListener)
  })
}

describe('ConsentBanner', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('BANNER_NoDecision_ShowsBanner', () => {
    render(<ConsentBanner />)
    expect(screen.getByRole('region', { name: /Consentimento de cookies/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Aceitar/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Recusar/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /Política de Privacidade/i })).toBeTruthy()
  })

  it('BANNER_Accept_PersistsAndEmitsEventAndHides', async () => {
    const eventPromise = consumeConsentEvent()
    render(<ConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /Aceitar/i }))

    expect(screen.queryByRole('region', { name: /Consentimento de cookies/i })).toBeNull()
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('accepted')
    await expect(eventPromise).resolves.toBe('accepted')
  })

  it('BANNER_Reject_PersistsAndEmitsEventAndHides', async () => {
    const eventPromise = consumeConsentEvent()
    render(<ConsentBanner />)
    fireEvent.click(screen.getByRole('button', { name: /Recusar/i }))

    expect(screen.queryByRole('region', { name: /Consentimento de cookies/i })).toBeNull()
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('rejected')
    await expect(eventPromise).resolves.toBe('rejected')
  })

  it('BANNER_PreviousDecision_HidesBanner', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    render(<ConsentBanner />)
    expect(screen.queryByRole('region', { name: /Consentimento de cookies/i })).toBeNull()
  })
})

describe('TrackingScripts', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.head.querySelectorAll('[data-tracking-src], script[id]').forEach((el) => el.remove())
  })

  it('TRACKING_Rejected_DoesNotInjectAnyScript', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected')
    render(<TrackingScripts />)
    expect(document.querySelector('[data-tracking-src]')).toBeNull()
    expect(document.getElementById('ga4-init')).toBeNull()
  })

  it('TRACKING_Accepted_InjectsGaGtmPixelAdsense', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted')
    render(<TrackingScripts />)
    const srcs: string[] = []
    document.querySelectorAll('[data-tracking-src]').forEach((el) => srcs.push(el.getAttribute('src') ?? ''))
    expect(srcs.some((s) => s.includes('googletagmanager.com/gtag/js'))).toBe(true)
    expect(srcs.some((s) => s.includes('adsbygoogle.js'))).toBe(true)
    expect(document.getElementById('ga4-init')).toBeTruthy()
    expect(document.getElementById('gtm-script')).toBeTruthy()
    expect(document.getElementById('meta-pixel')).toBeTruthy()
  })

  it('TRACKING_AcceptsAfterRejection_LoadsOnEvent', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected')
    render(<TrackingScripts />)
    expect(document.getElementById('ga4-init')).toBeNull()

    act(() => {
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: 'accepted' }))
    })
    expect(document.getElementById('ga4-init')).toBeTruthy()
  })
})