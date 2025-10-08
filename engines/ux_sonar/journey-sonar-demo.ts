/**
 * Journey Sonar Demo - Generate Example Metrics
 * This demonstrates the system without needing a running server
 */

import { JourneyNormalizer } from './journey-sonar/normalizer';
import { JourneyCritiqueAdapter } from './journey-sonar/critique-adapter';
import { JourneyReportGenerator } from './journey-sonar/report-generator';

// Mock telemetry data for demonstration
const mockHappyPathTelemetry = {
  route: '/dashboard',
  duration: 2500,
  timestamp: Date.now(),
  telemetry: {
    hesitationEvents: [],
    rageClickEvents: [],
    navigationEvents: [
      { timestamp: 1000, from: '/', to: '/dashboard', action: 'click' as const }
    ],
    errorEvents: [],
    taskCompletions: [
      { timestamp: 2500, taskName: 'View dashboard', duration: 2500, success: true, errorCount: 0 }
    ],
    pointerEvents: []
  },
  metrics: {
    avgHesitationTime: 0,
    hesitationCount: 0,
    rageClickCount: 0,
    backtrackCount: 0,
    errorLoopCount: 0,
    taskSuccessRate: 100,
    avgTaskDuration: 2500
  }
};

const mockFrustratedUserTelemetry = {
  route: '/checkout',
  duration: 12000,
  timestamp: Date.now(),
  telemetry: {
    hesitationEvents: [
      { timestamp: 2000, duration: 2500, beforeAction: 'click', element: 'button' },
      { timestamp: 5000, duration: 1800, beforeAction: 'hover', element: 'a' }
    ],
    rageClickEvents: [
      { timestamp: 8000, clickCount: 5, radius: 15, element: 'button', x: 500, y: 300 }
    ],
    navigationEvents: [
      { timestamp: 3000, from: '/', to: '/checkout', action: 'click' as const },
      { timestamp: 6000, from: '/checkout', to: '/', action: 'back' as const },
      { timestamp: 7000, from: '/', to: '/checkout', action: 'forward' as const }
    ],
    errorEvents: [
      { timestamp: 9000, errorType: 'validation-error', count: 2 }
    ],
    taskCompletions: [
      { timestamp: 12000, taskName: 'Complete checkout', duration: 12000, success: false, errorCount: 2 }
    ],
    pointerEvents: []
  },
  metrics: {
    avgHesitationTime: 2150,
    hesitationCount: 2,
    rageClickCount: 1,
    backtrackCount: 1,
    errorLoopCount: 1,
    taskSuccessRate: 0,
    avgTaskDuration: 12000
  }
};

