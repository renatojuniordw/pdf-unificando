import { test, expect } from '@playwright/test'
import { expectSuccessDownload, mockPdfRoute, uploadFiles } from './helpers'

test.describe('Juntar PDF - fila de múltiplos arquivos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ferramentas/juntar-pdf')
    // Garante que o bundle JS terminou de carregar antes de disparar o upload
    // (evita corrida de hidratação em dev cold: handler de onChange ainda não anexado)
    await page.waitForLoadState('load')
  })

  test('happy path: adiciona, reordena, remove, desfaz e baixa o PDF unido', async ({ page }) => {
    await mockPdfRoute(page, '**/api/pdf/merge')
    await uploadFiles(page, ['small.pdf', 'sample.pdf'])

    await expect(page.getByTestId('file-queue-item')).toHaveCount(2, { timeout: 20_000 })

    // Reordena: segundo item para cima (usa aria-label com nome do arquivo no drag handle)
    const firstDrag = page.getByTestId('file-queue-item').first().getByTestId('file-queue-drag')
    await expect(firstDrag).toBeVisible()
    await page.getByTestId('file-queue-item').nth(1).getByTestId('file-queue-move-up').click()

    // Remove o primeiro item e desfaz
    await page.getByTestId('file-queue-item').first().getByTestId('file-queue-item-remove').click()
    await expect(page.getByTestId('file-queue-removed-status')).toBeVisible()
    await page.getByTestId('file-queue-undo').click()
    await expect(page.getByTestId('file-queue-item')).toHaveCount(2, { timeout: 15_000 })

    await page.getByRole('button', { name: /JUNTAR|UNIR/i }).click()
    await expectSuccessDownload(page)
  })

  test('falha: API responde 413 e mostra banner de erro com tentar novamente', async ({ page }) => {
    await page.route('**/api/pdf/merge', async (route) => {
      await route.fulfill({
        status: 413,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: { code: 'FILE_TOO_LARGE', message: 'Arquivo grande demais.', retryable: false },
        }),
      })
    })

    await uploadFiles(page, ['large.pdf', 'sample.pdf'])
    await page.getByRole('button', { name: /JUNTAR|UNIR/i }).click()

    await expect(page.getByTestId('state-banner-error')).toBeVisible()
    await expect(page.getByTestId('state-banner-action')).toHaveText(/Tentar novamente/i)
    await expect(page.getByTestId('download-button-link')).toHaveCount(0)
  })
})