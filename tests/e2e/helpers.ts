import { expect, type Page } from '@playwright/test'
import path from 'path'

/** Resolve um fixture em tests/fixtures a partir de qualquer spec em tests/e2e. */
export const fixture = (name: string): string => path.join(__dirname, '../fixtures', name)

/**
 * Passo compartilhado: envia arquivos pelo DropZone.
 * Usa o clique no alvo (role=button) + filechooser real — evita corrida de
 * hidratação/re-render onde setInputFiles no nó antigo perdia o evento change.
 */
export async function uploadFiles(page: Page, files: string[]): Promise<void> {
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByTestId('upload-zone-drop').click()
  const chooser = await chooserPromise
  await chooser.setFiles(files.map((f) => fixture(f)))
}

/** Asserção compartilhada de sucesso: link de download + reset visíveis. */
export async function expectSuccessDownload(page: Page): Promise<void> {
  await expect(page.getByTestId('download-button-link')).toBeVisible()
  await expect(page.getByTestId('download-reset')).toBeVisible()
}

/**
 * Preenche um input controlado de forma robusta em todos os browsers.
 * O `click()` é um gesto real do usuário que resolve só quando o elemento está
 * acionável — o que, em páginas recém-carregadas, acontece APÓS a hidratação do
 * React anexar os handlers. Evita o race de hidratação do WebKit, onde um
 * `fill()` direto no 1º input não dispara `onChange` (estado fica vazio).
 */
export async function fillInput(page: Page, testid: string, value: string): Promise<void> {
  const locator = page.getByTestId(testid)
  await locator.click()
  await locator.fill(value)
}

/** Mocka uma rota de API própria que retorna PDF (usado quando a UI real basta). */
export async function mockPdfRoute(
  page: Page,
  url: string,
  options: { status?: number; disposition?: string } = {},
): Promise<void> {
  const { status = 200, disposition = 'saida.pdf' } = options
  await page.route(url, async (route) => {
    await route.fulfill({
      status,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${disposition}"`,
      },
      body: '%PDF-1.4\n%mock',
    })
  })
}