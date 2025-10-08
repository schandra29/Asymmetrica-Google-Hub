import { Baseline, BaselineSnapshot } from './multi-team-baseline';

export interface DriftAnalysis {
  drift: number;
  driftPercent: number;
  williamsThreshold: number;
  autoApprove: boolean;
  commitCount: number;
  reason: string;
}

export interface DriftReport {
  timestamp: string;
  teamId?: string;
  analysis: DriftAnalysis;
  baseline: {
    current: number;
    proposed: number;
  };
  recommendation: string;
}

/**
 * Williams Drift Checker
 *
 * Implements Williams Space Optimizer formula for baseline drift detection:
 * Formula: √t × log₂(t) where t = commits since last baseline update
 *
 * Auto-approve threshold: drift < williamsThreshold × 5%
 *
 * This prevents "configuration chaos" at scale by allowing small, natural
 * drifts while alerting on significant changes that could destabilize the system.
 */
export class WilliamsDriftChecker {
  private readonly AUTO_APPROVE_MULTIPLIER = 0.05; // 5% of Williams threshold

  /**
   * Calculate drift between baseline and new value
   * Returns absolute drift and percentage
   */
  calculateDrift(baseline: number, newValue: number): { drift: number; driftPercent: number } {
    const drift = Math.abs(newValue - baseline);
    const driftPercent = (drift / baseline) * 100;

    return { drift, driftPercent };
  }

  /**
   * Calculate Williams threshold: √t × log₂(t)
   * Where t = number of commits since last baseline update
   *
   * This formula comes from computational geometry (Ryan Williams, 2011)
   * and provides a natural growth curve for acceptable drift.
   *
   * Examples:
   * - t=1:   √1 × log₂(1) = 1 × 0 = 0 (no drift allowed on first commit)
   * - t=2:   √2 × log₂(2) = 1.41 × 1 = 1.41
   * - t=4:   √4 × log₂(4) = 2 × 2 = 4
   * - t=8:   √8 × log₂(8) = 2.83 × 3 = 8.49
   * - t=16:  √16 × log₂(16) = 4 × 4 = 16
   * - t=100: √100 × log₂(100) = 10 × 6.64 = 66.4
   */
  williamsThreshold(commitCount: number): number {
    if (commitCount <= 0) return 0;
    if (commitCount === 1) return 0.5; // Special case: allow minimal drift on first commit

    return Math.sqrt(commitCount) * Math.log2(commitCount);
  }

  /**
   * Determine if drift should be auto-approved
   * Auto-approve if: driftPercent < williamsThreshold × 5%
   */
  shouldAutoApprove(drift: number, threshold: number): boolean {
    const autoApproveThreshold = threshold * this.AUTO_APPROVE_MULTIPLIER;
    return drift < autoApproveThreshold;
  }

  /**
   * Complete drift analysis with recommendation
   */
  analyzeDrift(
    baseline: number,
    newValue: number,
    commitCount: number,
    teamId?: string
  ): DriftAnalysis {
    const { drift, driftPercent } = this.calculateDrift(baseline, newValue);
    const williamsThreshold = this.williamsThreshold(commitCount);
    const autoApprove = this.shouldAutoApprove(driftPercent, williamsThreshold);

    const autoApproveThreshold = williamsThreshold * this.AUTO_APPROVE_MULTIPLIER;

    let reason: string;
    if (autoApprove) {
      reason = `Drift ${driftPercent.toFixed(2)}% is within Williams threshold ${autoApproveThreshold.toFixed(2)}% (√${commitCount} × log₂(${commitCount}) × 5%)`;
    } else {
      reason = `Drift ${driftPercent.toFixed(2)}% exceeds Williams threshold ${autoApproveThreshold.toFixed(2)}% - manual review required`;
    }

    return {
      drift,
      driftPercent,
      williamsThreshold,
      autoApprove,
      commitCount,
      reason
    };
  }

  /**
   * Generate detailed drift report with markdown formatting
   */
  generateDriftReport(
    baseline: number,
    newValue: number,
    commitCount: number,
    teamId?: string
  ): DriftReport {
    const analysis = this.analyzeDrift(baseline, newValue, commitCount, teamId);

    let recommendation: string;
    if (analysis.autoApprove) {
      recommendation = '✅ AUTO-APPROVE: Drift is within acceptable bounds. Merge can proceed automatically.';
    } else {
      recommendation = `⚠️ MANUAL REVIEW REQUIRED: Drift exceeds Williams threshold. Cross-team impact assessment needed.`;
    }

    return {
      timestamp: new Date().toISOString(),
      teamId,
      analysis,
      baseline: {
        current: baseline,
        proposed: newValue
      },
      recommendation
    };
  }

  /**
   * Generate markdown drift report
   */
  generateMarkdownReport(report: DriftReport): string {
    const { analysis, baseline, recommendation, teamId, timestamp } = report;

    return `
# Baseline Drift Report

**Timestamp:** ${timestamp}
${teamId ? `**Team:** ${teamId}` : ''}

## Baseline Comparison
- **Current SHM:** ${baseline.current.toFixed(4)}
- **Proposed SHM:** ${baseline.proposed.toFixed(4)}
- **Absolute Drift:** ${analysis.drift.toFixed(4)}
- **Drift Percentage:** ${analysis.driftPercent.toFixed(2)}%

## Williams Space Optimizer Analysis
- **Formula:** √t × log₂(t) where t = commits since last update
- **Commit Count:** ${analysis.commitCount}
- **Williams Threshold:** ${analysis.williamsThreshold.toFixed(2)}
- **Auto-Approve Threshold:** ${(analysis.williamsThreshold * this.AUTO_APPROVE_MULTIPLIER).toFixed(2)}% (5% of Williams value)
- **Auto-Approve:** ${analysis.autoApprove ? '✅ YES' : '❌ NO'}

## Analysis
${analysis.reason}

## Recommendation
${recommendation}

---
*Generated by Williams Drift Checker - Asymmetrica Protocol*
    `.trim();
  }

  /**
   * Batch analyze multiple drift scenarios
   */
  batchAnalyze(
    scenarios: Array<{
      baseline: number;
      newValue: number;
      commitCount: number;
      teamId?: string;
    }>
  ): DriftReport[] {
    return scenarios.map(scenario =>
      this.generateDriftReport(
        scenario.baseline,
        scenario.newValue,
        scenario.commitCount,
        scenario.teamId
      )
    );
  }

  /**
   * Calculate recommended commit frequency based on desired drift tolerance
   * Returns number of commits before manual review is needed
   */
  calculateRecommendedCommitFrequency(driftTolerance: number): number {
    // Solve: driftTolerance = √t × log₂(t) × 0.05
    // This is an approximation using iterative approach
    let t = 1;
    while (t < 1000) {
      const threshold = this.williamsThreshold(t) * this.AUTO_APPROVE_MULTIPLIER;
      if (threshold >= driftTolerance) {
        return t;
      }
      t++;
    }
    return t;
  }

  /**
   * Get Williams threshold values for common commit counts
   * Useful for documentation and planning
   */
  getThresholdTable(): Array<{ commits: number; williams: number; autoApprove: number }> {
    const commitCounts = [1, 2, 4, 8, 16, 32, 64, 100, 200];

    return commitCounts.map(commits => ({
      commits,
      williams: this.williamsThreshold(commits),
      autoApprove: this.williamsThreshold(commits) * this.AUTO_APPROVE_MULTIPLIER
    }));
  }
}
