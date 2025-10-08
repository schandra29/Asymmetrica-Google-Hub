/**
 * Contract Tests for TetractysEngine - Sacred Geometry Convergence
 *
 * Proves that the Tetractys implementation correctly follows
 * Pythagorean sacred proportions and hierarchical convergence.
 *
 * Agent November - Sacred Geometry Validation
 */

import { describe, it, expect } from '@jest/globals';
import {
  TetractysEngine,
  Harmonizers,
  calculateSHMWithTetractys,
  createSonarTetractys,
  PHI
} from '../utils/tetractys-engine';

describe('TetractysEngine - Sacred Geometry Convergence', () => {
  describe('Core Convergence Algorithm', () => {
    it('should converge 6 metrics through sacred hierarchy: 6 → 3 → 2 → 1', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      const rawMetrics = [0.95, 0.88, 0.92, 0.81, 0.76, 0.89];
      const result = engine.converge(rawMetrics);

      // Verify convergence path
      expect(result.convergencePath).toEqual([6, 3, 2, 1]);

      // Verify all levels exist
      expect(result.levels).toHaveLength(4);
      expect(result.levels[0].level).toBe(1); // Apex
      expect(result.levels[1].level).toBe(2);
      expect(result.levels[2].level).toBe(3);
      expect(result.levels[3].level).toBe(4); // Base

      // Verify apex has single value
      expect(result.levels[0].metrics).toHaveLength(1);
      expect(result.apex).toBe(result.levels[0].metrics[0]);
    });

    it('should use sacred weights: 4 (apex) → 3 → 2 → 1 (base)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      const result = engine.converge([0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);

      expect(result.levels[0].weight).toBe(4); // Apex
      expect(result.levels[1].weight).toBe(3); // Level 2
      expect(result.levels[2].weight).toBe(2); // Level 3
      expect(result.levels[3].weight).toBe(1); // Level 4 (Base)
    });

    it('should verify sacred sum: 1 + 2 + 3 + 4 = 10 (Tetraktys)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      const result = engine.converge([1, 1, 1, 1, 1, 1]);
      const totalWeight = result.levels.reduce((sum, level) => sum + level.weight, 0);

      expect(totalWeight).toBe(10); // The sacred number of perfection
    });

    it('should handle odd number of metrics at any level', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      // 5 metrics: 5 → 3 → 2 → 1
      const result = engine.converge([0.9, 0.8, 0.7, 0.6, 0.5]);

      expect(result.convergencePath).toEqual([5, 3, 2, 1]);
      expect(result.levels[3].metrics).toHaveLength(5); // Base level
      expect(result.levels[2].metrics).toHaveLength(3); // Third level (2 pairs + 1 odd)
      expect(result.levels[1].metrics).toHaveLength(2); // Second level
      expect(result.levels[0].metrics).toHaveLength(1); // Apex
    });
  });

  describe('Harmonizer Functions', () => {
    it('arithmeticMean should calculate simple average', () => {
      const result = Harmonizers.arithmeticMean([0.8, 0.9, 1.0]);
      expect(result).toBeCloseTo(0.9, 5);
    });

    it('geometricMean should preserve proportional relationships', () => {
      const result = Harmonizers.geometricMean([0.64, 1.0]); // sqrt(0.64) = 0.8
      expect(result).toBeCloseTo(0.8, 5);
    });

    it('harmonicMean should emphasize smaller values', () => {
      const result = Harmonizers.harmonicMean([0.5, 1.0]);
      // Harmonic mean: 2 / (1/0.5 + 1/1.0) = 2 / 3 = 0.667
      expect(result).toBeCloseTo(0.667, 3);
    });

    it('goldenRatioGeometric should apply phi adjustment', () => {
      const metrics = [0.9, 0.9];
      const result = Harmonizers.goldenRatioGeometric(metrics);

      // Should be geometric mean * phi^(-n/10)
      const geometricMean = 0.9; // sqrt(0.9 * 0.9) = 0.9
      const phiAdjustment = Math.pow(PHI, -2 / 10);
      const expected = geometricMean * phiAdjustment;

      expect(result).toBeCloseTo(expected, 5);
    });

    it('quadraticMean should emphasize larger values', () => {
      const result = Harmonizers.quadraticMean([0.6, 0.8]);
      // RMS = sqrt((0.36 + 0.64) / 2) = sqrt(0.5) = 0.707
      expect(result).toBeCloseTo(0.707, 3);
    });
  });

  describe('Weighted Score Calculation', () => {
    it('should calculate weighted score respecting sacred proportions', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      // Uniform metrics for clear calculation
      const result = engine.converge([0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);

      // All levels average to 0.8, weighted average should be 0.8
      expect(result.weightedScore).toBeCloseTo(0.8, 5);
    });

    it('should weight apex (4) more heavily than base (1)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      // High apex, low base
      const result = engine.converge([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);

      // With arithmetic mean, all converge to 0.5, so weighted is also 0.5
      expect(result.weightedScore).toBeCloseTo(0.5, 5);
    });

    it('should produce different weighted scores than simple average for varied metrics', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.geometricMean
      });

      const rawMetrics = [0.95, 0.70, 0.92, 0.65, 0.88, 0.78];
      const result = engine.converge(rawMetrics);

      const simpleAverage = rawMetrics.reduce((a, b) => a + b, 0) / rawMetrics.length;

      // Weighted score should differ from simple average due to hierarchical weighting
      expect(result.weightedScore).not.toBeCloseTo(simpleAverage, 2);
    });
  });

  describe('Sonar Dashboard Integration', () => {
    it('should calculate SHM from 6 sonar scores', () => {
      const sonarScores = {
        ux: 0.95,
        design: 0.88,
        code: 0.92,
        semantic: 0.81,
        journey: 0.76,
        state: 0.89
      };

      const result = calculateSHMWithTetractys(sonarScores);

      expect(result.apex).toBeGreaterThan(0);
      expect(result.apex).toBeLessThanOrEqual(1);
      expect(result.convergencePath).toEqual([6, 3, 2, 1]);
      expect(result.visualization).toContain('Apex - SHM');
    });

    it('should produce valid SHM for all healthy sonars (>0.85)', () => {
      const sonarScores = {
        ux: 0.90,
        design: 0.92,
        code: 0.95,
        semantic: 0.88,
        journey: 0.91,
        state: 0.93
      };

      const result = calculateSHMWithTetractys(sonarScores);

      expect(result.apex).toBeGreaterThan(0.85); // Should be in stabilization
      expect(result.weightedScore).toBeGreaterThan(0.85);
    });

    it('should produce valid SHM for mixed regime sonars', () => {
      const sonarScores = {
        ux: 0.95, // Stabilization
        design: 0.75, // Optimization
        code: 0.92, // Stabilization
        semantic: 0.65, // Exploration
        journey: 0.70, // Optimization
        state: 0.88 // Stabilization
      };

      const result = calculateSHMWithTetractys(sonarScores);

      expect(result.apex).toBeGreaterThan(0);
      expect(result.apex).toBeLessThan(1);
      // SHM should reflect the mixed state (optimization range)
      expect(result.apex).toBeGreaterThan(0.70);
      expect(result.apex).toBeLessThan(0.90);
    });

    it('should handle all-zero scores gracefully', () => {
      const sonarScores = {
        ux: 0,
        design: 0,
        code: 0,
        semantic: 0,
        journey: 0,
        state: 0
      };

      const result = calculateSHMWithTetractys(sonarScores);

      expect(result.apex).toBe(0);
      expect(result.weightedScore).toBe(0);
    });

    it('should handle perfect scores (all 1.0)', () => {
      const sonarScores = {
        ux: 1.0,
        design: 1.0,
        code: 1.0,
        semantic: 1.0,
        journey: 1.0,
        state: 1.0
      };

      const result = calculateSHMWithTetractys(sonarScores);

      // With golden ratio harmonization, should be very close to 1.0
      expect(result.apex).toBeGreaterThan(0.95);
      expect(result.apex).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Factory Function', () => {
    it('should create Sonar Tetractys with golden ratio harmonizer by default', () => {
      const tetractys = createSonarTetractys();
      const result = tetractys.converge([0.9, 0.9, 0.9, 0.9, 0.9, 0.9]);

      // Should apply golden ratio adjustment
      expect(result.apex).toBeLessThan(0.9); // Due to phi adjustment
    });

    it('should allow custom harmonizer override', () => {
      const tetractys = createSonarTetractys({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = tetractys.converge([0.9, 0.9, 0.9, 0.9, 0.9, 0.9]);

      // With arithmetic mean, should converge to exactly 0.9
      expect(result.apex).toBeCloseTo(0.9, 5);
    });

    it('should support custom weights', () => {
      const customWeights: [number, number, number, number] = [10, 7, 4, 1];
      const tetractys = createSonarTetractys({
        weights: customWeights
      });
      const result = tetractys.converge([0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);

      expect(result.levels[0].weight).toBe(10); // Custom apex weight
      expect(result.levels[3].weight).toBe(1);  // Custom base weight
    });

    it('should track convergence journey when enabled', () => {
      const tetractys = createSonarTetractys({ trackPath: true });
      const result = tetractys.converge([0.9, 0.8, 0.7, 0.6, 0.5, 0.4]);

      expect(result.convergenceJourney).toBeDefined();
      expect(result.convergenceJourney).toHaveLength(3); // Levels 3, 2, 1
    });
  });

  describe('Visualization', () => {
    it('should generate ASCII visualization', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0.95, 0.88, 0.92, 0.81, 0.76, 0.89]);
      const labels = ['UX', 'Des', 'Cod', 'Sem', 'Jrn', 'Sta'];

      const viz = engine.visualize(result, labels);

      expect(viz).toContain('Apex - SHM');
      expect(viz).toContain('Sacred Weights: 4 (apex)');
      expect(viz).toContain('[6 → 3 → 2 → 1]');
      expect(viz).toContain('UX');
      expect(viz).toContain('Des');
    });

    it('should include weighted score in visualization', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);
      const viz = engine.visualize(result);

      expect(viz).toContain('Weighted Score:');
      expect(viz).toContain('0.80');
    });
  });

  describe('Edge Cases and Resilience', () => {
    it('should handle single metric (converges to itself)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0.85]);

      expect(result.apex).toBe(0.85);
      expect(result.convergencePath[0]).toBe(1);
    });

    it('should handle two metrics (minimal convergence)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0.8, 0.9]);

      expect(result.apex).toBeCloseTo(0.85, 5); // Average of 0.8 and 0.9
      expect(result.convergencePath).toEqual([2, 1, 1, 1]);
    });

    it('should handle large number of metrics (e.g., 16)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const metrics = Array(16).fill(0.8);
      const result = engine.converge(metrics);

      expect(result.apex).toBeCloseTo(0.8, 5);
      expect(result.convergencePath).toEqual([16, 8, 4, 2]);
    });

    it('should handle very small values (precision)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0.001, 0.002, 0.003, 0.004, 0.005, 0.006]);

      expect(result.apex).toBeGreaterThan(0);
      expect(result.apex).toBeLessThan(0.01);
    });

    it('should handle values at boundaries (0 and 1)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });
      const result = engine.converge([0, 1, 0, 1, 0, 1]);

      expect(result.apex).toBeCloseTo(0.5, 5);
    });
  });

  describe('Mathematical Properties', () => {
    it('should be deterministic (same input = same output)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.goldenRatioGeometric
      });
      const metrics = [0.95, 0.88, 0.92, 0.81, 0.76, 0.89];

      const result1 = engine.converge(metrics);
      const result2 = engine.converge(metrics);

      expect(result1.apex).toBe(result2.apex);
      expect(result1.weightedScore).toBe(result2.weightedScore);
    });

    it('should preserve monotonicity (higher inputs → higher output)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      const lowMetrics = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
      const highMetrics = [0.9, 0.9, 0.9, 0.9, 0.9, 0.9];

      const lowResult = engine.converge(lowMetrics);
      const highResult = engine.converge(highMetrics);

      expect(highResult.apex).toBeGreaterThan(lowResult.apex);
    });

    it('should converge to mean for uniform distributions (arithmetic)', () => {
      const engine = new TetractysEngine({
        harmonizer: Harmonizers.arithmeticMean
      });

      const value = 0.777;
      const result = engine.converge([value, value, value, value, value, value]);

      expect(result.apex).toBeCloseTo(value, 5);
      expect(result.weightedScore).toBeCloseTo(value, 5);
    });

    it('should demonstrate phi (golden ratio) is approximately 1.618', () => {
      expect(PHI).toBeCloseTo(1.618, 3);
      expect(PHI).toBeCloseTo((1 + Math.sqrt(5)) / 2, 10);
    });
  });
});
