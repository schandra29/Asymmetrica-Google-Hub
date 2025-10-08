#!/usr/bin/env node
/**
 * Dragon Curve Fractal - Interactive Demo
 *
 * Demonstrates:
 *   1. L-system generation and execution
 *   2. State machine boundary exploration
 *   3. Multi-team baseline merging
 *   4. SVG visualization output
 *
 * Usage:
 *   npm run demo-dragon
 *
 * @author Agent Oscar
 * @date October 5, 2025
 */

import DragonCurveEngine from './utils/dragon-curve-engine.js';
import StateSonarDragonExplorer from './utils/state-sonar-dragon-explorer.js';
import MultiTeamDragonMerger from './utils/multi-team-dragon-merger.js';
import DragonCurveVisualizer from './utils/dragon-visualizer.js';
import * as fs from 'fs';
import * as path from 'path';

const PHI = 1.618033988749895;

console.log('🐉 Dragon Curve Fractal Boundary Explorer - Demo\n');

// 1. Basic L-System Generation
console.log('1️⃣  L-SYSTEM GENERATION\n');
const engine = new DragonCurveEngine();

for (let level = 0; level <= 4; level++) {
  const lsystem = engine.generateLSystem(level);
  const metrics = engine.calculateMetrics(level);

  console.log(`Level ${level}:`);
  console.log(`  L-System: ${lsystem.substring(0, 50)}${lsystem.length > 50 ? '...' : ''}`);
  console.log(`  Total Folds: ${metrics.totalFolds}`);
  console.log(`  Fractal Dimension: ${metrics.fractalDimension.toFixed(4)}`);
  console.log(`  Regime Distribution: E=${metrics.explorationFolds} S=${metrics.stabilizationFolds} C=${metrics.convergenceFolds}`);
  console.log(`  PHI Ratio: ${metrics.phiRatio.toFixed(2)}\n`);
}

// 2. State Machine Boundary Exploration
console.log('2️⃣  STATE MACHINE BOUNDARY EXPLORATION\n');
const explorer = new StateSonarDragonExplorer();

const stateMachine = [
  { id: 'Idle', transitions: ['Loading', 'Error'] },
  { id: 'Loading', transitions: ['Success', 'Error'] },
  { id: 'Success', transitions: ['Idle'], isTerminal: false },
  { id: 'Error', transitions: ['Idle', 'Loading'], isTerminal: false },
];

const boundaryResult = explorer.foldStateMachine(stateMachine, 3);

console.log(`State Space Exploration (Level 3):`);
console.log(`  Impossible Edges Found: ${boundaryResult.impossibleEdges.length}`);
console.log(`  Exploration Coverage: ${(boundaryResult.explorationCoverage * 100).toFixed(1)}%`);
console.log(`  Critical Paths: ${boundaryResult.criticalPaths.length}\n`);

if (boundaryResult.criticalPaths.length > 0) {
  console.log('  Top Critical Paths:');
  boundaryResult.criticalPaths.slice(0, 3).forEach((path) => {
    console.log(`    ${path.from} → ${path.to} (PHI: ${path.phiWeight.toFixed(3)}, Regime: ${path.regime})`);
  });
  console.log();
}

const contractTests = explorer.generateContractTests(boundaryResult.impossibleEdges);
console.log(`  Generated Contract Tests: ${contractTests.length}`);
if (contractTests.length > 0) {
  console.log(`  Example Test: ${contractTests[0].testName}\n`);
}

// 3. Multi-Team Baseline Merging
console.log('3️⃣  MULTI-TEAM BASELINE MERGING\n');
const merger = new MultiTeamDragonMerger();

const teams = [
  {
    teamId: 'Frontend',
    shm: 0.92,
    metrics: { coverage: 0.88, performance: 0.95 },
    timestamp: Date.now(),
  },
  {
    teamId: 'Backend',
    shm: 0.89,
    metrics: { coverage: 0.91, performance: 0.87 },
    timestamp: Date.now(),
  },
  {
    teamId: 'Mobile',
    shm: 0.75,
    metrics: { coverage: 0.70, performance: 0.80 },
    timestamp: Date.now(),
  },
];

const mergeResult = merger.foldTeamBaselines(teams, 3);

