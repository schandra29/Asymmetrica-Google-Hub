/**
 * Dashboard Test Suite
 * Tests for unified Sonar Suite dashboard
 * Agent Foxtrot - Dashboard Architect
 */

import { test, expect } from '@playwright/test';
import { SonarDashboard } from '../dashboard-generator';
import { ReportAggregator } from '../dashboard/report-aggregator';
import { SparklineGenerator } from '../dashboard/sparkline-generator';
import { PraiseModeDetector } from '../dashboard/praise-mode-detector';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

test.describe('Dashboard Generator', () => {
  let dashboard: SonarDashboard;

  test.beforeEach(() => {
    dashboard = new SonarDashboard();
  });

  test('should calculate SHM correctly with weighted average', () => {
    const scores = new Map<string, number>([
      ['ux', 0.85],
      ['design', 0.78],
      ['code', 0.92],
      ['semantic', 0.81],
      ['journey', 0.76],
      ['state', 0.88]
    ]);

    const shm = dashboard.calculateSHM(scores);

    // Expected: (0.85*0.25 + 0.78*0.25 + 0.92*0.125 + 0.81*0.125 + 0.76*0.125 + 0.88*0.125)
    // = 0.2125 + 0.195 + 0.115 + 0.10125 + 0.095 + 0.11
    // = 0.82875 ≈ 0.83

    expect(shm).toBeGreaterThan(0.82);
    expect(shm).toBeLessThan(0.84);
  });

  test('should determine regime based on SHM score', () => {
    expect(dashboard.determineRegime(0.65)).toBe('exploration');
    expect(dashboard.determineRegime(0.70)).toBe('optimization');
    expect(dashboard.determineRegime(0.75)).toBe('optimization');
    expect(dashboard.determineRegime(0.85)).toBe('stabilization');
    expect(dashboard.determineRegime(0.90)).toBe('stabilization');
  });

  test('should determine status correctly', () => {
    expect(dashboard.determineStatus(0.55, 'exploration')).toBe('critical');
    expect(dashboard.determineStatus(0.65, 'exploration')).toBe('healthy');

    expect(dashboard.determineStatus(0.65, 'optimization')).toBe('critical');
    expect(dashboard.determineStatus(0.72, 'optimization')).toBe('warning');
    expect(dashboard.determineStatus(0.80, 'optimization')).toBe('healthy');

    expect(dashboard.determineStatus(0.75, 'stabilization')).toBe('critical');
    expect(dashboard.determineStatus(0.82, 'stabilization')).toBe('warning');
    expect(dashboard.determineStatus(0.90, 'stabilization')).toBe('healthy');
  });

  test('should get correct regime colors', () => {
    expect(dashboard.getRegimeColor('exploration')).toBe('#F59E0B');
    expect(dashboard.getRegimeColor('optimization')).toBe('#3B82F6');
    expect(dashboard.getRegimeColor('stabilization')).toBe('#10B981');
  });

  test('should generate sonar card HTML', () => {
    const sonarData = {
      name: 'UX',
      score: 0.85,
      regime: 'optimization' as const,
      keyMetric: { name: 'FPS', value: '58', unit: '/60' },
      delta: 0.10,
      status: 'healthy' as const
    };

    const cardHTML = dashboard.generateSonarCard(sonarData);

    expect(cardHTML).toContain('UX Sonar');
    expect(cardHTML).toContain('0.85');
    expect(cardHTML).toContain('FPS');
    expect(cardHTML).toContain('58/60');
    expect(cardHTML).toContain('▲');
    expect(cardHTML).toContain('0.10');
  });

  test('should generate praise mode HTML', () => {
    const signals = [
      {
        sonar: 'UX',
        message: 'Excellent frame rate!',
        icon: '✅',
        metric: '60 FPS'
      },
      {
        sonar: 'Design',
        message: 'Perfect color harmony!',
        icon: '🎨'
      }
    ];

    const praiseModeHTML = dashboard.generatePraiseMode(signals);

    expect(praiseModeHTML).toContain('Praise Mode');
    expect(praiseModeHTML).toContain('Excellent frame rate!');
    expect(praiseModeHTML).toContain('Perfect color harmony!');
    expect(praiseModeHTML).toContain('✅');
    expect(praiseModeHTML).toContain('🎨');
  });

  test('should generate empty praise mode when no signals', () => {
    const praiseModeHTML = dashboard.generatePraiseMode([]);

    expect(praiseModeHTML).toContain('No praise signals');
    expect(praiseModeHTML).toContain('empty');
  });

  test('should generate alerts HTML', () => {
    const alerts = [
      {
        severity: 'critical' as const,
        sonar: 'UX',
        message: 'Frame rate critically low',
        metric: '25 FPS'
      },
      {
        severity: 'warning' as const,
        sonar: 'Code',
        message: 'Bundle size exceeds target',
        metric: '350KB'
      }
    ];

    const alertsHTML = dashboard.generateAlerts(alerts);

    expect(alertsHTML).toContain('Critical Issues');
    expect(alertsHTML).toContain('Warnings');
    expect(alertsHTML).toContain('Frame rate critically low');
    expect(alertsHTML).toContain('Bundle size exceeds target');
  });

  test('should generate regime distribution visualization', () => {
    const distribution = {
      exploration: 2,
      optimization: 1,
      stabilization: 3
    };

    const distHTML = dashboard.generateRegimeDistribution(distribution);

    expect(distHTML).toContain('Regime Distribution');
    expect(distHTML).toContain('33%'); // 2/6
    expect(distHTML).toContain('17%'); // 1/6
    expect(distHTML).toContain('50%'); // 3/6
  });
});