async function runDemo() {
  console.log('='.repeat(80));
  console.log('JOURNEY SONAR DEMONSTRATION');
  console.log('='.repeat(80));
  console.log();

  const normalizer = new JourneyNormalizer();
  const critiqueAdapter = new JourneyCritiqueAdapter();
  const reportGenerator = new JourneyReportGenerator();

  // Demo 1: Happy Path
  console.log('📊 SCENARIO 1: Happy Path (Smooth User Flow)');
  console.log('-'.repeat(80));

  const normalized1 = normalizer.normalize(mockHappyPathTelemetry, '/dashboard');

  console.log('Frustration Score:', (normalized1.metrics.frustrationScore * 100).toFixed(1) + '%');
  console.log('Delight Score:', (normalized1.metrics.delightScore * 100).toFixed(1) + '%');
  console.log('Hesitation Ratio:', (normalized1.metrics.hesitationRatio * 100).toFixed(1) + '%');
  console.log('Task Success Rate:', normalized1.metrics.taskSuccessRate + '%');
  console.log('Regime:', normalized1.asymmetrica.regime);
  console.log('Frustration Level:', normalized1.delight.frustrationLevel);
  console.log();

  const critiques1 = critiqueAdapter.generateCritique(normalized1);
  const delightSignals1 = critiques1.filter(c => c.delightMode === true);

  console.log('✅ Delight Signals:', delightSignals1.length);
  delightSignals1.forEach(signal => {
    console.log('  -', signal.finding);
  });
  console.log();

  normalizer.saveBaseline(normalized1, '/demo-happy-path');

  // Demo 2: Frustrated User
  console.log('📊 SCENARIO 2: Frustrated User (Rage Clicks + Errors)');
  console.log('-'.repeat(80));

  const normalized2 = normalizer.normalize(mockFrustratedUserTelemetry, '/checkout');

  console.log('Frustration Score:', (normalized2.metrics.frustrationScore * 100).toFixed(1) + '%');
  console.log('Delight Score:', (normalized2.metrics.delightScore * 100).toFixed(1) + '%');
  console.log('Hesitation Ratio:', (normalized2.metrics.hesitationRatio * 100).toFixed(1) + '%');
  console.log('Rage Click Density:', (normalized2.metrics.rageClickDensity * 100).toFixed(1) + '%');
  console.log('Backtrack Ratio:', (normalized2.metrics.backtrackRatio * 100).toFixed(1) + '%');
  console.log('Error Loop Score:', (normalized2.metrics.errorLoopScore * 100).toFixed(1) + '%');
  console.log('Task Success Rate:', normalized2.metrics.taskSuccessRate + '%');
  console.log('Regime:', normalized2.asymmetrica.regime);
  console.log('Frustration Level:', normalized2.delight.frustrationLevel);
  console.log();

  const critiques2 = critiqueAdapter.generateCritique(normalized2);
  const critical2 = critiques2.filter(c => c.severity === 'critical');
  const warnings2 = critiques2.filter(c => c.severity === 'warning');

  console.log('🚨 Critical Issues:', critical2.length);
  critical2.forEach(issue => {
    console.log('  -', issue.heuristic + ':', issue.finding);
  });
  console.log();

  console.log('⚠️  Warnings:', warnings2.length);
  warnings2.forEach(issue => {
    console.log('  -', issue.heuristic + ':', issue.finding);
  });
  console.log();

  // Recommendations
  const recommendations = normalizer.generateRecommendations(normalized2);
  console.log('💡 Recommendations:');
  recommendations.forEach(rec => {
    console.log('  -', rec);
  });
  console.log();

  normalizer.saveBaseline(normalized2, '/demo-frustrated-user');

  // Generate reports
  const report1 = reportGenerator.generate(normalized1, '/demo-happy-path');
  const report2 = reportGenerator.generate(normalized2, '/demo-frustrated-user');

  const reportPath1 = reportGenerator.saveReport(report1, 'html');
  const reportPath2 = reportGenerator.saveReport(report2, 'html');

  console.log('📄 Reports Generated:');
  console.log('  - Happy Path:', reportPath1);
  console.log('  - Frustrated User:', reportPath2);
  console.log();

  // Comparison
  console.log('📊 BASELINE COMPARISON');
  console.log('-'.repeat(80));

  const baseline = normalizer.loadBaseline('/demo-happy-path');
  if (baseline) {
    const comparison = normalizer.compareBaselines(normalized2, baseline);

    console.log('Frustration Delta:', (comparison.frustrationDelta * 100).toFixed(1) + '%', comparison.frustrationDelta > 0 ? '📈 (worse)' : '📉 (better)');
    console.log('Delight Delta:', (comparison.delightDelta * 100).toFixed(1) + '%', comparison.delightDelta > 0 ? '📈 (better)' : '📉 (worse)');
    console.log('Success Rate Delta:', comparison.successRateDelta.toFixed(1) + '%', comparison.successRateDelta > 0 ? '📈 (better)' : '📉 (worse)');
    console.log('Regime Change:', comparison.regimeChange ? `Yes (${baseline.asymmetrica.regime} → ${normalized2.asymmetrica.regime})` : 'No');
    console.log('Verdict:', comparison.verdict.toUpperCase());
  }

  console.log();
  console.log('='.repeat(80));
  console.log('✅ JOURNEY SONAR DEMO COMPLETE!');
  console.log('='.repeat(80));
  console.log();
  console.log('Summary of Capabilities:');
  console.log('✓ Privacy-first telemetry (no PII, aggregate metrics only)');
  console.log('✓ Frustration Score calculation (Grok\'s formula)');
  console.log('✓ 5 heuristic patterns (rage clicks, hesitation, backtrack, error loops, choice overload)');
  console.log('✓ Delight signal detection (Praise Mode!)');
  console.log('✓ Regime classification (exploration/optimization/stabilization)');
  console.log('✓ Sankey diagrams + heatmaps + funnel analysis');
  console.log('✓ Code examples for fixes');
  console.log('✓ HTML + JSON reports');
  console.log('✓ Baseline comparison for regression detection');
  console.log();
}

// Run the demo
runDemo().catch(console.error);
