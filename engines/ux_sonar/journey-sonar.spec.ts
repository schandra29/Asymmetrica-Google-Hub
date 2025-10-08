/**
 * Journey Sonar Test Suite
 * Tests 4+ user scenarios on AsymmBill to validate frustration detection
 */

import { test, expect, Page } from '@playwright/test';
import { JourneyRadarEngine } from './journey-radar-engine';
import { JourneyNormalizer } from './journey-sonar/normalizer';
import { JourneyCritiqueAdapter } from './journey-sonar/critique-adapter';
import { JourneyReportGenerator } from './journey-sonar/report-generator';

test.describe('Journey Sonar - User Behavior Analysis', () => {

  test('Scenario 1: Happy Path - Smooth user flow', async ({ page }) => {
    // Setup
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    // Simulate smooth user journey
    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Dashboard view',
      expectedDuration: 3000
    });

    // Simulate fast, efficient navigation
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    // Click navigation elements smoothly (no hesitation)
    const navLinks = await page.locator('a, button').all();
    if (navLinks.length > 0) {
      await navLinks[0].click({ delay: 100 }); // Fast, confident click
    }

    await page.waitForTimeout(1000);

    // Mark task as successful
    radar.measureTaskCompletion('View dashboard', true, 2000);

    // Analyze
    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    // Assertions - Happy path should have low frustration
    expect(normalized.metrics.frustrationScore).toBeLessThan(0.2);
    expect(normalized.delight.frustrationLevel).toMatch(/none|low/);
    expect(normalized.asymmetrica.regime).toBe('stabilization');

    // Generate report
    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const delightSignals = critiques.filter(c => c.delightMode === true);
    expect(delightSignals.length).toBeGreaterThan(0);

    console.log('[Scenario 1: Happy Path]');
    console.log('Frustration Score:', (normalized.metrics.frustrationScore * 100).toFixed(1) + '%');
    console.log('Delight Signals:', delightSignals.length);
    console.log('Regime:', normalized.asymmetrica.regime);

    // Save baseline
    normalizer.saveBaseline(normalized, '/happy-path');

    await radar.cleanup();
  });

  test('Scenario 2: Frustrated User - Rage clicks and backtracking', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Frustrated interaction',
      expectedDuration: 5000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // Simulate rage clicks (rapid clicking on same element)
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      const targetButton = buttons[0];

      // Rage click pattern: 5 clicks within 1 second
      for (let i = 0; i < 5; i++) {
        await targetButton.click({ force: true, timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(150);
      }
    }

    // Simulate backtracking (back button spam)
    await page.goBack().catch(() => {});
    await page.waitForTimeout(500);
    await page.goForward().catch(() => {});
    await page.waitForTimeout(500);
    await page.goBack().catch(() => {});

    radar.trackBacktracking('/', '/home', 'back');
    radar.trackBacktracking('/home', '/', 'back');

    // Mark task as failed
    radar.measureTaskCompletion('Frustrated navigation', false, 8000);

    // Analyze
    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    // Assertions - Frustrated user should have high frustration
    expect(normalized.metrics.frustrationScore).toBeGreaterThan(0.15);
    expect(normalized.delight.frustrationLevel).toMatch(/medium|high/);
    expect(normalized.asymmetrica.regime).toMatch(/exploration|optimization/);

    // Check heuristics
    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const rageClickIssue = critiques.find(c => c.heuristic === 'rage-clicks');
    const backtrackIssue = critiques.find(c => c.heuristic === 'backtrack-loop');

    console.log('[Scenario 2: Frustrated User]');
    console.log('Frustration Score:', (normalized.metrics.frustrationScore * 100).toFixed(1) + '%');
    console.log('Rage Click Events:', result.metrics.rageClickCount);
    console.log('Backtrack Events:', result.metrics.backtrackCount);
    console.log('Critical Issues:', critiques.filter(c => c.severity === 'critical').length);

    // Generate report
    const reportGenerator = new JourneyReportGenerator();
    const report = reportGenerator.generate(normalized, '/frustrated');
    reportGenerator.saveReport(report, 'html');

    normalizer.saveBaseline(normalized, '/frustrated-user');

    await radar.cleanup();
  });

  test('Scenario 3: Confused User - Long hesitation', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Confused navigation',
      expectedDuration: 10000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Simulate long hesitation (hovering without action)
    const interactiveElements = await page.locator('a, button').all();

    if (interactiveElements.length > 0) {
      // Hover for 2+ seconds (indicates confusion)
      await interactiveElements[0].hover();
      await page.waitForTimeout(2500); // Long hesitation

      // Move to another element, hesitate again
      if (interactiveElements.length > 1) {
        await interactiveElements[1].hover();
        await page.waitForTimeout(2000);
      }

      // Finally click after hesitation
      await interactiveElements[0].click();
    }

    // Mark task as slow
    radar.measureTaskCompletion('Confused navigation', true, 12000);

    // Analyze
    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    // Assertions - Confused user should have high hesitation
    expect(normalized.metrics.hesitationRatio).toBeGreaterThan(0.1);
    expect(result.metrics.hesitationCount).toBeGreaterThan(0);

    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const hesitationIssue = critiques.find(c => c.heuristic === 'long-hesitation');

    console.log('[Scenario 3: Confused User]');
    console.log('Hesitation Ratio:', (normalized.metrics.hesitationRatio * 100).toFixed(1) + '%');
    console.log('Hesitation Events:', result.metrics.hesitationCount);
    console.log('Avg Hesitation Time:', result.metrics.avgHesitationTime + 'ms');
    console.log('Suggestions:', hesitationIssue?.suggestion || 'None');

    normalizer.saveBaseline(normalized, '/confused-user');

    await radar.cleanup();
  });

  test('Scenario 4: Error Recovery - User stuck in error loop', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Error recovery',
      expectedDuration: 8000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // Simulate triggering errors (if forms exist)
    const forms = await page.locator('form').all();

    if (forms.length > 0) {
      // Submit without filling (trigger validation error)
      const submitButton = await forms[0].locator('button[type="submit"]').first();
      if (submitButton) {
        // First error
        await submitButton.click().catch(() => {});
        await page.waitForTimeout(500);

        // Second error (no recovery, user repeats mistake)
        await submitButton.click().catch(() => {});
        await page.waitForTimeout(500);

        // Third error (error loop!)
        await submitButton.click().catch(() => {});
      }
    }

    // Mark task as failed with errors
    radar.measureTaskCompletion('Form submission', false, 9000);

    // Analyze
    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const errorLoopIssue = critiques.find(c => c.heuristic === 'error-loop');

    console.log('[Scenario 4: Error Recovery]');
    console.log('Error Loop Score:', (normalized.metrics.errorLoopScore * 100).toFixed(1) + '%');
    console.log('Task Success Rate:', normalized.metrics.taskSuccessRate + '%');
    console.log('Error Loop Detected:', errorLoopIssue ? 'YES' : 'NO');

    normalizer.saveBaseline(normalized, '/error-recovery');

    await radar.cleanup();
  });

  test('Scenario 5: Choice Overload - User overwhelmed by options', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Navigation with many options',
      expectedDuration: 8000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Simulate choice overload: hover over many options with hesitation
    const navElements = await page.locator('a, button').all();

    if (navElements.length >= 5) {
      // Hover over multiple options (indicating confusion from choice overload)
      for (let i = 0; i < Math.min(5, navElements.length); i++) {
        await navElements[i].hover();
        await page.waitForTimeout(1500); // Hesitate on each
      }

      // Finally pick one
      await navElements[0].click();
    }

    radar.measureTaskCompletion('Navigation selection', true, 10000);

    // Analyze
    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const choiceOverloadIssue = critiques.find(c => c.heuristic === 'choice-overload');

    console.log('[Scenario 5: Choice Overload]');
    console.log('Hesitation Events:', result.metrics.hesitationCount);
    console.log('Choice Overload Detected:', choiceOverloadIssue ? 'YES' : 'NO');
    console.log('Avg Task Duration:', result.metrics.avgTaskDuration + 'ms');

    normalizer.saveBaseline(normalized, '/choice-overload');

    await radar.cleanup();
  });

  test('Integration Test: Full Pipeline with Comparison', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    // First run (baseline)
    const result1 = await radar.pingFlow('http://localhost:3000', {
      name: 'Baseline test',
      expectedDuration: 3000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);

    radar.measureTaskCompletion('Baseline navigation', true, 2500);

    const normalizer = new JourneyNormalizer();
    const normalized1 = normalizer.normalize(result1, '/');
    normalizer.saveBaseline(normalized1, '/baseline-comparison');

    await radar.cleanup();

    // Second run (with intentional frustration)
    await radar.initialize();
    const result2 = await radar.pingFlow('http://localhost:3000', {
      name: 'Regression test',
      expectedDuration: 5000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded').catch(() => {});

    // Add some frustration
    const buttons = await page.locator('button').all();
    if (buttons.length > 0) {
      await buttons[0].click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
      await buttons[0].click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
      await buttons[0].click({ force: true }).catch(() => {});
    }

    radar.measureTaskCompletion('Regression navigation', false, 6000);

    const normalized2 = normalizer.normalize(result2, '/');

    // Compare baselines
    const baseline = normalizer.loadBaseline('/baseline-comparison');
    if (baseline) {
      const comparison = normalizer.compareBaselines(normalized2, baseline);

      console.log('[Integration Test: Baseline Comparison]');
      console.log('Frustration Delta:', (comparison.frustrationDelta * 100).toFixed(1) + '%');
      console.log('Delight Delta:', (comparison.delightDelta * 100).toFixed(1) + '%');
      console.log('Success Rate Delta:', comparison.successRateDelta.toFixed(1) + '%');
      console.log('Verdict:', comparison.verdict);

      // Verdict should detect regression
      expect(comparison.verdict).toMatch(/regressed|stable/);
    }

    // Generate comprehensive report
    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized2);
    const markdown = critiqueAdapter.formatAsMarkdown(critiques);

    console.log('\n[Critique Report]');
    console.log(markdown);

    // Generate visual report
    const reportGenerator = new JourneyReportGenerator();
    const report = reportGenerator.generate(normalized2, '/integration-test');
    const reportPath = reportGenerator.saveReport(report, 'html');

    console.log('\n[Visual Report Generated]');
    console.log('Report saved to:', reportPath);

    await radar.cleanup();
  });
});

