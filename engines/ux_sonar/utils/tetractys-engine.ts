/**
 * TetractysEngine - Sacred Hierarchical Metric Convergence
 *
 * Based on the Pythagorean Tetractys (Sacred Triangle):
 *          •  (Level 1 - Apex, Weight: 4)
 *         / \
 *        •   •  (Level 2, Weight: 3)
 *       / \ / \
 *      •   •   •  (Level 3, Weight: 2)
 *     / \ / \ / \
 *    •   •   •   •  (Level 4 - Base, Weight: 1)
 *
 * Mathematical Basis:
 * - The Tetractys represents the number 10 (perfection): 1 + 2 + 3 + 4 = 10
 * - Hierarchical aggregation with weighted sacred proportions
 * - Each level converges pairs upward using a harmonizer function
 * - Final apex represents the unified system harmony metric
 *
 * Agent November - Sacred Geometry Integration
 */

/**
 * Represents a single level in the Tetractys hierarchy
 */
export interface TetractysLevel<T> {
  level: number;        // 1 (apex) to 4 (base)
  weight: number;       // 4 (apex) to 1 (base) - sacred proportions
  metrics: T[];         // Metrics at this level
  convergedValue?: number; // Final converged value (apex only)
}

/**
 * Configuration for Tetractys convergence
 */
export interface TetractysConfig {
  /** Function to harmonize metrics at each level */
  harmonizer: (metrics: number[]) => number;

  /** Override default sacred weights [4, 3, 2, 1] */
  weights?: [number, number, number, number];

  /** Enable detailed convergence path tracking */
  trackPath?: boolean;
}

/**
 * Result of Tetractys convergence
 */
export interface TetractysConvergenceResult {
  /** Final apex value (System Harmony Metric) */
  apex: number;

  /** All levels in the hierarchy (1 to 4) */
  levels: TetractysLevel<number>[];

  /** Convergence path showing count at each level [6, 3, 2, 1] */
  convergencePath: number[];

  /** Weighted score respecting sacred proportions */
  weightedScore: number;

  /** Detailed convergence journey (if trackPath enabled) */
  convergenceJourney?: {
    level: number;
    input: number[];
    output: number[];
    harmonization: string;
  }[];
}

/**
 * Golden Ratio constant (φ) - used in sacred harmonization
 */
export const PHI = 1.618033988749895;

/**
 * TetractysEngine - Hierarchical Metric Convergence System
 *
 * Implements the Pythagorean Tetractys pattern for metric aggregation.
 * Converges raw metrics upward through sacred hierarchy to produce
 * a unified system harmony metric (SHM).
 */
export class TetractysEngine {
  private config: Required<TetractysConfig>;

  constructor(config: TetractysConfig) {
    this.config = {
      harmonizer: config.harmonizer,
      weights: config.weights || [4, 3, 2, 1], // Default sacred weights (apex to base)
      trackPath: config.trackPath ?? false
    };
  }

