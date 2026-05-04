import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('PDF Tools - E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve carregar home e exibir ferramentas', async ({ page }) => {
    // Verificar título
    await expect(page).toHaveTitle(/Unificando|PDF/)

    // Verificar hero section
    const hero = page.locator('h1')
    await expect(hero).toBeVisible()

    // Verificar grid de ferramentas
    const toolCards = page.locator('[data-testid="tool-card"]')
    const count = await toolCards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('deve navegar para página de ferramenta', async ({ page }) => {
    // Clicar em um card de ferramenta (primeiro disponível)
    const firstCard = page.locator('[data-testid="tool-card"]').first()
    await firstCard.click()

    // Verificar se a página mudou
    expect(page.url()).toContain('/ferramentas/')

    // Verificar presença de seções esperadas
    const dropzone = page.locator('[data-testid="dropzone"]')
    await expect(dropzone).toBeVisible()
  })

  test('deve fazer upload de arquivo via DropZone', async ({ page }) => {
    // Ir para página de ferramenta
    await page.goto('/ferramentas/comprimir-pdf')

    // Preparar arquivo de teste
    const testFile = path.join(__dirname, '../../fixtures/sample.pdf')

    // Fazer upload via input
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testFile)

    // Verificar se arquivo aparece na fila
    const fileQueue = page.locator('[data-testid="file-queue-item"]')
    await expect(fileQueue).toBeVisible()
  })

  test('deve exibir PrivacyBanner em página de ferramenta', async ({ page }) => {
    await page.goto('/ferramentas/juntar-pdf')

    const privacyBanner = page.locator('[data-testid="privacy-banner"]')
    await expect(privacyBanner).toBeVisible()

    // Verificar texto importante
    const text = await privacyBanner.textContent()
    expect(text).toContain('ARMAZENADO')
  })

  test('deve exibir Header e Footer em todas as páginas', async ({ page }) => {
    await page.goto('/')

    // Verificar Header
    const header = page.locator('[data-testid="header"]')
    await expect(header).toBeVisible()

    // Verificar Footer
    const footer = page.locator('[data-testid="footer"]')
    await expect(footer).toBeVisible()
  })

  test('deve navegar para página de privacidade', async ({ page }) => {
    // Página inicial
    await page.goto('/')

    // Clicar no link de privacidade no footer
    const privacyLink = page.locator('a[href="/privacidade"]')
    await privacyLink.click()

    // Verificar se está na página correta
    expect(page.url()).toContain('/privacidade')

    // Verificar conteúdo
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  test('deve verificar responsividade - menu mobile', async ({ page }) => {
    // Viewport mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Verificar se hamburger menu existe
    const hamburger = page.locator('[data-testid="mobile-menu-toggle"]')
    await expect(hamburger).toBeVisible()

    // Clicar para abrir menu
    await hamburger.click()

    // Verificar se menu está visível
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()
  })
})

test.describe('PDF Processing - Feature Tests', () => {
  test('deve processar arquivo de upload (compress)', async ({ page }) => {
    await page.goto('/ferramentas/comprimir-pdf')

    const testFile = path.join(__dirname, '../../fixtures/sample.pdf')

    // Upload
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testFile)

    // Verificar se arquivo aparece na fila
    const fileQueue = page.locator('[data-testid="file-queue-item"]')
    await expect(fileQueue).toBeVisible()

    // Clicar em processar
    const processButton = page.locator('[data-testid="process-button"]')
    if (await processButton.isVisible()) {
      await processButton.click()

      // Esperar pelo estado de processamento
      const statusText = page.locator('[data-testid="processing-status"]')
      await expect(statusText).toBeVisible()
    }
  })

  test('deve restringir upload para arquivos PDF', async ({ page }) => {
    await page.goto('/ferramentas/comprimir-pdf')

    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).toHaveAttribute('accept', '.pdf')
  })
})
