import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 5173);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      // Reuses the Chrome already present in the environment instead of
      // downloading a Playwright browser bundle on every install.
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
