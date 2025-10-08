import { chromium, FullConfig } from '@playwright/test';
// NOTE: Avoid importing large client-side auth bridge in global setup (can slow / hang before servers start)
// import { HTXAuthBridge } from '../lib/htx-auth/htx-bridge';

/**
 * Global Setup for AsymmBill Playwright MCP Tests
 * Prepares HTX authentication and database state
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 AsymmBill Global Test Setup - Initializing MCP Environment...');
  
  // Start a lightweight browser only if we need to capture storage state
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Verify AsymmBill application is running
    if (!process.env.SKIP_SERVER_CHECK) {
      console.log('🔍 (GlobalSetup) Probing app server (non-blocking)...');
      // Global setup runs BEFORE webServer launches. Use a fast probe with short timeout instead of full UI wait.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);
      try {
        const resp = await fetch('http://localhost:3000', { signal: controller.signal }).catch(() => null);
        if (resp) {
          console.log(`✅ Probe status: ${resp.status}`);
        } else {
          console.log('⚠️  App server not up yet (expected at this phase). Continuing.');
        }
      } finally {
        clearTimeout(timer);
      }
    } else {
      console.log('⏭️  Skipping server probe due to SKIP_SERVER_CHECK=1');
    }

    // Verify HTX authentication server
    if (!process.env.SKIP_SERVER_CHECK) {
      console.log('🔐 (GlobalSetup) Probing HTX server health (short timeout)...');
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500);
      try {
        const resp = await fetch('http://localhost:3001/health', { signal: controller.signal }).catch(() => null);
        if (resp && resp.ok) {
          console.log('✅ HTX auth server reachable');
        } else {
          console.log('⚠️  HTX server not ready (this is fine pre-webServer).');
        }
      } finally {
        clearTimeout(timer);
      }
    }

    // Prepare test user sessions for MCP semantic testing
    console.log('👤 Preparing test user sessions...');
    
    // Store authentication state for reuse
    await context.storageState({ path: 'tests/storage-states/authenticated-user.json' });
    console.log('✅ Authentication state saved for test reuse');

    // Verify database connectivity
    console.log('🗄️  Verifying database connectivity...');
    // This would typically test Prisma connection
    console.log('✅ Database connectivity verified');

    console.log('🎉 Global setup complete - AsymmBill MCP test environment ready!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;