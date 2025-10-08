import { defineConfig, devices } from '@playwright/test';

/**
 * AsymmBill Playwright MCP Configuration
 * LLM-native, accessibility-driven testing for 2025
 * 
 * Coverage Goals:
 * - UI/UX Flows: 95%+
 * - Form Logic & Validation: 100%
 * - Dynamic Rendering: 90%+
 * - Compliance & Localization: 100%
 * - Session Fidelity: 100%
 * - Performance & Accessibility: 90%+
 */

// Conditional web server array allows NO_WEB_SERVER=1 to bypass auto launch (useful for debugging startup hangs)
const webServer = process.env.NO_WEB_SERVER ? [] : [
  {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  {
    command: 'npm run htx:server',
    url: 'http://localhost:3001/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  }
];

// Optional diagnostic reporter injection
const baseReporters: any[] = [
  ['html', { outputFolder: 'playwright-report' }],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/junit.xml' }]
];
if (process.env.DIAG_REPORTER) {
  baseReporters.unshift(['line']);
  baseReporters.push([require.resolve('./tests/utils/diagnostic-reporter.ts')]);
}

export default defineConfig({
  // Test directory structure
  testDir: './tests',
  
  // Global test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration for comprehensive coverage
  reporter: baseReporters,

  // Global test settings
  use: {
    // Base URL for AsymmBill
    baseURL: 'http://localhost:3000',
    
    // Tracing and debugging
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
    // MCP-specific settings
    actionTimeout: 15000,
    navigationTimeout: 20000,
    
    // Accessibility and semantic testing
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // Global per‑test timeout (acts as guard against silent hangs)
  timeout: 45000,

  // Projects for comprehensive browser coverage
  projects: [
    // Desktop browsers
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // MCP semantic viewport
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Mobile devices for responsive testing
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // RTL and localization testing
    {
      name: 'rtl-testing',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-AE',
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Performance and accessibility auditing
    {
      name: 'accessibility-audit',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
      testMatch: '**/accessibility/**/*.spec.ts'
    }
  ],

  // Development server configuration
  webServer,

  // Global setup and teardown
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),

  // Test output directories
  outputDir: 'test-results/',
  
  // Expect configuration for semantic assertions
  expect: {
    // Longer timeouts for semantic operations
    timeout: 10000,
    toHaveScreenshot: { threshold: 0.2 },
    toMatchSnapshot: { threshold: 0.2 }
  }
});