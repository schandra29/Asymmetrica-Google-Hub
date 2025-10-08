/**
 * Williams Drift Detection Scenarios
 * Demonstrates auto-approve vs manual review at different commit counts
 */

import { WilliamsDriftChecker } from './baseline-drift-checker';

const checker = new WilliamsDriftChecker();

console.log('🌀 WILLIAMS DRIFT DETECTION SCENARIOS 🌀\n');
console.log('Formula: √t × log₂(t) where t = commits since last update');
console.log('Auto-approve threshold: Williams × 5%\n');
console.log('='.repeat(100));

// Scenario 1: Early commits (strict threshold)
console.log('\n📍 SCENARIO 1: Early Development (2 commits since baseline)');
console.log('-'.repeat(100));
const scenario1 = [
  { teamId: 'team-ux', baseline: 0.80, proposed: 0.801, commits: 2 },
  { teamId: 'team-backend', baseline: 0.80, proposed: 0.805, commits: 2 },
  { teamId: 'team-qa', baseline: 0.80, proposed: 0.82, commits: 2 }
];

scenario1.forEach(s => {
  const report = checker.generateDriftReport(s.baseline, s.proposed, s.commits, s.teamId);
  const status = report.analysis.autoApprove ? '✅ AUTO-APPROVED' : '❌ MANUAL REVIEW';
  console.log(`${status} - ${s.teamId}: ${s.baseline} → ${s.proposed} (${report.analysis.driftPercent.toFixed(2)}% drift)`);
  console.log(`  Williams: ${report.analysis.williamsThreshold.toFixed(2)}, Threshold: ${(report.analysis.williamsThreshold * 0.05).toFixed(2)}%`);
});

// Scenario 2: Medium maturity (balanced threshold)
console.log('\n📍 SCENARIO 2: Medium Maturity (16 commits since baseline)');
console.log('-'.repeat(100));
const scenario2 = [
  { teamId: 'team-ux', baseline: 0.82, proposed: 0.825, commits: 16 },
  { teamId: 'team-backend', baseline: 0.82, proposed: 0.83, commits: 16 },
  { teamId: 'team-qa', baseline: 0.82, proposed: 0.85, commits: 16 }
];

scenario2.forEach(s => {
  const report = checker.generateDriftReport(s.baseline, s.proposed, s.commits, s.teamId);
  const status = report.analysis.autoApprove ? '✅ AUTO-APPROVED' : '❌ MANUAL REVIEW';
  console.log(`${status} - ${s.teamId}: ${s.baseline} → ${s.proposed} (${report.analysis.driftPercent.toFixed(2)}% drift)`);
  console.log(`  Williams: ${report.analysis.williamsThreshold.toFixed(2)}, Threshold: ${(report.analysis.williamsThreshold * 0.05).toFixed(2)}%`);
});

// Scenario 3: High maturity (loose threshold)
console.log('\n📍 SCENARIO 3: High Maturity (100 commits since baseline)');
console.log('-'.repeat(100));
const scenario3 = [
  { teamId: 'team-ux', baseline: 0.85, proposed: 0.88, commits: 100 },
  { teamId: 'team-backend', baseline: 0.85, proposed: 0.90, commits: 100 },
  { teamId: 'team-qa', baseline: 0.85, proposed: 0.95, commits: 100 }
];

scenario3.forEach(s => {
  const report = checker.generateDriftReport(s.baseline, s.proposed, s.commits, s.teamId);
  const status = report.analysis.autoApprove ? '✅ AUTO-APPROVED' : '❌ MANUAL REVIEW';
  console.log(`${status} - ${s.teamId}: ${s.baseline} → ${s.proposed} (${report.analysis.driftPercent.toFixed(2)}% drift)`);
  console.log(`  Williams: ${report.analysis.williamsThreshold.toFixed(2)}, Threshold: ${(report.analysis.williamsThreshold * 0.05).toFixed(2)}%`);
});

// Scenario 4: Edge cases
console.log('\n📍 SCENARIO 4: Edge Cases');
console.log('-'.repeat(100));
const scenario4 = [
  { teamId: 'first-commit', baseline: 0.80, proposed: 0.801, commits: 1 },
  { teamId: 'large-drift', baseline: 0.80, proposed: 0.95, commits: 50 },
  { teamId: 'tiny-drift', baseline: 0.80, proposed: 0.8001, commits: 10 }
];

scenario4.forEach(s => {
  const report = checker.generateDriftReport(s.baseline, s.proposed, s.commits, s.teamId);
  const status = report.analysis.autoApprove ? '✅ AUTO-APPROVED' : '❌ MANUAL REVIEW';
  console.log(`${status} - ${s.teamId}: ${s.baseline} → ${s.proposed} (${report.analysis.driftPercent.toFixed(2)}% drift)`);
  console.log(`  Williams: ${report.analysis.williamsThreshold.toFixed(2)}, Threshold: ${(report.analysis.williamsThreshold * 0.05).toFixed(2)}%`);
});

// Summary table
console.log('\n📊 WILLIAMS THRESHOLD GROWTH CURVE');
console.log('-'.repeat(100));
console.log('Commits | Williams | Auto-Approve | Example: 2% drift | Example: 5% drift | Example: 10% drift');
console.log('-'.repeat(100));

const commitCounts = [1, 2, 4, 8, 16, 32, 64, 100, 200];
commitCounts.forEach(commits => {
  const williams = checker.williamsThreshold(commits);
  const threshold = williams * 0.05;

  const drift2 = 2 < threshold ? '✅' : '❌';
  const drift5 = 5 < threshold ? '✅' : '❌';
  const drift10 = 10 < threshold ? '✅' : '❌';

  console.log(
    `${commits.toString().padStart(7)} | ${williams.toFixed(2).padStart(8)} | ${threshold.toFixed(2).padStart(12)}% | ${drift2.padStart(17)} | ${drift5.padStart(17)} | ${drift10.padStart(18)}`
  );
});

// Key insights
console.log('\n💡 KEY INSIGHTS');
console.log('-'.repeat(100));
console.log('1. Early commits (1-4): Very strict threshold (0.03%-0.20%) - prevents bad initial baselines');
console.log('2. Medium commits (8-32): Balanced threshold (0.42%-1.41%) - natural evolution allowed');
console.log('3. High commits (64-200): Loose threshold (2.40%-5.41%) - mature system can drift more');
console.log('4. Formula √t × log₂(t): Logarithmic growth prevents unbounded drift');
console.log('5. 5% multiplier: Balance between automation (productivity) and safety (quality)');

console.log('\n✅ Drift detection scenarios complete!\n');
