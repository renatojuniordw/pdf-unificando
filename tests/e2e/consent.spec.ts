import { test, expect } from '@playwright/test'

// Este spec valida a jornada LGPD e NÃO herda o storageState do config
// (que pré-aceita o consentimento). Limpeza explícita por teste.
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Consentimento de cookies (LGPD)', () => {
  test('happy path: aceitar oculta o banner e persiste a preferência', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('consent-banner')).toBeVisible()
    await page.getByTestId('consent-accept').click()

    await expect(page.getByTestId('consent-banner')).toHaveCount(0)
    const stored = await page.evaluate(() => window.localStorage.getItem('unificando-consent'))
    expect(stored).toBe('accepted')
  })

  test('alternativa: recusar oculta o banner e não injeta scripts de terceiros', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('consent-banner')).toBeVisible()

    await page.getByTestId('consent-reject').click()
    await expect(page.getByTestId('consent-banner')).toHaveCount(0)

    const stored = await page.evaluate(() => window.localStorage.getItem('unificando-consent'))
    expect(stored).toBe('rejected')

    // Anti-flakiness: asserta presença no DOM, sem depender de resposta de rede externa.
    const hasTracking = await page.evaluate(() => {
      const html = document.head.innerHTML + document.body.innerHTML
      return /googletagmanager|gtag|connect\.facebook|adsbygoogle/.test(html)
    })
    expect(hasTracking).toBe(false)
  })
})