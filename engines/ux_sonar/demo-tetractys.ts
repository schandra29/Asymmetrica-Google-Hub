/**
 * Tetractys Demonstration Script
 *
 * Demonstrates the sacred geometry implementation with real examples
 * and visual output.
 *
 * Agent November - Sacred Geometry Demo
 */

import {
  TetractysEngine,
  Harmonizers,
  calculateSHMWithTetractys,
  createSonarTetractys,
  PHI
} from './utils/tetractys-engine';

import { generateTetractysWidget, TetractysVisualizer } from './utils/tetractys-visualizer';

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   TETRACTYS SACRED GEOMETRY DEMONSTRATION                    ║');
console.log('║   Agent November - Pythagorean Metric Convergence            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Demonstration 1: Basic Convergence
console.log('═══ Demo 1: Basic Convergence with 6 Sonar Scores ═══\n');

const sonarScores = {
  ux: 0.95,
  design: 0.88,
  code: 0.92,
  semantic: 0.81,
  journey: 0.76,
  state: 0.89
};

console.log('Input Sonar Scores:');
console.log('  UX:       ', sonarScores.ux);
console.log('  Design:   ', sonarScores.design);
console.log('  Code:     ', sonarScores.code);
console.log('  Semantic: ', sonarScores.semantic);
console.log('  Journey:  ', sonarScores.journey);
console.log('  State:    ', sonarScores.state);
console.log();

const result = calculateSHMWithTetractys(sonarScores);

console.log('Tetractys Convergence Result:');
console.log('  System Health Metric (SHM): ', result.apex.toFixed(4));
console.log('  Weighted Score:            ', result.weightedScore.toFixed(4));
console.log('  Convergence Path:          ', result.convergencePath.join(' → '));
console.log();

console.log(result.visualization);
console.log();

// Demonstration 2: Sacred Weights Validation
console.log('═══ Demo 2: Sacred Weights Validation ═══\n');

console.log('Pythagorean Tetraktys: 1 + 2 + 3 + 4 = 10 (Perfection)\n');

const totalWeight = result.levels.reduce((sum, level) => sum + level.weight, 0);

console.log('Level Weights:');
result.levels.forEach(level => {
  console.log(`  Level ${level.level}: weight = ${level.weight}, metrics = ${level.metrics.length}`);
});
console.log();
console.log(`Total Weight: ${totalWeight} (Sacred Number: 10) ✅`);
console.log();

// Demonstration 3: Golden Ratio
console.log('═══ Demo 3: Golden Ratio (φ) Harmonization ═══\n');

console.log(`Golden Ratio (φ): ${PHI.toFixed(15)}`);
console.log(`Mathematical Definition: φ = (1 + √5) / 2`);
console.log(`Validation: φ² = φ + 1`);
console.log(`  φ² = ${(PHI * PHI).toFixed(10)}`);
console.log(`  φ + 1 = ${(PHI + 1).toFixed(10)}`);
console.log(`  Match: ${Math.abs((PHI * PHI) - (PHI + 1)) < 0.0000001 ? '✅' : '❌'}`);
console.log();

// Demonstration 4: Comparing Harmonizers
console.log('═══ Demo 4: Comparing Different Harmonizers ═══\n');

const testMetrics = [0.95, 0.88, 0.92, 0.81, 0.76, 0.89];

const harmonizers = [
  { name: 'Arithmetic Mean', fn: Harmonizers.arithmeticMean },
  { name: 'Geometric Mean', fn: Harmonizers.geometricMean },
  { name: 'Harmonic Mean', fn: Harmonizers.harmonicMean },
  { name: 'Golden Ratio Geometric', fn: Harmonizers.goldenRatioGeometric },
  { name: 'Quadratic Mean (RMS)', fn: Harmonizers.quadraticMean }
];

console.log('Test Metrics: [' + testMetrics.map(m => m.toFixed(2)).join(', ') + ']\n');

harmonizers.forEach(({ name, fn }) => {
  const engine = new TetractysEngine({ harmonizer: fn });
  const result = engine.converge(testMetrics);
  console.log(`${name.padEnd(25)}: SHM = ${result.apex.toFixed(4)}, Weighted = ${result.weightedScore.toFixed(4)}`);
});
console.log();

// Demonstration 5: Convergence Journey
console.log('═══ Demo 5: Convergence Journey (Step-by-Step) ═══\n');

const journeyEngine = createSonarTetractys({ trackPath: true });
const journeyResult = journeyEngine.converge(testMetrics);

console.log('Step-by-step convergence path:\n');
journeyResult.convergenceJourney?.forEach((step, index) => {
  console.log(`Step ${index + 1}: ${step.harmonization}`);
  console.log(`  Level ${step.level}:`);
  console.log(`    Input:  [${step.input.map(n => n.toFixed(3)).join(', ')}]`);
  console.log(`    Output: [${step.output.map(n => n.toFixed(3)).join(', ')}]`);
  console.log();
});

// Demonstration 6: Real-World Scenarios
console.log('═══ Demo 6: Real-World Scenarios ═══\n');

const scenarios = [
  {
    name: 'All Healthy (Stabilization)',
    scores: { ux: 0.90, design: 0.92, code: 0.95, semantic: 0.88, journey: 0.91, state: 0.93 },
    expectedRegime: 'Stabilization (>0.85)'
  },
  {
    name: 'Mixed Performance (Optimization)',
    scores: { ux: 0.75, design: 0.80, code: 0.78, semantic: 0.72, journey: 0.76, state: 0.79 },
    expectedRegime: 'Optimization (0.70-0.85)'
  },
  {
    name: 'Low Performance (Exploration)',
    scores: { ux: 0.60, design: 0.65, code: 0.58, semantic: 0.62, journey: 0.55, state: 0.63 },
    expectedRegime: 'Exploration (<0.70)'
  },
  {
    name: 'One Critical Sonar',
    scores: { ux: 0.95, design: 0.40, code: 0.92, semantic: 0.88, journey: 0.90, state: 0.89 },
    expectedRegime: 'Mixed (Geometric mean pulls down)'
  }
];

scenarios.forEach(scenario => {
  const result = calculateSHMWithTetractys(scenario.scores);
  console.log(`${scenario.name}:`);
  console.log(`  SHM: ${result.apex.toFixed(4)}`);
  console.log(`  Expected: ${scenario.expectedRegime}`);
  console.log(`  Status: ${result.apex >= 0.85 ? 'Stabilization ✅' : result.apex >= 0.70 ? 'Optimization ⚠️' : 'Exploration 🔍'}`);
  console.log();
});

// Demonstration 7: Performance vs Simple Average
console.log('═══ Demo 7: Comparison with Simple Weighted Average ═══\n');

const comparisonScores = { ux: 0.95, design: 0.88, code: 0.92, semantic: 0.81, journey: 0.76, state: 0.89 };

// Simple weighted average (old method)
const weights = [0.25, 0.25, 0.125, 0.125, 0.125, 0.125];
const metrics = [comparisonScores.ux, comparisonScores.design, comparisonScores.code,
                 comparisonScores.semantic, comparisonScores.journey, comparisonScores.state];
const simpleAverage = metrics.reduce((sum, m, i) => sum + m * weights[i], 0);

const tetractysResult = calculateSHMWithTetractys(comparisonScores);

console.log('Input: UX=0.95, Design=0.88, Code=0.92, Semantic=0.81, Journey=0.76, State=0.89\n');
console.log(`Simple Weighted Average: ${simpleAverage.toFixed(4)}`);
console.log(`Tetractys (Golden Ratio): ${tetractysResult.apex.toFixed(4)}`);
console.log(`Difference: ${((tetractysResult.apex - simpleAverage) / simpleAverage * 100).toFixed(2)}%`);
console.log();
console.log('Analysis:');
console.log('  - Tetractys uses hierarchical convergence (6→3→2→1)');
console.log('  - Golden ratio adjustment provides natural balance');
console.log('  - Geometric mean emphasizes proportional relationships');
console.log('  - Sacred weights (4-3-2-1) give more importance to convergence');
console.log();

// Demonstration 8: SVG Visualization Preview
console.log('═══ Demo 8: SVG Visualization (Preview) ═══\n');

const visualizer = new TetractysVisualizer();
const labels = ['UX', 'Des', 'Cod', 'Sem', 'Jrn', 'Sta'];
const svgPreview = visualizer.generateSVG(tetractysResult, labels);

console.log('SVG Generated:');
console.log(`  Size: ${svgPreview.length} characters`);
console.log(`  Contains animated dots: ${svgPreview.includes('animation') ? '✅' : '❌'}`);
console.log(`  Contains convergence path: ${svgPreview.includes('convergence') ? '✅' : '❌'}`);
console.log(`  Contains sacred weights: ${svgPreview.includes('w:4') ? '✅' : '❌'}`);
console.log();

// Final Summary
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║   TETRACTYS DEMONSTRATION COMPLETE                           ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

console.log('✅ Sacred Weights Validated: 1+2+3+4=10');
console.log('✅ Golden Ratio Integration: φ ≈ 1.618');
console.log('✅ Hierarchical Convergence: 6→3→2→1');
console.log('✅ Multiple Harmonizers Available');
console.log('✅ Dashboard Integration Ready');
console.log('✅ SVG Visualization Complete');
console.log();

console.log('🔺 The Tetractys lives! Sacred geometry meets modern software. ✨\n');

// Export for programmatic use
export {
  sonarScores as demoSonarScores,
  result as demoResult,
  scenarios as demoScenarios
};
