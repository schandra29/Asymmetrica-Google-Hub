import { test } from '@playwright/test';
import { FrontendCollector } from './collectors/frontend-collector';
import { BackendCollector } from './collectors/backend-collector';
import { TelemetryNormalizer } from './normalizer';

test('Full Telemetry Pipeline - AsymmBill Dashboard', async ({ page }) => {
  const frontendCollector = new FrontendCollector(page);
  const backendCollector = new BackendCollector();
  const normalizer = new TelemetryNormalizer();
  
  await frontendCollector.initialize();
  await backendCollector.initialize(page);
  
  // Collect telemetry
  const frontendData = await frontendCollector.collect('http://localhost:3000');
  const backendData = await backendCollector.collect('/');
  
  // Normalize
  const normalized = normalizer.normalize(frontendData, backendData, '/');
  
  console.log('=== NORMALIZED TELEMETRY ===');
  console.log(JSON.stringify(normalized, null, 2));
  
  // Save as baseline
  normalizer.saveBaseline(normalized, '/');
  
  // Try to load and compare
  const baseline = normalizer.loadBaseline('/');
  if (baseline) {
    const comparison = normalizer.compareBaselines(normalized, baseline);
    console.log('=== BASELINE COMPARISON ===');
    console.log(JSON.stringify(comparison, null, 2));
  }
  
  await frontendCollector.cleanup();
});