test.describe('Report Aggregator', () => {
  let aggregator: ReportAggregator;

  test.beforeEach(() => {
    aggregator = new ReportAggregator();
  });

  test('should calculate SHM from reports', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 85 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 50, energyEfficiency: 20 },
          asymmetrica: { regime: 'optimization' as const }
        }
      }],
      design: {
        timestamp: new Date().toISOString(),
        score: 0.78,
        regime: 'exploration' as const,
        metrics: {
          paletteHarmony: 0.72,
          typeScale: 0.85,
          spacing: 0.80,
          accessibility: 0.75
        }
      }
    };

    const shm = aggregator.aggregateSHM(mockReports);

    expect(shm).toBeGreaterThan(0);
    expect(shm).toBeLessThanOrEqual(1);
  });

  test('should extract key metrics from reports', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 85 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 50, energyEfficiency: 20 },
          layers: {
            frontend: {
              metrics: { fps: 58, cls: 0.03, longTasks: 45 }
            }
          },
          asymmetrica: { regime: 'optimization' as const }
        }
      }]
    };

    const metrics = aggregator.extractKeyMetrics(mockReports);

    expect(metrics.length).toBeGreaterThan(0);
    expect(metrics[0].name).toBe('UX');
    expect(metrics[0].score).toBe(0.85);
    expect(metrics[0].keyMetric.name).toBe('FPS');
  });

  test('should detect praise signals', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 92 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 65, energyEfficiency: 25 },
          layers: {
            frontend: {
              metrics: { fps: 60, cls: 0.02, longTasks: 30 }
            }
          },
          asymmetrica: { regime: 'stabilization' as const }
        }
      }]
    };

    const signals = aggregator.detectPraiseSignals(mockReports);

    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some(s => s.sonar === 'UX')).toBe(true);
  });

  test('should detect critical issues', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: {
          metrics: { overallScore: 45 },
          issues: [
            {
              type: 'performance',
              severity: 'critical' as const,
              description: 'Frame rate critically low'
            }
          ]
        },
        telemetry: {
          metrics: { smoothnessIndex: 20, energyEfficiency: 10 },
          layers: {
            frontend: {
              metrics: { fps: 25, cls: 0.15, longTasks: 250 }
            }
          },
          asymmetrica: { regime: 'exploration' as const }
        }
      }]
    };

    const alerts = aggregator.detectCriticalIssues(mockReports);

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts.some(a => a.severity === 'critical')).toBe(true);
  });

  test('should generate complete system health data', () => {
    const healthData = aggregator.generateSystemHealthData();

    expect(healthData).toHaveProperty('shm');
    expect(healthData).toHaveProperty('regime');
    expect(healthData).toHaveProperty('delta');
    expect(healthData).toHaveProperty('sonars');
    expect(healthData).toHaveProperty('regimeDistribution');
    expect(healthData).toHaveProperty('praiseSignals');
    expect(healthData).toHaveProperty('alerts');
    expect(healthData).toHaveProperty('timestamp');

    expect(healthData.sonars.length).toBe(6);
  });
});

test.describe('Sparkline Generator', () => {
  let generator: SparklineGenerator;

  test.beforeEach(() => {
    generator = new SparklineGenerator();
  });

  test('should generate ASCII sparkline', () => {
    const values = [0.5, 0.6, 0.7, 0.8, 0.9, 0.85, 0.82, 0.88, 0.90, 0.92];
    const sparkline = generator.generateASCIISparkline(values);

    expect(sparkline).toBeTruthy();
    expect(sparkline.length).toBeGreaterThan(0);
    expect(sparkline).toMatch(/[▁▂▃▄▅▆▇█]/);
  });

  test('should calculate trend correctly', () => {
    const upward = [0.5, 0.6, 0.7, 0.8, 0.9];
    const downward = [0.9, 0.8, 0.7, 0.6, 0.5];
    const flat = [0.7, 0.7, 0.7, 0.7, 0.7];

    expect(generator.calculateTrend(upward)).toBeGreaterThan(0);
    expect(generator.calculateTrend(downward)).toBeLessThan(0);
    expect(generator.calculateTrend(flat)).toBe(0);
  });

  test('should generate SVG sparkline', () => {
    const values = [0.5, 0.6, 0.7, 0.8, 0.9];
    const svg = generator.generateSVGSparkline(values);

    expect(svg).toContain('<svg');
    expect(svg).toContain('<path');
    expect(svg).toContain('stroke=');
  });

  test('should generate sparkline with statistics', () => {
    const values = [0.5, 0.6, 0.7, 0.8, 0.9];
    const result = generator.generateWithStats(values);

    expect(result).toHaveProperty('sparkline');
    expect(result).toHaveProperty('stats');
    expect(result.stats).toHaveProperty('min');
    expect(result.stats).toHaveProperty('max');
    expect(result.stats).toHaveProperty('avg');
    expect(result.stats).toHaveProperty('trend');
    expect(result.stats).toHaveProperty('trendDirection');

    expect(result.stats.min).toBe(0.5);
    expect(result.stats.max).toBe(0.9);
    expect(result.stats.trendDirection).toBe('up');
  });
});

