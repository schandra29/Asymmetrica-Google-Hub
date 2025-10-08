/**
 * TetractysVisualizer - SVG/HTML Rendering of the Sacred Tetractys
 *
 * Creates interactive visual representations of the Tetractys hierarchy
 * for dashboard integration.
 *
 * Agent November - Sacred Geometry Visualization
 */

import { TetractysConvergenceResult } from './tetractys-engine';

export interface TetractysVisualizerConfig {
  width?: number;
  height?: number;
  dotRadius?: number;
  colorScheme?: {
    healthy: string;
    warning: string;
    critical: string;
    apex: string;
  };
  showLabels?: boolean;
  showWeights?: boolean;
  animated?: boolean;
}

export interface TetractysDotData {
  level: number;
  position: number; // Position within level (0-indexed)
  value: number;
  x: number;
  y: number;
  label?: string;
  weight: number;
}

/**
 * TetractysVisualizer - Generates SVG and HTML visualizations
 */
export class TetractysVisualizer {
  private config: Required<TetractysVisualizerConfig>;

  constructor(config?: TetractysVisualizerConfig) {
    this.config = {
      width: 600,
      height: 500,
      dotRadius: 25,
      colorScheme: {
        healthy: '#10B981',    // Green
        warning: '#F59E0B',    // Yellow
        critical: '#EF4444',   // Red
        apex: '#8B5CF6'        // Purple (sacred)
      },
      showLabels: true,
      showWeights: true,
      animated: true,
      ...config
    };
  }

