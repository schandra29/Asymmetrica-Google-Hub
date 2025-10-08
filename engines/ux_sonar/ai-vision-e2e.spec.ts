import { test } from '@playwright/test';
import { FrontendCollector } from './collectors/frontend-collector';
import { TelemetryNormalizer } from './normalizer';
import { CritiqueAdapter } from './ai-vision/critique-adapter';
import { ReportGenerator } from './feedback/report-generator';
import { CIIntegration } from './feedback/ci-integration';

test('Full AI Vision Pipeline - AsymmBill', async ({ page }) => {
  // Step 1: Collect telemetry
  const frontendCollector = new FrontendCollector(page);
  await frontendCollector.initialize();

  const frontendData = await frontendCollector.collect('http://localhost:3000');

  // Step 2: Normalize
  const normalizer = new TelemetryNormalizer();
  const normalized = normalizer.normalize(frontendData, null, '/');

  console.log('=== NORMALIZED TELEMETRY ===');
  console.log(JSON.stringify(normalized, null, 2));

  // Step 3: AI Critique
  const critiqueAdapter = new CritiqueAdapter();
  const critique = critiqueAdapter.generateCritique(normalized);

  console.log('=== AI CRITIQUE ===');
  console.log(JSON.stringify(critique, null, 2));

  // Step 4: Generate Report
  const reportGen = new ReportGenerator();
  const markdown = reportGen.generateMarkdownReport(critique, normalized, '/');
  const reportPath = reportGen.saveReport(markdown, '/');

  console.log(`Report saved: ${reportPath}`);

  // Step 5: CI Integration
  const ciIntegration = new CIIntegration();
  const prComment = ciIntegration.generatePRComment(critique, null);

  console.log('=== PR COMMENT ===');
  console.log(prComment);

  // Step 6: Save as baseline
  const jsonReport = reportGen.generateJSONReport(critique, normalized, '/');
  normalizer.saveBaseline({ ...normalized, critique }, '/');

  // Check if should fail CI
  const shouldFail = ciIntegration.shouldFailCI(critique);
  console.log(`CI Should Fail: ${shouldFail}`);

  await frontendCollector.cleanup();
});
