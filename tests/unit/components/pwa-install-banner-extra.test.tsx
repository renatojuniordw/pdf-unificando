// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import { logError } from '@/lib/utils/logger'

vi.mock('framer-motion', () => {
  const passthrough = (tag: string) =>
    function MotionComponent({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
      return React.createElement(tag as React.ElementType, props, children)
    }

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: { div: passthrough('div') },
    useReducedMotion: () => false,
  }
})

vi.mock('@/lib/utils/logger', () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}))

function makeBeforeInstallPromptEvent(promptImpl?: () => Promise<void>) {
  const event = new Event('beforeinstallprompt') as Event & {
    preventDefault: () => void
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  }
  event.preventDefault = vi.fn()
  event.prompt = promptImpl ?? vi.fn().mockResolvedValue(undefined)
  event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
  return event
}

describe('PWAInstallBanner (edge cases)', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('PWA_STANDALONE_ReturnsNullWithoutRendering', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    })
    const { container } = render(<PWAInstallBanner />)
    expect(container.innerHTML).toBe('')
    expect(screen.queryByText(/Instalar no Celular/i)).toBeNull()
  })

  it('PWA_Dismissed_SkipsScheduling', async () => {
    vi.useFakeTimers()
    sessionStorage.setItem('pwa-banner-dismissed', 'true')
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')

    render(<PWAInstallBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(screen.queryByText(/Instalar no Celular/i)).toBeNull()
  })

  it('PWA_SessionStorageThrows_ReadDismissedFallsBackToFalse', async () => {
    vi.useFakeTimers()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')

    render(<PWAInstallBanner />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(screen.getByText(/Instalar no Celular/i)).toBeTruthy()
  })

  it('PWA_InstallPromptFails_SetsErrorAndLogs', async () => {
    vi.useFakeTimers()
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (X11; Linux x86_64)')

    render(<PWAInstallBanner />)
    await act(async () => {
      await Promise.resolve()
    })

    const failingPrompt = vi.fn().mockRejectedValue(new Error('prompt aborted'))
    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent(failingPrompt))
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    fireEvent.click(screen.getByRole('button', { name: /Instalar Agora/i }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText(/Não foi possível abrir o instalador agora/i)).toBeTruthy()
    expect(logError).toHaveBeenCalledWith('PWA Install', expect.any(Error), { outcome: 'failed' })
    expect(screen.getByRole('button', { name: /Instalar Agora/i })).toBeTruthy()
  })

  it('PWA_DoubleScheduling_ClearsPreviousTimer', async () => {
    vi.useFakeTimers()
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (X11; Linux x86_64)')

    render(<PWAInstallBanner />)
    await act(async () => {
      await Promise.resolve()
    })

    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })
    act(() => {
      window.dispatchEvent(makeBeforeInstallPromptEvent())
    })
    expect(clearTimeoutSpy).toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(screen.getByText(/Instalar no Celular/i)).toBeTruthy()
  })
})