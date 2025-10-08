import { Baseline, TeamOverride, MultiTeamBaselineManager } from './multi-team-baseline';
import { WilliamsDriftChecker } from './baseline-drift-checker';
import { writeFileSync } from 'fs';
import { join } from 'path';

export interface TeamContribution {
  teamId: string;
  currentSHM: number;
  contribution: number;
  regime: string;
  lastUpdate: string;
}

export interface DriftAlert {
  teamId: string;
  timestamp: string;
  drift: number;
  threshold: number;
  approved: boolean;
  reason: string;
}

export interface RegimeMismatch {
  teams: Array<{ teamId: string; regime: string }>;
  severity: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface CrossTeamReport {
  timestamp: string;
  globalSHM: number;
  trendAnalysis: {
    last10Commits: Array<{ shm: number; timestamp: string; teamId?: string }>;
    averageSHM: number;
    volatility: number;
  };
  teamContributions: TeamContribution[];
  driftAlerts: DriftAlert[];
  regimeMismatches: RegimeMismatch[];
  mergeLog: Array<{
    timestamp: string;
    teamId: string;
    approved: boolean;
    reason: string;
  }>;
  recommendations: string[];
}

/**
 * Cross-Team Reporter
 *
 * Generates comprehensive reports showing:
 * - Global SHM trend (last 10 commits)
 * - Per-team SHM contributions
 * - Drift alerts (which teams caused >5% swings)
 * - Regime mismatch warnings (Team A exploration vs Team B stabilization)
 * - Merge approval/rejection logs
 */
export class CrossTeamReporter {
  private baselineManager: MultiTeamBaselineManager;
  private driftChecker: WilliamsDriftChecker;
  private mergeLog: Array<{
    timestamp: string;
    teamId: string;
    approved: boolean;
    reason: string;
  }> = [];

  constructor(baselineManager: MultiTeamBaselineManager, driftChecker: WilliamsDriftChecker) {
    this.baselineManager = baselineManager;
    this.driftChecker = driftChecker;
  }

  /**
   * Generate comprehensive cross-team report
   */
  generateReport(teamIds: string[]): CrossTeamReport {
    const globalBaseline = this.baselineManager.getGlobalBaseline();
    if (!globalBaseline) {
      throw new Error('Global baseline not loaded');
    }

    const trendAnalysis = this.analyzeTrend(globalBaseline);
    const teamContributions = this.analyzeTeamContributions(teamIds, globalBaseline);
    const driftAlerts = this.analyzeDriftAlerts(globalBaseline);
    const regimeMismatches = this.analyzeRegimeMismatches(teamIds);
    const recommendations = this.generateRecommendations(
      driftAlerts,
      regimeMismatches,
      trendAnalysis
    );

    return {
      timestamp: new Date().toISOString(),
      globalSHM: globalBaseline.shm,
      trendAnalysis,
      teamContributions,
      driftAlerts,
      regimeMismatches,
      mergeLog: this.mergeLog,
      recommendations
    };
  }

  /**
   * Analyze global SHM trend over last 10 commits
   */
  private analyzeTrend(baseline: Baseline): CrossTeamReport['trendAnalysis'] {
    const history = baseline.history || [];
    const last10 = history.slice(-10);

    // Add current value
    last10.push({
      shm: baseline.shm,
      timestamp: baseline.lastUpdated,
      teamId: undefined
    });

    const averageSHM = last10.reduce((sum, h) => sum + h.shm, 0) / last10.length;

    // Calculate volatility (standard deviation)
    const variance =
      last10.reduce((sum, h) => sum + Math.pow(h.shm - averageSHM, 2), 0) / last10.length;
    const volatility = Math.sqrt(variance);

    return {
      last10Commits: last10,
      averageSHM,
      volatility
    };
  }

  /**
   * Analyze per-team contributions to global SHM
   */
  private analyzeTeamContributions(
    teamIds: string[],
    globalBaseline: Baseline
  ): TeamContribution[] {
    const contributions: TeamContribution[] = [];

    for (const teamId of teamIds) {
      const teamOverride = this.baselineManager.getTeamOverride(teamId);

      if (!teamOverride) continue;

      // Calculate team's influence on global SHM
      // This is a simplified calculation - in production, track actual contributions
      const teamWeight = Object.values(teamOverride.weights).reduce((a, b) => a + b, 0);
      const globalWeight = Object.values(globalBaseline.weights).reduce((a, b) => a + b, 0);
      const contribution = (teamWeight / globalWeight) * globalBaseline.shm;

      // Determine team's current regime based on blend
      const regime = this.getTeamRegime(teamOverride.regimeBlend);

      contributions.push({
        teamId,
        currentSHM: contribution,
        contribution: (contribution / globalBaseline.shm) * 100,
        regime,
        lastUpdate: teamOverride.lastUpdated
      });
    }

    return contributions;
  }

