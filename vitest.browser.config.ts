import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    browser: {
      enabled: true,
      instances: [
        {
          browser: 'chromium',
          provider: playwright(),
        },
      ],
      headless: true,
      screenshotFailures: false,
    },
    setupFiles: ['./src/test/setup.browser.ts'],
    include: ['**/*.browser.test.{ts,tsx}'],
  },
})
