/**
 * Asymmetrica Deep-Sensing Studio - Three-Regime Types
 *
 * Classification system based on Asymmetrica Protocol ordinal hierarchy.
 * Enables intelligent sharding, routing, and optimization across the system.
 *
 * @module shared/types/regime
 */

/**
 * Three-Regime classification enum
 *
 * @remarks
 * Based on Asymmetrica Protocol ordinal hierarchy with empirically validated leverage:
 * - Support (α₀): 32.1x leverage - Maximum efficiency, high-confidence data
 * - Exploration (α₁): 26.8x leverage - High creativity, novel or low-confidence data
 * - Balance (α₂): 11.5x leverage - Integration and equilibrium between the two
 *
 * Maps directly to Prisma schema Regime enum.
 */
export enum Regime {
  /** Maximum efficiency regime - high-confidence, well-understood data */
  Support = 'Support',
  /** High creativity regime - novel, low-confidence, exploratory data */
  Exploration = 'Exploration',
  /** Balance regime - integration and equilibrium between Support and Exploration */
  Balance = 'Balance',
}

/**
 * Regime classification result
 *
 * @remarks
 * Used by the Protective Guardian service to classify documents.
 */
export interface RegimeClassification {
  /** The classified regime */
  regime: Regime;
  /** Confidence score for the classification (0-1) */
  confidence: number;
  /** Reasoning or metadata about the classification */
  reasoning?: string;
}

/**
 * Three-Regime distribution statistics
 *
 * @remarks
 * Used for monitoring and optimization of system behavior.
 * Tracks how data is distributed across the three regimes.
 */
export interface ThreeRegimeDistribution {
  /** Count of documents in Support regime */
  support_count: number;
  /** Count of documents in Exploration regime */
  exploration_count: number;
  /** Count of documents in Balance regime */
  balance_count: number;
  /** Total document count */
  total_count: number;
  /** Percentage in Support regime (0-100) */
  support_percentage: number;
  /** Percentage in Exploration regime (0-100) */
  exploration_percentage: number;
  /** Percentage in Balance regime (0-100) */
  balance_percentage: number;
}

/**
 * Regime-based test distribution for QA Fortress
 *
 * @remarks
 * Based on DefenseKit Three-Regime Test Planner:
 * - Exploration: 30% of tests (weight 0.70) - edge cases, new features
 * - Optimization: 20% of tests (weight 0.85) - performance, refactoring
 * - Stabilization: 50% of tests (weight 1.00) - critical paths, regression
 */
export interface RegimeTestDistribution {
  exploration: number; // 0.30
  optimization: number; // 0.20
  stabilization: number; // 0.50
}

/**
 * Test regime weights for confidence scoring
 */
export interface RegimeTestWeights {
  exploration: number; // 0.70
  optimization: number; // 0.85
  stabilization: number; // 1.00
}

/**
 * Three-Regime Test Planner constants
 *
 * @remarks
 * Empirically validated distribution for test quality assurance.
 */
export const THREE_REGIME_TEST_CONFIG = {
  distribution: {
    exploration: 0.30,
    optimization: 0.20,
    stabilization: 0.50,
  } as RegimeTestDistribution,
  weights: {
    exploration: 0.70,
    optimization: 0.85,
    stabilization: 1.00,
  } as RegimeTestWeights,
};

/**
 * Regime performance multipliers
 *
 * @remarks
 * Empirically validated leverage factors from Asymmetrica Protocol.
 */
export const REGIME_LEVERAGE = {
  [Regime.Support]: 32.1,
  [Regime.Exploration]: 26.8,
  [Regime.Balance]: 11.5,
} as const;
