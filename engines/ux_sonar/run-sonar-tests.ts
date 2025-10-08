/**
 * Standalone Sonar Test Runner
 * Runs Code Sonar and Semantic Sonar without Playwright
 */

import { CodeRadarEngine } from './code-sonar-engine';
import { CodeHeuristicsEngine } from './code-sonar/heuristics';
import { CodeNormalizer } from './code-sonar/normalizer';
import { CodeCritiqueAdapter } from './code-sonar/critique-adapter';
import { CodeReportGenerator } from './code-sonar/report-generator';

import { SemanticRadarEngine } from './semantic-sonar-engine';
import { SemanticHeuristicsEngine } from './semantic-sonar/heuristics';
import { SemanticNormalizer } from './semantic-sonar/normalizer';
import { SemanticCritiqueAdapter } from './semantic-sonar/critique-adapter';
import { SemanticReportGenerator } from './semantic-sonar/report-generator';

const PROJECT_PATH = process.cwd();

async function runCodeSonar() {
  console.log('\n' + '='.repeat(80));
  console.log('💻 CODE SONAR - Code Quality Analysis');
  console.log('='.repeat(80) + '\n');

  const engine = new CodeRadarEngine();
  await engine.initialize(PROJECT_PATH);

  console.log('🔍 Running code analysis...');
  const result = await engine.pingFlow(PROJECT_PATH);

  console.log(`\n📊 METRICS:`);
  console.log(`   Functions Analyzed: ${result.telemetry.complexity.length}`);
  console.log(`   Average Complexity: ${result.telemetry.metrics.avgComplexity.toFixed(1)}`);
  console.log(`   Max Complexity: ${result.telemetry.metrics.maxComplexity}`);
  console.log(`   Total Files: ${result.telemetry.metrics.totalFiles}`);
  console.log(`   Total Lines: ${result.telemetry.metrics.totalLines.toLocaleString()}`);
  console.log(`   Duplication Blocks: ${result.telemetry.duplication.length}`);
  console.log(`   Duplication Ratio: ${(result.telemetry.metrics.duplicationRatio * 100).toFixed(2)}%`);
  console.log(`   Dead Code Instances: ${result.telemetry.deadCode.length}`);
  console.log(`   Bundles Analyzed: ${result.telemetry.bundles.length}`);

  // Run heuristics
  const heuristicsEngine = new CodeHeuristicsEngine();
  const issues = heuristicsEngine.analyze(result.telemetry);

  console.log(`\n🔍 HEURISTICS:`);
  console.log(`   Issues Found: ${issues.length}`);

  issues.forEach((issue, i) => {
    const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`   ${emoji} ${i + 1}. ${issue.heuristic} (${issue.severity})`);
  });

  // Generate praise
  const praise = heuristicsEngine.generatePraise(result.telemetry);
  if (praise.length > 0) {
    console.log(`\n🎉 PRAISE SIGNALS (${praise.length}):`);
    praise.forEach(p => console.log(`   ${p}`));
  }

  // Normalize
  const normalizer = new CodeNormalizer();
  const normalized = normalizer.normalize(result, PROJECT_PATH);

  console.log(`\n📈 NORMALIZED METRICS:`);
  console.log(`   Bug Density: ${normalized.metrics.bugDensity.toFixed(3)} bugs/LOC`);
  console.log(`   Cohesion Score: ${(normalized.metrics.cohesionScore * 100).toFixed(0)}%`);
  console.log(`   Maintainability Index: ${normalized.metrics.maintainabilityIndex}/100`);
  console.log(`   Complexity Score: ${normalized.metrics.complexityScore}/100`);
  console.log(`   Duplication Score: ${normalized.metrics.duplicationScore}/100`);
  console.log(`   Regime: ${normalized.asymmetrica.regime.toUpperCase()}`);
  console.log(`   Complexity: ${normalized.asymmetrica.complexity}`);

  // Quality gates
  const gates = normalizer.checkQualityGates(normalized);
  console.log(`\n🚦 QUALITY GATES: ${gates.passed ? '✅ PASS' : '❌ FAIL'}`);
  if (!gates.passed) {
    gates.failures.forEach(f => console.log(`   ❌ ${f}`));
  }

  // Generate critique
  const critiqueAdapter = new CodeCritiqueAdapter();
  const critique = critiqueAdapter.generateCritique(normalized, issues);

  console.log(`\n💡 CRITIQUE:`);
  console.log(`   Improvements: ${critique.improvements.length}`);
  console.log(`   Roadmap Phases: ${critique.refactoringRoadmap.length}`);

  // Generate report
  const reportGenerator = new CodeReportGenerator();
  const report = reportGenerator.generateReport(normalized, issues, critique, PROJECT_PATH);
  const reportPath = reportGenerator.saveReport(report, PROJECT_PATH, 'code_asymmbill_latest.md');

  console.log(`\n📄 REPORT: ${reportPath}`);

  // Save baseline
  normalizer.saveBaseline(normalized, PROJECT_PATH);

  await engine.cleanup();

  return {
    result,
    normalized,
    issues,
    critique,
    reportPath
  };
}

