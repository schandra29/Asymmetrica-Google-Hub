import { harmonicMean } from '../../src/utils/harmonic-mean';

describe('Vedic Math: harmonicMean', () => {
  it('should calculate the harmonic mean of a set of positive numbers', () => {
    const values = [1, 2, 4];
    // 3 / (1/1 + 1/2 + 1/4) = 3 / (1.75) = 1.7142857...
    expect(harmonicMean(values)).toBeCloseTo(1.7142857);
  });

  it('should be heavily influenced by smaller values (outliers)', () => {
    const values = [0.9, 0.95, 0.85, 0.2];
    // Arithmetic mean would be 0.725
    // Harmonic mean is 4 / (1/0.9 + 1/0.95 + 1/0.85 + 1/0.2) = 4 / (8.34) = 0.479...
    expect(harmonicMean(values)).toBeCloseTo(0.479);
    expect(harmonicMean(values)).toBeLessThan(0.725);
  });

  it('should return 0 for an empty array', () => {
    expect(harmonicMean([])).toBe(0);
  });

  it('should return 0 for a null input', () => {
    expect(harmonicMean(null as any)).toBe(0);
  });

  it('should filter out zero values from the calculation', () => {
    const values = [1, 2, 4, 0];
    // Should be the same as harmonicMean([1, 2, 4])
    expect(harmonicMean(values)).toBeCloseTo(1.7142857);
  });

  it('should return 0 if all values are zero', () => {
    expect(harmonicMean([0, 0, 0])).toBe(0);
  });

  it('should return the value itself for a single-element array', () => {
    expect(harmonicMean([5])).toBe(5);
  });

  it('should use the absolute value for calculations', () => {
    const values = [-1, 2, -4];
    // Should be the same as harmonicMean([1, 2, 4])
     expect(harmonicMean(values)).toBeCloseTo(1.7142857);
  });
});