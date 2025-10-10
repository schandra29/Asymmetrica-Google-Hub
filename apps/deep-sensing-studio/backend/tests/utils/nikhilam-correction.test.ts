import { nikhilamCorrection } from '../../src/utils/nikhilam-correction';

describe('Vedic Math: nikhilamCorrection', () => {
  // Test case based on "All from 9, last from 10" for integers
  it('should find the complement of an integer from the next highest power of 10', () => {
    // Base 100
    expect(nikhilamCorrection(87)).toBe(13);
    expect(nikhilamCorrection(99)).toBe(1);
    // Base 1000
    expect(nikhilamCorrection(985)).toBe(15);
    expect(nikhilamCorrection(101)).toBe(899); // Base is 1000
    // Base 10
    expect(nikhilamCorrection(3)).toBe(7);
  });

  // Test case for floating point numbers, especially confidence scores < 1
  it('should find the complement of a float from the base of 1.0', () => {
    expect(nikhilamCorrection(0.15)).toBeCloseTo(0.85);
    expect(nikhilamCorrection(0.99)).toBeCloseTo(0.01);
    expect(nikhilamCorrection(0.5)).toBeCloseTo(0.5);
  });

  it('should return 0 for an input of 0', () => {
    expect(nikhilamCorrection(0)).toBe(0);
  });

  it('should return 0 for a negative input', () => {
    expect(nikhilamCorrection(-50)).toBe(0);
  });

  it('should handle numbers that are exact powers of 10', () => {
    // Base is 100, complement from 1000 is 900
    expect(nikhilamCorrection(100)).toBe(900);
    // Base is 10, complement from 100 is 90
    expect(nikhilamCorrection(10)).toBe(90);
     // Base is 1, complement from 10 is 9
    expect(nikhilamCorrection(1)).toBe(9);
  });

  it('should handle large numbers', () => {
    expect(nikhilamCorrection(999999)).toBe(1); // Base 1,000,000
  });

  it('should handle floating point numbers greater than 1', () => {
    // Base is 100
    expect(nikhilamCorrection(15.5)).toBeCloseTo(84.5);
  });
});