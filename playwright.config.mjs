import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.PORTAL_E2E_URL,
    browserName: process.env.PLAYWRIGHT_BROWSER ?? 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
});
