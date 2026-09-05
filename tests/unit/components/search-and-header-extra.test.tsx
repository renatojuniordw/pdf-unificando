// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Header } from '@/components/layout/Header'
import { TutorialsSearchBar } from '@/components/tutorials/TutorialsSearchBar'

const navState = vi.hoisted(() => ({
  pathname: '/tutoriais',
  search: '',
  push: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navState.push, replace: navState.replace }),
  usePathname: () => navState.pathname,
  useSearchParams: () => new URLSearchParams(navState.search),
}))

describe('Header (dropdown extras)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
    navState.pathname = '/tutoriais'
    navState.search = ''
  })

  it('HEADER_DesktopToolLinkClick_ClosesDropdown', () => {
    render(<Header />)
    const desktopToolsButton = screen.getAllByRole('button', { name: /Ferramentas/i })[0]
    fireEvent.mouseEnter(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('link', { name: /Juntar PDF/i }))
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('false')
  })

  it('HEADER_DesktopButtonClick_TogglesDropdown', () => {
    render(<Header />)
    const desktopToolsButton = screen.getAllByRole('button', { name: /Ferramentas/i })[0]
    fireEvent.click(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('false')
  })

  it('HEADER_MouseLeave_ClosesDropdown', () => {
    render(<Header />)
    const desktopToolsButton = screen.getAllByRole('button', { name: /Ferramentas/i })[0]
    fireEvent.mouseEnter(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.mouseLeave(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('false')
  })

  it('HEADER_ClickOutside_ClosesDropdownAndRefocusesButton', () => {
    render(<Header />)
    const desktopToolsButton = screen.getAllByRole('button', { name: /Ferramentas/i })[0]
    fireEvent.mouseEnter(desktopToolsButton)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.mouseDown(document.body)
    expect(desktopToolsButton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(desktopToolsButton)
  })
})

describe('TutorialsSearchBar (query edge cases)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navState.pathname = '/tutoriais'
    navState.search = ''
    vi.useFakeTimers()
  })

  it('SEARCH_ValueEqualsInitial_DoesNotReplace', async () => {
    render(<TutorialsSearchBar initialQuery="juntar" />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(navState.replace).not.toHaveBeenCalled()
  })

  it('SEARCH_ClearingQuery_DeletesQParam', async () => {
    const { container } = render(<TutorialsSearchBar initialQuery="juntar" />)
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(navState.replace).toHaveBeenCalledWith('/tutoriais', { scroll: false })
  })
})