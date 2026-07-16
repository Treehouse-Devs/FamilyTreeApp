import { defineConfig } from '@playwright/test'

const STAGING_URL = 'https://api-treely.arkaes.dev'
const target = process.env.STAGING_API_URL ?? STAGING_URL

if (target !== STAGING_URL) {
  throw new Error(`Staging API e2e target must be exactly ${STAGING_URL}`)
}

export default defineConfig({
  testDir: './test/staging-api',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: 0,
  timeout: 30_000,
  outputDir: 'test-results/staging-api/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results/staging-api/html', open: 'never' }],
    ['junit', { outputFile: 'test-results/staging-api/junit.xml' }],
    ['json', { outputFile: 'test-results/staging-api/results.json' }],
  ],
  use: {
    baseURL: target,
    ignoreHTTPSErrors: false,
  },
})
