/**
 * PR Comment Generator
 * Generates beautiful, informative PR comments with Sonar Suite results
 *
 * Agent Kilo - CI/CD Automation Architect
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SonarScore {
  name: string;
  score: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  keyMetric: { name: string; value: string; unit: string };
  delta: number;
  status: 'critical' | 'warning' | 'healthy';
}

interface SystemHealthData {
  shm: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  delta: number;
  sonars: SonarScore[];
  regimeDistribution: {
    exploration: number;
    optimization: number;
    stabilization: number;
  };
  praiseSignals: Array<{ sonar: string; message: string; icon: string }>;
  alerts: Array<{ severity: 'critical' | 'warning'; sonar: string; message: string }>;
  timestamp: string;
}

interface QualityGateReport {
  overallStatus: 'passed' | 'failed' | 'warning';
  shm: number;
  regime: string;
  gates: Array<{ name: string; status: string; message: string; score?: number }>;
  summary: string;
  recommendations: string[];
  timestamp: string;
}

class PRCommentGenerator {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    const isInUXSonar = basePath.includes('ux-sonar');
    this.basePath = isInUXSonar ? basePath : join(basePath, 'tests/ux-sonar');
  }

  /**
   * Load system health data
   */
  loadSystemHealth(): SystemHealthData | null {
    const path = join(this.basePath, 'reports/system-health-report.json');
    if (!existsSync(path)) return null;

    try {
      return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (error) {
      console.error('Failed to load system health data:', error);
      return null;
    }
  }

  /**
   * Load quality gate report
   */
  loadQualityGateReport(): QualityGateReport | null {
    const path = join(this.basePath, 'reports/quality-gates-report.json');
    if (!existsSync(path)) return null;

    try {
      return JSON.parse(readFileSync(path, 'utf-8'));
    } catch (error) {
      console.error('Failed to load quality gate report:', error);
      return null;
    }
  }

  /**
   * Generate SHM badge
   */
  getSHMBadge(shm: number, regime: string): string {
    const percentage = (shm * 100).toFixed(0);
    const color = this.getSHMColor(shm);
    const emoji = this.getRegimeEmoji(regime);

    return `![SHM](https://img.shields.io/badge/SHM-${percentage}%25-${color}?style=for-the-badge&logo=target) ${emoji}`;
  }

  /**
   * Get color for SHM badge
   */
  private getSHMColor(shm: number): string {
    if (shm >= 0.85) return 'brightgreen';
    if (shm >= 0.75) return 'green';
    if (shm >= 0.65) return 'yellow';
    if (shm >= 0.50) return 'orange';
    return 'red';
  }

  /**
   * Get emoji for regime
   */
  private getRegimeEmoji(regime: string): string {
    const emojis = {
      exploration: '🔍',
      optimization: '⚙️',
      stabilization: '✅'
    };
    return emojis[regime as keyof typeof emojis] || '❓';
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(status: string): string {
    const emojis = {
      passed: '✅',
      failed: '❌',
      warning: '⚠️',
      critical: '🚨',
      healthy: '💚'
    };
    return emojis[status as keyof typeof emojis] || '❓';
  }

  /**
   * Generate trend sparkline
   */
  generateSparkline(history: number[]): string {
    if (history.length < 2) return '';

    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const sparkline = history.map(value => {
      const normalized = (value - min) / range;
      const index = Math.min(Math.floor(normalized * blocks.length), blocks.length - 1);
      return blocks[index];
    }).join('');

    const trend = ((history[history.length - 1] - history[0]) / history[0]) * 100;
    const trendEmoji = trend >= 0 ? '📈' : '📉';

    return `\`${sparkline}\` ${trendEmoji} ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`;
  }

  /**
   * Generate regime distribution bar
   */
  generateRegimeDistributionBar(distribution: { exploration: number; optimization: number; stabilization: number }): string {
    const total = distribution.exploration + distribution.optimization + distribution.stabilization;
    if (total === 0) return '';

    const explPct = Math.round((distribution.exploration / total) * 100);
    const optPct = Math.round((distribution.optimization / total) * 100);
    const stabPct = Math.round((distribution.stabilization / total) * 100);

    return `🔍 ${explPct}% | ⚙️ ${optPct}% | ✅ ${stabPct}%`;
  }

  /**
   * Generate PR comment
   */
  generate(): string {
    const healthData = this.loadSystemHealth();
    const gateReport = this.loadQualityGateReport();

    if (!healthData) {
      return this.generateErrorComment('System health data not found');
    }

    const shmBadge = this.getSHMBadge(healthData.shm, healthData.regime);
    const statusEmoji = gateReport
      ? this.getStatusEmoji(gateReport.overallStatus)
      : '❓';

    const regimeDistBar = this.generateRegimeDistributionBar(healthData.regimeDistribution);

    // Get top 3 critical issues
    const criticalIssues = healthData.alerts
      .filter(a => a.severity === 'critical')
      .slice(0, 3);

    // Get top 3 warnings
    const warnings = healthData.alerts
      .filter(a => a.severity === 'warning')
      .slice(0, 3);

    // Get top 3 praise items
    const praise = healthData.praiseSignals.slice(0, 3);

    // Get failing/warning sonars
    const failingSonars = healthData.sonars
      .filter(s => s.status === 'critical')
      .sort((a, b) => a.score - b.score);

    const warningSonars = healthData.sonars
      .filter(s => s.status === 'warning')
      .sort((a, b) => a.score - b.score);

    // Build comment
    let comment = `## 🎯 Sonar Suite Results\n\n`;

    // Header with SHM badge and status
    comment += `${shmBadge}\n\n`;
    comment += `**Overall Status:** ${statusEmoji} ${gateReport?.overallStatus.toUpperCase() || 'UNKNOWN'}\n`;
    comment += `**Regime Distribution:** ${regimeDistBar}\n`;

    if (healthData.delta !== 0) {
      const deltaEmoji = healthData.delta > 0 ? '📈' : '📉';
      const deltaSign = healthData.delta > 0 ? '+' : '';
      comment += `**Trend:** ${deltaEmoji} ${deltaSign}${(healthData.delta * 100).toFixed(1)}% from baseline\n`;
    }

    comment += `\n---\n\n`;

    // Critical Issues Section
    if (criticalIssues.length > 0 || failingSonars.length > 0) {
      comment += `### 🚨 Critical Issues (${criticalIssues.length + failingSonars.length})\n\n`;

      // Show failing sonars first
      for (const sonar of failingSonars) {
        comment += `- **${sonar.name}:** Score ${sonar.score.toFixed(2)} (${sonar.keyMetric.name}: ${sonar.keyMetric.value}${sonar.keyMetric.unit})\n`;
      }

      // Then show alert messages
      for (const issue of criticalIssues) {
        comment += `- **${issue.sonar}:** ${issue.message}\n`;
      }

      comment += `\n`;
    }

    // Warnings Section
    if (warnings.length > 0 || warningSonars.length > 0) {
      comment += `### ⚠️ Warnings (${warnings.length + warningSonars.length})\n\n`;

      // Show warning sonars
      for (const sonar of warningSonars) {
        comment += `- **${sonar.name}:** Score ${sonar.score.toFixed(2)} - below target\n`;
      }

      // Then show warning messages
      for (const warning of warnings) {
        comment += `- **${warning.sonar}:** ${warning.message}\n`;
      }

      comment += `\n`;
    }

    // Praise Mode Section (only if no critical issues)
    if (praise.length > 0 && criticalIssues.length === 0 && failingSonars.length === 0) {
      comment += `### ✅ Wins\n\n`;

      for (const p of praise) {
        comment += `- ${p.icon} **${p.sonar}:** ${p.message}\n`;
      }

      comment += `\n`;
    }

    // Sonar Scores Table
    comment += `### 📊 Sonar Scores\n\n`;
    comment += `| Sonar | Score | Status | Key Metric | Delta |\n`;
    comment += `|-------|-------|--------|------------|-------|\n`;

    for (const sonar of healthData.sonars) {
      const statusEmoji = this.getStatusEmoji(sonar.status);
      const deltaSymbol = sonar.delta >= 0 ? '▲' : '▼';
      const deltaEmoji = sonar.delta >= 0 ? '🟢' : '🔴';

      comment += `| **${sonar.name}** | ${sonar.score.toFixed(2)} | ${statusEmoji} ${sonar.status} | ${sonar.keyMetric.name}: ${sonar.keyMetric.value}${sonar.keyMetric.unit} | ${deltaEmoji} ${deltaSymbol}${Math.abs(sonar.delta).toFixed(2)} |\n`;
    }

    comment += `\n`;

    // Recommendations Section
    if (gateReport && gateReport.recommendations.length > 0) {
      comment += `### 💡 Recommendations\n\n`;

      for (const rec of gateReport.recommendations.slice(0, 5)) {
        comment += `- ${rec}\n`;
      }

      comment += `\n`;
    }

    // Footer
    comment += `---\n\n`;

    // Link to full dashboard
    if (process.env.GITHUB_RUN_ID) {
      const runUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
      comment += `📊 [View Full Dashboard](${runUrl}/artifacts)\n\n`;
    }

    comment += `<details>\n`;
    comment += `<summary>🤖 About Sonar Suite</summary>\n\n`;
    comment += `The **Unified Sonar Suite** analyzes your codebase across 6 dimensions:\n\n`;
    comment += `- **UX Sonar:** Performance, accessibility, responsiveness\n`;
    comment += `- **Design Sonar:** Visual harmony, consistency, breathability\n`;
    comment += `- **Code Sonar:** Complexity, duplication, maintainability\n`;
    comment += `- **Semantic Sonar:** Architecture, coupling, dependencies\n`;
    comment += `- **Journey Sonar:** User behavior, frustration detection\n`;
    comment += `- **State Sonar:** State machine complexity, impossible states\n\n`;
    comment += `**System Health Metric (SHM)** is a weighted aggregate (0-100%) showing overall system quality.\n\n`;
    comment += `**Regimes:**\n`;
    comment += `- 🔍 **Exploration** (<70%): Focus on stabilization\n`;
    comment += `- ⚙️ **Optimization** (70-85%): Refine and improve\n`;
    comment += `- ✅ **Stabilization** (>85%): Maintain quality\n\n`;
    comment += `</details>\n\n`;

    comment += `*Generated by Agent Kilo - CI/CD Automation Architect*\n`;
    comment += `*Timestamp: ${new Date().toISOString()}*\n`;

    return comment;
  }

  /**
   * Generate error comment when data is missing
   */
  private generateErrorComment(message: string): string {
    return `## 🎯 Sonar Suite Results\n\n❌ **Error:** ${message}\n\nPlease ensure all sonar tests have completed successfully.\n`;
  }
}

/**
 * Main execution
 */
async function main() {
  const generator = new PRCommentGenerator();
  const comment = generator.generate();

  console.log(comment);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ PR comment generation failed:', error);
    process.exit(1);
  });
}

export { PRCommentGenerator };
