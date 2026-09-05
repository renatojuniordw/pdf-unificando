import { defineConfig, devices } from '@playwright/test'

/**
 * E2E autocontido: o webServer SEMPRE sobe a aplicação (next dev) na porta
 * dedicada E2E_TEST_PORT (3100). Não reutiliza servidores externos — o fluxo de
 * produção em Docker ocupa a 11005 e pode estar desatualizado, causando
 * seletores ausentes. Rodar `npm run test:e2e` funciona sem nada iniciado.
 */
const E2E_PORT = Number(process.env.E2E_TEST_PORT ?? 3100)
const BASE_URL = `http://localhost:${E2E_PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Consentimento pré-aceito nos testes E2E para o banner não interceptar ações
    // (o spec consent.spec.ts sobrescreve com storageState vazio).
    storageState: {
      cookies: [],
      origins: [
        {
          origin: BASE_URL,
          localStorage: [{ name: 'unificando-consent', value: 'accepted' }],
        },
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${E2E_PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})