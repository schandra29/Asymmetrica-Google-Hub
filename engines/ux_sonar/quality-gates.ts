/**
 * Quality Gates Script
 * Applies regime-based quality gates to Sonar Suite results
 *
 * Agent Kilo - CI/CD Automation Architect
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface SonarScore {
  name: string;
  score: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
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
  timestamp: string;
}

interface QualityGate {
  name: string;
  regime: string;
  threshold: number;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  score?: number;
}

interface QualityGateReport {
  overallStatus: 'passed' | 'failed' | 'warning';
  shm: number;
  regime: string;
  gates: QualityGate[];
  summary: string;
  recommendations: string[];
  timestamp: string;
}

class QualityGateEngine {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    const isInUXSonar = basePath.includes('ux-sonar');
    this.basePath = isInUXSonar ? basePath : join(basePath, 'tests/ux-sonar');
  }

  /**
   * Load system health data from dashboard
   */
  loadSystemHealth(): SystemHealthData | null {
    const reportPath = join(this.basePath, 'reports/system-health-report.json');

    if (!existsSync(reportPath)) {
      console.error('❌ System health report not found. Run dashboard generator first.');
      return null;
    }

    try {
      const data = readFileSync(reportPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ Failed to parse system health report:', error);
      return null;
    }
  }

  /**
   * Apply regime-based quality gates
   *
   * Thresholds:
   * - Exploration: score >= 0.60 (warning), >= 0.70 (pass)
   * - Optimization: score >= 0.70 (warning), >= 0.80 (pass)
   * - Stabilization: score >= 0.85 (hard requirement)
   */
  applyGates(data: SystemHealthData): QualityGateReport {
    const gates: QualityGate[] = [];

    // Gate 1: Overall SHM threshold based on regime
    const shmGate = this.applySHMGate(data.shm, data.regime);
    gates.push(shmGate);

    // Gate 2: Individual sonar gates
    for (const sonar of data.sonars) {
      const sonarGate = this.applySonarGate(sonar);
      gates.push(sonarGate);
    }

    // Gate 3: Regime distribution validation
    const regimeGate = this.applyRegimeDistributionGate(data.regimeDistribution);
    gates.push(regimeGate);

    // Gate 4: Critical issues check
    const criticalGate = this.applyCriticalIssuesGate(data.sonars);
    gates.push(criticalGate);

    // Determine overall status
    const failedGates = gates.filter(g => g.status === 'failed');
    const warningGates = gates.filter(g => g.status === 'warning');

    let overallStatus: 'passed' | 'failed' | 'warning';
    let summary: string;

    if (failedGates.length > 0) {
      overallStatus = 'failed';
      summary = `❌ Quality gates FAILED: ${failedGates.length} gate(s) failed`;
    } else if (warningGates.length > 0) {
      overallStatus = 'warning';
      summary = `⚠️ Quality gates PASSED with warnings: ${warningGates.length} warning(s)`;
    } else {
      overallStatus = 'passed';
      summary = `✅ All quality gates PASSED`;
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(gates, data);

    const report: QualityGateReport = {
      overallStatus,
      shm: data.shm,
      regime: data.regime,
      gates,
      summary,
      recommendations,
      timestamp: new Date().toISOString()
    };

    return report;
  }

  /**
   * Apply SHM threshold gate
   */
  private applySHMGate(shm: number, regime: string): QualityGate {
    const thresholds = {
      exploration: { warning: 0.60, pass: 0.70 },
      optimization: { warning: 0.70, pass: 0.80 },
      stabilization: { warning: 0.80, pass: 0.85 }
    };

    const threshold = thresholds[regime as keyof typeof thresholds];

    if (shm >= threshold.pass) {
      return {
        name: 'System Health Metric (SHM)',
        regime,
        threshold: threshold.pass,
        status: 'passed',
        message: `SHM ${(shm * 100).toFixed(0)}% meets ${regime} threshold (>= ${(threshold.pass * 100).toFixed(0)}%)`,
        score: shm
      };
    } else if (shm >= threshold.warning) {
      return {
        name: 'System Health Metric (SHM)',
        regime,
        threshold: threshold.pass,
        status: 'warning',
        message: `SHM ${(shm * 100).toFixed(0)}% below target (>= ${(threshold.pass * 100).toFixed(0)}%) but above warning threshold`,
        score: shm
      };
    } else {
      return {
        name: 'System Health Metric (SHM)',
        regime,
        threshold: threshold.warning,
        status: 'failed',
        message: `SHM ${(shm * 100).toFixed(0)}% below warning threshold (>= ${(threshold.warning * 100).toFixed(0)}%)`,
        score: shm
      };
    }
  }

  /**
   * Apply individual sonar gate
   */
  private applySonarGate(sonar: SonarScore): QualityGate {
    const thresholds = {
      exploration: { critical: 0.50, warning: 0.60 },
      optimization: { critical: 0.65, warning: 0.75 },
      stabilization: { critical: 0.80, warning: 0.85 }
    };

    const threshold = thresholds[sonar.regime];

    if (sonar.score >= threshold.warning) {
      return {
        name: `${sonar.name} Sonar`,
        regime: sonar.regime,
        threshold: threshold.warning,
        status: 'passed',
        message: `Score ${sonar.score.toFixed(2)} meets threshold`,
        score: sonar.score
      };
    } else if (sonar.score >= threshold.critical) {
      return {
        name: `${sonar.name} Sonar`,
        regime: sonar.regime,
        threshold: threshold.warning,
        status: 'warning',
        message: `Score ${sonar.score.toFixed(2)} below target (>= ${threshold.warning.toFixed(2)})`,
        score: sonar.score
      };
    } else {
      return {
        name: `${sonar.name} Sonar`,
        regime: sonar.regime,
        threshold: threshold.critical,
        status: 'failed',
        message: `Score ${sonar.score.toFixed(2)} critically low (< ${threshold.critical.toFixed(2)})`,
        score: sonar.score
      };
    }
  }

  /**
   * Apply regime distribution gate
   * Expected: 30% exploration, 20% optimization, 50% stabilization
   */
  private applyRegimeDistributionGate(distribution: { exploration: number; optimization: number; stabilization: number }): QualityGate {
    const total = distribution.exploration + distribution.optimization + distribution.stabilization;

    if (total === 0) {
      return {
        name: 'Regime Distribution',
        regime: 'unknown',
        threshold: 0,
        status: 'warning',
        message: 'No regime distribution data available'
      };
    }

    const stabPct = (distribution.stabilization / total) * 100;

    // At least 40% should be in stabilization regime
    if (stabPct >= 40) {
      return {
        name: 'Regime Distribution',
        regime: 'stabilization',
        threshold: 40,
        status: 'passed',
        message: `Stabilization coverage ${stabPct.toFixed(0)}% is healthy (>= 40%)`,
        score: stabPct / 100
      };
    } else if (stabPct >= 30) {
      return {
        name: 'Regime Distribution',
        regime: 'stabilization',
        threshold: 40,
        status: 'warning',
        message: `Stabilization coverage ${stabPct.toFixed(0)}% below target (>= 40%)`,
        score: stabPct / 100
      };
    } else {
      return {
        name: 'Regime Distribution',
        regime: 'stabilization',
        threshold: 30,
        status: 'failed',
        message: `Stabilization coverage ${stabPct.toFixed(0)}% critically low (< 30%)`,
        score: stabPct / 100
      };
    }
  }

  /**
   * Apply critical issues gate
   */
  private applyCriticalIssuesGate(sonars: SonarScore[]): QualityGate {
    const criticalSonars = sonars.filter(s => s.status === 'critical');

    if (criticalSonars.length === 0) {
      return {
        name: 'Critical Issues',
        regime: 'stabilization',
        threshold: 0,
        status: 'passed',
        message: 'No critical issues detected',
        score: 1.0
      };
    } else if (criticalSonars.length <= 2) {
      return {
        name: 'Critical Issues',
        regime: 'optimization',
        threshold: 2,
        status: 'warning',
        message: `${criticalSonars.length} sonar(s) in critical state: ${criticalSonars.map(s => s.name).join(', ')}`,
        score: 1 - (criticalSonars.length / sonars.length)
      };
    } else {
      return {
        name: 'Critical Issues',
        regime: 'exploration',
        threshold: 3,
        status: 'failed',
        message: `${criticalSonars.length} sonar(s) in critical state - immediate attention required`,
        score: 1 - (criticalSonars.length / sonars.length)
      };
    }
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(gates: QualityGate[], data: SystemHealthData): string[] {
    const recommendations: string[] = [];

    // Check failed gates
    const failedGates = gates.filter(g => g.status === 'failed');
    for (const gate of failedGates) {
      if (gate.name === 'System Health Metric (SHM)') {
        recommendations.push(`🎯 Focus on improving lowest-scoring sonars to raise SHM`);
      } else if (gate.name.includes('Sonar')) {
        const sonarName = gate.name.replace(' Sonar', '');
        recommendations.push(`🔧 ${sonarName}: Review and address critical issues identified in sonar report`);
      } else if (gate.name === 'Regime Distribution') {
        recommendations.push(`📊 Increase test coverage in stabilization regime (critical paths)`);
      } else if (gate.name === 'Critical Issues') {
        recommendations.push(`🚨 Address all critical-status sonars immediately`);
      }
    }

    // Check warning gates
    const warningGates = gates.filter(g => g.status === 'warning');
    for (const gate of warningGates) {
      if (gate.name.includes('Sonar') && gate.score && gate.score < 0.75) {
        const sonarName = gate.name.replace(' Sonar', '');
        recommendations.push(`⚡ ${sonarName}: Optimization opportunity - score below 0.75`);
      }
    }

    // Regime-specific recommendations
    if (data.regime === 'exploration') {
      recommendations.push(`🔍 Exploration regime: Focus on stabilizing core features before adding new ones`);
    } else if (data.regime === 'optimization') {
      recommendations.push(`⚙️ Optimization regime: Refine existing features and improve test coverage`);
    }

    // Delta-based recommendations
    if (data.delta < -0.05) {
      recommendations.push(`📉 SHM decreased by ${Math.abs(data.delta * 100).toFixed(0)}% - investigate recent changes`);
    } else if (data.delta > 0.05) {
      recommendations.push(`📈 SHM improved by ${(data.delta * 100).toFixed(0)}% - great progress!`);
    }

    if (recommendations.length === 0) {
      recommendations.push(`✨ All systems healthy - maintain current quality standards`);
    }

    return recommendations;
  }

  /**
   * Save quality gate report
   */
  saveReport(report: QualityGateReport): void {
    const reportsDir = join(this.basePath, 'reports');

    // Save JSON
    const jsonPath = join(reportsDir, 'quality-gates-report.json');
    writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Save Markdown
    const mdPath = join(reportsDir, 'quality-gates-report.md');
    const markdown = this.generateMarkdown(report);
    writeFileSync(mdPath, markdown);

    console.log(`\n📝 Quality gate report saved:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   MD:   ${mdPath}`);
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdown(report: QualityGateReport): string {
    const statusEmoji = {
      passed: '✅',
      failed: '❌',
      warning: '⚠️'
    };

    let md = `# Quality Gates Report\n\n`;
    md += `**Status:** ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}\n`;
    md += `**SHM:** ${(report.shm * 100).toFixed(0)}%\n`;
    md += `**Regime:** ${report.regime.charAt(0).toUpperCase() + report.regime.slice(1)}\n`;
    md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;

    md += `---\n\n## Summary\n\n`;
    md += `${report.summary}\n\n`;

    md += `## Gate Results\n\n`;
    md += `| Gate | Regime | Status | Score | Message |\n`;
    md += `|------|--------|--------|-------|----------|\n`;
    for (const gate of report.gates) {
      const emoji = statusEmoji[gate.status];
      const score = gate.score ? gate.score.toFixed(2) : 'N/A';
      md += `| ${gate.name} | ${gate.regime} | ${emoji} ${gate.status} | ${score} | ${gate.message} |\n`;
    }

    md += `\n## Recommendations\n\n`;
    for (const rec of report.recommendations) {
      md += `- ${rec}\n`;
    }

    md += `\n---\n\n`;
    md += `*Generated by Agent Kilo - CI/CD Automation Architect*\n`;

    return md;
  }

  /**
   * Print report to console
   */
  printReport(report: QualityGateReport): void {
    console.log('\n' + '='.repeat(60));
    console.log('  QUALITY GATES REPORT');
    console.log('='.repeat(60));

    const statusEmoji = {
      passed: '✅',
      failed: '❌',
      warning: '⚠️'
    };

    console.log(`\nOverall Status: ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}`);
    console.log(`SHM: ${(report.shm * 100).toFixed(0)}%`);
    console.log(`Regime: ${report.regime}`);
    console.log(`\n${report.summary}\n`);

    console.log('Gate Results:');
    console.log('-'.repeat(60));

    for (const gate of report.gates) {
      const emoji = statusEmoji[gate.status];
      const score = gate.score ? ` (${gate.score.toFixed(2)})` : '';
      console.log(`${emoji} ${gate.name}${score}`);
      console.log(`   ${gate.message}`);
    }

    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:');
      console.log('-'.repeat(60));
      for (const rec of report.recommendations) {
        console.log(`  ${rec}`);
      }
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Quality Gates Analysis...\n');

  const engine = new QualityGateEngine();

  // Load system health data
  const data = engine.loadSystemHealth();
  if (!data) {
    console.error('❌ Failed to load system health data');
    process.exit(1);
  }

  console.log(`📊 System Health Data loaded:`);
  console.log(`   SHM: ${(data.shm * 100).toFixed(0)}%`);
  console.log(`   Regime: ${data.regime}`);
  console.log(`   Sonars: ${data.sonars.length}`);

  // Apply quality gates
  const report = engine.applyGates(data);

  // Print and save report
  engine.printReport(report);
  engine.saveReport(report);

  // Set GitHub Actions outputs (if running in CI)
  if (process.env.GITHUB_OUTPUT) {
    const fs = require('fs');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `shm=${data.shm}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `regime=${data.regime}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `status=${report.overallStatus}\n`);
  }

  // Exit with appropriate code
  if (report.overallStatus === 'failed') {
    console.log('❌ Quality gates FAILED - exiting with code 1');
    process.exit(1);
  } else if (report.overallStatus === 'warning') {
    console.log('⚠️ Quality gates PASSED with warnings - exiting with code 0');
    process.exit(0);
  } else {
    console.log('✅ Quality gates PASSED - exiting with code 0');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Quality gates failed with error:', error);
    process.exit(1);
  });
}

export { QualityGateEngine, QualityGateReport, QualityGate };