  /**
   * Converge raw metrics upward through the sacred hierarchy
   *
   * @param rawMetrics - Bottom level measurements (Level 4)
   * @returns Complete Tetractys structure with apex value
   *
   * @example
   * const engine = new TetractysEngine({ harmonizer: geometricMean });
   * const result = engine.converge([0.95, 0.88, 0.92, 0.81, 0.76, 0.89]);
   * console.log(result.apex); // 0.865 (System Harmony Metric)
   */
  converge(rawMetrics: number[]): TetractysConvergenceResult {
    const journey: TetractysConvergenceResult['convergenceJourney'] = [];

    // Level 4: Base measurements (weight: 1)
    const level4: TetractysLevel<number> = {
      level: 4,
      weight: this.config.weights[3],
      metrics: [...rawMetrics]
    };

    // Level 3: Harmonize pairs (weight: 2)
    const level3Metrics = this.harmonizePairs(rawMetrics);
    const level3: TetractysLevel<number> = {
      level: 3,
      weight: this.config.weights[2],
      metrics: level3Metrics
    };

    if (this.config.trackPath) {
      journey.push({
        level: 3,
        input: rawMetrics,
        output: level3Metrics,
        harmonization: 'Pair-wise convergence'
      });
    }

    // Level 2: Harmonize groups (weight: 3)
    const level2Metrics = this.harmonizePairs(level3Metrics);
    const level2: TetractysLevel<number> = {
      level: 2,
      weight: this.config.weights[1],
      metrics: level2Metrics
    };

    if (this.config.trackPath) {
      journey.push({
        level: 2,
        input: level3Metrics,
        output: level2Metrics,
        harmonization: 'Group convergence'
      });
    }

    // Level 1: Final apex (weight: 4)
    const apexValue = this.config.harmonizer(level2Metrics);
    const level1: TetractysLevel<number> = {
      level: 1,
      weight: this.config.weights[0],
      metrics: [apexValue],
      convergedValue: apexValue
    };

    if (this.config.trackPath) {
      journey.push({
        level: 1,
        input: level2Metrics,
        output: [apexValue],
        harmonization: 'Final apex convergence'
      });
    }

    // Calculate weighted score respecting sacred proportions
    const weightedScore = this.calculateWeightedScore([level1, level2, level3, level4]);

    const result: TetractysConvergenceResult = {
      apex: apexValue,
      levels: [level1, level2, level3, level4],
      convergencePath: [
        rawMetrics.length,
        level3Metrics.length,
        level2Metrics.length,
        1
      ],
      weightedScore
    };

    if (this.config.trackPath) {
      result.convergenceJourney = journey;
    }

    return result;
  }

  /**
   * Harmonize pairs of metrics using the configured harmonizer
   * Odd metrics pass through unchanged
   */
  private harmonizePairs(metrics: number[]): number[] {
    const result: number[] = [];

    for (let i = 0; i < metrics.length; i += 2) {
      if (i + 1 < metrics.length) {
        // Pair exists - harmonize
        const harmonized = this.config.harmonizer([metrics[i], metrics[i + 1]]);
        result.push(harmonized);
      } else {
        // Odd one out - pass through
        result.push(metrics[i]);
      }
    }

    return result;
  }

  /**
   * Calculate weighted score respecting sacred proportions
   * Each level contributes based on its sacred weight (4, 3, 2, 1)
   */
  private calculateWeightedScore(levels: TetractysLevel<number>[]): number {
    let totalWeightedSum = 0;
    let totalWeight = 0;

    for (const level of levels) {
      const levelAvg = this.calculateAverage(level.metrics);
      totalWeightedSum += levelAvg * level.weight;
      totalWeight += level.weight;
    }

    return totalWeightedSum / totalWeight;
  }

  /**
   * Calculate average of metrics
   */
  private calculateAverage(metrics: number[]): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  /**
   * Generate ASCII visualization of the Tetractys
   */
  visualize(result: TetractysConvergenceResult, labels?: string[]): string {
    const { levels } = result;

    // Extract values for each position
    const l1 = levels[0].metrics[0];
    const l2 = levels[1].metrics;
    const l3 = levels[2].metrics;
    const l4 = levels[3].metrics;

    // Format values
    const fmt = (n: number) => n.toFixed(2);

    return `
         ${fmt(l1)}  (Apex - SHM)
        /     \\
       ${fmt(l2[0] ?? 0)}   ${fmt(l2[1] ?? 0)}  (Level 2)
      / \\   / \\
     ${fmt(l3[0] ?? 0)} ${fmt(l3[1] ?? 0)} ${fmt(l3[2] ?? 0)}  (Level 3)
    / \\ / \\ / \\
   ${fmt(l4[0] ?? 0)} ${fmt(l4[1] ?? 0)} ${fmt(l4[2] ?? 0)} ${fmt(l4[3] ?? 0)} ${fmt(l4[4] ?? 0)} ${fmt(l4[5] ?? 0)}  (Base Metrics)
   ${labels ? labels.slice(0, 6).map(l => l.substring(0, 3).padEnd(4)).join(' ') : ''}

Sacred Weights: 4 (apex) → 3 → 2 → 1 (base)
Convergence Path: [${result.convergencePath.join(' → ')}]
Weighted Score: ${fmt(result.weightedScore)}
    `.trim();
  }
}

