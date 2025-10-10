/**
 * Utility for calculating the Nikhilam correction.
 * Part of the Asymmetrica Protocol's Vedic mathematics toolkit.
 *
 * This function implements the "Nikhilam Navatashcaramam Dashatah" sutra, which
 * translates to "All from 9 and the last from 10". It's used to find the
 * complement of a number from the next highest power of 10.
 *
 * @file This file contains the nikhilamCorrection function.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

/**
 * Calculates the Nikhilam complement of a positive number.
 *
 * This method finds the difference between a number and the next highest
 * power of 10. It is used as a fallback or correction mechanism for certain
 * data points, effectively inverting a score. For example, a low score of 0.15
 * is transformed into a high score of 0.85.
 *
 * @param value The positive number for which to find the complement. Must be non-negative.
 * @returns The Nikhilam complement.
 *
 * @example
 * ```typescript
 * // For numbers between 0 and 1, the next power of 10 is 1.
 * nikhilamCorrection(0.15); // returns 0.85 (since 1 - 0.15 = 0.85)
 * nikhilamCorrection(0.8); // returns 0.2
 *
 * // For numbers >= 1.
 * nikhilamCorrection(1);   // returns 9 (since 10 - 1 = 9)
 * nikhilamCorrection(7);   // returns 3 (since 10 - 7 = 3)
 * nikhilamCorrection(88);  // returns 12 (since 100 - 88 = 12)
 * ```
 */
export function nikhilamCorrection(value: number): number {
  if (value < 0) {
    // Nikhilam is not defined for negative numbers in this context.
    return 0;
  }

  let nextPowerOf10 = 1;

  // Find the smallest power of 10 that is strictly greater than the value.
  // For value = 1, we need 10. For value = 10, we need 100.
  while (nextPowerOf10 <= value) {
    nextPowerOf10 *= 10;
  }

  // The result is the difference.
  // To handle potential floating point inaccuracies, we can round the result.
  const result = nextPowerOf10 - value;

  // Round to a reasonable number of decimal places to avoid floating point noise.
  return parseFloat(result.toPrecision(15));
}