  /**
   * Generate complete SVG visualization
   */
  generateSVG(
    result: TetractysConvergenceResult,
    labels?: string[]
  ): string {
    const dots = this.calculateDotPositions(result, labels);
    const connections = this.calculateConnections(dots);

    const { width, height } = this.config;

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="tetractys-visualization">
  <defs>
    <style>
      .tetractys-dot {
        transition: all 0.3s ease;
        cursor: pointer;
      }
      .tetractys-dot:hover {
        transform: scale(1.1);
        filter: brightness(1.2);
      }
      .tetractys-line {
        stroke: #E5E7EB;
        stroke-width: 2;
        opacity: 0.3;
      }
      .tetractys-label {
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 600;
        fill: #1F2937;
        text-anchor: middle;
      }
      .tetractys-value {
        font-family: 'Segoe UI', sans-serif;
        font-size: 12px;
        fill: white;
        text-anchor: middle;
      }
      .tetractys-weight {
        font-family: 'Segoe UI', sans-serif;
        font-size: 10px;
        fill: #6B7280;
        text-anchor: middle;
      }
      ${this.config.animated ? `
      .tetractys-dot {
        animation: pulse 2s ease-in-out infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }
      ` : ''}
    </style>
    <linearGradient id="apexGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6366F1;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Connection lines -->
  <g class="tetractys-connections">
    ${connections.map(conn => `
    <line
      class="tetractys-line"
      x1="${conn.x1}"
      y1="${conn.y1}"
      x2="${conn.x2}"
      y2="${conn.y2}"
    />
    `).join('')}
  </g>

  <!-- Dots and labels -->
  <g class="tetractys-dots">
    ${dots.map(dot => this.renderDot(dot)).join('')}
  </g>

  <!-- Title and metrics -->
  <text x="${width / 2}" y="30" class="tetractys-label" style="font-size: 18px;">
    Sacred Tetractys Convergence
  </text>
  <text x="${width / 2}" y="50" class="tetractys-weight">
    Path: [${result.convergencePath.join(' → ')}] | Weighted Score: ${result.weightedScore.toFixed(3)}
  </text>
</svg>
    `.trim();
  }

  /**
   * Generate HTML widget with interactive features
   */
  generateHTMLWidget(
    result: TetractysConvergenceResult,
    labels?: string[]
  ): string {
    const svg = this.generateSVG(result, labels);

    return `
<div class="tetractys-widget" style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  max-width: 700px;
  margin: 20px auto;
">
  <div style="background: white; border-radius: 8px; padding: 15px;">
    ${svg}
  </div>

  <div style="
    margin-top: 15px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  ">
    <div class="metric-card" style="
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    ">
      <div style="font-size: 24px; font-weight: bold; color: #8B5CF6;">
        ${result.apex.toFixed(3)}
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">
        Apex (SHM)
      </div>
    </div>

    <div class="metric-card" style="
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    ">
      <div style="font-size: 24px; font-weight: bold; color: #10B981;">
        ${result.weightedScore.toFixed(3)}
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">
        Weighted Score
      </div>
    </div>

    <div class="metric-card" style="
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    ">
      <div style="font-size: 24px; font-weight: bold; color: #3B82F6;">
        1+2+3+4=10
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">
        Sacred Proportion
      </div>
    </div>
  </div>

  ${this.renderConvergenceJourney(result)}
</div>
    `.trim();
  }

  /**
   * Render a single dot in the Tetractys
   */
  private renderDot(dot: TetractysDotData): string {
    const color = this.getColorForValue(dot.value, dot.level === 1);
    const { dotRadius, showLabels, showWeights } = this.config;

    return `
    <g class="tetractys-dot" data-level="${dot.level}" data-value="${dot.value}">
      <circle
        cx="${dot.x}"
        cy="${dot.y}"
        r="${dotRadius}"
        fill="${dot.level === 1 ? 'url(#apexGradient)' : color}"
        stroke="white"
        stroke-width="3"
      />
      <text
        x="${dot.x}"
        y="${dot.y + 5}"
        class="tetractys-value"
      >
        ${dot.value.toFixed(2)}
      </text>
      ${showLabels && dot.label ? `
      <text
        x="${dot.x}"
        y="${dot.y + dotRadius + 18}"
        class="tetractys-label"
        style="font-size: 11px;"
      >
        ${dot.label}
      </text>
      ` : ''}
      ${showWeights ? `
      <text
        x="${dot.x}"
        y="${dot.y - dotRadius - 8}"
        class="tetractys-weight"
      >
        w:${dot.weight}
      </text>
      ` : ''}
    </g>
    `;
  }

  /**
   * Calculate positions for all dots in the Tetractys
   */
  private calculateDotPositions(
    result: TetractysConvergenceResult,
    labels?: string[]
  ): TetractysDotData[] {
    const { width, height } = this.config;
    const dots: TetractysDotData[] = [];

    const centerX = width / 2;
    const startY = 100;
    const levelSpacing = 100;
    const dotSpacing = 80;

    // Process each level (1 to 4)
    result.levels.forEach((level, levelIndex) => {
      const levelNum = level.level;
      const y = startY + (4 - levelNum) * levelSpacing;
      const metricsCount = level.metrics.length;
      const totalWidth = (metricsCount - 1) * dotSpacing;
      const startX = centerX - totalWidth / 2;

      level.metrics.forEach((value, pos) => {
        const x = startX + pos * dotSpacing;
        const label = labels && levelNum === 4 ? labels[pos] : undefined;

        dots.push({
          level: levelNum,
          position: pos,
          value,
          x,
          y,
          label,
          weight: level.weight
        });
      });
    });

    return dots;
  }

  /**
   * Calculate connection lines between dots
   */
  private calculateConnections(dots: TetractysDotData[]): Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }> {
    const connections: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    // Group dots by level
    const dotsByLevel = new Map<number, TetractysDotData[]>();
    dots.forEach(dot => {
      if (!dotsByLevel.has(dot.level)) {
        dotsByLevel.set(dot.level, []);
      }
      dotsByLevel.get(dot.level)!.push(dot);
    });

    // Connect each level to the one above (level 4→3, 3→2, 2→1)
    for (let level = 4; level > 1; level--) {
      const currentLevel = dotsByLevel.get(level) || [];
      const upperLevel = dotsByLevel.get(level - 1) || [];

      currentLevel.forEach((dot, index) => {
        // Each dot connects to the dot above it (pair convergence)
        const targetIndex = Math.floor(index / 2);
        if (targetIndex < upperLevel.length) {
          const target = upperLevel[targetIndex];
          connections.push({
            x1: dot.x,
            y1: dot.y,
            x2: target.x,
            y2: target.y
          });
        }
      });
    }

    return connections;
  }

  /**
   * Get color based on value and health thresholds
   */
  private getColorForValue(value: number, isApex: boolean = false): string {
    if (isApex) {
      return this.config.colorScheme.apex;
    }

    if (value >= 0.85) {
      return this.config.colorScheme.healthy;
    } else if (value >= 0.70) {
      return this.config.colorScheme.warning;
    } else {
      return this.config.colorScheme.critical;
    }
  }

  /**
   * Render convergence journey details
   */
  private renderConvergenceJourney(result: TetractysConvergenceResult): string {
    if (!result.convergenceJourney) {
      return '';
    }

    return `
    <div style="
      background: rgba(255,255,255,0.95);
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    ">
      <h4 style="margin: 0 0 10px 0; color: #1F2937; font-size: 14px;">
        Convergence Journey
      </h4>
      ${result.convergenceJourney.map(step => `
        <div style="
          padding: 8px;
          margin-bottom: 8px;
          background: #F3F4F6;
          border-radius: 4px;
          font-size: 12px;
        ">
          <strong>Level ${step.level}:</strong> ${step.harmonization}<br>
          <span style="color: #6B7280;">
            [${step.input.map(n => n.toFixed(2)).join(', ')}] → [${step.output.map(n => n.toFixed(2)).join(', ')}]
          </span>
        </div>
      `).join('')}
    </div>
    `;
  }
}

/**
 * Quick helper to generate SVG for dashboard
 */
export function generateTetractysSVG(
  result: TetractysConvergenceResult,
  labels?: string[]
): string {
  const visualizer = new TetractysVisualizer();
  return visualizer.generateSVG(result, labels);
}

/**
 * Quick helper to generate HTML widget for dashboard
 */
export function generateTetractysWidget(
  result: TetractysConvergenceResult,
  labels?: string[]
): string {
  const visualizer = new TetractysVisualizer();
  return visualizer.generateHTMLWidget(result, labels);
}
