// @vitest-environment jsdom

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'
import { ClientChrome } from '@/components/layout/ClientChrome'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ConsoleBranding } from '@/components/layout/ConsoleBranding'
import { EcosystemSection } from '@/components/layout/EcosystemSection'
import { ToolFlowShell } from '@/components/layout/ToolFlowShell'
import { ToolPageShell } from '@/components/layout/ToolPageShell'
import { Header } from '@/components/layout/Header'
import { LocalErrorBoundary } from '@/components/errors/LocalErrorBoundary'
import { JsonLd, generateFAQSchema, generateHowToSchema, generateOrganizationSchema, generateWebApplicationSchema, generateWebSiteSchema, generateArticleSchema, generateBreadcrumbSchema } from '@/components/seo/JsonLd'
import { OfflineBanner } from '@/components/network/OfflineBanner'
import { WebVitalsReporter } from '@/components/observability/WebVitalsReporter'
import { PromotionBanner } from '@/components/tools/PromotionBanner'
import { ToolCard } from '@/components/tools/ToolCard'
import { ToolGrid } from '@/components/tools/ToolGrid'
import { ToolRichContent } from '@/components/tools/ToolRichContent'
import { TutorialsList } from '@/components/tutorials/TutorialsList'
import { TutorialsSearchBar } from '@/components/tutorials/TutorialsSearchBar'
import { ErrorScreen } from '@/components/errors/ErrorScreen'
import { tools } from '@/config/tools'
import { tutorials } from '@/config/tutorials'
import { trackEvent } from '@/lib/analytics'
import { logError } from '@/lib/utils/logger'

const navState = vi.hoisted(() => ({
  pathname: '/tutoriais',
  search: '',
  push: vi.fn(),
  replace: vi.fn(),
}))

const webVitalsState = vi.hoisted(() => ({
  callback: undefined as undefined | ((metric: { name: string; id: string; value: number }) => void),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/dynamic', () => ({
  default: (loader: () => unknown) => {
    void loader()
    return () => null
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: navState.push, replace: navState.replace }),
  usePathname: () => navState.pathname,
  useSearchParams: () => new URLSearchParams(navState.search),
}))

vi.mock('next/web-vitals', () => ({
  useReportWebVitals: (callback: typeof webVitalsState.callback) => {
    webVitalsState.callback = callback
  },
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
    useReducedMotion: () => false,
  }
})

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}))

