import { test, expect } from '@playwright/test'
import { fillInput } from './helpers'

test.describe('Tutoriais - busca e navegação', () => {
  test('happy path: busca "juntar" filtra a lista e abre o tutorial', async ({ page }) => {
    await page.goto('/tutoriais')

    // click+fill evita o race de hidratação do WebKit em inputs controlados
    await fillInput(page, 'tutorials-search-input', 'juntar')

    // Debounce de 250ms → URL com ?q=juntar (espera condicional em URL, sem sleep)
    await expect(page).toHaveURL(/\?q=juntar/, { timeout: 10_000 })

    // Ao menos um card de tutorial, e nenhum empty state
    await expect(page.getByTestId('tutorials-empty')).toHaveCount(0)
    const card = page.getByTestId(/tutorial-card-/).first()
    await expect(card).toBeVisible()

    // Navega até a página do tutorial (link "Ler tutorial completo")
    await page.getByTestId(/tutorial-read-/).first().click()
    await expect(page).toHaveURL(/\/tutoriais\//)
  })

  test('falha: busca sem resultado mostra empty state e limpeza restaura a lista', async ({ page }) => {
    await page.goto('/tutoriais')

    await fillInput(page, 'tutorials-search-input', 'zqxwv')
    await expect(page).toHaveURL(/\?q=zqxwv/, { timeout: 10_000 })

    await expect(page.getByTestId('tutorials-empty')).toBeVisible()
    await expect(page.getByTestId(/tutorial-card-/)).toHaveCount(0)

    await page.getByTestId('tutorials-clear-search').click()
    await expect(page).toHaveURL(/\/tutoriais$/, { timeout: 10_000 })
    await expect(page.getByTestId(/tutorial-card-/).first()).toBeVisible()
  })
})