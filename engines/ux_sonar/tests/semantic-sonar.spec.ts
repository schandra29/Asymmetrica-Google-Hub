/**
 * Semantic Sonar Test Suite
 * Tests architecture quality analysis on AsymmBill codebase
 */

import { test, expect } from '@playwright/test';
import { SemanticRadarEngine } from '../semantic-sonar-engine';
import { SemanticHeuristicsEngine } from '../semantic-sonar/heuristics';
import { SemanticNormalizer } from '../semantic-sonar/normalizer';
import { SemanticCritiqueAdapter } from '../semantic-sonar/critique-adapter';
import { SemanticReportGenerator } from '../semantic-sonar/report-generator';

const PROJECT_PATH = 'C:\\Projects\\asymmbill';

test.describe('Semantic Sonar - AsymmBill Architecture Analysis', () => {

  test('should detect circular dependencies', async () => {
    console.log('\n=== SEMANTIC SONAR: Circular Dependencies ===\n');

    const engine = new SemanticRadarEngine();
    await engine.initialize(PROJECT_PATH);

    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`🔄 Circular Dependencies Found: ${result.telemetry.cycles.length}`);

    if (result.telemetry.cycles.length > 0) {
      console.log('\n🔥 Dependency Cycles:');
      result.telemetry.cycles.slice(0, 5).forEach((cycle, i) => {
        console.log(`${i + 1}. Length ${cycle.length}: ${cycle.cycle.join(' → ')} → ${cycle.cycle[0]}`);
      });
    } else {
      console.log('✅ No circular dependencies detected!');
    }

    await engine.cleanup();
  });

  test('should analyze module coupling', async () => {
    console.log('\n=== SEMANTIC SONAR: Module Coupling ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`📊 Total Modules: ${result.telemetry.metrics.totalModules}`);
    console.log(`🔗 Average Coupling: ${result.telemetry.metrics.avgCoupling.toFixed(1)}`);
    console.log(`📈 Max Coupling: ${result.telemetry.metrics.maxCoupling}`);

    // Find highly coupled modules (z-score > 2)
    const highCoupling = result.telemetry.coupling.filter(c => c.zScore > 2);
    console.log(`\n⚠️ Highly Coupled Modules (z-score > 2): ${highCoupling.length}`);

    if (highCoupling.length > 0) {
      console.log('\n🔥 Top 5 Highly Coupled:');
      highCoupling.slice(0, 5).forEach((c, i) => {
        console.log(`${i + 1}. ${c.module}`);
        console.log(`   Fan-In: ${c.fanIn}, Fan-Out: ${c.fanOut}, Z-Score: ${c.zScore.toFixed(2)}`);
      });
    }

    await engine.cleanup();
  });

  test('should detect god modules', async () => {
    console.log('\n=== SEMANTIC SONAR: God Modules ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`👑 God Modules Found: ${result.telemetry.godModules.length}`);

    if (result.telemetry.godModules.length > 0) {
      console.log('\n🔥 God Modules:');
      result.telemetry.godModules.forEach((gm, i) => {
        console.log(`${i + 1}. ${gm.module}`);
        console.log(`   Centrality: ${gm.centrality}, Score: ${gm.score.toFixed(2)}×`);
        console.log(`   Inbound: ${gm.inboundDeps}, Outbound: ${gm.outboundDeps}`);
      });
    } else {
      console.log('✅ No god modules detected!');
    }

    await engine.cleanup();
  });

  test('should check architectural layering', async () => {
    console.log('\n=== SEMANTIC SONAR: Layering Violations ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`🏛️ Layering Violations Found: ${result.telemetry.layeringViolations.length}`);

    if (result.telemetry.layeringViolations.length > 0) {
      const byType = result.telemetry.layeringViolations.reduce((acc: any, v) => {
        acc[v.violationType] = (acc[v.violationType] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Violations by Type:');
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

      console.log('\n🔥 Sample Violations:');
      result.telemetry.layeringViolations.slice(0, 5).forEach((v, i) => {
        console.log(`${i + 1}. ${v.from} → ${v.to} (${v.violationType})`);
      });
    } else {
      console.log('✅ No layering violations detected!');
    }

    await engine.cleanup();
  });

  test('should find orphan domains', async () => {
    console.log('\n=== SEMANTIC SONAR: Orphan Domains ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    console.log(`🗑️ Orphan Domains Found: ${result.telemetry.orphanDomains.length}`);

    if (result.telemetry.orphanDomains.length > 0) {
      const byType = result.telemetry.orphanDomains.reduce((acc: any, o) => {
        acc[o.type] = (acc[o.type] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📊 Orphans by Type:');
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

      console.log('\n🔥 Sample Orphans:');
      result.telemetry.orphanDomains.slice(0, 5).forEach((o, i) => {
        console.log(`${i + 1}. ${o.module} (${o.type}): ${o.reason}`);
      });
    } else {
      console.log('✅ No orphan domains detected!');
    }

    await engine.cleanup();
  });

  test('should run semantic heuristics', async () => {
    console.log('\n=== SEMANTIC SONAR: Heuristics Analysis ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const heuristicsEngine = new SemanticHeuristicsEngine();
    const issues = heuristicsEngine.analyze(result.telemetry);

    console.log(`🔍 Semantic Issues Found: ${issues.length}`);

    issues.forEach((issue, i) => {
      console.log(`\n${i + 1}. ${issue.heuristic} (${issue.severity.toUpperCase()})`);
      console.log(`   ${issue.message}`);
    });

    // Generate praise
    const praise = heuristicsEngine.generatePraise(result.telemetry);
    if (praise.length > 0) {
      console.log('\n🎉 Praise Signals:');
      praise.forEach(p => console.log(`   ${p}`));
    }

    await engine.cleanup();
  });

  test('should normalize metrics and compute AQS', async () => {
    console.log('\n=== SEMANTIC SONAR: Normalization & AQS ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const normalizer = new SemanticNormalizer();
    const normalized = normalizer.normalize(result, PROJECT_PATH);

    console.log(`🎯 AQS (Architecture Quality Score): ${normalized.metrics.aqs.toFixed(2)}`);
    console.log(`🏗️ Modularity Index: ${(normalized.metrics.modularityIndex * 100).toFixed(0)}%`);
    console.log(`💚 Architecture Health: ${normalized.metrics.architectureHealth}/100`);
    console.log(`🔗 Coupling: ${normalized.metrics.coupling.toFixed(1)}`);
    console.log(`🧩 Cohesion: ${(normalized.metrics.cohesion * 100).toFixed(0)}%`);
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

  test('should generate architecture critique and report', async () => {
    console.log('\n=== SEMANTIC SONAR: Critique & Report Generation ===\n');

    const engine = new SemanticRadarEngine();
    const result = await engine.pingFlow(PROJECT_PATH);

    const heuristicsEngine = new SemanticHeuristicsEngine();
    const issues = heuristicsEngine.analyze(result.telemetry);

    const normalizer = new SemanticNormalizer();
    const normalized = normalizer.normalize(result, PROJECT_PATH);

    const critiqueAdapter = new SemanticCritiqueAdapter();
    const critique = critiqueAdapter.generateCritique(normalized, issues);

    console.log(critique.summary);

    console.log(`\n💡 Architecture Improvements: ${critique.improvements.length}`);
    console.log(`🗺️ Refactoring Phases: ${critique.refactoringRoadmap.length}`);

    // Generate and save report
    const reportGenerator = new SemanticReportGenerator();
    const report = reportGenerator.generateReport(normalized, issues, critique, PROJECT_PATH);
    const reportPath = reportGenerator.saveReport(report, PROJECT_PATH);

    console.log(`\n📄 Report saved to: ${reportPath}`);

    expect(report.length).toBeGreaterThan(1000);
    expect(report).toContain('Semantic Sonar Report');
    expect(report).toContain('Architecture Quality');

    await engine.cleanup();
  });

});
