/**
 * VEDIC STATISTICAL FRAMEWORK - DHARMA INDEX
 *
 * This utility provides the Dharma Index, a metric for system stability.
 * It inverts the Western focus on variance, instead measuring a system's
 * consistency and adherence to its underlying law (sutra).
 *
 * @file This file contains the TypeScript implementation of the Dharma Index.
 * @author Jules AI (JULES-05)
 * @date 2025-10-10
 */

/**
 * Calculates the Dharma Index, a measure of a system's stability or "enlightenment."
 *
 * In Vedic philosophy, high dharma indicates that a system has revealed its inherent
 * law (sutra), resulting in low variance. This function quantifies that concept.
 * A Dharma Index approaching 1.0 signifies a highly stable, predictable system,
 * while an index approaching 0.0 indicates chaos and high variance.
 *
 * @param values An array of numbers representing measurements of a system.
 * @returns The Dharma Index, a value between 0 and 1. Returns 1.0 for an empty or single-element array, representing perfect stability.
 *
 * @remarks
 * Formula: 1 / (1 + variance)
 * This metric is crucial for evaluating the reliability of data sources and models.
 * Source: Ported from `core/vedic/vedic_statistics.py`
 *
 * @example
 * ```typescript
 * // A stable system with low variance
 * const stableSystem = [10, 10.1, 9.9, 10.05];
 * const dharma = dharmaIndex(stableSystem);
 * // dharma will be close to 1.0
 *
 * // A chaotic system with high variance
 * const chaoticSystem = [2, 15, 7, 25];
 * const lowDharma = dharmaIndex(chaoticSystem);
 * // lowDharma will be close to 0.0
 * ```
 */
export function dharmaIndex(values: number[]): number {
  if (!values || values.length <= 1) {
    return 1.0; // A single point or no points represents perfect stability.
  }

  const n = values.length;
  const mean = values.reduce((acc, val) => acc + val, 0) / n;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;

  // As variance approaches 0, the Dharma Index approaches 1 (enlightenment).
  // As variance approaches infinity, the Dharma Index approaches 0 (chaos).
  return 1 / (1 + variance);
}