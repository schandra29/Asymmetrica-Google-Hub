/**
 * Dragon Curve Visualizer
 *
 * Generates SVG/HTML visualizations of dragon curve fractal:
 *   - Color-coded by regime (exploration=green, stabilization=orange, convergence=blue)
 *   - PHI-weighted line thickness (deeper folds = thicker lines)
 *   - Interactive HTML demo with level selector
 *
 * Output Formats:
 *   - SVG: Static fractal visualization
 *   - HTML: Interactive demo page
 *   - JSON: Exportable path data
 *
 * @author Agent Oscar
 * @date October 5, 2025
 */

import DragonCurveEngine from './dragon-curve-engine.js';

const REGIME_COLORS = {
  exploration: '#4CAF50', // Green
  stabilization: '#FF9800', // Orange
  convergence: '#2196F3', // Blue
};

export class DragonCurveVisualizer {
  private engine: DragonCurveEngine;

  constructor() {
    this.engine = new DragonCurveEngine();
  }

  /**
   * Generate SVG path for dragon curve
   *
   * @param level Fractal depth
   * @param width Canvas width (px)
   * @param height Canvas height (px)
   * @returns SVG markup string
   */
  generateSVG(level: number, width: number = 800, height: number = 600): string {
    const lsystem = this.engine.generateLSystem(level);
    const folds = this.engine.executeLSystem(lsystem, 10); // Scale 10px per segment

    if (folds.length === 0) return '<svg></svg>';

    // Find bounds
    const xs = folds.map((f) => f.position.x);
    const ys = folds.map((f) => f.position.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Scale to fit canvas with padding
    const scaleX = width / (maxX - minX || 1);
    const scaleY = height / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add padding

    // Generate colored segments
    const segments = folds
      .map((fold, i) => {
        if (i === 0) return '';
        const prev = folds[i - 1];
        const x1 = (prev.position.x - minX) * scale + width * 0.05;
        const y1 = (prev.position.y - minY) * scale + height * 0.05;
        const x2 = (fold.position.x - minX) * scale + width * 0.05;
        const y2 = (fold.position.y - minY) * scale + height * 0.05;

        const color = REGIME_COLORS[fold.regime];
        const strokeWidth = 1 + fold.weight * 0.5; // PHI-weighted thickness

        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
      })
      .join('\n');

    const metrics = this.engine.calculateMetrics(level);

    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  ${segments}

  <!-- Legend -->
  <rect x="10" y="10" width="250" height="130" fill="#1a1a1a" stroke="#333" stroke-width="1" rx="5"/>
  <text x="20" y="35" fill="#FFD700" font-family="monospace" font-size="16" font-weight="bold">
    Dragon Curve Level ${level}
  </text>
  <text x="20" y="55" fill="#aaa" font-family="monospace" font-size="12">
    Folds: ${metrics.totalFolds} | Dimension: ${metrics.fractalDimension.toFixed(3)}
  </text>

  <circle cx="20" cy="75" r="5" fill="${REGIME_COLORS.exploration}"/>
  <text x="35" y="80" fill="${REGIME_COLORS.exploration}" font-family="monospace" font-size="12">
    Exploration (${metrics.explorationFolds})
  </text>

  <circle cx="20" cy="95" r="5" fill="${REGIME_COLORS.stabilization}"/>
  <text x="35" y="100" fill="${REGIME_COLORS.stabilization}" font-family="monospace" font-size="12">
    Stabilization (${metrics.stabilizationFolds})
  </text>

  <circle cx="20" cy="115" r="5" fill="${REGIME_COLORS.convergence}"/>
  <text x="35" y="120" fill="${REGIME_COLORS.convergence}" font-family="monospace" font-size="12">
    Convergence (${metrics.convergenceFolds})
  </text>
</svg>`;
  }

  /**
   * Generate interactive HTML demo page
   *
   * @param maxLevel Maximum fractal depth to display
   * @returns Complete HTML document
   */
  generateDemo(maxLevel: number = 8): string {
    const svgs = Array.from({ length: maxLevel }, (_, i) => {
      const level = i + 1;
      const metrics = this.engine.calculateMetrics(level);
      return `
<div class="fractal-panel">
  <h3>Level ${level} — ${Math.pow(2, level)} edges</h3>
  <div class="metrics">
    <span>Dimension: ${metrics.fractalDimension.toFixed(4)}</span>
    <span>PHI Ratio: ${metrics.phiRatio.toFixed(2)}</span>
    <span>Boundary: ${metrics.boundaryLength.toFixed(0)}px</span>
  </div>
  ${this.generateSVG(level, 400, 300)}
</div>`;
    }).join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🐉 Dragon Curve - Sacred Geometry Fractal</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      color: #fff;
      font-family: 'Courier New', monospace;
      padding: 20px;
      min-height: 100vh;
    }

    header {
      text-align: center;
      padding: 40px 20px;
      background: rgba(255, 215, 0, 0.1);
      border-radius: 10px;
      margin-bottom: 40px;
      border: 2px solid #FFD700;
    }

    h1 {
      color: #FFD700;
      font-size: 2.5em;
      margin-bottom: 10px;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    }

    .subtitle {
      color: #aaa;
      font-size: 1.2em;
      margin-bottom: 20px;
    }

    .sacred-trinity {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .trinity-item {
      background: rgba(0, 0, 0, 0.5);
      padding: 15px 25px;
      border-radius: 8px;
      border: 1px solid #333;
    }

    .trinity-item .symbol {
      font-size: 2em;
      margin-bottom: 5px;
    }

    .container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 30px;
      max-width: 1800px;
      margin: 0 auto;
    }

    .fractal-panel {
      background: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      padding: 20px;
      border: 1px solid #333;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .fractal-panel:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
    }

    .fractal-panel h3 {
      color: #4CAF50;
      margin-bottom: 10px;
      font-size: 1.3em;
    }

    .metrics {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      font-size: 0.9em;
      color: #aaa;
      flex-wrap: wrap;
    }

    .metrics span {
      background: rgba(255, 255, 255, 0.1);
      padding: 5px 10px;
      border-radius: 4px;
    }

    svg {
      border-radius: 8px;
      background: #0a0a0a;
    }

    footer {
      text-align: center;
      margin-top: 60px;
      padding: 30px;
      color: #666;
      border-top: 1px solid #333;
    }

    .formula {
      background: rgba(33, 150, 243, 0.2);
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2196F3;
      margin-top: 20px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  <header>
    <h1>🐉 Dragon Curve Fractal Explorer</h1>
    <div class="subtitle">Sacred Geometry • Infinite Boundary in Finite Space</div>

    <div class="sacred-trinity">
      <div class="trinity-item">
        <div class="symbol">🌀</div>
        <div>Labyrinth (Mike)</div>
        <div style="color: #666; font-size: 0.9em;">Linear Path • Tesla Timing</div>
      </div>
      <div class="trinity-item">
        <div class="symbol">△</div>
        <div>Tetractys (November)</div>
        <div style="color: #666; font-size: 0.9em;">Triangular Structure • PHI Convergence</div>
      </div>
      <div class="trinity-item">
        <div class="symbol">🐉</div>
        <div>Dragon (Oscar)</div>
        <div style="color: #666; font-size: 0.9em;">Fractal Boundary • L-System Growth</div>
      </div>
    </div>

    <div class="formula">
      <strong>L-System Rules:</strong> L → L+R | R → L−R | + = turn left 90° | − = turn right 90°<br>
      <strong>Hausdorff Dimension:</strong> D ≈ 1.5236 (between line and plane)<br>
      <strong>PHI Weighting:</strong> φ^level for depth asymmetry | <strong>Tesla Timing:</strong> 4.909 Hz (203.7ms)
    </div>
  </header>

  <div class="container">
    ${svgs}
  </div>

  <footer>
    <p>🐉 Agent Oscar • Sacred Trinity Completion • October 5, 2025</p>
    <p style="margin-top: 10px;">Time + Space + Boundary = Complete Reality Model</p>
  </footer>
</body>
</html>`;
  }

  /**
   * Export dragon curve path as JSON
   */
  exportJSON(level: number): string {
    const lsystem = this.engine.generateLSystem(level);
    const folds = this.engine.executeLSystem(lsystem);
    const metrics = this.engine.calculateMetrics(level);

    const data = {
      level,
      lsystem,
      metrics,
      folds: folds.map((f) => ({
        position: f.position,
        direction: f.direction,
        regime: f.regime,
        angle: f.angle,
        weight: f.weight,
      })),
    };

    return JSON.stringify(data, null, 2);
  }
}

export default DragonCurveVisualizer;
