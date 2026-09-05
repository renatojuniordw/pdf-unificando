import { test, expect } from '@playwright/test'
import { uploadFiles } from './helpers'

test.describe('PDF Tools - E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve carregar a home e exibir ferramentas', async ({ page }) => {
    await expect(page).toHaveTitle(/Unificando|PDF/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /Comprimir PDF/i })).toBeVisible()
  })

  test('deve navegar para uma ferramenta a partir da home', async ({ page }) => {
    await page.getByRole('link', { name: /Comprimir PDF/i }).click()

    await expect(page).toHaveURL(/\/ferramentas\/comprimir-pdf/)
    await expect(page.getByText(/ARRASTE OU CLIQUE/i)).toBeVisible()
  })

  test('deve abrir o menu mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()

    const menuButton = page.getByRole('button', { name: 'Menu' })
    await expect(menuButton).toBeVisible()
    await menuButton.click()

    await expect(page.locator('#mobile-menu')).toBeVisible()
    await expect(page.locator('#mobile-menu').getByRole('link', { name: /Privacidade/i })).toBeVisible()
  })

  test('deve mostrar o banner de privacidade em página de ferramenta', async ({ page }) => {
    await page.goto('/ferramentas/juntar-pdf')

    await expect(page.getByText(/SEUS ARQUIVOS NÃO SÃO ARMAZENADOS/i).first()).toBeVisible()
  })

  test('deve concluir o fluxo feliz de compressão com resposta simulada', async ({ page }) => {
    await page.route('**/api/pdf/compress', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="saida.pdf"',
        },
        body: '%PDF-1.4\n%mock',
      })
    })

    await page.goto('/ferramentas/comprimir-pdf')

    // Upload via filechooser real (evita corrida de hidratação com setInputFiles direto)
    await uploadFiles(page, ['sample.pdf'])

    await expect(page.getByText(/ARQUIVO COMPRIMIDO/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /BAIXAR ARQUIVO/i })).toBeVisible()
  })

  test('deve exibir erro quando a API responde com falha', async ({ page }) => {
    await page.route('**/api/pdf/compress', async (route) => {
      await route.fulfill({
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Falha simulada',
            retryable: false,
          },
        }),
      })
    })

    await page.goto('/ferramentas/comprimir-pdf')

    // Upload via filechooser real (evita corrida de hidratação com setInputFiles direto)
    await uploadFiles(page, ['sample.pdf'])

    await expect(page.getByText(/Falha simulada/i)).toBeVisible()
  })
})
