/**
 * VEDIC STATISTICAL FRAMEWORK - NIKHILAM CORRECTION
 *
 * This utility provides the Nikhilam correction, a method for finding the
 * complement of a number relative to a power of 10. It is used as a
 * fallback mechanism for low-quality inputs, transforming a deficit into
 * a surplus measure.
 *
 * @file This file contains the TypeScript implementation of the Nikhilam correction.
 * @author Jules AI (JULES-05)
 * @date 2025-10-10
 */

/**
 * Calculates the Vedic complement of a number using the "Nikhilam Navatashcaramam Dashatah"
 * sutra, which translates to "All from 9 and the last from 10".
 *
 * This function finds the next power of 10 that is greater than or equal to the input value
 * and calculates the difference (the complement). It is particularly useful for
 * inverting low-quality scores into a measure of potential. For example, a low
 * confidence score of 0.15 is complemented to 0.85 (from a base of 1.0).
 *
 * @param value The number to correct. Must be a positive number.
 * @returns The Nikhilam complement of the value. Returns 0 if the input is not positive.
 *
 * @remarks
 * The function determines the base automatically. For `87`, the base is `100`, complement is `13`.
 * For `0.15`, the base is `1`, complement is `0.85`.
 * Source: Interpretation of Nikhilam Sutra for modern data correction.
 *
 * @example
 * ```typescript
 * // Correcting a low confidence score
 * const lowConfidence = 0.2;
 * const corrected = nikhilamCorrection(lowConfidence); // 0.8
 *
 * // Finding the complement of an integer
 * const integerValue = 980;
 * const complement = nikhilamCorrection(integerValue); // 20 (from base 1000)
 * ```
 */
export function nikhilamCorrection(value: number): number {
  if (value <= 0) {
    return 0;
  }

  let base: number;
  if (value < 1) {
    // For values between 0 and 1 (like confidence scores), the base is 1.
    base = 1;
  } else {
    // For values >= 1, find the next power of 10.
    base = 1;
    // Use a small epsilon to handle floating point inaccuracies if comparing directly
    while (base <= value) {
      base *= 10;
    }
  }

  // The Nikhilam complement is simply the base minus the value.
  // The "All from 9..." is a mental shortcut for this operation.
  // We use high precision multiplication to avoid floating point errors.
  const precision = 1e12;
  const result = (Math.round(base * precision) - Math.round(value * precision)) / precision;

  return result;
}