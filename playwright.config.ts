import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:11005',
    trace: 'on-first-retry',
    // Consentimento pré-aceito nos testes E2E para o banner não interceptar ações
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:11005',
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
    command: 'npm run dev',
    url: 'http://localhost:11005',
    reuseExistingServer: !process.env.CI,
  },
})
