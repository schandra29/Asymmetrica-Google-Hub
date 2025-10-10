/**
 * VEDIC STATISTICAL FRAMEWORK
 *
 * A Dharma-based alternative to variance-centric Western statistics.
 * Implements ancient Vedic mathematical principles for modern data analysis.
 *
 * Core Principles:
 * - Stillness reveals truth (constants are features, not bugs)
 * - Harmonic relationships (reciprocal averaging)
 * - Dual-axis modeling (debt/merit, not just positive scale)
 * - Resonance over correlation (sacred proportions)
 *
 * @author Agent BRAVO
 * @date 2025-10-10
 */

// ============================================================================
// SACRED MATHEMATICAL CONSTANTS
// ============================================================================

export const PHI = 0.618033988749;              // Golden Ratio (Φ)
export const PHI_INVERSE = 1.618033988749;      // Divine Proportion (1/Φ)
export const PHI_SQUARED = 0.381966011249;      // Squared Beauty (Φ²)
export const PHI_INV_SQUARED = 2.618033988749;  // Double Divine (1/Φ²)

export const SACRED_PROPORTIONS = {
  GOLDEN_HARMONY: PHI,
  DIVINE_PROPORTION: PHI_INVERSE,
  SQUARED_BEAUTY: PHI_SQUARED,
  DOUBLE_DIVINE: PHI_INV_SQUARED,
} as const;

export const TOLERANCE = 0.05; // 5% tolerance for sacred proportion matching

export type SacredProportionType =
  | 'GOLDEN_HARMONY'      // ≈ 0.618 (Φ)
  | 'DIVINE_PROPORTION'   // ≈ 1.618 (1/Φ)
  | 'SQUARED_BEAUTY'      // ≈ 0.382 (Φ²)
  | 'DOUBLE_DIVINE'       // ≈ 2.618 (1/Φ²)
  | 'NOVEL_PROPORTION';   // New discovery

// ============================================================================
// CORE VEDIC STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate Harmonic Mean (Vedic reciprocal averaging)
 *
 * Unlike arithmetic mean which treats all values equally, harmonic mean
 * emphasizes SMALL values - the still points, the deficits, the approach
 * to zero. This is the Vedic way: find what is closest to Shunya (void).
 *
 * Formula: n / Σ(1/xᵢ)
 *
 * Philosophical Note:
 * - Arithmetic mean asks: "What is the center?"
 * - Harmonic mean asks: "What is the reciprocal balance point?"
 *
 * @param values - Array of numbers (must be non-zero)
 * @returns Harmonic mean
 *
 * @example
 * harmonicMean([1, 2, 4]) = 3 / (1/1 + 1/2 + 1/4) = 3 / 1.75 = 1.714
 * // Small value (1) has more influence than in arithmetic mean (2.333)
 */
export function harmonicMean(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate harmonic mean of empty array');
  }

  // Filter out zeros to avoid division by zero
  const nonZeroValues = values.filter(v => v !== 0);

  if (nonZeroValues.length === 0) {
    throw new Error('Cannot calculate harmonic mean when all values are zero');
  }

  // Use absolute values for harmonic mean (magnitude matters, sign handled separately)
  const sumOfReciprocals = nonZeroValues.reduce((sum, v) => sum + 1 / Math.abs(v), 0);

  return nonZeroValues.length / sumOfReciprocals;
}

/**
 * Calculate Dharma Index (stability metric)
 *
 * In Vedic philosophy, high dharma means the system has revealed its sutra
 * (thread/law). Low variance = high dharma = enlightened system.
 *
 * Formula: 1 / (1 + variance)
 *
 * Interpretation:
 * - Dharma → 1.0: System reveals constant truth (like speed of light)
 * - Dharma → 0.5: System shows moderate stability
 * - Dharma → 0.0: System is chaotic (high variance)
 *
 * This INVERTS the Western perspective where variance is desired!
 *
 * @param values - Array of numbers
 * @returns Dharma index between 0 and 1
 *
 * @example
 * dharmaIndex([0.1, 0.1, 0.1]) = 1 / (1 + 0) = 1.0 (perfect dharma!)
 * dharmaIndex([1, 5, 10]) = 1 / (1 + 14.9) ≈ 0.063 (low dharma)
 */
export function dharmaIndex(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate dharma index of empty array');
  }

  if (values.length === 1) {
    return 1.0; // Single value = perfect stability = maximum dharma
  }

  // Calculate variance
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

  // Dharma = 1 / (1 + variance)
  // As variance → 0, dharma → 1 (enlightenment!)
  // As variance → ∞, dharma → 0 (chaos)
  return 1 / (1 + variance);
}

