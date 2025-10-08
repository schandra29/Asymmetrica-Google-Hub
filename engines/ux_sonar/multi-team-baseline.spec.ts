import { describe, it, expect, beforeEach } from '@jest/globals';
import { MultiTeamBaselineManager, Baseline, TeamOverride } from './multi-team-baseline';
import { WilliamsDriftChecker } from './baseline-drift-checker';
import { CrossTeamReporter } from './cross-team-reporter';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('Multi-Team Baseline System', () => {
  let manager: MultiTeamBaselineManager;
  let driftChecker: WilliamsDriftChecker;
  let reporter: CrossTeamReporter;
  const baseDir = process.cwd();

  beforeEach(() => {
    manager = new MultiTeamBaselineManager(baseDir);
    driftChecker = new WilliamsDriftChecker();
    reporter = new CrossTeamReporter(manager, driftChecker);
  });

  describe('MultiTeamBaselineManager', () => {
    it('should load global baseline', () => {
      const baseline = manager.loadGlobalBaseline();

      expect(baseline).toBeDefined();
      expect(baseline.shm).toBe(0.82);
      expect(baseline.regimeBlend).toEqual([0.30, 0.20, 0.50]);
      expect(baseline.commitsSinceUpdate).toBe(3);
    });

    it('should load team overrides for all 3 teams', () => {
      const teamUX = manager.loadTeamOverride('team-ux');
      const teamBackend = manager.loadTeamOverride('team-backend');
      const teamQA = manager.loadTeamOverride('team-qa');

      expect(teamUX.teamId).toBe('team-ux');
      expect(teamUX.weights.design).toBe(0.30); // UX-focused

      expect(teamBackend.teamId).toBe('team-backend');
      expect(teamBackend.weights.code).toBe(0.30); // Backend-focused

      expect(teamQA.teamId).toBe('team-qa');
      expect(teamQA.weights.ux).toBe(0.35); // QA-focused
    });

    it('should blend team-specific weights with global', () => {
      manager.loadGlobalBaseline();
      manager.loadTeamOverride('team-ux');

      const scores = {
        ux: 0.85,
        design: 0.90,
        code: 0.75,
        semantic: 0.80,
        journey: 0.88,
        state: 0.82
      };

      const blended = manager.blendForTeam('team-ux', scores);

      expect(blended.teamId).toBe('team-ux');
      expect(blended.globalInfluence).toBe(0.5); // 50% global influence
      expect(blended.weights.design).toBeGreaterThan(0.25); // UX team emphasizes design
      expect(blended.regimeBlend[0]).toBeGreaterThan(0.30); // More exploration-focused
    });

    it('should use global baseline when no team override exists', () => {
      manager.loadGlobalBaseline();

      const scores = {
        ux: 0.85,
        design: 0.90,
        code: 0.75,
        semantic: 0.80,
        journey: 0.88,
        state: 0.82
      };

      const blended = manager.blendForTeam('team-unknown', scores);

      expect(blended.globalInfluence).toBe(1.0); // 100% global
      expect(blended.weights).toEqual(manager.getGlobalBaseline()!.weights);
    });
  });

  describe('Williams Drift Detection', () => {
    beforeEach(() => {
      manager.loadGlobalBaseline();
    });

    it('should auto-approve small drifts (within threshold)', () => {
      const baseline = manager.getGlobalBaseline()!;
      const smallDrift = 0.821; // ~0.12% drift from 0.82

      const result = manager.checkMergeDrift('team-ux', smallDrift);

      expect(result.approved).toBe(true);
      expect(result.drift).toBeLessThan(1); // Less than 1% drift
      expect(result.williamsValue).toBeGreaterThan(0);
      console.log(`✅ Small drift approved: ${result.reason}`);
    });

    it('should reject large drifts (exceeds threshold)', () => {
      const baseline = manager.getGlobalBaseline()!;
      const largeDrift = 0.90; // ~9.76% drift from 0.82

      const result = manager.checkMergeDrift('team-backend', largeDrift);

      expect(result.approved).toBe(false);
      expect(result.drift).toBeGreaterThan(5); // More than 5% drift
      console.log(`❌ Large drift rejected: ${result.reason}`);
    });

    it('should calculate Williams threshold correctly for different commit counts', () => {
      const table = driftChecker.getThresholdTable();

      expect(table).toHaveLength(9);

      // Verify formula: √t × log₂(t)
      const t4 = table.find(t => t.commits === 4)!;
      expect(t4.williams).toBeCloseTo(4.0, 1); // √4 × log₂(4) = 2 × 2 = 4

      const t16 = table.find(t => t.commits === 16)!;
      expect(t16.williams).toBeCloseTo(16.0, 1); // √16 × log₂(16) = 4 × 4 = 16

      console.log('Williams Threshold Table:');
      table.forEach(t => {
        console.log(
          `  Commits: ${t.commits}, Williams: ${t.williams.toFixed(2)}, Auto-Approve: ${t.autoApprove.toFixed(2)}%`
        );
      });
    });

    it('should handle edge case: first commit (t=1)', () => {
      const threshold = driftChecker.williamsThreshold(1);
      expect(threshold).toBe(0.5); // Special case for first commit
    });

    it('should handle edge case: zero commits', () => {
      const threshold = driftChecker.williamsThreshold(0);
      expect(threshold).toBe(0); // No drift allowed with 0 commits
    });
  });

  describe('Cross-Team Merge Simulation', () => {
    beforeEach(() => {
      manager.loadGlobalBaseline();
      manager.loadTeamOverride('team-ux');
      manager.loadTeamOverride('team-backend');
    });

    it('should approve and merge small drift from Team A', () => {
      const initialSHM = manager.getGlobalBaseline()!.shm;
      const newSHM = 0.825; // Small increase

      const approved = manager.approveAutoMerge('team-ux', newSHM, 'commit-abc');

      expect(approved).toBe(true);
      expect(manager.getGlobalBaseline()!.shm).toBe(newSHM);
      expect(manager.getGlobalBaseline()!.commitsSinceUpdate).toBe(0);
      expect(manager.getGlobalBaseline()!.history).toHaveLength(3); // 2 initial + 1 new
    });

    it('should reject large drift from Team B and maintain baseline', () => {
      const initialSHM = manager.getGlobalBaseline()!.shm;
      const newSHM = 0.95; // Large increase

      const approved = manager.approveAutoMerge('team-backend', newSHM, 'commit-def');

      expect(approved).toBe(false);
      expect(manager.getGlobalBaseline()!.shm).toBe(initialSHM); // Unchanged
      expect(manager.getGlobalBaseline()!.commitsSinceUpdate).toBe(3); // Unchanged
    });

    it('should track history correctly after multiple merges', () => {
      manager.approveAutoMerge('team-ux', 0.823, 'commit-1');
      manager.approveAutoMerge('team-backend', 0.825, 'commit-2');

      const history = manager.getGlobalBaseline()!.history!;
      expect(history.length).toBeGreaterThanOrEqual(2);

      const lastEntry = history[history.length - 1];
      expect(lastEntry.teamId).toBe('team-ux'); // First merge
      expect(lastEntry.commitHash).toBe('commit-1');
    });
  });

  describe('Regime Mismatch Detection', () => {
    beforeEach(() => {
      manager.loadGlobalBaseline();
      manager.loadTeamOverride('team-ux');
      manager.loadTeamOverride('team-backend');
      manager.loadTeamOverride('team-qa');
    });

    it('should detect regime mismatch when teams are in different regimes', () => {
      const teams = [
        { teamId: 'team-ux', regime: 'exploration' }, // UX: 35/20/45
        { teamId: 'team-backend', regime: 'stabilization' }, // Backend: 25/25/50
        { teamId: 'team-qa', regime: 'stabilization' } // QA: 20/30/50
      ];

      const result = manager.checkRegimeMismatch(teams);

      expect(result.mismatch).toBe(true);
      expect(result.details).toContain('team-ux: exploration');
      expect(result.details).toContain('team-backend: stabilization');
      console.log(`⚠️ Regime mismatch: ${result.details}`);
    });

    it('should not detect mismatch when teams are aligned', () => {
      const teams = [
        { teamId: 'team-backend', regime: 'stabilization' },
        { teamId: 'team-qa', regime: 'stabilization' }
      ];

      const result = manager.checkRegimeMismatch(teams);

      expect(result.mismatch).toBe(false);
      expect(result.details).toContain('All teams in sync');
    });
  });

  describe('Cross-Team Reporter', () => {
    beforeEach(() => {
      manager.loadGlobalBaseline();
      manager.loadTeamOverride('team-ux');
      manager.loadTeamOverride('team-backend');
      manager.loadTeamOverride('team-qa');
    });

    it('should generate comprehensive cross-team report', () => {
      const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);

      expect(report.globalSHM).toBe(0.82);
      expect(report.trendAnalysis.last10Commits.length).toBeGreaterThan(0);
      expect(report.teamContributions.length).toBe(3);
      expect(report.recommendations.length).toBeGreaterThan(0);

      console.log('\nCross-Team Report Summary:');
      console.log(`Global SHM: ${report.globalSHM}`);
      console.log(`Average SHM: ${report.trendAnalysis.averageSHM.toFixed(4)}`);
      console.log(`Volatility: ${report.trendAnalysis.volatility.toFixed(4)}`);
      console.log(`Teams: ${report.teamContributions.length}`);
      console.log(`Recommendations: ${report.recommendations.length}`);
    });

    it('should track team contributions correctly', () => {
      const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);

      const uxContribution = report.teamContributions.find(t => t.teamId === 'team-ux');
      const backendContribution = report.teamContributions.find(t => t.teamId === 'team-backend');

      expect(uxContribution).toBeDefined();
      expect(backendContribution).toBeDefined();
      expect(uxContribution!.regime).toBe('exploration'); // UX team is exploration-focused
      expect(backendContribution!.regime).toBe('stabilization'); // Backend is stabilization
    });

    it('should generate markdown report', () => {
      const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);
      const markdown = reporter.generateMarkdownReport(report);

      expect(markdown).toContain('# Cross-Team Baseline Report');
      expect(markdown).toContain('## 📊 Trend Analysis');
      expect(markdown).toContain('## 👥 Team Contributions');
      expect(markdown).toContain('team-ux');
      expect(markdown).toContain('team-backend');
      expect(markdown).toContain('team-qa');

      console.log('\n' + '='.repeat(60));
      console.log(markdown);
      console.log('='.repeat(60));
    });

    it('should detect high volatility and recommend action', () => {
      // Simulate high volatility by approving multiple divergent merges
      manager.approveAutoMerge('team-ux', 0.81, 'commit-1');
      manager.approveAutoMerge('team-backend', 0.805, 'commit-2');
      manager.approveAutoMerge('team-qa', 0.808, 'commit-3');

      const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);

      // Check if volatility warning appears in recommendations
      const hasVolatilityWarning = report.recommendations.some(rec =>
        rec.toLowerCase().includes('volatility')
      );

      console.log('\nRecommendations:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    });

    it('should log merge attempts', () => {
      reporter.logMerge('team-ux', true, 'Drift within threshold');
      reporter.logMerge('team-backend', false, 'Drift exceeds threshold');

      const report = reporter.generateReport(['team-ux', 'team-backend']);

      expect(report.mergeLog.length).toBe(2);
      expect(report.mergeLog[0].approved).toBe(true);
      expect(report.mergeLog[1].approved).toBe(false);
    });
  });

  describe('Drift Analysis', () => {
    it('should calculate drift percentage correctly', () => {
      const analysis = driftChecker.calculateDrift(0.80, 0.88);

      expect(analysis.drift).toBeCloseTo(0.08, 2);
      expect(analysis.driftPercent).toBeCloseTo(10.0, 1); // 10% drift
    });

    it('should generate detailed drift report', () => {
      const report = driftChecker.generateDriftReport(0.82, 0.85, 5, 'team-ux');

      expect(report.teamId).toBe('team-ux');
      expect(report.baseline.current).toBe(0.82);
      expect(report.baseline.proposed).toBe(0.85);
      expect(report.analysis.commitCount).toBe(5);
      expect(report.recommendation).toContain('APPROVE');

      console.log('\nDrift Report:');
      console.log(driftChecker.generateMarkdownReport(report));
    });

    it('should batch analyze multiple scenarios', () => {
      const scenarios = [
        { baseline: 0.80, newValue: 0.81, commitCount: 4, teamId: 'team-ux' },
        { baseline: 0.82, newValue: 0.90, commitCount: 2, teamId: 'team-backend' },
        { baseline: 0.85, newValue: 0.86, commitCount: 8, teamId: 'team-qa' }
      ];

      const reports = driftChecker.batchAnalyze(scenarios);

      expect(reports.length).toBe(3);
      expect(reports[0].analysis.autoApprove).toBe(true); // Small drift
      expect(reports[1].analysis.autoApprove).toBe(false); // Large drift

      console.log('\nBatch Analysis Results:');
      reports.forEach((r, i) => {
        console.log(
          `  ${i + 1}. ${r.teamId}: ${r.analysis.autoApprove ? '✅' : '❌'} - ${r.analysis.reason}`
        );
      });
    });
  });

  describe('Integration Test: Full Workflow', () => {
    it('should complete full multi-team workflow', () => {
      console.log('\n🌀 Starting Full Multi-Team Workflow Test 🌀\n');

      // 1. Load global baseline
      console.log('1️⃣ Loading global baseline...');
      const baseline = manager.loadGlobalBaseline();
      console.log(`   Global SHM: ${baseline.shm}, Commits: ${baseline.commitsSinceUpdate}`);

      // 2. Load team overrides
      console.log('\n2️⃣ Loading team overrides...');
      manager.loadTeamOverride('team-ux');
      manager.loadTeamOverride('team-backend');
      manager.loadTeamOverride('team-qa');
      console.log('   Loaded: team-ux, team-backend, team-qa');

      // 3. Team UX proposes small change (should approve)
      console.log('\n3️⃣ Team UX proposes SHM 0.825 (small drift)...');
      const uxApproved = manager.approveAutoMerge('team-ux', 0.825, 'ux-commit-1');
      reporter.logMerge('team-ux', uxApproved, uxApproved ? 'Auto-approved' : 'Rejected');
      console.log(`   Result: ${uxApproved ? '✅ Approved' : '❌ Rejected'}`);

      // 4. Team Backend proposes large change (should reject)
      console.log('\n4️⃣ Team Backend proposes SHM 0.95 (large drift)...');
      const backendApproved = manager.approveAutoMerge('team-backend', 0.95, 'backend-commit-1');
      reporter.logMerge(
        'team-backend',
        backendApproved,
        backendApproved ? 'Auto-approved' : 'Exceeds threshold'
      );
      console.log(`   Result: ${backendApproved ? '✅ Approved' : '❌ Rejected'}`);

      // 5. Generate cross-team report
      console.log('\n5️⃣ Generating cross-team report...');
      const report = reporter.generateReport(['team-ux', 'team-backend', 'team-qa']);
      console.log(`   Global SHM: ${report.globalSHM}`);
      console.log(`   Trend volatility: ${report.trendAnalysis.volatility.toFixed(4)}`);
      console.log(`   Merge log entries: ${report.mergeLog.length}`);

      // 6. Check regime mismatches
      console.log('\n6️⃣ Checking regime alignment...');
      const teams = report.teamContributions.map(t => ({
        teamId: t.teamId,
        regime: t.regime
      }));
      const mismatch = manager.checkRegimeMismatch(teams);
      console.log(
        `   Mismatch: ${mismatch.mismatch ? '⚠️ YES' : '✅ NO'} - ${mismatch.details}`
      );

      // 7. Display recommendations
      console.log('\n7️⃣ System Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));

      // Assertions
      expect(uxApproved).toBe(true);
      expect(backendApproved).toBe(false);
      expect(report.mergeLog.length).toBe(2);
      expect(mismatch.mismatch).toBe(true); // UX vs Backend regimes differ

      console.log('\n✅ Full workflow test complete!\n');
    });
  });
});
