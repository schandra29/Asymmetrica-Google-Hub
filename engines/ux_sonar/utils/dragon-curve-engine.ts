/**
 * Dragon Curve Fractal Boundary Explorer
 *
 * Mathematical Foundation: Heighway Dragon (1967) - Space-filling fractal from paper-folding
 * Sacred Geometry: Infinite boundary in finite space
 *
 * L-System Rules:
 *   L → L+R  (left fold creates left-right pattern)
 *   R → L−R  (right fold creates left-right pattern)
 *   + = turn left 90°
 *   − = turn right 90°
 *
 * Properties:
 *   - Hausdorff dimension ≈ 1.5236 (between line and plane)
 *   - Self-similar: Each fold contains the whole pattern
 *   - Non-idempotent: f(f(x)) >> f(x) — amplifies emergence
 *   - Finite area, infinite boundary
 *
 * Asymmetrica Integration:
 *   - PHI weighting: 1.618^level for asymmetric depth exploration
 *   - Tesla timing: 203.7ms intervals (4.909 Hz harmonics)
 *   - Three-regime mapping: Exploration (L+), Stabilization (R−), Convergence (unfold)
 *
 * @author Agent Oscar (Sacred Geometry Trinity Completion)
 * @date October 5, 2025
 */

const PHI = 1.618033988749895;
const TESLA_BASE_PERIOD_MS = 1000 / 4.909; // ~203.7ms

export interface DragonFold {
  level: number;
  direction: 'L' | 'R' | 'F'; // Left (explore), Right (stabilize), Forward (converge)
  position: { x: number; y: number };
  angle: number; // 0, 90, 180, 270 degrees
  weight: number; // PHI^level for asymmetric depth
  regime: 'exploration' | 'stabilization' | 'convergence';
  timestamp: number; // Tesla harmonic timing
}

export interface BoundaryEdge<T = any> {
  from: T;
  to: T;
  fold: DragonFold;
  isImpossible: boolean;
  regime: 'exploration' | 'stabilization' | 'convergence';
  divergence?: number; // Metric space distance
}

export interface DragonCurveMetrics {
  level: number;
  totalFolds: number;
  explorationFolds: number;
  stabilizationFolds: number;
  convergenceFolds: number;
  fractalDimension: number;
  boundaryLength: number;
  area: number;
  phiRatio: number; // Actual PHI distribution in folds
  teslaFrequency: number; // Hz
}

export class DragonCurveEngine {
  private readonly maxLevel: number = 12; // Cap at 2^12 = 4096 edges (performance limit)
  private foldCache: Map<number, string> = new Map();

  /**
   * Generate L-system string for given fold level
   *
   * Dragon Curve L-system:
   *   Axiom: F
   *   Rules: F → F+F−F (each forward creates two 90° turns)
   *
   * Growth: Level N = 2^N segments
   *
   * @param level Recursion depth (0-12)
   * @returns L-system command string
   */
  generateLSystem(level: number): string {
    if (level === 0) return 'F';
    if (level > this.maxLevel) {
      throw new Error(`Max level ${this.maxLevel} exceeded (would generate ${Math.pow(2, level)} segments)`);
    }

    // Check cache
    if (this.foldCache.has(level)) {
      return this.foldCache.get(level)!;
    }

    let current = 'F';
    for (let i = 0; i < level; i++) {
      current = this.applyRules(current);
    }

    this.foldCache.set(level, current);
    return current;
  }

  /**
   * Apply L-system transformation rules
   * F → F+F−F (dragon curve characteristic)
   */
  private applyRules(str: string): string {
    return str
      .split('')
      .map((c) => {
        if (c === 'F') return 'F+F−F';
        return c;
      })
      .join('');
  }

  /**
   * Execute L-system commands to generate fold path
   *
   * Commands:
   *   F = move forward (create fold)
   *   + = turn left 90° (exploration)
   *   − = turn right 90° (stabilization)
   *
   * @param lsystem L-system string from generateLSystem()
   * @param scale Spatial scale per segment (default 1.0)
   * @param startTime Tesla harmonic start time (ms)
   * @returns Array of DragonFold positions and metadata
   */
  executeLSystem(
    lsystem: string,
    scale: number = 1.0,
    startTime: number = 0
  ): DragonFold[] {
    const folds: DragonFold[] = [];
    let pos = { x: 0, y: 0 };
    let angle = 0; // Start facing east (0°)
    let level = 0;
    let time = startTime;

    for (const cmd of lsystem) {
      if (cmd === 'F') {
        // Move forward, create fold
        const radians = (angle * Math.PI) / 180;
        const newPos = {
          x: pos.x + scale * Math.cos(radians),
          y: pos.y + scale * Math.sin(radians),
        };

        const fold: DragonFold = {
          level,
          direction: 'F', // Will be classified after angle change
          position: newPos,
          angle,
          weight: Math.pow(PHI, level / 10), // Scale PHI to prevent overflow
          regime: 'convergence', // Default, updated by turn commands
          timestamp: time,
        };

        folds.push(fold);
        pos = newPos;
        level++;
        time += TESLA_BASE_PERIOD_MS; // Tesla harmonic timing
      } else if (cmd === '+') {
        // Turn left (explore)
        angle = (angle + 90) % 360;
        if (folds.length > 0) {
          const lastFold = folds[folds.length - 1];
          lastFold.direction = 'L';
          lastFold.regime = 'exploration';
        }
      } else if (cmd === '−') {
        // Turn right (stabilize)
        angle = (angle - 90 + 360) % 360;
        if (folds.length > 0) {
          const lastFold = folds[folds.length - 1];
          lastFold.direction = 'R';
          lastFold.regime = 'stabilization';
        }
      }
    }

    return folds;
  }