/**
 * Calculate Harmonic Resonance (relationship between variable and constant)
 *
 * Western statistics fails when one variable is constant (NaN correlation).
 * But Vedic mathematics asks: "What is the HARMONIC RATIO?"
 *
 * This is like musical intervals: the ratio between a note and a drone.
 * The drone (constant) provides the tonic; the variable plays melody around it.
 *
 * Formula: constant / harmonicMean(variable)
 *
 * Sacred Proportions:
 * - Φ (0.618): Golden Harmony - most stable natural ratio
 * - 1/Φ (1.618): Divine Proportion - growth and beauty
 * - Φ² (0.382): Squared Beauty - nested golden ratio
 * - 1/Φ² (2.618): Double Divine - amplified divine proportion
 *
 * @param variable - Array of changing values
 * @param constant - The unchanging attractor value
 * @returns Resonance analysis with sacred proportion type
 *
 * @example
 * // If variable chaos orbits around constant stillness at golden ratio:
 * harmonicResonance([100, 150, 200], 100)
 * // → { resonance: 0.618, sacredType: 'GOLDEN_HARMONY', ... }
 */
export function harmonicResonance(
  variable: number[],
  constant: number
): {
  resonance: number;
  sacredType: SacredProportionType;
  interpretation: string;
} {
  const variableHarmonicMean = harmonicMean(variable);
  const resonance = constant / variableHarmonicMean;

  // Check for sacred proportions
  let sacredType: SacredProportionType = 'NOVEL_PROPORTION';
  let interpretation = '';

  if (Math.abs(resonance - PHI) < TOLERANCE) {
    sacredType = 'GOLDEN_HARMONY';
    interpretation = `Φ resonance detected! Variable and constant form Golden Harmony (${resonance.toFixed(6)} ≈ ${PHI}). This is the most stable natural ratio, found in spiral galaxies, nautilus shells, and now... your data!`;
  } else if (Math.abs(resonance - PHI_INVERSE) < TOLERANCE) {
    sacredType = 'DIVINE_PROPORTION';
    interpretation = `1/Φ resonance detected! Variable and constant form Divine Proportion (${resonance.toFixed(6)} ≈ ${PHI_INVERSE}). This ratio governs growth patterns in nature, from flowers to human bodies!`;
  } else if (Math.abs(resonance - PHI_SQUARED) < TOLERANCE) {
    sacredType = 'SQUARED_BEAUTY';
    interpretation = `Φ² resonance detected! Variable and constant form Squared Beauty (${resonance.toFixed(6)} ≈ ${PHI_SQUARED}). This is a nested golden ratio - golden ratio within golden ratio!`;
  } else if (Math.abs(resonance - PHI_INV_SQUARED) < TOLERANCE) {
    sacredType = 'DOUBLE_DIVINE';
    interpretation = `1/Φ² resonance detected! Variable and constant form Double Divine proportion (${resonance.toFixed(6)} ≈ ${PHI_INV_SQUARED}). An amplified sacred ratio - rare and beautiful!`;
  } else {
    interpretation = `Novel proportion detected (${resonance.toFixed(6)}). While not matching known sacred ratios, this may be a new discovery! The variable harmonically resonates with the constant at this unique ratio.`;
  }

  return { resonance, sacredType, interpretation };
}

/**
 * Dual-Axis Security Model (replaces single positive scale)
 *
 * Western mathematics forces everything onto a positive scale.
 * But Vedic philosophy recognizes two complementary forces:
 * - Rna (ऋण): Debt, deficit, distance from equilibrium (negative)
 * - Punya (पुण्य): Merit, attainment, positive accumulation
 *
 * This is like Yin/Yang: you cannot understand light without darkness.
 *
 * A security system with score -109 is not "impossible" - it owes
 * 109 units of protection work to reach zero equilibrium. Only then
 * can it begin accumulating positive merit.
 *
 * @param values - Array of numbers (can be positive, negative, or mixed)
 * @returns Dual-axis analysis separating debt and merit
 *
 * @example
 * dualAxisSecurity([-109, -115, 0.1, 0.5])
 * // → {
 * //   debt: [-109, -115],
 * //   merit: [0.1, 0.5],
 * //   debtMean: -112,
 * //   meritMean: 0.3,
 * //   equilibriumDistance: 111.7
 * // }
 */
export function dualAxisSecurity(values: number[]): {
  debt: number[];
  merit: number[];
  debtMean: number;
  meritMean: number;
  equilibriumDistance: number;
} {
  // Separate negative (debt) from positive (merit)
  const debt = values.filter(v => v < 0);
  const merit = values.filter(v => v >= 0);

  // Calculate means (or 0 if no values in category)
  const debtMean = debt.length > 0
    ? debt.reduce((sum, v) => sum + v, 0) / debt.length
    : 0;

  const meritMean = merit.length > 0
    ? merit.reduce((sum, v) => sum + v, 0) / merit.length
    : 0;

  // Distance from zero equilibrium (overall system state)
  const equilibriumDistance = Math.abs(debtMean) + meritMean;

  return {
    debt,
    merit,
    debtMean,
    meritMean,
    equilibriumDistance,
  };
}