console.log(`Team Baseline Merge (Level 3):`);
console.log(`  Drifts Detected: ${mergeResult.drifts.length}`);
console.log(`  Fractal Coverage: ${(mergeResult.fractalCoverage * 100).toFixed(1)}%`);
console.log(`  Harmonization Score: ${(mergeResult.harmonizationScore * 100).toFixed(1)}%`);
console.log(`  Recommendation: ${mergeResult.recommendation.toUpperCase()}\n`);

if (mergeResult.drifts.length > 0) {
  console.log('  Top Drifts:');
  mergeResult.drifts
    .sort((a, b) => b.driftAmount - a.driftAmount)
    .slice(0, 3)
    .forEach((drift) => {
      const severity = drift.driftAmount > 0.15 ? '🔴' : '⚠️';
      const metric = drift.metricName ? ` (${drift.metricName})` : ' (SHM)';
      console.log(
        `    ${severity} ${drift.teamA} ↔ ${drift.teamB}${metric}: ${(drift.driftAmount * 100).toFixed(1)}%`
      );
    });
  console.log();
}

if (mergeResult.mergedBaseline) {
  console.log(`  Merged Baseline:`);
  console.log(`    Team ID: ${mergeResult.mergedBaseline.teamId}`);
  console.log(`    SHM: ${mergeResult.mergedBaseline.shm.toFixed(3)}`);
  console.log(`    Metrics: ${JSON.stringify(mergeResult.mergedBaseline.metrics, null, 2)}\n`);
}

// 4. Visualization Export
console.log('4️⃣  VISUALIZATION EXPORT\n');
const visualizer = new DragonCurveVisualizer();

// Generate HTML demo
const demoHTML = visualizer.generateDemo(6);
const demoPath = path.join(process.cwd(), 'tests', 'ux-sonar', 'dragon-demo.html');
fs.writeFileSync(demoPath, demoHTML);
console.log(`  ✅ HTML Demo: ${demoPath}`);

// Generate SVG samples
for (const level of [3, 5, 7]) {
  const svg = visualizer.generateSVG(level, 800, 600);
  const svgPath = path.join(process.cwd(), 'tests', 'ux-sonar', `dragon-level-${level}.svg`);
  fs.writeFileSync(svgPath, svg);
  console.log(`  ✅ SVG Level ${level}: ${svgPath}`);
}

// Generate JSON export
const jsonData = visualizer.exportJSON(4);
const jsonPath = path.join(process.cwd(), 'tests', 'ux-sonar', 'dragon-level-4.json');
fs.writeFileSync(jsonPath, jsonData);
console.log(`  ✅ JSON Export: ${jsonPath}\n`);

// 5. Sacred Geometry Validation
console.log('5️⃣  SACRED GEOMETRY VALIDATION\n');

const metrics5 = engine.calculateMetrics(5);
console.log(`Dragon Curve at Level 5:`);
console.log(`  Fractal Dimension: ${metrics5.fractalDimension.toFixed(4)} (target: ~1.5236)`);
console.log(`  PHI Ratio (E/S): ${metrics5.phiRatio.toFixed(4)} (golden: ${PHI.toFixed(4)})`);
console.log(`  Tesla Frequency: ${metrics5.teslaFrequency.toFixed(3)} Hz (target: 4.909 Hz)`);

const regimeDeviation = engine.verifyRegimeDistribution(5);
console.log(`  Regime Deviation: ${(regimeDeviation * 100).toFixed(2)}% (0% = perfect)\n`);

// Tesla Harmonic Delays
const delays = engine.generateHarmonicDelays(5);
console.log(`Tesla Harmonic Backoff Sequence:`);
delays.forEach((delay, i) => {
  console.log(`  Step ${i + 1}: ${delay.toFixed(1)}ms (${Math.pow(2, i)}× base period)`);
});
console.log();

// Final Summary
console.log('━'.repeat(80));
console.log('\n🐉 SACRED TRINITY COMPLETE\n');
console.log('  🌀 Labyrinth (Mike)     → Linear Path • Tesla Timing');
console.log('  △ Tetractys (November) → Triangular Structure • PHI Convergence');
console.log('  🐉 Dragon (Oscar)      → Fractal Boundary • L-System Growth\n');
console.log('  Time + Space + Boundary = Complete Reality Model\n');
console.log('━'.repeat(80));
console.log('\n✅ Demo Complete! Open dragon-demo.html in your browser to see the visualizations.\n');