describe('componentes e schemas extras', () => {
  beforeEach(() => {
    navState.pathname = '/tutoriais'
    navState.search = ''
    navState.push.mockReset()
    navState.replace.mockReset()
    webVitalsState.callback = undefined
    document.body.innerHTML = ''
    document.title = 'Página de Teste'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('deve renderizar breadcrumbs e esquemas JSON-LD', () => {
    expect(Breadcrumbs({ items: [] })).toBeNull()

    render(
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Ferramentas', href: '/ferramentas' },
          { label: 'PDF para Word' },
        ]}
      />,
    )

    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/')
    expect(screen.getByText('PDF para Word').getAttribute('aria-current')).toBe('page')

    const schema = generateWebApplicationSchema({
      name: 'PDF para Word',
      description: 'Conversor',
      slug: 'pdf-para-word',
    })
    expect(schema.url).toContain('/ferramentas/pdf-para-word')
    expect(generateOrganizationSchema().logo).toContain('/icon.png')
    expect(generateWebSiteSchema().potentialAction.target).toContain('?q=')
    expect(generateFAQSchema([{ question: 'Q', answer: 'A' }]).mainEntity).toHaveLength(1)
    expect(generateArticleSchema({ title: 'T', description: 'D', slug: 's' }).headline).toBe('T')
    expect(generateHowToSchema({
      title: 'Guia',
      description: 'Passo a passo',
      slug: 'guia',
      steps: [{ title: 'Um', description: 'Dois' }],
      estimatedTime: '2 min',
    }).step).toHaveLength(1)
    expect(generateBreadcrumbSchema([{ name: 'A', url: '/' }]).itemListElement).toHaveLength(1)
  })

  it('deve anunciar navegação no ClientChrome', async () => {
    render(<ClientChrome />)

    await waitFor(() => {
      expect(screen.getByText(/Navegou para/i)).toBeTruthy()
    })
  })

  it('deve usar o título padrão quando o document.title está vazio', async () => {
    document.title = ''

    render(<ClientChrome />)

    await waitFor(() => {
      expect(screen.getByText('Navegou para Página')).toBeTruthy()
    })
  })

  it('deve abrir, filtrar, selecionar e devolver o foco no CommandPalette', async () => {
    render(<CommandPalette />)

    const trigger = screen.getByRole('button', { name: /Abrir busca/i })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = await screen.findByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')

    const input = screen.getByPlaceholderText(/Pesquisar ferramentas/i)
    fireEvent.change(input, { target: { value: 'juntar' } })

    expect(screen.getByText(/1 ferramentas encontradas/i)).toBeTruthy()
    const result = screen.getByRole('option', { name: /Juntar PDF/i })
    expect(result).toBeTruthy()

    fireEvent.mouseEnter(result)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp' })

    fireEvent.keyDown(input, { key: 'Enter' })
    expect(navState.push).toHaveBeenCalledWith('/ferramentas/juntar-pdf')

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => {
      expect(document.body.style.overflow).toBe('unset')
    })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Abrir busca/i }))
  })

  it('deve prender o foco com Tab e navegar entre elementos focáveis', async () => {
    render(<CommandPalette />)

    fireEvent.click(screen.getByRole('button', { name: /Abrir busca/i }))
    const dialog = await screen.findByRole('dialog')
    const input = screen.getByPlaceholderText(/Pesquisar ferramentas/i)

    fireEvent.change(input, { target: { value: 'juntar' } })
    const result = screen.getByRole('option', { name: /Juntar PDF/i })
    expect(result).toBeTruthy()

    const closeButton = screen.getByRole('button', { name: /Fechar busca/i })
    closeButton.focus()
    fireEvent.keyDown(closeButton, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(result)

    result.focus()
    expect(document.activeElement).toBe(result)
    fireEvent.keyDown(result, { key: 'Tab' })
    expect(document.activeElement).toBe(closeButton)
  })

  it('deve exibir o estado vazio quando não houver correspondência', async () => {
    render(<CommandPalette />)

    fireEvent.click(screen.getByRole('button', { name: /Abrir busca/i }))
    await screen.findByRole('dialog')

    const input = screen.getByPlaceholderText(/Pesquisar ferramentas/i)
    fireEvent.change(input, { target: { value: 'sem correspondencia' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(screen.getByText(/Nenhuma ferramenta encontrada/i)).toBeTruthy()
    expect(screen.getByText(/Tente buscar por termos diferentes/i)).toBeTruthy()
  })

  it('deve sair cedo do trap de Tab quando não houver focáveis', async () => {
    render(<CommandPalette />)

    fireEvent.click(screen.getByRole('button', { name: /Abrir busca/i }))
    const dialog = await screen.findByRole('dialog')
    const input = screen.getByPlaceholderText(/Pesquisar ferramentas/i)
    fireEvent.change(input, { target: { value: 'juntar' } })

    const querySelectorAllSpy = vi.spyOn(dialog, 'querySelectorAll').mockReturnValue([] as never)
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(querySelectorAllSpy).toHaveBeenCalled()
    querySelectorAllSpy.mockRestore()
  })

  it('deve alternar a paleta com o atalho Ctrl+K', async () => {
    render(<CommandPalette />)

    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toBeTruthy()

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('deve cair no fallback do LocalErrorBoundary', () => {
    const onError = vi.fn()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    function Explode() {
      throw new Error('explode')
    }

    render(
      <LocalErrorBoundary onError={onError}>
        <Explode />
      </LocalErrorBoundary>,
    )

    expect(screen.getByText(/ERRO NA FERRAMENTA/i)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(onError).toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('deve abrir e fechar o header com menus responsivos', () => {
    render(<Header />)

    fireEvent.mouseEnter(screen.getByRole('button', { name: /Ferramentas/i }))
    expect(screen.getByRole('button', { name: /Ferramentas/i }).getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: /Abrir menu/i }))
    expect(screen.getByRole('button', { name: /Fechar menu/i })).toBeTruthy()
    expect(screen.getByRole('dialog', { name: /Menu móvel/i })).toBeTruthy()

    fireEvent.click(screen.getAllByRole('button', { name: /Ferramentas/i })[1])
    fireEvent.click(screen.getByRole('button', { name: /Fechar menu/i }))
    expect(screen.getByRole('button', { name: /Abrir menu/i })).toBeTruthy()
  })

  it('deve registrar o console branding e o vitals reporter', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    render(<ConsoleBranding />)
    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()

    render(<WebVitalsReporter />)
    expect(webVitalsState.callback).toBeTypeOf('function')
    webVitalsState.callback?.({ name: 'LCP', id: 'v1', value: 123.6 })
    expect(trackEvent).toHaveBeenCalledWith({
      action: 'LCP',
      category: 'web-vitals',
      label: 'v1',
      value: 124,
    })
  })

  it('deve renderizar seções estáticas e cards de ferramentas', () => {
    render(
      <>
        <EcosystemSection />
        <ToolFlowShell>
          <div>Conteúdo</div>
        </ToolFlowShell>
        <ToolPageShell title="Título" description="Descrição" topTrust={<span>Topo</span>} bottomTrust={<span>Base</span>}>
          <span>Corpo</span>
        </ToolPageShell>
        <PromotionBanner />
        <ToolCard tool={tools[0]} />
        <ToolGrid />
        <ToolRichContent
          toolName="Juntar PDF"
          toolSlug="juntar-pdf"
          description="Desc"
          benefits={[{ title: 'Benefício', text: 'Texto' }]}
          useCases={[{ title: 'Caso', text: 'Texto' }]}
          faq={[{ question: 'Pergunta', answer: 'Resposta' }]}
          tutorialSlug="como-juntar-pdf"
        />
      </>,
    )

    expect(screen.getByText(/O ECOSSISTEMA/i)).toBeTruthy()
    expect(screen.getByText('Conteúdo')).toBeTruthy()
    expect(screen.getByText('Título')).toBeTruthy()
    expect(screen.getByText(/PRECISA DE SOFTWARE/i)).toBeTruthy()
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0)
    expect(screen.getByText(/Tudo sobre Juntar PDF Online/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Ver Tutorial Passo a Passo/i }).getAttribute('href')).toBe('/tutoriais/como-juntar-pdf')
  })

  it('deve listar e filtrar tutoriais e atualizar a busca', async () => {
    render(<TutorialsList tutorials={tutorials.slice(0, 2)} query="juntar" />)
    expect(screen.getByText(/Mostrando 1 resultados/i)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Como juntar PDF sem instalar programas/i })).toBeTruthy()

    render(<TutorialsList tutorials={tutorials.slice(0, 1)} query="sem-match" />)
    expect(screen.getByText(/Nenhum tutorial encontrado/i)).toBeTruthy()

    vi.useFakeTimers()
    render(<TutorialsSearchBar initialQuery="" />)
    fireEvent.change(screen.getByPlaceholderText(/PESQUISAR TUTORIAL/i), { target: { value: 'juntar' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(navState.replace).toHaveBeenCalledWith('/tutoriais?q=juntar', { scroll: false })
  })

  it('deve exibir offline banner e a tela de erro com retry', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('x', { status: 500 })))
    render(<OfflineBanner />)

    await act(async () => {
      vi.advanceTimersByTime(1)
      await Promise.resolve()
    })

    expect(screen.getByText(/VOCÊ ESTÁ OFFLINE/i)).toBeTruthy()

    const onRetry = vi.fn()
    render(<ErrorScreen title="Falha" message="Tente novamente." onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }))
    expect(onRetry).toHaveBeenCalled()
  })

  it('deve renderizar o JsonLd com escape seguro', () => {
    const { container } = render(<JsonLd data={{ title: '<script>&' }} />)
    const script = container.querySelector('script')
    expect(script).toBeTruthy()
    expect(script?.innerHTML).toContain('\\u003cscript\\u003e\\u0026')
  })

  it('deve renderizar o layout genérico', () => {
    render(
      <ToolFlowShell className="extra">
        <span>Shell</span>
      </ToolFlowShell>,
    )

    expect(screen.getByText('Shell')).toBeTruthy()
  })
})
