import { defineConfig, devices } from '@playwright/test';

/**
 * UX Sonar Playwright Configuration
 *
 * Specialized config for animation telemetry capture via Chrome DevTools Protocol (CDP).
 * This configuration optimizes for:
 * - Single-threaded execution (deterministic telemetry)
 * - Chromium only (CDP support)
 * - No retries (accurate performance metrics)
 * - Extended timeouts (allow animations to complete)
 */

export default defineConfig({
  testDir: './tests/ux-sonar',
  fullyParallel: false, // Sequential execution for consistent telemetry
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries - we want accurate metrics
  workers: 1, // Single worker for deterministic results

  reporter: [
    ['html', { outputFolder: 'ux-sonar-report' }],
    ['json', { outputFile: 'ux-sonar-results/results.json' }],
    ['list'] // Console output for immediate feedback
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Extended timeouts for animation capture
    actionTimeout: 20000,
    navigationTimeout: 30000,
  },

  // Global test timeout (animations need time)
  timeout: 60000,

  // Chromium only - CDP support required
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Disable parallel execution
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
            '--enable-features=NetworkService,NetworkServiceInProcess'
          ]
        }
      },
    },
  ],

  // Development server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Output directories
  outputDir: 'ux-sonar-results/',

  // Expect configuration
  expect: {
    timeout: 15000,
  }
});