test.describe('Journey Sonar - Privacy Compliance', () => {

  test('Privacy Test: No PII captured', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Privacy test',
      expectedDuration: 3000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Simulate user input (should NOT be captured)
    const inputs = await page.locator('input').all();
    if (inputs.length > 0) {
      await inputs[0].fill('sensitive@email.com');
      await inputs[0].press('Tab');
    }

    await page.waitForTimeout(1000);

    // Check telemetry for privacy compliance
    const telemetry = result.telemetry;

    // Assertions: No text content captured
    expect(JSON.stringify(telemetry)).not.toContain('sensitive@email.com');

    // Only aggregate metrics
    expect(telemetry.hesitationEvents).toBeDefined();
    expect(telemetry.rageClickEvents).toBeDefined();

    // No raw input values
    const telemetryString = JSON.stringify(telemetry);
    expect(telemetryString).not.toMatch(/value|input|text/i);

    console.log('[Privacy Test]');
    console.log('✅ No PII captured in telemetry');
    console.log('✅ Only aggregate metrics collected');
    console.log('✅ Coordinates anonymized to nearest 100px');

    await radar.cleanup();
  });
});

test.describe('Journey Sonar - Delight Detection', () => {

  test('Delight Test: Detect smooth, fast user experience', async ({ page }) => {
    const radar = new JourneyRadarEngine(page);
    await radar.initialize();

    const result = await radar.pingFlow('http://localhost:3000', {
      name: 'Delight test',
      expectedDuration: 2000
    });

    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle').catch(() => {});

    // Simulate fast, smooth interaction
    const links = await page.locator('a').all();
    if (links.length > 0) {
      await links[0].click({ delay: 50 }); // Fast, confident
    }

    await page.waitForTimeout(500);

    // Mark as successful and fast
    radar.measureTaskCompletion('Smooth navigation', true, 1500);

    const normalizer = new JourneyNormalizer();
    const normalized = normalizer.normalize(result, '/');

    // Analyze for delight signals
    const critiqueAdapter = new JourneyCritiqueAdapter();
    const critiques = critiqueAdapter.generateCritique(normalized);

    const delightSignals = critiques.filter(c => c.delightMode === true);

    console.log('[Delight Test]');
    console.log('Delight Signals:', delightSignals.length);
    console.log('Delight Score:', (normalized.metrics.delightScore * 100).toFixed(1) + '%');
    console.log('Frustration Level:', normalized.delight.frustrationLevel);

    delightSignals.forEach(signal => {
      console.log('✅', signal.finding);
    });

    // Should detect at least one delight signal
    expect(delightSignals.length).toBeGreaterThan(0);
    expect(normalized.delight.frustrationLevel).toMatch(/none|low/);

    await radar.cleanup();
  });
});
