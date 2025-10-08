/**
 * SonarDashboard - Unified Dashboard Generator
 * Displays System Health Metric (SHM) as north star with drill-down for all 6 sonars
 *
 * Agent Foxtrot - Dashboard Architect
 * Agent November - Tetractys Sacred Geometry Integration
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { calculateSHMWithTetractys, TetractysConvergenceResult } from './utils/tetractys-engine';

export interface SonarScore {
  name: string;
  score: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  keyMetric: { name: string; value: string; unit: string };
  delta: number;
  status: 'critical' | 'warning' | 'healthy';
}

export interface SystemHealthData {
  shm: number;
  regime: 'exploration' | 'optimization' | 'stabilization';
  delta: number;
  sonars: SonarScore[];
  regimeDistribution: {
    exploration: number;
    optimization: number;
    stabilization: number;
  };
  praiseSignals: PraiseSignal[];
  alerts: Alert[];
  timestamp: string;
  tetractys?: TetractysConvergenceResult & { visualization: string };
}

export interface PraiseSignal {
  sonar: string;
  message: string;
  icon: string;
  metric?: string;
}

export interface Alert {
  severity: 'critical' | 'warning';
  sonar: string;
  message: string;
  metric?: string;
}

export class SonarDashboard {
  private templatePath: string;
  private cssPath: string;

  constructor(basePath: string = process.cwd()) {
    // Check if we're already in the ux-sonar directory
    const isInUXSonar = basePath.includes('ux-sonar');
    const baseDir = isInUXSonar ? basePath : join(basePath, 'tests/ux-sonar');

    this.templatePath = join(baseDir, 'dashboard/templates/main-dashboard.html');
    this.cssPath = join(baseDir, 'dashboard/styles/sonar-dashboard.css');
  }

  /**
   * Calculate System Health Metric (SHM) - weighted aggregate of all sonars
   * Weights: UX 0.25, Design 0.25, Code/Semantic/Journey/State 0.125 each
   *
   * @deprecated Use calculateSHMWithTetractys for sacred geometry convergence
   */
  calculateSHM(sonarScores: Map<string, number>): number {
    const weights = {
      ux: 0.25,
      design: 0.25,
      code: 0.125,
      semantic: 0.125,
      journey: 0.125,
      state: 0.125
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [sonar, score] of sonarScores.entries()) {
      const weight = weights[sonar.toLowerCase() as keyof typeof weights] || 0.125;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
  }

  /**
   * Calculate System Health Metric (SHM) using Tetractys sacred convergence
   * Uses Pythagorean hierarchical aggregation with golden ratio harmonization
   */
  calculateSHMTetractys(sonarScores: Map<string, number>): TetractysConvergenceResult & { visualization: string } {
    const scores = {
      ux: sonarScores.get('ux') || 0,
      design: sonarScores.get('design') || 0,
      code: sonarScores.get('code') || 0,
      semantic: sonarScores.get('semantic') || 0,
      journey: sonarScores.get('journey') || 0,
      state: sonarScores.get('state') || 0
    };

    return calculateSHMWithTetractys(scores);
  }

  /**
   * Determine regime based on SHM score
   * <0.7 = exploration, 0.7-0.85 = optimization, >0.85 = stabilization
   */
  determineRegime(shm: number): 'exploration' | 'optimization' | 'stabilization' {
    if (shm < 0.70) return 'exploration';
    if (shm < 0.85) return 'optimization';
    return 'stabilization';
  }

  /**
   * Determine status based on score and regime
   */
  determineStatus(score: number, regime: string): 'critical' | 'warning' | 'healthy' {
    if (regime === 'exploration' && score < 0.60) return 'critical';
    if (regime === 'optimization' && score < 0.70) return 'critical';
    if (regime === 'stabilization' && score < 0.80) return 'critical';

    if (regime === 'optimization' && score < 0.75) return 'warning';
    if (regime === 'stabilization' && score < 0.85) return 'warning';

    return 'healthy';
  }

  /**
   * Get regime color for visual coding
   */
  getRegimeColor(regime: string): string {
    const colors = {
      exploration: '#F59E0B',  // Yellow
      optimization: '#3B82F6', // Blue
      stabilization: '#10B981' // Green
    };
    return colors[regime as keyof typeof colors] || '#6B7280';
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors = {
      critical: '#EF4444',  // Red
      warning: '#F59E0B',   // Yellow
      healthy: '#10B981'    // Green
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  }

  /**
   * Generate individual sonar card HTML
   */
  generateSonarCard(sonar: SonarScore, sparkline?: string): string {
    const regimeColor = this.getRegimeColor(sonar.regime);
    const statusColor = this.getStatusColor(sonar.status);
    const deltaSymbol = sonar.delta >= 0 ? '▲' : '▼';
    const deltaColor = sonar.delta >= 0 ? '#10B981' : '#EF4444';
    const regimeLabel = sonar.regime.charAt(0).toUpperCase() + sonar.regime.slice(1, 4);

    return `
      <div class="sonar-card" style="border-left: 4px solid ${regimeColor};">
        <div class="card-header">
          <h3>${sonar.name} Sonar</h3>
          <span class="regime-badge" style="background-color: ${regimeColor};">${regimeLabel}</span>
        </div>
        <div class="card-body">
          <div class="score-display">
            <div class="score-value" style="color: ${statusColor};">${sonar.score.toFixed(2)}</div>
            <div class="score-label">Score</div>
          </div>
          <div class="key-metric">
            <div class="metric-name">${sonar.keyMetric.name}</div>
            <div class="metric-value">${sonar.keyMetric.value}${sonar.keyMetric.unit}</div>
          </div>
          <div class="delta" style="color: ${deltaColor};">
            ${deltaSymbol} ${Math.abs(sonar.delta).toFixed(2)} from baseline
          </div>
          ${sparkline ? `<div class="sparkline">${sparkline}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate sparkline visualization (ASCII-based)
   */
  generateSparkline(history: number[]): string {
    if (history.length === 0) return '';

    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;

    const trend = history.length > 1
      ? ((history[history.length - 1] - history[0]) / history[0]) * 100
      : 0;

    const sparkline = history.map(value => {
      const normalized = (value - min) / range;
      const index = Math.min(Math.floor(normalized * blocks.length), blocks.length - 1);
      return blocks[index];
    }).join('');

    const trendColor = trend >= 0 ? '#10B981' : '#EF4444';
    const trendSymbol = trend >= 0 ? '↑' : '↓';

    return `
      <div class="sparkline-container">
        <code class="sparkline-chars">${sparkline}</code>
        <span class="sparkline-trend" style="color: ${trendColor};">
          ${trendSymbol} ${Math.abs(trend).toFixed(1)}%
        </span>
      </div>
    `;
  }

  /**
   * Generate Praise Mode section HTML
   */
  generatePraiseMode(signals: PraiseSignal[]): string {
    if (signals.length === 0) {
      return `
        <div class="praise-mode empty">
          <p>No praise signals detected yet. Keep optimizing!</p>
        </div>
      `;
    }

    const signalHTML = signals.map(signal => `
      <div class="praise-item">
        <span class="praise-icon">${signal.icon}</span>
        <div class="praise-content">
          <strong>${signal.sonar}</strong>: ${signal.message}
          ${signal.metric ? `<code>${signal.metric}</code>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <div class="praise-mode">
        <h3>🎉 Praise Mode - Celebrating Wins!</h3>
        ${signalHTML}
      </div>
    `;
  }

  /**
   * Generate Alerts section HTML
   */
  generateAlerts(alerts: Alert[]): string {
    if (alerts.length === 0) {
      return `
        <div class="alerts-section empty">
          <p>✅ No critical alerts - all systems nominal!</p>
        </div>
      `;
    }

    const critical = alerts.filter(a => a.severity === 'critical');
    const warnings = alerts.filter(a => a.severity === 'warning');

    const criticalHTML = critical.length > 0 ? `
      <div class="alert-group critical">
        <h4>🚨 Critical Issues (${critical.length})</h4>
        ${critical.map(alert => `
          <div class="alert-item">
            <strong>${alert.sonar}</strong>: ${alert.message}
            ${alert.metric ? `<code>${alert.metric}</code>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    const warningHTML = warnings.length > 0 ? `
      <div class="alert-group warning">
        <h4>⚠️ Warnings (${warnings.length})</h4>
        ${warnings.map(alert => `
          <div class="alert-item">
            <strong>${alert.sonar}</strong>: ${alert.message}
            ${alert.metric ? `<code>${alert.metric}</code>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    return `
      <div class="alerts-section">
        ${criticalHTML}
        ${warningHTML}
      </div>
    `;
  }

  /**
   * Generate regime distribution visualization
   */
  generateRegimeDistribution(distribution: { exploration: number; optimization: number; stabilization: number }): string {
    const total = distribution.exploration + distribution.optimization + distribution.stabilization;

    if (total === 0) {
      return '<div class="regime-distribution">No data available</div>';
    }

    const explPct = (distribution.exploration / total) * 100;
    const optPct = (distribution.optimization / total) * 100;
    const stabPct = (distribution.stabilization / total) * 100;

    return `
      <div class="regime-distribution">
        <h3>Regime Distribution</h3>
        <div class="regime-bar">
          <div class="regime-segment exploration" style="width: ${explPct}%;" title="Exploration: ${explPct.toFixed(1)}%">
            ${explPct.toFixed(0)}%
          </div>
          <div class="regime-segment optimization" style="width: ${optPct}%;" title="Optimization: ${optPct.toFixed(1)}%">
            ${optPct.toFixed(0)}%
          </div>
          <div class="regime-segment stabilization" style="width: ${stabPct}%;" title="Stabilization: ${stabPct.toFixed(1)}%">
            ${stabPct.toFixed(0)}%
          </div>
        </div>
        <div class="regime-legend">
          <span><span class="legend-dot exploration"></span> Exploration (${distribution.exploration})</span>
          <span><span class="legend-dot optimization"></span> Optimization (${distribution.optimization})</span>
          <span><span class="legend-dot stabilization"></span> Stabilization (${distribution.stabilization})</span>
        </div>
      </div>
    `;
  }

  /**
   * Generate complete dashboard HTML
   */
  generateHTML(data: SystemHealthData): string {
    const template = readFileSync(this.templatePath, 'utf-8');
    const css = readFileSync(this.cssPath, 'utf-8');

    const shmColor = this.getRegimeColor(data.regime);
    const shmPercentage = (data.shm * 100).toFixed(0);
    const deltaSymbol = data.delta >= 0 ? '▲' : '▼';
    const deltaColor = data.delta >= 0 ? '#10B981' : '#EF4444';
    const regimeLabel = data.regime.toUpperCase();

    // Generate sonar cards
    const sonarCardsHTML = data.sonars.map(sonar => this.generateSonarCard(sonar)).join('');

    // Generate sections
    const praiseModeHTML = this.generatePraiseMode(data.praiseSignals);
    const alertsHTML = this.generateAlerts(data.alerts);
    const regimeDistHTML = this.generateRegimeDistribution(data.regimeDistribution);

    // Replace template variables
    let html = template
      .replace('{{CSS}}', css)
      .replace('{{TIMESTAMP}}', data.timestamp)
      .replace('{{SHM_VALUE}}', data.shm.toFixed(2))
      .replace('{{SHM_PERCENTAGE}}', shmPercentage)
      .replace('{{SHM_COLOR}}', shmColor)
      .replace('{{REGIME}}', regimeLabel)
      .replace('{{REGIME_COLOR}}', shmColor)
      .replace('{{DELTA_SYMBOL}}', deltaSymbol)
      .replace('{{DELTA_VALUE}}', Math.abs(data.delta).toFixed(2))
      .replace('{{DELTA_COLOR}}', deltaColor)
      .replace('{{SONAR_CARDS}}', sonarCardsHTML)
      .replace('{{PRAISE_MODE}}', praiseModeHTML)
      .replace('{{REGIME_DISTRIBUTION}}', regimeDistHTML)
      .replace('{{ALERTS}}', alertsHTML);

    return html;
  }
}
