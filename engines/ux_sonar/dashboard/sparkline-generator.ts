/**
 * SparklineGenerator - Trend visualization generator
 * Supports both ASCII and SVG sparklines
 * Agent Foxtrot - Dashboard Architect
 */

export interface SparklineOptions {
  width?: number;
  height?: number;
  strokeWidth?: number;
  colorUp?: string;
  colorDown?: string;
  showTrend?: boolean;
}

export class SparklineGenerator {
  private defaultOptions: SparklineOptions = {
    width: 100,
    height: 30,
    strokeWidth: 2,
    colorUp: '#10B981',
    colorDown: '#EF4444',
    showTrend: true
  };

  /**
   * Generate ASCII sparkline using block characters
   * Characters: ▁▂▃▄▅▆▇█
   */
  generateASCIISparkline(values: number[], options?: { showTrend?: boolean }): string {
    if (values.length === 0) return '';

    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Generate sparkline characters
    const sparkline = values.map(value => {
      const normalized = (value - min) / range;
      const index = Math.min(Math.floor(normalized * blocks.length), blocks.length - 1);
      return blocks[index];
    }).join('');

    // Calculate trend
    if (options?.showTrend && values.length > 1) {
      const trend = this.calculateTrend(values);
      const trendSymbol = trend >= 0 ? '↑' : '↓';
      const trendPercent = Math.abs(trend).toFixed(1);
      return `${sparkline} ${trendSymbol}${trendPercent}%`;
    }

    return sparkline;
  }

  /**
   * Generate SVG sparkline with smooth path
   */
  generateSVGSparkline(values: number[], options?: SparklineOptions): string {
    if (values.length === 0) return '';

    const opts = { ...this.defaultOptions, ...options };
    const width = opts.width!;
    const height = opts.height!;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Calculate points
    const points = values.map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });

    // Generate SVG path
    const pathData = this.generateSmoothPath(points);

    // Determine color based on trend
    const trend = this.calculateTrend(values);
    const color = trend >= 0 ? opts.colorUp : opts.colorDown;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="sparkline-svg">
        <path
          d="${pathData}"
          fill="none"
          stroke="${color}"
          stroke-width="${opts.strokeWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;
  }

  /**
   * Generate smooth path using quadratic curves
   */
  private generateSmoothPath(points: Array<{ x: number; y: number }>): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      // Use quadratic Bezier curve for smoothing
      const cpX = (p0.x + p1.x) / 2;
      const cpY = (p0.y + p1.y) / 2;

      path += ` Q ${p0.x} ${p0.y}, ${cpX} ${cpY}`;

      // Add line to final point
      if (i === points.length - 1) {
        path += ` L ${p1.x} ${p1.y}`;
      }
    }

    return path;
  }

  /**
   * Calculate trend percentage (comparing first and last values)
   */
  calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];

    if (first === 0) return last > 0 ? 100 : 0;

    return ((last - first) / first) * 100;
  }

  /**
   * Color sparkline by trend direction
   */
  colorByTrend(values: number[], asciiSparkline: string): string {
    const trend = this.calculateTrend(values);
    const color = trend >= 0 ? 'green' : 'red';

    // Return HTML with colored text
    return `<span style="color: ${trend >= 0 ? '#10B981' : '#EF4444'}">${asciiSparkline}</span>`;
  }

  /**
   * Generate sparkline with statistics
   */
  generateWithStats(values: number[], type: 'ascii' | 'svg' = 'ascii'): {
    sparkline: string;
    stats: {
      min: number;
      max: number;
      avg: number;
      trend: number;
      trendDirection: 'up' | 'down' | 'flat';
    };
  } {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const trend = this.calculateTrend(values);

    let trendDirection: 'up' | 'down' | 'flat';
    if (trend > 1) trendDirection = 'up';
    else if (trend < -1) trendDirection = 'down';
    else trendDirection = 'flat';

    const sparkline = type === 'ascii'
      ? this.generateASCIISparkline(values, { showTrend: true })
      : this.generateSVGSparkline(values);

    return {
      sparkline,
      stats: {
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        trend: Math.round(trend * 10) / 10,
        trendDirection
      }
    };
  }

  /**
   * Generate multiple sparklines for comparison
   */
  generateComparison(datasets: Array<{ name: string; values: number[] }>): string {
    let output = '';

    datasets.forEach(dataset => {
      const sparkline = this.generateASCIISparkline(dataset.values, { showTrend: true });
      output += `${dataset.name.padEnd(15)} ${sparkline}\n`;
    });

    return output;
  }

  /**
   * Generate historical trend visualization
   */
  generateHistoricalTrend(
    values: number[],
    labels?: string[],
    type: 'ascii' | 'svg' = 'ascii'
  ): string {
    if (type === 'ascii') {
      const sparkline = this.generateASCIISparkline(values, { showTrend: true });
      const trend = this.calculateTrend(values);
      const trendColor = trend >= 0 ? '🟢' : '🔴';

      return `
Timeline: ${labels ? labels.join(' → ') : `Last ${values.length} runs`}
Progress: ${sparkline}
Trend:    ${trendColor} ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%
      `.trim();
    } else {
      return this.generateSVGSparkline(values, { width: 200, height: 40 });
    }
  }

  /**
   * Generate regime-colored sparkline
   * Colors based on performance zones
   */
  generateRegimeSparkline(values: number[], thresholds: { low: number; high: number }): string {
    if (values.length === 0) return '';

    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return values.map(value => {
      const normalized = (value - min) / range;
      const index = Math.min(Math.floor(normalized * blocks.length), blocks.length - 1);
      const block = blocks[index];

      // Color by regime
      let color = '#F59E0B'; // Yellow (exploration)
      if (value >= thresholds.high) {
        color = '#10B981'; // Green (stabilization)
      } else if (value >= thresholds.low) {
        color = '#3B82F6'; // Blue (optimization)
      }

      return `<span style="color: ${color}">${block}</span>`;
    }).join('');
  }

  /**
   * Generate mini chart with gridlines (ASCII)
   */
  generateMiniChart(values: number[], height: number = 5): string {
    if (values.length === 0) return '';

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const lines: string[] = [];

    for (let row = height - 1; row >= 0; row--) {
      let line = '';
      for (let col = 0; col < values.length; col++) {
        const value = values[col];
        const normalized = (value - min) / range;
        const cellHeight = Math.floor(normalized * height);

        if (cellHeight > row) {
          line += '█';
        } else {
          line += ' ';
        }
      }
      lines.push(line);
    }

    return lines.join('\n');
  }
}

// Example usage and exports
export function generateQuickSparkline(values: number[]): string {
  const generator = new SparklineGenerator();
  return generator.generateASCIISparkline(values, { showTrend: true });
}

export function generateColoredSparkline(values: number[]): string {
  const generator = new SparklineGenerator();
  const sparkline = generator.generateASCIISparkline(values, { showTrend: false });
  return generator.colorByTrend(values, sparkline);
}