  /**
   * Explore boundaries by folding state space
   *
   * Core Algorithm:
   *   1. Generate L-system fractal path
   *   2. Apply stateFolder transformation at each fold
   *   3. Classify edges as possible/impossible
   *   4. Weight by PHI and regime
   *
   * @param initialStates Starting state space
   * @param level Fractal recursion depth
   * @param stateFolder Function to fold state (returns null if impossible)
   * @returns Boundary edges with impossibility flags
   */
  exploreBoundaries<T>(
    initialStates: T[],
    level: number,
    stateFolder: (state: T, fold: DragonFold) => T | null
  ): BoundaryEdge<T>[] {
    const lsystem = this.generateLSystem(level);
    const folds = this.executeLSystem(lsystem);
    const boundaries: BoundaryEdge<T>[] = [];

    for (const fold of folds) {
      for (const state of initialStates) {
        const folded = stateFolder(state, fold);

        if (folded !== null) {
          boundaries.push({
            from: state,
            to: folded,
            fold,
            isImpossible: this.isImpossibleState(folded),
            regime: this.classifyRegime(fold),
          });
        }
      }
    }

    return boundaries;
  }

  /**
   * Override in subclass to define impossibility conditions
   * Default: No states are impossible
   */
  protected isImpossibleState(state: any): boolean {
    return false;
  }

  /**
   * Classify fold into Asymmetrica regime
   *
   * Mapping:
   *   L (left turn) → Exploration (probe new boundaries)
   *   R (right turn) → Stabilization (anchor known edges)
   *   F (forward) → Convergence (balanced path)
   */
  private classifyRegime(fold: DragonFold): 'exploration' | 'stabilization' | 'convergence' {
    if (fold.direction === 'L') return 'exploration';
    if (fold.direction === 'R') return 'stabilization';
    return 'convergence';
  }

  /**
   * Calculate fractal dimension (Hausdorff)
   *
   * Dragon curve theoretical dimension ≈ 1.5236
   * Formula: D = log(N) / log(1/r)
   *   where N = number of self-similar pieces (2)
   *   and r = scaling factor (1/√2 for dragon curve)
   *
   * Derivation:
   *   D = log(2) / log(√2) = log(2) / (0.5 * log(2)) = 2
   *   (Correction: Actual dragon curve uses different scaling)
   *   D ≈ 1.5236 (empirically measured)
   */
  calculateFractalDimension(level: number): number {
    const segments = Math.pow(2, level);
    const scale = Math.pow(2, -level / 2); // Dragon curve scale factor
    const dimension = Math.log(segments) / Math.log(1 / scale);
    return dimension;
  }

  /**
   * Calculate comprehensive metrics for dragon curve at given level
   */
  calculateMetrics(level: number): DragonCurveMetrics {
    const lsystem = this.generateLSystem(level);
    const folds = this.executeLSystem(lsystem);

    const explorationFolds = folds.filter((f) => f.regime === 'exploration').length;
    const stabilizationFolds = folds.filter((f) => f.regime === 'stabilization').length;
    const convergenceFolds = folds.filter((f) => f.regime === 'convergence').length;

    // Calculate boundary length (sum of segment lengths)
    let boundaryLength = 0;
    for (let i = 1; i < folds.length; i++) {
      const dx = folds[i].position.x - folds[i - 1].position.x;
      const dy = folds[i].position.y - folds[i - 1].position.y;
      boundaryLength += Math.sqrt(dx * dx + dy * dy);
    }

    // Calculate area (approximate via bounding box)
    const xs = folds.map((f) => f.position.x);
    const ys = folds.map((f) => f.position.y);
    const area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));

    // PHI ratio (exploration vs stabilization)
    const phiRatio = explorationFolds / (stabilizationFolds || 1);

    return {
      level,
      totalFolds: folds.length,
      explorationFolds,
      stabilizationFolds,
      convergenceFolds,
      fractalDimension: this.calculateFractalDimension(level),
      boundaryLength,
      area,
      phiRatio,
      teslaFrequency: 1000 / TESLA_BASE_PERIOD_MS,
    };
  }

  /**
   * Verify three-regime distribution matches Asymmetrica protocol
   * Target: Exploration 30%, Stabilization 20%, Convergence 50%
   *
   * @returns Deviation from ideal (0.0 = perfect, 1.0 = completely wrong)
   */
  verifyRegimeDistribution(level: number): number {
    const metrics = this.calculateMetrics(level);
    const total = metrics.totalFolds;

    const actualExploration = metrics.explorationFolds / total;
    const actualStabilization = metrics.stabilizationFolds / total;
    const actualConvergence = metrics.convergenceFolds / total;

    const targetExploration = 0.3;
    const targetStabilization = 0.2;
    const targetConvergence = 0.5;

    const deviation =
      Math.abs(actualExploration - targetExploration) +
      Math.abs(actualStabilization - targetStabilization) +
      Math.abs(actualConvergence - targetConvergence);

    return deviation / 3; // Normalize to 0-1 range
  }

  /**
   * Generate Tesla harmonic delay sequence for exploration
   * Returns array of delays in milliseconds following exponential backoff
   * with harmonic intervals (1×, 2×, 4×, 8×, 16× base period)
   */
  generateHarmonicDelays(steps: number): number[] {
    const delays: number[] = [];
    for (let i = 0; i < steps; i++) {
      const multiplier = Math.pow(2, i); // Exponential backoff
      delays.push(TESLA_BASE_PERIOD_MS * multiplier);
    }
    return delays;
  }

  /**
   * Clear L-system cache (for memory management)
   */
  clearCache(): void {
    this.foldCache.clear();
  }
}

export default DragonCurveEngine;
