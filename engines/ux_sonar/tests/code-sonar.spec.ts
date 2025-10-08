/**
 * Code Sonar Test Suite
 * Tests code quality analysis on AsymmBill codebase
 */

import { test, expect } from '@playwright/test';
import { CodeRadarEngine } from '../code-sonar-engine';
import { CodeHeuristicsEngine } from '../code-sonar/heuristics';
import { CodeNormalizer } from '../code-sonar/normalizer';
import { CodeCritiqueAdapter } from '../code-sonar/critique-adapter';
import { CodeReportGenerator } from '../code-sonar/report-generator';

const PROJECT_PATH = 'C:\\Projects\\asymmbill';

test.describe('Code Sonar - AsymmBill Analysis', () => {

  test('should analyze code complexity', async () => {
    console.log('\n=== CODE SONAR: Complexity Analysis ===\n');

    const engine = new CodeRadarEngine();
    await engine.initialize(PROJECT_PATH);

    const result = await engine.pingFlow(PROJECT_PATH);

    expect(result).toBeDefined();
    expect(result.telemetry).toBeDefined();
    expect(result.telemetry.complexity.length).toBeGreaterThan(0);

    console.log(`📊 Analyzed ${result.telemetry.complexity.length} functions`);
    console.log(`📈 Average Complexity: ${result.telemetry.metrics.avgComplexity.toFixed(1)}`);
    console.log(`📈 Max Complexity: ${result.telemetry.metrics.maxComplexity}`);
    console.log(`📁 Total Files: ${result.telemetry.metrics.totalFiles}`);
    console.log(`📝 Total Lines: ${result.telemetry.metrics.totalLines.toLocaleString()}`);

    // Find most complex functions
    const topComplex = [...result.telemetry.complexity]
      .sort((a, b) => b.complexity - a.complexity)
      .slice(0, 5);

    console.log('\n🔥 Top 5 Most Complex Functions:');
    topComplex.forEach((c, i) => {
      console.log(`${i + 1}. ${c.function} (${c.file}) - CC: ${c.complexity}, Lines: ${c.lines}`);
    });

    await engine.cleanup();
  });

  test('should detect code duplication', async () => {
    console.log('\n=== CODE SONAR: Duplication Detection ===\n');

    const engine = new CodeRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`🔄 Duplication Blocks Found: ${result.telemetry.duplication.length}`);
    console.log(`📊 Duplication Ratio: ${(result.telemetry.metrics.duplicationRatio * 100).toFixed(2)}%`);

    if (result.telemetry.duplication.length > 0) {
      const top = result.telemetry.duplication.slice(0, 3);
      console.log('\n🔥 Top 3 Duplication Blocks:');
      top.forEach((d, i) => {
        console.log(`${i + 1}. ${d.lines} lines: ${d.file1} ↔ ${d.file2}`);
      });
    } else {
      console.log('✅ No duplication detected!');
    }

    await engine.cleanup();
  });

  test('should run heuristics analysis', async () => {
    console.log('\n=== CODE SONAR: Heuristics Analysis ===\n');

    const engine = new CodeRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const heuristicsEngine = new CodeHeuristicsEngine();
    const issues = heuristicsEngine.analyze(result.telemetry);

    console.log(`🔍 Heuristic Issues Found: ${issues.length}`);

    issues.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.heuristic} (${issue.severity.toUpperCase()})`);
      console.log(`   ${issue.message}`);
      if (issue.affectedItems && issue.affectedItems.length > 0) {
        console.log(`   Affected: ${issue.affectedItems.slice(0, 3).join(', ')}`);
      }
    });

    // Generate praise
    const praise = heuristicsEngine.generatePraise(result.telemetry);
    if (praise.length > 0) {
      console.log('\n🎉 Praise Signals:');
      praise.forEach(p => console.log(`   ${p}`));
    }

    await engine.cleanup();
  });

  test('should normalize metrics and compute bug density', async () => {
    console.log('\n=== CODE SONAR: Normalization & Bug Density ===\n');

    const engine = new CodeRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const normalizer = new CodeNormalizer();
    const normalized = normalizer.normalize(result, PROJECT_PATH);

    console.log(`📊 Bug Density: ${normalized.metrics.bugDensity.toFixed(3)} bugs/LOC`);
    console.log(`🧩 Cohesion Score: ${(normalized.metrics.cohesionScore * 100).toFixed(0)}%`);
    console.log(`📈 Maintainability Index: ${normalized.metrics.maintainabilityIndex}/100`);
    console.log(`🎯 Complexity Score: ${normalized.metrics.complexityScore}/100`);
    console.log(`🔄 Duplication Score: ${normalized.metrics.duplicationScore}/100`);
    console.log(`🏛️ Regime: ${normalized.asymmetrica.regime.toUpperCase()}`);

    // Check quality gates
    const gates = normalizer.checkQualityGates(normalized);
    console.log(`\n🚦 Quality Gates: ${gates.passed ? '✅ PASS' : '❌ FAIL'}`);
    if (!gates.passed) {
      console.log('   Failures:');
      gates.failures.forEach(f => console.log(`   - ${f}`));
    }

    // Save baseline
    normalizer.saveBaseline(normalized, PROJECT_PATH);

    await engine.cleanup();
  });

  test('should generate critique and report', async () => {
    console.log('\n=== CODE SONAR: Critique & Report Generation ===\n');

    const engine = new CodeRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const heuristicsEngine = new CodeHeuristicsEngine();
    const issues = heuristicsEngine.analyze(result.telemetry);

    const normalizer = new CodeNormalizer();
    const normalized = normalizer.normalize(result, PROJECT_PATH);

    const critiqueAdapter = new CodeCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized, issues);

    console.log(critique.summary);

    console.log(`\n💡 Improvements Recommended: ${critique.improvements.length}`);
    console.log(`🗺️ Refactoring Phases: ${critique.refactoringRoadmap.length}`);

    // Generate and save report
    const reportGenerator = new CodeReportGenerator();
    const report = reportGenerator.generateReport(normalized, issues, critique, PROJECT_PATH);
    const reportPath = reportGenerator.saveReport(report, PROJECT_PATH);

    console.log(`\n📄 Report saved to: ${reportPath}`);

    expect(report.length).toBeGreaterThan(1000);
    expect(report).toContain('Code Sonar Report');
    expect(report).toContain('Bug Density');

    await engine.cleanup();
  });

});
