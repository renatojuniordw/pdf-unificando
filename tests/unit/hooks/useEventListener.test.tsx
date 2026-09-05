// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEventListener } from '@/hooks/useEventListener'

describe('hooks/useEventListener', () => {
  it('EVENT_AddsListenerOnMount_RemovesOnUnmount', () => {
    const target = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as EventTarget
    const listener = () => {}
    const { unmount } = renderHook(() => useEventListener(target, 'click', listener))

    expect(target.addEventListener).toHaveBeenCalledWith('click', listener, undefined)

    unmount()
    expect(target.removeEventListener).toHaveBeenCalledWith('click', listener, undefined)
  })

  it('EVENT_ForwardsOptionsToAddAndRemove', () => {
    const target = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as EventTarget
    const listener = () => {}
    const { unmount } = renderHook(() => useEventListener(target, 'scroll', listener, { passive: true }))

    expect(target.addEventListener).toHaveBeenCalledWith('scroll', listener, { passive: true })
    unmount()
    expect(target.removeEventListener).toHaveBeenCalledWith('scroll', listener, { passive: true })
  })

  it('EVENT_NullTarget_NoOpWithoutError', () => {
    expect(() =>
      renderHook(() => useEventListener(null, 'click', () => {})),
    ).not.toThrow()
  })
})