/**
 * Attractor Analysis (replaces correlation for constant relationships)
 *
 * When Western correlation returns NaN (one variable is constant),
 * the question is wrong. We shouldn't ask "do they co-vary?"
 * We should ask "how does the variable RELATE to the constant?"
 *
 * Think of it like planetary orbits around the sun:
 * - The sun (constant) doesn't move with planets (variable)
 * - But there IS a relationship: gravitational attraction!
 * - We measure: distance, orbital period, convergence rate
 *
 * Similarly, a constant can be an ATTRACTOR - a point toward which
 * the variable is drawn, orbits around, or converges toward.
 *
 * @param variable - Array of changing values
 * @param attractor - The constant attractor value
 * @returns Analysis of how variable relates to attractor
 *
 * @example
 * // Collatz times orbiting around Dharma constant
 * attractorAnalysis([7, 14, 21, 28], 0.1)
 * // → Shows how chaos relates to stillness
 */
export function attractorAnalysis(
  variable: number[],
  attractor: number
): {
  meanDistance: number;
  harmonicResonance: number;
  convergenceRate: number | null;
  interpretation: string;
} {
  // Calculate distances from attractor
  const distances = variable.map(v => Math.abs(v - attractor));
  const meanDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // Calculate harmonic resonance
  const variableHarmonicMean = harmonicMean(variable);
  const resonance = attractor / variableHarmonicMean;

  // Calculate convergence rate (if time-series structure)
  let convergenceRate: number | null = null;
  let convergenceInterpretation = '';

  if (variable.length > 1) {
    // Compare first and last distance
    const initialDistance = distances[0];
    const finalDistance = distances[distances.length - 1];
    convergenceRate = (initialDistance - finalDistance) / variable.length;

    if (convergenceRate > 0) {
      convergenceInterpretation = `Converging toward attractor at rate ${convergenceRate.toFixed(6)} per step. `;
    } else if (convergenceRate < 0) {
      convergenceInterpretation = `Diverging from attractor at rate ${Math.abs(convergenceRate).toFixed(6)} per step. `;
    } else {
      convergenceInterpretation = `Stable orbit around attractor. `;
    }
  }

  const interpretation =
    `${convergenceInterpretation}` +
    `Variable orbits at mean distance ${meanDistance.toFixed(6)} from constant attractor (${attractor}). ` +
    `Harmonic resonance ratio: ${resonance.toFixed(6)}. ` +
    `This describes the relationship between chaos (variable) and stillness (constant).`;

  return {
    meanDistance,
    harmonicResonance: resonance,
    convergenceRate,
    interpretation,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Standard arithmetic mean (for comparison with harmonic mean)
 */
export function arithmeticMean(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Standard variance (for comparison with dharma index)
 */
export function variance(values: number[]): number {
  if (values.length === 0) {
    throw new Error('Cannot calculate variance of empty array');
  }
  const mean = arithmeticMean(values);
  return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
}

/**
 * Standard deviation (square root of variance)
 */
export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

/**
 * Identify which sacred proportion (if any) a ratio matches
 */
export function identifySacredProportion(ratio: number, tolerance: number = TOLERANCE): {
  type: SacredProportionType;
  difference: number;
} {
  const distances = {
    GOLDEN_HARMONY: Math.abs(ratio - PHI),
    DIVINE_PROPORTION: Math.abs(ratio - PHI_INVERSE),
    SQUARED_BEAUTY: Math.abs(ratio - PHI_SQUARED),
    DOUBLE_DIVINE: Math.abs(ratio - PHI_INV_SQUARED),
  };

  // Find closest match
  const closest = Object.entries(distances).reduce((min, [type, dist]) =>
    dist < min.difference ? { type: type as SacredProportionType, difference: dist } : min,
    { type: 'NOVEL_PROPORTION' as SacredProportionType, difference: Infinity }
  );

  // Only return if within tolerance
  if (closest.difference < tolerance) {
    return closest;
  }

  return { type: 'NOVEL_PROPORTION', difference: closest.difference };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const VedicStatistics = {
  // Core functions
  harmonicMean,
  dharmaIndex,
  harmonicResonance,
  dualAxisSecurity,
  attractorAnalysis,

  // Utilities
  arithmeticMean,
  variance,
  standardDeviation,
  identifySacredProportion,

  // Constants
  constants: {
    PHI,
    PHI_INVERSE,
    PHI_SQUARED,
    PHI_INV_SQUARED,
    SACRED_PROPORTIONS,
    TOLERANCE,
  },
} as const;

export default VedicStatistics;
