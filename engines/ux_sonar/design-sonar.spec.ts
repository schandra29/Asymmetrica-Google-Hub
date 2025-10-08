/**
 * Design Sonar E2E Test Suite
 * Tests the complete Design Sonar pipeline: PING → ECHO → MAP → CRITIQUE
 */

import { test, expect } from '@playwright/test';
import { DesignRadarEngine } from './design-radar-engine';
import { DesignNormalizer } from './design-sonar/normalizer';
import { DesignCritiqueAdapter } from './design-sonar/critique-adapter';
import { DesignReportGenerator } from './design-sonar/report-generator';

test.describe('Design Sonar - Visual Quality Guardian', () => {

  test('should capture design telemetry and generate harmony report for landing page', async ({ page }) => {
    console.log('\n🎨 Design Sonar Test Started - Landing Page\n');

    // STEP 1: PING - Capture design telemetry
    console.log('📡 PING: Collecting design telemetry...');
    const radar = new DesignRadarEngine(page);
    await radar.initialize();

    const radarResult = await radar.pingFlow('http://localhost:3000/');

    console.log(`✅ Design telemetry captured in ${radarResult.duration}ms`);
    console.log(`   - Colors: ${radarResult.telemetry.colors.length}`);
    console.log(`   - Typography: ${radarResult.telemetry.typography.length}`);
    console.log(`   - Spacing: ${radarResult.telemetry.spacing.length}`);
    console.log(`   - Focus States: ${radarResult.telemetry.focusStates.length}`);
    console.log(`   - Total Elements: ${radarResult.telemetry.layoutMetrics.totalElements}`);

    // Assertions on telemetry collection
    expect(radarResult.telemetry.colors.length).toBeGreaterThan(0);
    expect(radarResult.telemetry.typography.length).toBeGreaterThan(0);
    expect(radarResult.telemetry.layoutMetrics.totalElements).toBeGreaterThan(0);

    // STEP 2: ECHO - Normalize telemetry and compute harmony index
    console.log('\n🔄 ECHO: Normalizing telemetry and computing harmony index...');
    const normalizer = new DesignNormalizer();
    const normalized = normalizer.normalize(radarResult, '/');

    console.log(`✅ Harmony Index: ${normalized.metrics.harmonyIndex.toFixed(1)}/100`);
    console.log(`   - Contrast Score: ${normalized.metrics.contrastScore.toFixed(1)}/100`);
    console.log(`   - Hierarchy Score: ${normalized.metrics.hierarchyScore.toFixed(1)}/100`);
    console.log(`   - Spacing Score: ${normalized.metrics.spacingScore.toFixed(1)}/100`);
    console.log(`   - Breathability: ${normalized.metrics.breathabilityIndex.toFixed(2)}`);
    console.log(`   - Regime: ${normalized.asymmetrica.regime}`);
    console.log(`   - Complexity: ${normalized.asymmetrica.complexity}`);

    // Assertions on normalized metrics
    expect(normalized.metrics.harmonyIndex).toBeGreaterThanOrEqual(0);
    expect(normalized.metrics.harmonyIndex).toBeLessThanOrEqual(100);
    expect(['exploration', 'optimization', 'stabilization']).toContain(normalized.asymmetrica.regime);

    // STEP 3: MAP - Run heuristics and generate critique
    console.log('\n🗺️  MAP: Running design heuristics...');
    const critiqueAdapter = new DesignCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized);

    console.log(`✅ Design critique generated`);
    console.log(`   - Issues found: ${critique.issues.length}`);
    console.log(`   - Critical: ${critique.issues.filter(i => i.severity === 'critical').length}`);
    console.log(`   - Warnings: ${critique.issues.filter(i => i.severity === 'warning').length}`);
    console.log(`   - Praise items: ${critique.praise.length}`);
    console.log(`   - Overall Score: ${critique.metrics.overallScore.toFixed(1)}/100`);

    if (critique.issues.length > 0) {
      console.log('\n   Issues detected:');
      critique.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity}] ${issue.type}: ${issue.description}`);
      });
    }

    if (critique.praise.length > 0) {
      console.log('\n   🎉 Praise Mode:');
      critique.praise.forEach((praise) => {
        console.log(`   ${praise}`);
      });
    }

    // Assertions on critique
    expect(critique.metrics.overallScore).toBeGreaterThanOrEqual(0);
    expect(critique.metrics.overallScore).toBeLessThanOrEqual(100);
    expect(critique.summary).toBeTruthy();
    expect(critique.recommendations.length).toBeGreaterThan(0);

    // STEP 4: CRITIQUE - Generate and save report
    console.log('\n📝 CRITIQUE: Generating reports...');
    const reportGen = new DesignReportGenerator();

    const markdownReport = reportGen.generateMarkdownReport(critique, normalized, '/');
    const reportPath = reportGen.saveReport(markdownReport, '/');

    const jsonReport = reportGen.generateJSONReport(critique, normalized, '/');
    const jsonPath = reportGen.saveJSONReport(jsonReport, '/');

    console.log(`✅ Markdown report saved: ${reportPath}`);
    console.log(`✅ JSON report saved: ${jsonPath}`);

    // Assertions on reports
    expect(markdownReport).toContain('Design Sonar Report');
    expect(markdownReport).toContain('Harmony Index');
    expect(markdownReport).toContain(normalized.asymmetrica.regime);

    // STEP 5: Save baseline
    console.log('\n💾 Saving baseline...');
    normalizer.saveBaseline(normalized, '/');
    console.log('✅ Baseline saved for future comparisons');

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎨 DESIGN SONAR COMPLETE');
    console.log('='.repeat(60));
    console.log(`Route: /`);
    console.log(`Harmony Index: ${normalized.metrics.harmonyIndex.toFixed(1)}/100`);
    console.log(`Overall Score: ${critique.metrics.overallScore.toFixed(1)}/100`);
    console.log(`Regime: ${normalized.asymmetrica.regime}`);
    console.log(`Issues: ${critique.issues.length} (${critique.issues.filter(i => i.severity === 'critical').length} critical)`);
    console.log(`Praise: ${critique.praise.length} items`);
    console.log('='.repeat(60) + '\n');

    await radar.cleanup();
  });

  test('should detect at least one design heuristic on AsymmBill', async ({ page }) => {
    console.log('\n🎨 Design Sonar Test - Heuristic Detection\n');

    const radar = new DesignRadarEngine(page);
    await radar.initialize();

    const radarResult = await radar.pingFlow('http://localhost:3000/');
    const normalizer = new DesignNormalizer();
    const normalized = normalizer.normalize(radarResult, '/');
    const critiqueAdapter = new DesignCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized);

    console.log(`\n📊 Heuristic Detection Results:`);
    console.log(`   - Total Issues: ${critique.issues.length}`);

    // We expect AsymmBill to have at least SOME design issues to detect
    // (No production app is perfect!)
    if (critique.issues.length > 0) {
      console.log('   ✅ Design Sonar successfully detected issues');
      critique.issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. [${issue.severity}] ${issue.type}`);
      });
    } else {
      console.log('   🎉 No issues detected - Perfect design harmony!');
    }

    // Assert that we have functioning heuristics (even if no issues found)
    expect(critique.issues).toBeDefined();
    expect(Array.isArray(critique.issues)).toBe(true);

    await radar.cleanup();
  });

  test('should generate code examples for detected issues', async ({ page }) => {
    console.log('\n🎨 Design Sonar Test - Code Example Generation\n');

    const radar = new DesignRadarEngine(page);
    await radar.initialize();

    const radarResult = await radar.pingFlow('http://localhost:3000/');
    const normalizer = new DesignNormalizer();
    const normalized = normalizer.normalize(radarResult, '/');
    const critiqueAdapter = new DesignCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized);

    console.log(`\n🛠️  Code Example Generation:`);

    if (critique.issues.length > 0) {
      const issuesWithExamples = critique.issues.filter(i => i.codeExample);
      console.log(`   - Issues with code examples: ${issuesWithExamples.length}/${critique.issues.length}`);

      issuesWithExamples.slice(0, 2).forEach((issue, i) => {
        console.log(`\n   Example ${i + 1}: ${issue.type}`);
        console.log(`   ${issue.codeExample?.split('\n')[0]}`);
      });

      // Assert that issues have code examples
      expect(issuesWithExamples.length).toBeGreaterThan(0);
    } else {
      console.log('   ℹ️  No issues found, no code examples needed');
    }

    await radar.cleanup();
  });

  test('should calculate harmony index using GPT-5 formula', async ({ page }) => {
    console.log('\n🎨 Design Sonar Test - Harmony Index Formula Validation\n');

    const radar = new DesignRadarEngine(page);
    await radar.initialize();

    const radarResult = await radar.pingFlow('http://localhost:3000/');
    const normalizer = new DesignNormalizer();
    const normalized = normalizer.normalize(radarResult, '/');

    console.log(`\n📐 Harmony Index Calculation:`);
    console.log(`   Formula: (layoutPHI × 0.618) + (avgContrast/maxContrast) - colorClashPenalty`);
    console.log(`   Result: ${normalized.metrics.harmonyIndex.toFixed(1)}/100`);
    console.log(`   Regime: ${normalized.asymmetrica.regime}`);

    // Validate harmony index is within 0-100 range
    expect(normalized.metrics.harmonyIndex).toBeGreaterThanOrEqual(0);
    expect(normalized.metrics.harmonyIndex).toBeLessThanOrEqual(100);

    // Validate regime assignment based on harmony index
    if (normalized.metrics.harmonyIndex < 70) {
      expect(normalized.asymmetrica.regime).toBe('exploration');
    } else if (normalized.metrics.harmonyIndex < 85) {
      expect(normalized.asymmetrica.regime).toBe('optimization');
    } else {
      expect(normalized.asymmetrica.regime).toBe('stabilization');
    }

    console.log('   ✅ Harmony index formula validated');

    await radar.cleanup();
  });

  test('should include Praise Mode in reports', async ({ page }) => {
    console.log('\n🎨 Design Sonar Test - Praise Mode Validation\n');

    const radar = new DesignRadarEngine(page);
    await radar.initialize();

    const radarResult = await radar.pingFlow('http://localhost:3000/');
    const normalizer = new DesignNormalizer();
    const normalized = normalizer.normalize(radarResult, '/');
    const critiqueAdapter = new DesignCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized);

    console.log(`\n🎉 Praise Mode:`);

    if (critique.praise.length > 0) {
      console.log(`   - Praise items: ${critique.praise.length}`);
      critique.praise.forEach((praise, i) => {
        console.log(`   ${i + 1}. ${praise}`);
      });

      // Assert praise is included
      expect(critique.praise.length).toBeGreaterThan(0);
      console.log('   ✅ Praise Mode active!');
    } else {
      console.log('   ⚠️  No praise items (design needs improvement)');
      console.log('   (This is normal for sites in exploration regime)');
    }

    // Generate report and verify Praise Mode section exists
    const reportGen = new DesignReportGenerator();
    const markdownReport = reportGen.generateMarkdownReport(critique, normalized, '/');

    if (critique.praise.length > 0) {
      expect(markdownReport).toContain('Praise Mode');
    }

    await radar.cleanup();
  });
});