test.describe('Praise Mode Detector', () => {
  let detector: PraiseModeDetector;

  test.beforeEach(() => {
    detector = new PraiseModeDetector();
  });

  test('should detect UX praise signals', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 92 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 65, energyEfficiency: 25 },
          layers: {
            frontend: {
              metrics: { fps: 60, cls: 0.02, longTasks: 30 }
            }
          },
          asymmetrica: { regime: 'stabilization' as const }
        }
      }]
    };

    const signals = detector.detectPraiseSignals(mockReports);

    expect(signals.length).toBeGreaterThan(0);
    expect(signals.some(s => s.icon === '✅' || s.icon === '⚡' || s.icon === '🏆')).toBe(true);
  });

  test('should get top N signals', () => {
    const mockReports = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 95 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 70, energyEfficiency: 30 },
          layers: {
            frontend: {
              metrics: { fps: 60, cls: 0.01, longTasks: 20 }
            }
          },
          asymmetrica: { regime: 'stabilization' as const }
        }
      }]
    };

    const topSignals = detector.getTopSignals(mockReports, 3);

    expect(topSignals.length).toBeLessThanOrEqual(3);
  });

  test('should generate celebration message', () => {
    expect(detector.generateCelebrationMessage(0)).toContain('Keep optimizing');
    expect(detector.generateCelebrationMessage(1)).toContain('Great job');
    expect(detector.generateCelebrationMessage(3)).toContain('Excellent');
    expect(detector.generateCelebrationMessage(7)).toContain('Incredible');
  });

  test('should check achievements', () => {
    const perfectUXReport = {
      ux: [{
        route: '/test',
        timestamp: new Date().toISOString(),
        critique: { metrics: { overallScore: 100 }, issues: [] },
        telemetry: {
          metrics: { smoothnessIndex: 100, energyEfficiency: 100 },
          asymmetrica: { regime: 'stabilization' as const }
        }
      }]
    };

    expect(detector.checkAchievement(perfectUXReport, 'perfect-ux')).toBe(true);
  });
});

test.describe('Dashboard Integration', () => {
  test('should generate complete dashboard HTML', async () => {
    const dashboard = new SonarDashboard();
    const aggregator = new ReportAggregator();

    // Generate system health data
    const healthData = aggregator.generateSystemHealthData();

    // Generate dashboard HTML
    const html = dashboard.generateHTML(healthData);

    // Verify HTML structure
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Sonar Suite Dashboard');
    expect(html).toContain('System Health Metric');
    expect(html).toContain(healthData.shm.toFixed(2));
    expect(html).toContain('UX Sonar');
    expect(html).toContain('Design Sonar');
    expect(html).toContain('Code Sonar');
    expect(html).toContain('Semantic');
    expect(html).toContain('Journey');
    expect(html).toContain('State Sonar');

    // Save dashboard for manual inspection
    const outputDir = join(process.cwd(), 'tests/ux-sonar/dashboard');
    try {
      mkdirSync(outputDir, { recursive: true });
    } catch (e) {
      // Directory exists
    }

    const outputPath = join(outputDir, 'index.html');
    writeFileSync(outputPath, html);

    console.log(`\n✅ Dashboard generated successfully!`);
    console.log(`📊 Open in browser: ${outputPath}`);
    console.log(`\nDashboard Stats:`);
    console.log(`  SHM: ${healthData.shm.toFixed(2)} (${healthData.regime})`);
    console.log(`  Sonars: ${healthData.sonars.length}`);
    console.log(`  Praise Signals: ${healthData.praiseSignals.length}`);
    console.log(`  Alerts: ${healthData.alerts.length}`);
  });

  test('should handle missing data gracefully', () => {
    const dashboard = new SonarDashboard();

    const minimalData = {
      shm: 0.75,
      regime: 'optimization' as const,
      delta: 0,
      sonars: [],
      regimeDistribution: { exploration: 0, optimization: 0, stabilization: 0 },
      praiseSignals: [],
      alerts: [],
      timestamp: new Date().toISOString()
    };

    expect(() => dashboard.generateHTML(minimalData)).not.toThrow();
  });
});
