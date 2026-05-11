// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

describe('PWAInstallBanner isolado', () => {
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
  })

  it('deve renderizar e permitir fechar no iPhone', async () => {
    vi.useFakeTimers()
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')

    const { PWAInstallBanner } = await import('@/components/pwa/PWAInstallBanner')
    render(<PWAInstallBanner />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(screen.getByText(/Instalar no Celular/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Fechar aviso de instalação/i }))
    expect(sessionStorage.getItem('pwa-banner-dismissed')).toBe('true')
  })

  it('deve aceitar o prompt de instalação no fluxo padrão', async () => {
    vi.useFakeTimers()
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (X11; Linux x86_64)')

    const { PWAInstallBanner } = await import('@/components/pwa/PWAInstallBanner')
    render(<PWAInstallBanner />)

    await act(async () => {
      await Promise.resolve()
    })

    const prompt = vi.fn().mockResolvedValue(undefined)
    const userChoice = Promise.resolve({ outcome: 'accepted' as const, platform: 'web' })
    const event = new Event('beforeinstallprompt') as Event & {
      preventDefault: () => void
      prompt: typeof prompt
      userChoice: typeof userChoice
    }
    event.preventDefault = vi.fn()
    event.prompt = prompt
    event.userChoice = userChoice

    act(() => {
      window.dispatchEvent(event)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(screen.getByRole('button', { name: /Instalar Agora/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Instalar Agora/i }))
    await act(async () => {
      await Promise.resolve()
    })

    expect(prompt).toHaveBeenCalled()
    expect(screen.queryByText(/Instalar no Celular/i)).toBeNull()
  })
})