/**
 * Pre-configured harmonizers for common use cases
 */
export const Harmonizers = {
  /**
   * Arithmetic mean - simple average
   */
  arithmeticMean: (metrics: number[]): number => {
    if (metrics.length === 0) return 0;
    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  },

  /**
   * Geometric mean - preserves proportional relationships
   */
  geometricMean: (metrics: number[]): number => {
    if (metrics.length === 0) return 0;
    if (metrics.some(m => m <= 0)) return 0;
    const product = metrics.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / metrics.length);
  },

  /**
   * Harmonic mean - emphasizes smaller values
   */
  harmonicMean: (metrics: number[]): number => {
    if (metrics.length === 0) return 0;
    if (metrics.some(m => m === 0)) return 0;
    const sum = metrics.reduce((a, b) => a + 1/b, 0);
    return metrics.length / sum;
  },

  /**
   * Golden ratio weighted geometric mean (sacred harmonization)
   * Applies φ-based adjustment for sacred proportions
   */
  goldenRatioGeometric: (metrics: number[]): number => {
    if (metrics.length === 0) return 0;
    if (metrics.some(m => m <= 0)) return 0;

    const product = metrics.reduce((a, b) => a * b, 1);
    const geometricMean = Math.pow(product, 1 / metrics.length);

    // Apply golden ratio adjustment (decreases with more metrics)
    const phiAdjustment = Math.pow(PHI, -metrics.length / 10);

    return geometricMean * phiAdjustment;
  },

  /**
   * Quadratic mean (RMS) - emphasizes larger values
   */
  quadraticMean: (metrics: number[]): number => {
    if (metrics.length === 0) return 0;
    const sumSquares = metrics.reduce((a, b) => a + b * b, 0);
    return Math.sqrt(sumSquares / metrics.length);
  }
};

/**
 * Factory function to create a Tetractys engine with sensible defaults
 * for the Asymmetrica Dashboard
 */
export function createSonarTetractys(options?: {
  harmonizer?: (metrics: number[]) => number;
  weights?: [number, number, number, number];
  trackPath?: boolean;
}): TetractysEngine {
  return new TetractysEngine({
    harmonizer: options?.harmonizer || Harmonizers.goldenRatioGeometric,
    weights: options?.weights,
    trackPath: options?.trackPath
  });
}

/**
 * Calculate System Harmony Metric (SHM) using Tetractys convergence
 *
 * @param sonarScores - Individual sonar scores (6 sonars)
 * @returns Tetractys convergence result with SHM as apex
 *
 * @example
 * const shm = calculateSHMWithTetractys({
 *   ux: 0.95,
 *   design: 0.88,
 *   code: 0.92,
 *   semantic: 0.81,
 *   journey: 0.76,
 *   state: 0.89
 * });
 * console.log(shm.apex); // 0.865
 * console.log(shm.visualization);
 */
export function calculateSHMWithTetractys(sonarScores: {
  ux: number;
  design: number;
  code: number;
  semantic: number;
  journey: number;
  state: number;
}): TetractysConvergenceResult & { visualization: string } {
  const rawMetrics = [
    sonarScores.ux,
    sonarScores.design,
    sonarScores.code,
    sonarScores.semantic,
    sonarScores.journey,
    sonarScores.state
  ];

  const labels = ['UX', 'Des', 'Cod', 'Sem', 'Jrn', 'Sta'];

  const tetractys = createSonarTetractys({ trackPath: true });
  const result = tetractys.converge(rawMetrics);
  const visualization = tetractys.visualize(result, labels);

  return {
    ...result,
    visualization
  };
}
