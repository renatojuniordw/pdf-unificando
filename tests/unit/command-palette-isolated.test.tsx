// @vitest-environment jsdom

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('framer-motion', () => {
  const passthrough = (tag: string) =>
    function MotionComponent({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) {
      return React.createElement(tag as React.ElementType, props, children)
    }

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: passthrough('div'),
      button: passthrough('button'),
    },
    useReducedMotion: () => false,
  }
})

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react')
  return {
    ...actual,
    useState: vi.fn(),
  }
})

describe('CommandPalette isolado', () => {
  it('deve renderizar aberto e permitir selecionar ou exibir vazio', async () => {
    const ReactModule = await import('react')
    const useStateMock = vi.mocked(ReactModule.useState)
    const push = vi.fn()

    vi.doMock('next/navigation', () => ({
      useRouter: () => ({ push }),
    }))

    useStateMock
      .mockImplementationOnce(() => [true, vi.fn()] as never)
      .mockImplementationOnce(() => ['juntar', vi.fn()] as never)
      .mockImplementationOnce(() => [0, vi.fn()] as never)

    vi.resetModules()
    const { CommandPalette } = await import('@/components/layout/CommandPalette')
    render(<CommandPalette />)

    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByPlaceholderText(/Pesquisar ferramentas/i)).toBeTruthy()
    expect(screen.getByRole('option', { name: /Juntar PDF/i })).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')

    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    fireEvent.keyDown(screen.getByPlaceholderText(/Pesquisar ferramentas/i), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByPlaceholderText(/Pesquisar ferramentas/i), { key: 'ArrowUp' })
    fireEvent.keyDown(screen.getByPlaceholderText(/Pesquisar ferramentas/i), { key: 'Enter' })
    fireEvent.mouseEnter(screen.getByRole('option', { name: /Juntar PDF/i }))
    fireEvent.click(screen.getByRole('option', { name: /Juntar PDF/i }))
    expect(push).toHaveBeenCalledWith('/ferramentas/juntar-pdf')
    fireEvent.click(screen.getByRole('button', { name: /Fechar busca/i }))

    useStateMock.mockReset()
    useStateMock
      .mockImplementationOnce(() => [true, vi.fn()] as never)
      .mockImplementationOnce(() => ['xyz', vi.fn()] as never)
      .mockImplementationOnce(() => [0, vi.fn()] as never)

    vi.resetModules()
    const { CommandPalette: EmptyCommandPalette } = await import('@/components/layout/CommandPalette')
    render(<EmptyCommandPalette />)
    expect(screen.getByText(/Nenhuma ferramenta encontrada/i)).toBeTruthy()
  })
})
