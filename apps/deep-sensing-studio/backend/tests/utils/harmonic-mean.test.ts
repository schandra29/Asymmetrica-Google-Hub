/**
 * UNIT TESTS - HARMONIC MEAN UTILITY
 *
 * This test suite validates the correctness of the harmonicMean function,
 * a key component of the Vedic statistics toolkit used in the
 * Protective Guardian service for confidence scoring.
 *
 * @file This file contains unit tests for the harmonic mean utility.
 * @author Jules AI (JULES-01)
 * @date 2025-10-10
 */

import { harmonicMean } from '../../src/utils/harmonic-mean';

describe('Utility: harmonicMean', () => {
  // Test Case 13: Standard Calculation
  test('should calculate the harmonic mean correctly for a standard set of values', () => {
    const values = [0.8, 0.9, 1.0, 0.85];
    // The actual, more precise result is closer to 0.8815
    expect(harmonicMean(values)).toBeCloseTo(0.8815, 4);
  });

  // Test Case 14: Sensitivity to Outliers
  test('should be heavily influenced by a low outlier', () => {
    const values = [0.9, 0.95, 1.0, 0.2]; // Contains a significant outlier
    // The actual, more precise result is closer to 0.490
    const result = harmonicMean(values);
    expect(result).toBeLessThan(0.5);
    expect(result).toBeCloseTo(0.490, 3);
  });

  // Test Case 15: Edge Case - Empty Array
  test('should return 0 for an empty array', () => {
    expect(harmonicMean([])).toBe(0);
  });

  // Test Case 16: Edge Case - Contains Zero
  test('should return 0 if any value is zero', () => {
    const values = [0.9, 0.8, 0];
    expect(harmonicMean(values)).toBe(0);
  });
});