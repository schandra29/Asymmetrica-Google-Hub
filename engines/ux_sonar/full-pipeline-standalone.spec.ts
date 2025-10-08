import { test } from '@playwright/test';
import { FrontendCollector } from './collectors/frontend-collector';
import { BackendCollector } from './collectors/backend-collector';
import { TelemetryNormalizer } from './normalizer';

test('Full Telemetry Pipeline - AsymmBill Dashboard', async ({ page }) => {
  test.setTimeout(60000);
  
  const frontendCollector = new FrontendCollector(page);
  const backendCollector = new BackendCollector();
  const normalizer = new TelemetryNormalizer();
  
  console.log('[Pipeline] Initializing collectors...');
  await frontendCollector.initialize();
  await backendCollector.initialize(page);
  
  console.log('[Pipeline] Collecting frontend telemetry...');
  const frontendData = await frontendCollector.collect('http://localhost:3000');
  
  console.log('[Pipeline] Collecting backend telemetry...');
  const backendData = await backendCollector.collect('/');
  
  console.log('[Pipeline] Normalizing data...');
  const normalized = normalizer.normalize(frontendData, backendData, '/');
  
  console.log('\n=== NORMALIZED TELEMETRY ===');
  console.log(JSON.stringify(normalized, null, 2));
  
  console.log('\n[Pipeline] Saving baseline...');
  normalizer.saveBaseline(normalized, '/');
  
  console.log('[Pipeline] Attempting to load baseline...');
  const baseline = normalizer.loadBaseline('/');
  if (baseline && baseline.id !== normalized.id) {
    const comparison = normalizer.compareBaselines(normalized, baseline);
    console.log('\n=== BASELINE COMPARISON ===');
    console.log(JSON.stringify(comparison, null, 2));
  }
  
  await frontendCollector.cleanup();
  
  console.log('\n[Pipeline] Test complete!');
});