  /**
   * Analyze drift alerts from history
   */
  private analyzeDriftAlerts(baseline: Baseline): DriftAlert[] {
    const alerts: DriftAlert[] = [];
    const history = baseline.history || [];

    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const current = history[i];
      const drift = Math.abs(current.shm - prev.shm);
      const driftPercent = (drift / prev.shm) * 100;

      const analysis = this.driftChecker.analyzeDrift(
        prev.shm,
        current.shm,
        baseline.commitsSinceUpdate
      );

      if (driftPercent > 5) {
        alerts.push({
          teamId: current.teamId || 'unknown',
          timestamp: current.timestamp,
          drift: driftPercent,
          threshold: analysis.williamsThreshold * 0.05,
          approved: analysis.autoApprove,
          reason: analysis.reason
        });
      }
    }

    return alerts;
  }

  /**
   * Analyze regime mismatches across teams
   */
  private analyzeRegimeMismatches(teamIds: string[]): RegimeMismatch[] {
    const mismatches: RegimeMismatch[] = [];
    const teamRegimes: Array<{ teamId: string; regime: string }> = [];

    for (const teamId of teamIds) {
      const teamOverride = this.baselineManager.getTeamOverride(teamId);
      if (teamOverride) {
        const regime = this.getTeamRegime(teamOverride.regimeBlend);
        teamRegimes.push({ teamId, regime });
      }
    }

    // Check for mismatches
    const regimeSet = new Set(teamRegimes.map(t => t.regime));

    if (regimeSet.size > 1) {
      // Determine severity
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (regimeSet.has('exploration') && regimeSet.has('stabilization')) {
        severity = 'high'; // Opposite ends of spectrum
      } else if (regimeSet.size === 3) {
        severity = 'medium'; // All three regimes active
      }

      let recommendation: string;
      if (severity === 'high') {
        recommendation =
          'Critical: Teams are in opposing regimes. Coordinate sprint planning to align objectives.';
      } else if (severity === 'medium') {
        recommendation =
          'Moderate: Multiple regimes active. Consider staggering feature releases.';
      } else {
        recommendation = 'Low impact: Adjacent regimes active. Monitor for alignment opportunities.';
      }

      mismatches.push({
        teams: teamRegimes,
        severity,
        recommendation
      });
    }

    return mismatches;
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  private generateRecommendations(
    driftAlerts: DriftAlert[],
    regimeMismatches: RegimeMismatch[],
    trendAnalysis: CrossTeamReport['trendAnalysis']
  ): string[] {
    const recommendations: string[] = [];

    // Drift recommendations
    if (driftAlerts.length > 3) {
      recommendations.push(
        `⚠️ High drift frequency detected (${driftAlerts.length} alerts). Consider baseline freeze or coordinated merge windows.`
      );
    }

    // Volatility recommendations
    if (trendAnalysis.volatility > 0.05) {
      recommendations.push(
        `⚠️ High SHM volatility (${trendAnalysis.volatility.toFixed(3)}). Investigate unstable components.`
      );
    }

    // Regime recommendations
    for (const mismatch of regimeMismatches) {
      if (mismatch.severity === 'high') {
        recommendations.push(`🚨 ${mismatch.recommendation}`);
      } else if (mismatch.severity === 'medium') {
        recommendations.push(`⚠️ ${mismatch.recommendation}`);
      }
    }

    // Trend recommendations
    if (trendAnalysis.averageSHM < 0.75) {
      recommendations.push(
        `⚠️ Below target SHM (${trendAnalysis.averageSHM.toFixed(2)} < 0.75). Focus on stabilization regime.`
      );
    } else if (trendAnalysis.averageSHM > 0.90) {
      recommendations.push(
        `✅ Excellent SHM (${trendAnalysis.averageSHM.toFixed(2)}). Consider exploration initiatives.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ All systems nominal. Continue current development patterns.');
    }

    return recommendations;
  }

  /**
   * Get primary regime from blend
   */
  private getTeamRegime(regimeBlend: [number, number, number]): string {
    const [exploration, optimization, stabilization] = regimeBlend;
    const max = Math.max(exploration, optimization, stabilization);

    if (max === exploration) return 'exploration';
    if (max === optimization) return 'optimization';
    return 'stabilization';
  }

  /**
   * Log a merge attempt
   */
  logMerge(teamId: string, approved: boolean, reason: string): void {
    this.mergeLog.push({
      timestamp: new Date().toISOString(),
      teamId,
      approved,
      reason
    });
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report: CrossTeamReport): string {
    let md = `# Cross-Team Baseline Report\n\n`;
    md += `**Generated:** ${report.timestamp}\n`;
    md += `**Global SHM:** ${report.globalSHM.toFixed(4)}\n\n`;

    // Trend Analysis
    md += `## 📊 Trend Analysis (Last 10 Commits)\n\n`;
    md += `- **Average SHM:** ${report.trendAnalysis.averageSHM.toFixed(4)}\n`;
    md += `- **Volatility:** ${report.trendAnalysis.volatility.toFixed(4)}\n\n`;
    md += `| Commit | SHM | Team | Timestamp |\n`;
    md += `|--------|-----|------|----------|\n`;
    report.trendAnalysis.last10Commits.forEach(commit => {
      md += `| - | ${commit.shm.toFixed(4)} | ${commit.teamId || 'N/A'} | ${commit.timestamp} |\n`;
    });
    md += `\n`;

    // Team Contributions
    md += `## 👥 Team Contributions\n\n`;
    md += `| Team | SHM | Contribution | Regime | Last Update |\n`;
    md += `|------|-----|--------------|--------|-------------|\n`;
    report.teamContributions.forEach(team => {
      md += `| ${team.teamId} | ${team.currentSHM.toFixed(4)} | ${team.contribution.toFixed(1)}% | ${team.regime} | ${team.lastUpdate} |\n`;
    });
    md += `\n`;

    // Drift Alerts
    if (report.driftAlerts.length > 0) {
      md += `## ⚠️ Drift Alerts\n\n`;
      report.driftAlerts.forEach(alert => {
        const status = alert.approved ? '✅' : '❌';
        md += `### ${status} ${alert.teamId} - ${alert.timestamp}\n`;
        md += `- **Drift:** ${alert.drift.toFixed(2)}%\n`;
        md += `- **Threshold:** ${alert.threshold.toFixed(2)}%\n`;
        md += `- **Reason:** ${alert.reason}\n\n`;
      });
    }

    // Regime Mismatches
    if (report.regimeMismatches.length > 0) {
      md += `## 🔄 Regime Mismatches\n\n`;
      report.regimeMismatches.forEach(mismatch => {
        const emoji = mismatch.severity === 'high' ? '🚨' : mismatch.severity === 'medium' ? '⚠️' : 'ℹ️';
        md += `### ${emoji} ${mismatch.severity.toUpperCase()} Severity\n`;
        md += `**Teams:**\n`;
        mismatch.teams.forEach(team => {
          md += `- ${team.teamId}: ${team.regime}\n`;
        });
        md += `\n**Recommendation:** ${mismatch.recommendation}\n\n`;
      });
    }

    // Merge Log
    if (report.mergeLog.length > 0) {
      md += `## 📝 Merge Log\n\n`;
      md += `| Timestamp | Team | Status | Reason |\n`;
      md += `|-----------|------|--------|--------|\n`;
      report.mergeLog.forEach(log => {
        const status = log.approved ? '✅ Approved' : '❌ Rejected';
        md += `| ${log.timestamp} | ${log.teamId} | ${status} | ${log.reason} |\n`;
      });
      md += `\n`;
    }

    // Recommendations
    md += `## 💡 Recommendations\n\n`;
    report.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    md += `\n`;

    md += `---\n*Generated by Cross-Team Reporter - Asymmetrica Protocol*\n`;

    return md;
  }

  /**
   * Save report to disk
   */
  saveReport(report: CrossTeamReport, outputDir: string = 'reports'): void {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const jsonPath = join(outputDir, `cross-team-report-${timestamp}.json`);
    const mdPath = join(outputDir, `cross-team-report-${timestamp}.md`);

    writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    writeFileSync(mdPath, this.generateMarkdownReport(report));

    console.log(`[CrossTeamReporter] Report saved:`);
    console.log(`  JSON: ${jsonPath}`);
    console.log(`  MD: ${mdPath}`);
  }
}