async function runSemanticSonar() {
  console.log('\n' + '='.repeat(80));
  console.log('🏗️  SEMANTIC SONAR - Architecture Quality Analysis');
  console.log('='.repeat(80) + '\n');

  const engine = new SemanticRadarEngine();
  await engine.initialize(PROJECT_PATH);

  console.log('🔍 Running architecture analysis...');
  const result = await engine.pingFlow(PROJECT_PATH);

  console.log(`\n📊 METRICS:`);
  console.log(`   Total Modules: ${result.telemetry.metrics.totalModules}`);
  console.log(`   Average Coupling: ${result.telemetry.metrics.avgCoupling.toFixed(1)}`);
  console.log(`   Max Coupling: ${result.telemetry.metrics.maxCoupling}`);
  console.log(`   Average Cohesion: ${(result.telemetry.metrics.avgCohesion * 100).toFixed(0)}%`);
  console.log(`   Modularity Index: ${(result.telemetry.metrics.modularityIndex * 100).toFixed(0)}%`);
  console.log(`   Architecture Score: ${result.telemetry.metrics.architectureScore}/100`);
  console.log(`   Circular Dependencies: ${result.telemetry.cycles.length}`);
  console.log(`   God Modules: ${result.telemetry.godModules.length}`);
  console.log(`   Layering Violations: ${result.telemetry.layeringViolations.length}`);
  console.log(`   Orphan Domains: ${result.telemetry.orphanDomains.length}`);

  // Run heuristics
  const heuristicsEngine = new SemanticHeuristicsEngine();
  const issues = heuristicsEngine.analyze(result.telemetry);

  console.log(`\n🔍 HEURISTICS:`);
  console.log(`   Issues Found: ${issues.length}`);

  issues.forEach((issue, i) => {
    const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`   ${emoji} ${i + 1}. ${issue.heuristic} (${issue.severity})`);
  });

  // Generate praise
  const praise = heuristicsEngine.generatePraise(result.telemetry);
  if (praise.length > 0) {
    console.log(`\n🎉 PRAISE SIGNALS (${praise.length}):`);
    praise.forEach(p => console.log(`   ${p}`));
  }

  // Normalize
  const normalizer = new SemanticNormalizer();
  const normalized = normalizer.normalize(result, PROJECT_PATH);

  console.log(`\n📈 NORMALIZED METRICS:`);
  console.log(`   AQS (Architecture Quality Score): ${normalized.metrics.aqs.toFixed(2)}`);
  console.log(`   Modularity Index: ${(normalized.metrics.modularityIndex * 100).toFixed(0)}%`);
  console.log(`   Architecture Health: ${normalized.metrics.architectureHealth}/100`);
  console.log(`   Coupling: ${normalized.metrics.coupling.toFixed(1)}`);
  console.log(`   Cohesion: ${(normalized.metrics.cohesion * 100).toFixed(0)}%`);
  console.log(`   Maintainability Score: ${normalized.metrics.maintainabilityScore}/100`);
  console.log(`   Regime: ${normalized.asymmetrica.regime.toUpperCase()}`);
  console.log(`   Complexity: ${normalized.asymmetrica.complexity}`);

  // Quality gates
  const gates = normalizer.checkQualityGates(normalized);
  console.log(`\n🚦 QUALITY GATES: ${gates.passed ? '✅ PASS' : '❌ FAIL'}`);
  if (!gates.passed) {
    gates.failures.forEach(f => console.log(`   ❌ ${f}`));
  }

  // Generate critique
  const critiqueAdapter = new SemanticCritiqueAdapter();
  const critique = critiqueAdapter.generateCritique(normalized, issues);

  console.log(`\n💡 CRITIQUE:`);
  console.log(`   Improvements: ${critique.improvements.length}`);
  console.log(`   Roadmap Phases: ${critique.refactoringRoadmap.length}`);

  // Generate report
  const reportGenerator = new SemanticReportGenerator();
  const report = reportGenerator.generateReport(normalized, issues, critique, PROJECT_PATH);
  const reportPath = reportGenerator.saveReport(report, PROJECT_PATH, 'semantic_asymmbill_latest.md');

  console.log(`\n📄 REPORT: ${reportPath}`);

  // Save baseline
  normalizer.saveBaseline(normalized, PROJECT_PATH);

  await engine.cleanup();

  return {
    result,
    normalized,
    issues,
    critique,
    reportPath
  };
}

async function main() {
  console.log('\n🚀 UNIFIED SONAR SUITE - Code & Semantic Analysis');
  console.log(`📂 Project: ${PROJECT_PATH}\n`);

  try {
    const codeResults = await runCodeSonar();
    const semanticResults = await runSemanticSonar();

    console.log('\n' + '='.repeat(80));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(80));
    console.log(`\n📄 Code Sonar Report: ${codeResults.reportPath}`);
    console.log(`📄 Semantic Sonar Report: ${semanticResults.reportPath}`);
    console.log(`\n🎯 Code Regime: ${codeResults.normalized.asymmetrica.regime.toUpperCase()}`);
    console.log(`🎯 Semantic Regime: ${semanticResults.normalized.asymmetrica.regime.toUpperCase()}`);
    console.log(`\n💻 Code Quality: ${codeResults.normalized.metrics.maintainabilityIndex}/100`);
    console.log(`🏗️  Architecture Quality: ${semanticResults.normalized.metrics.architectureHealth}/100`);

    console.log('\n✨ Mission Complete! 🎉\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during analysis:', error);
    process.exit(1);
  }
}

main();
