import { test, expect } from '@playwright/test'
import { expectSuccessDownload, mockPdfRoute, uploadFiles } from './helpers'

test.describe('Redigir PDF - fluxo de censura por busca', () => {
  test.beforeEach(async ({ page }) => {
    // Busca e aplicação mockadas (estabilidade); preview usa o backend real local.
    await mockPdfRoute(page, '**/api/pdf/redact')
    await page.route('**/api/pdf/redact/search', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regions: [{ page: 0, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }],
        }),
      })
    })
    await page.goto('/ferramentas/redigir-pdf')
  })

  test('happy path: busca termo (CPF), aplica e baixa o PDF censurado', async ({ page }) => {
    await uploadFiles(page, ['sample.pdf'])

    // Aguarda o editor (renderização do preview via PDF.js)
    await expect(page.getByTestId('redact-search-input')).toBeVisible({ timeout: 20_000 })

    await page.getByTestId('redact-search-input').fill('39284761508')
    await page.getByTestId('redact-search-submit').click()

    // Busca retorna 1 região → contador/marcas no editor (sem navegar de tela)
    await expect(page.getByRole('button', { name: /Aplicar Alterações/i })).toBeVisible()

    await page.getByRole('button', { name: /Aplicar Alterações/i }).click()

    await expectSuccessDownload(page)
  })

  test('falha: busca com resposta de erro mostra aviso e não aplica', async ({ page }) => {
    // Sobrescreve o mock do beforeEach: busca responde 422 (não-retryable, erro imediato)
    await page.unroute('**/api/pdf/redact/search')
    await page.route('**/api/pdf/redact/search', async (route) => {
      await route.fulfill({
        status: 422,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Falha simulada', retryable: false },
        }),
      })
    })

    await uploadFiles(page, ['sample.pdf'])
    await expect(page.getByTestId('redact-search-input')).toBeVisible({ timeout: 20_000 })

    await page.getByTestId('redact-search-input').fill('inexistentetermo')
    await page.getByTestId('redact-search-submit').click()

    // Mensagem de erro da busca visível (exact: evita o overlay de erro do Next dev)
    await expect(page.getByText('Falha simulada', { exact: true })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByTestId('redact-search-input')).toBeVisible()
    await expect(page.getByTestId('download-button-link')).toHaveCount(0)
  })
})