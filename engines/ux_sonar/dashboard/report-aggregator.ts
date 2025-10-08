/**
 * ReportAggregator - Collects and aggregates data from all sonar sources
 * Agent Foxtrot - Dashboard Architect
 * Agent November - Tetractys Sacred Geometry Integration
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { SonarScore, SystemHealthData, PraiseSignal, Alert } from '../dashboard-generator';
import { calculateSHMWithTetractys } from '../utils/tetractys-engine';

export interface UXSonarReport {
  route: string;
  timestamp: string;
  critique: {
    metrics: {
      overallScore: number;
    };
    issues: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      description: string;
    }>;
  };
  telemetry: {
    metrics: {
      smoothnessIndex: number;
      energyEfficiency: number;
    };
    layers?: {
      frontend?: {
        metrics: {
          fps: number;
          cls: number;
          longTasks: number;
        };
      };
    };
    asymmetrica?: {
      regime: 'exploration' | 'optimization' | 'stabilization';
    };
  };
}

export interface DesignSonarReport {
  timestamp: string;
  score: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  metrics: {
    paletteHarmony: number;
    typeScale: number;
    spacing: number;
    accessibility: number;
  };
}

export interface SonarReportMap {
  ux?: UXSonarReport[];
  design?: DesignSonarReport;
  code?: any;
  semantic?: any;
  journey?: any;
  state?: any;
}

export class ReportAggregator {
  private basePath: string;
  private reportsDir: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    // Check if we're already in the ux-sonar directory
    const isInUXSonar = basePath.includes('ux-sonar');
    this.reportsDir = isInUXSonar ? join(basePath, 'reports') : join(basePath, 'tests/ux-sonar/reports');
  }

  /**
   * Load all reports for a specific run or latest if runId not provided
   */
  loadAllReports(runId?: string): SonarReportMap {
    const reports: SonarReportMap = {};

    // Load UX Sonar reports (currently the only one implemented)
    reports.ux = this.loadUXReports();

    // Placeholder for future sonars (will be implemented by other agents)
    reports.design = this.loadDesignReports();
    reports.code = this.loadCodeReports();
    reports.semantic = this.loadSemanticReports();
    reports.journey = this.loadJourneyReports();
    reports.state = this.loadStateReports();

    return reports;
  }

  /**
   * Load UX Sonar reports from the reports directory
   */
  private loadUXReports(): UXSonarReport[] {
    if (!existsSync(this.reportsDir)) {
      return [];
    }

    const files = readdirSync(this.reportsDir).filter(f => f.endsWith('.md'));

    // Parse markdown reports (simple extraction for now)
    // TODO: Store JSON reports alongside markdown for easier parsing
    return files.map(file => {
      const content = readFileSync(join(this.reportsDir, file), 'utf-8');
      return this.parseUXMarkdownReport(content);
    }).filter(Boolean) as UXSonarReport[];
  }

  /**
   * Parse UX markdown report into structured data
   */
  private parseUXMarkdownReport(content: string): UXSonarReport | null {
    try {
      // Extract key metrics from markdown
      const routeMatch = content.match(/# UX Sonar Report - (.+)/);
      const timestampMatch = content.match(/\*\*Generated:\*\* (.+)/);
      const regimeMatch = content.match(/\*\*Regime:\*\* (.+)/);
      const scoreMatch = content.match(/\*\*Overall Score:\*\* (\d+)\/100/);
      const fpsMatch = content.match(/Average FPS.*?\| (\d+\.?\d*)/);
      const clsMatch = content.match(/Cumulative Layout Shift.*?\| (\d+\.?\d*)/);
      const longTasksMatch = content.match(/Long Tasks.*?\| (\d+)/);
      const smoothnessMatch = content.match(/Smoothness Index.*?\| (\d+\.?\d*)/);

      return {
        route: routeMatch?.[1] || 'unknown',
        timestamp: timestampMatch?.[1] || new Date().toISOString(),
        critique: {
          metrics: {
            overallScore: scoreMatch ? parseInt(scoreMatch[1]) : 0
          },
          issues: []
        },
        telemetry: {
          metrics: {
            smoothnessIndex: smoothnessMatch ? parseFloat(smoothnessMatch[1]) : 0,
            energyEfficiency: 0
          },
          layers: {
            frontend: {
              metrics: {
                fps: fpsMatch ? parseFloat(fpsMatch[1]) : 60,
                cls: clsMatch ? parseFloat(clsMatch[1]) : 0,
                longTasks: longTasksMatch ? parseInt(longTasksMatch[1]) : 0
              }
            }
          },
          asymmetrica: {
            regime: (regimeMatch?.[1]?.toLowerCase() as any) || 'exploration'
          }
        }
      };
    } catch (error) {
      console.error('Failed to parse UX report:', error);
      return null;
    }
  }

  /**
   * Placeholder loaders for future sonars
   */
  private loadDesignReports(): DesignSonarReport | undefined {
    // TODO: Implement when Design Sonar (Agent Delta) is complete
    return undefined;
  }

  private loadCodeReports(): any {
    // TODO: Implement when Code Sonar is complete
    return undefined;
  }

  private loadSemanticReports(): any {
    // TODO: Implement when Semantic Sonar is complete
    return undefined;
  }

  private loadJourneyReports(): any {
    // TODO: Implement when Journey Sonar is complete
    return undefined;
  }

  private loadStateReports(): any {
    // TODO: Implement when State Sonar is complete
    return undefined;
  }

  /**
   * Aggregate System Health Metric from all available sonars using Tetractys
   */
  aggregateSHM(reports: SonarReportMap): number {
    const sonarScores = this.extractSonarScores(reports);
    const tetractys = calculateSHMWithTetractys(sonarScores);
    return tetractys.apex;
  }

  /**
   * Extract raw sonar scores from reports
   */
  private extractSonarScores(reports: SonarReportMap): {
    ux: number;
    design: number;
    code: number;
    semantic: number;
    journey: number;
    state: number;
  } {
    return {
      ux: reports.ux && reports.ux.length > 0
        ? reports.ux[reports.ux.length - 1].critique.metrics.overallScore / 100
        : 0,
      design: reports.design?.score || 0,
      code: reports.code ? 0.92 : 0, // Placeholder
      semantic: reports.semantic ? 0.81 : 0, // Placeholder
      journey: reports.journey ? 0.76 : 0, // Placeholder
      state: reports.state ? 0.88 : 0 // Placeholder
    };
  }

  /**
   * Extract key metrics for each sonar
   */
  extractKeyMetrics(reports: SonarReportMap): SonarScore[] {
    const sonars: SonarScore[] = [];

    // UX Sonar
    if (reports.ux && reports.ux.length > 0) {
      const latestUX = reports.ux[reports.ux.length - 1];
      const score = latestUX.critique.metrics.overallScore / 100;
      sonars.push({
        name: 'UX',
        score,
        regime: latestUX.telemetry.asymmetrica?.regime || 'exploration',
        keyMetric: {
          name: 'FPS',
          value: latestUX.telemetry.layers?.frontend?.metrics.fps.toFixed(0) || '60',
          unit: '/60'
        },
        delta: this.calculateDelta(score, 0.75), // Baseline 0.75
        status: this.determineStatus(score, latestUX.telemetry.asymmetrica?.regime || 'exploration')
      });
    }

    // Design Sonar (placeholder)
    if (reports.design) {
      sonars.push({
        name: 'Design',
        score: reports.design.score,
        regime: reports.design.regime,
        keyMetric: {
          name: 'Harmony',
          value: reports.design.metrics.paletteHarmony.toFixed(2),
          unit: ''
        },
        delta: this.calculateDelta(reports.design.score, 0.70),
        status: this.determineStatus(reports.design.score, reports.design.regime)
      });
    } else {
      // Mock Design Sonar for demo
      sonars.push({
        name: 'Design',
        score: 0.78,
        regime: 'exploration',
        keyMetric: { name: 'Harmony', value: '0.72', unit: '' },
        delta: 0.08,
        status: 'healthy'
      });
    }

    // Mock other sonars for demo (will be replaced by real implementations)
    sonars.push(
      {
        name: 'Code',
        score: 0.92,
        regime: 'stabilization',
        keyMetric: { name: 'Density', value: '0.03', unit: '' },
        delta: 0.12,
        status: 'healthy'
      },
      {
        name: 'Semantic',
        score: 0.81,
        regime: 'optimization',
        keyMetric: { name: 'AQS', value: '0.68', unit: '' },
        delta: 0.06,
        status: 'healthy'
      },
      {
        name: 'Journey',
        score: 0.76,
        regime: 'exploration',
        keyMetric: { name: 'Flow Score', value: '0.12', unit: '' },
        delta: -0.04,
        status: 'warning'
      },
      {
        name: 'State',
        score: 0.88,
        regime: 'stabilization',
        keyMetric: { name: 'SMT', value: '7.2', unit: 'ms' },
        delta: 0.10,
        status: 'healthy'
      }
    );

    return sonars;
  }

  /**
   * Calculate delta from baseline
   */
  private calculateDelta(current: number, baseline: number): number {
    return Math.round((current - baseline) * 100) / 100;
  }

  /**
   * Determine status based on score and regime
   */
  private determineStatus(score: number, regime: string): 'critical' | 'warning' | 'healthy' {
    if (regime === 'exploration' && score < 0.60) return 'critical';
    if (regime === 'optimization' && score < 0.70) return 'critical';
    if (regime === 'stabilization' && score < 0.80) return 'critical';

    if (regime === 'optimization' && score < 0.75) return 'warning';
    if (regime === 'stabilization' && score < 0.85) return 'warning';

    return 'healthy';
  }

  /**
   * Detect praise signals (positive achievements)
   */
  detectPraiseSignals(reports: SonarReportMap): PraiseSignal[] {
    const signals: PraiseSignal[] = [];

    // UX Sonar praise signals
    if (reports.ux && reports.ux.length > 0) {
      const latestUX = reports.ux[reports.ux.length - 1];
      const fps = latestUX.telemetry.layers?.frontend?.metrics.fps || 0;
      const cls = latestUX.telemetry.layers?.frontend?.metrics.cls || 0;

      if (fps >= 58) {
        signals.push({
          sonar: 'UX',
          message: 'Excellent frame rate! Smooth animations detected.',
          icon: '✅',
          metric: `${fps.toFixed(0)} FPS`
        });
      }

      if (cls < 0.05) {
        signals.push({
          sonar: 'UX',
          message: 'Minimal layout shift - stable visual experience!',
          icon: '✅',
          metric: `CLS: ${cls.toFixed(3)}`
        });
      }
    }

    // Design Sonar praise signals (placeholder)
    // Will be implemented by Agent Delta

    // Limit to top 3 signals
    return signals.slice(0, 3);
  }

  /**
   * Detect critical issues and warnings
   */
  detectCriticalIssues(reports: SonarReportMap): Alert[] {
    const alerts: Alert[] = [];

    // UX Sonar alerts
    if (reports.ux && reports.ux.length > 0) {
      const latestUX = reports.ux[reports.ux.length - 1];

      latestUX.critique.issues.forEach(issue => {
        if (issue.severity === 'critical') {
          alerts.push({
            severity: 'critical',
            sonar: 'UX',
            message: issue.description,
            metric: issue.type
          });
        } else if (issue.severity === 'warning') {
          alerts.push({
            severity: 'warning',
            sonar: 'UX',
            message: issue.description,
            metric: issue.type
          });
        }
      });

      // Check performance thresholds
      const fps = latestUX.telemetry.layers?.frontend?.metrics.fps || 60;
      if (fps < 30) {
        alerts.push({
          severity: 'critical',
          sonar: 'UX',
          message: 'Frame rate critically low - major performance issue!',
          metric: `${fps.toFixed(0)} FPS`
        });
      } else if (fps < 50) {
        alerts.push({
          severity: 'warning',
          sonar: 'UX',
          message: 'Frame rate below target - optimization needed.',
          metric: `${fps.toFixed(0)} FPS`
        });
      }
    }

    return alerts;
  }

  /**
   * Calculate deltas compared to baselines
   */
  calculateDeltas(reports: SonarReportMap, baselines: Map<string, number>): Map<string, number> {
    const deltas = new Map<string, number>();

    const metrics = this.extractKeyMetrics(reports);
    metrics.forEach(metric => {
      const baseline = baselines.get(metric.name.toLowerCase()) || 0.75;
      deltas.set(metric.name.toLowerCase(), metric.score - baseline);
    });

    return deltas;
  }

  /**
   * Calculate regime distribution across all sonars
   */
  calculateRegimeDistribution(sonars: SonarScore[]): { exploration: number; optimization: number; stabilization: number } {
    const distribution = {
      exploration: 0,
      optimization: 0,
      stabilization: 0
    };

    sonars.forEach(sonar => {
      distribution[sonar.regime]++;
    });

    return distribution;
  }

  /**
   * Generate complete system health data for dashboard
   */
  generateSystemHealthData(runId?: string): SystemHealthData {
    const reports = this.loadAllReports(runId);
    const sonarScores = this.extractSonarScores(reports);
    const tetractys = calculateSHMWithTetractys(sonarScores);
    const shm = tetractys.apex;
    const sonars = this.extractKeyMetrics(reports);
    const praiseSignals = this.detectPraiseSignals(reports);
    const alerts = this.detectCriticalIssues(reports);
    const regimeDistribution = this.calculateRegimeDistribution(sonars);

    // Determine overall regime based on SHM
    let regime: 'exploration' | 'optimization' | 'stabilization';
    if (shm < 0.70) regime = 'exploration';
    else if (shm < 0.85) regime = 'optimization';
    else regime = 'stabilization';

    // Calculate delta from baseline SHM (0.75)
    const delta = shm - 0.75;

    return {
      shm,
      regime,
      delta,
      sonars,
      regimeDistribution,
      praiseSignals,
      alerts,
      timestamp: new Date().toISOString(),
      tetractys
    };
  }
}
