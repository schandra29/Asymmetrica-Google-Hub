import { defineConfig, devices } from '@playwright/test';

/**
 * 🐛 Debug Playwright Configuration for AsymmBill
 * Minimal config to troubleshoot issues
 */

export default defineConfig({
  testDir: './tests/smoke',
  
  // Simplified settings for debugging
  fullyParallel: false, // Run tests sequentially for easier debugging
  forbidOnly: false,    // Allow .only() for focused testing
  retries: 0,           // No retries during debugging
  workers: 1,           // Single worker to avoid race conditions
  
  // Simple reporter
  reporter: 'line',
  
  // Debug-friendly settings
  use: {
    // Try without baseURL first
    // baseURL: 'http://localhost:3000',
    
    // Debugging helpers
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    
    // Longer timeouts for debugging
    actionTimeout: 10000,
    navigationTimeout: 15000,
    
    // Show browser for visual debugging
    headless: false,
    // slowMo not available in this config structure
  },

  // Single browser for debugging
  projects: [
    {
      name: 'chromium-debug',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // No global setup/teardown to keep it simple
});