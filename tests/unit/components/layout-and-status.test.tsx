// @vitest-environment jsdom

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorScreen } from '@/components/errors/ErrorScreen'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { PrivacyBanner } from '@/components/tools/PrivacyBanner'
import { ProcessingStatus } from '@/components/processing/ProcessingStatus'
import { RetryCountdown } from '@/components/processing/RetryCountdown'
import { DownloadButton } from '@/components/processing/DownloadButton'
import { StateBanner } from '@/components/shared/StateBanner'
import { ChoiceGroup } from '@/components/shared/ChoiceGroup'
import { PageRangeField } from '@/components/shared/PageRangeField'
import { TextPreviewPanel } from '@/components/shared/TextPreviewPanel'
import { trackToolDownload } from '@/lib/analytics'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
      span: passthrough('span'),
      button: passthrough('button'),
    },
  }
})

vi.mock('@/lib/analytics', () => ({
  trackToolDownload: vi.fn(),
}))

describe('componentes de layout e status', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('deve renderizar header e abrir o menu mobile', () => {
    render(<Header />)

    const button = screen.getByRole('button', { name: 'Abrir menu' })
    expect(button.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(document.getElementById('mobile-menu')).toBeTruthy()
  })

  it('deve renderizar footer com links importantes', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: /Tutoriais/i }).getAttribute('href')).toBe('/tutoriais')
    expect(screen.getByRole('link', { name: /Privacidade/i }).getAttribute('href')).toBe('/privacidade')
  })

  it('deve exibir o banner de privacidade', () => {
    render(<PrivacyBanner />)

    expect(screen.getByText(/seus arquivos não são armazenados/i)).toBeTruthy()
    expect(screen.getByText(/Processados em memória/i)).toBeTruthy()
  })

  it('deve mostrar os estados de processamento', () => {
    const { rerender } = render(<ProcessingStatus status="uploading" />)
    expect(screen.getByText(/ENVIANDO/i)).toBeTruthy()

    rerender(<ProcessingStatus status="processing" />)
    expect(screen.getByText(/PROCESSANDO/i)).toBeTruthy()
  })

  it('deve renderizar o countdown e liberar retry ao final', () => {
    const onRetry = vi.fn()
    const { rerender } = render(<RetryCountdown secondsLeft={3} progress={0.5} onRetry={onRetry} />)

    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /Tentar novamente/i })).toBeNull()

    rerender(<RetryCountdown secondsLeft={0} progress={1} onRetry={onRetry} />)
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeTruthy()
  })

  it('deve acionar tracking ao baixar', () => {
    const onReset = vi.fn()
    render(
      <DownloadButton
        url="blob:arquivo"
        filename="saida.pdf"
        toolName="comprimir-pdf"
        fileSize={1536}
        onReset={onReset}
      />,
    )

    fireEvent.click(screen.getByRole('link', { name: /Baixar arquivo/i }))
    expect(onReset).not.toHaveBeenCalled()
    expect(trackToolDownload).toHaveBeenCalledWith('comprimir-pdf', 'saida.pdf')
  })

  it('deve renderizar a tela de erro com ação de retorno', () => {
    const onRetry = vi.fn()
    render(
      <ErrorScreen
        title="Algo falhou"
        message="Não foi possível concluir a ação."
        onRetry={onRetry}
      />,
    )

    expect(screen.getByText(/Algo falhou/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('deve renderizar banners de estado compartilhados', () => {
    const onAction = vi.fn()
    render(
      <StateBanner
        tone="success"
        title="Tudo certo"
        message="Arquivo pronto"
        actionLabel="Refazer"
        onAction={onAction}
      />,
    )

    expect(screen.getByText(/Tudo certo/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Refazer/i }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('deve permitir escolher opções reutilizáveis', () => {
    const onChange = vi.fn()
    render(
      <ChoiceGroup
        label="DPI"
        value="150"
        onChange={onChange}
        options={[
          { value: '72', label: '72 DPI' },
          { value: '150', label: '150 DPI' },
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('radio', { name: /72 DPI/i }))
    expect(onChange).toHaveBeenCalledWith('72')
  })

  it('deve exibir o painel de texto com cópia', async () => {
    const clipboardWrite = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWrite,
      },
    })

    render(<TextPreviewPanel title="TEXTO EXTRAÍDO" text="um dois tres" />)

    expect(screen.getByText(/TEXTO EXTRAÍDO/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Copiar/i }))
    expect(clipboardWrite).toHaveBeenCalledWith('um dois tres')
  })

  it('deve renderizar campos de intervalo compartilhados', () => {
    const onChange = vi.fn()
    render(
      <PageRangeField
        label="PÁGINAS"
        value="1-3"
        onChange={onChange}
        hint="Use vírgulas"
        error="Erro de teste"
      />,
    )

    expect(screen.getByText(/Erro de teste/i)).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '2-4' } })
    expect(onChange).toHaveBeenCalledWith('2-4')
  })
})
