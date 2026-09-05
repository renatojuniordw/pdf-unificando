import { test, expect } from '@playwright/test'
import { expectSuccessDownload, fillInput, mockPdfRoute, uploadFiles } from './helpers'

test.describe('Proteger PDF - senha forte', () => {
  test.beforeEach(async ({ page }) => {
    await mockPdfRoute(page, '**/api/pdf/protect')
    await page.goto('/ferramentas/proteger-pdf')
  })

  test('happy path: senha forte + confirmação protege e baixa o PDF', async ({ page }) => {
    const password = 'Tr0v4!Segur@nça'
    // click+fill evita o race de hidratação do WebKit em inputs controlados
    await fillInput(page, 'protect-password-input', password)
    await fillInput(page, 'protect-password-confirm-input', password)

    // Alterna visibilidade: campo vira texto
    await page.getByTestId('protect-password-toggle').click()
    await expect(page.getByTestId('protect-password-input')).toHaveAttribute('type', 'text')

    await uploadFiles(page, ['sample.pdf'])
    await expectSuccessDownload(page)
  })

  test('falha: senhas divergentes mostram erro e bloqueiam o processamento', async ({ page }) => {
    await fillInput(page, 'protect-password-input', 'Tr0v4!Segur@nça')
    await fillInput(page, 'protect-password-confirm-input', 'Tr0v4!Segur@ncx')

    await expect(page.getByTestId('protect-password-error')).toBeVisible()
    // DropZone desabilitada impede o upload: nenhum download deve surgir
    await expect(page.getByTestId('upload-zone-drop')).toBeDisabled()
    await expect(page.getByTestId('download-button-link')).toHaveCount(0)
  })
})