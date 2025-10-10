import { dharmaIndex } from '../../src/utils/dharma-index';

describe('Vedic Math: dharmaIndex', () => {
  it('should return 1.0 for a perfectly stable system (identical values)', () => {
    const values = [5, 5, 5, 5];
    // Variance is 0, so 1 / (1 + 0) = 1
    expect(dharmaIndex(values)).toBe(1.0);
  });

  it('should return a value close to 1.0 for a system with very low variance', () => {
    const values = [10, 10.01, 9.99, 10.005];
    expect(dharmaIndex(values)).toBeGreaterThan(0.99);
  });

  it('should return a value close to 0.0 for a chaotic system with high variance', () => {
    const values = [1, 100, 50, 200];
    // High variance, so 1 / (1 + big number) should be small
    expect(dharmaIndex(values)).toBeLessThan(0.1);
  });

  it('should return 1.0 for an empty array (considered perfectly stable)', () => {
    expect(dharmaIndex([])).toBe(1.0);
  });

  it('should return 1.0 for a null input', () => {
    expect(dharmaIndex(null as any)).toBe(1.0);
  });

  it('should return 1.0 for a single-element array (perfectly stable)', () => {
    expect(dharmaIndex([123])).toBe(1.0);
  });

  it('should handle negative numbers correctly', () => {
    const values = [-10, -10.01, -9.99];
    // Same low variance as positive numbers
    expect(dharmaIndex(values)).toBeGreaterThan(0.99);
  });

  it('should calculate dharma for a moderately variant system', () => {
    const values = [1, 2, 3, 4, 5];
    // Mean = 3. Variance = (4+1+0+1+4)/5 = 2. Dharma = 1/3.
    expect(dharmaIndex(values)).toBeCloseTo(1 / 3);
  });
});