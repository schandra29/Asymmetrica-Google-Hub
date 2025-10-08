/**
 * State Sonar Normalizer
 * Computes State Manageability Threshold (SMT) and determines regime
 * Based on Grok's formula: SMT = log₂(states × transitions) / explosionFactor
 * where explosionFactor = n! / n for n parallel states
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { StateTelemetry } from '../state-radar-engine';

interface NormalizedStateTelemetry {
  id: string;
  timestamp: number;
  route: string;
  telemetry: StateTelemetry;
  metrics: {
    smt: number;
    explosionFactor: number;
    totalStates: number;
    totalTransitions: number;
    parallelStates: number;
    transitionCoverage: number;
    impossibleStateCount: number;
    raceConditionCount: number;
  };
  asymmetrica: {
    regime: 'exploration' | 'optimization' | 'stabilization';
    complexity: string;
  };
}

export class StateNormalizer {

  normalize(rawTelemetry: any, route: string = '/'): NormalizedStateTelemetry {
    const telemetry = rawTelemetry.telemetry as StateTelemetry;

    const totalStates = this.computeTotalStates(telemetry);
    const totalTransitions = this.computeTotalTransitions(telemetry);
    const parallelStates = this.computeParallelStates(telemetry);
    const explosionFactor = this.computeExplosionFactor(parallelStates);
    const smt = this.computeSMT(totalStates, totalTransitions, explosionFactor);
    const transitionCoverage = this.computeTransitionCoverage(telemetry);

    const regime = this.determineRegime(smt, explosionFactor, totalTransitions, totalStates);

    return {
      id: `state-telemetry-${Date.now()}`,
      timestamp: Date.now(),
      route,
      telemetry,
      metrics: {
        smt,
        explosionFactor,
        totalStates,
        totalTransitions,
        parallelStates,
        transitionCoverage,
        impossibleStateCount: telemetry.impossibleStates.length,
        raceConditionCount: telemetry.raceConditions.length
      },
      asymmetrica: {
        regime,
        complexity: this.assessComplexity(telemetry, smt)
      }
    };
  }

  /**
   * Compute State Manageability Threshold (SMT)
   * Grok's formula: SMT = log₂(states × transitions) / explosionFactor
   */
  private computeSMT(states: number, transitions: number, explosionFactor: number): number {
    if (states === 0 || transitions === 0) return 0;

    const product = states * transitions;
    const logProduct = Math.log2(product);

    // Avoid division by zero
    if (explosionFactor === 0) {
      return logProduct;
    }

    const smt = logProduct / explosionFactor;

    return Math.round(smt * 100) / 100;
  }

  /**
   * Compute explosion factor for parallel states
   * explosionFactor = n! / n for n parallel states
   */
  private computeExplosionFactor(parallelStates: number): number {
    if (parallelStates <= 1) return 1;

    // Calculate factorial
    const factorial = (n: number): number => {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    };

    const nFactorial = factorial(parallelStates);
    const explosionFactor = nFactorial / parallelStates;

    return explosionFactor;
  }

  /**
   * Compute total number of states across all state machines
   */
  private computeTotalStates(telemetry: StateTelemetry): number {
    return telemetry.totalStates || telemetry.stateMachines.reduce(
      (sum, machine) => sum + machine.states.length,
      0
    );
  }

  /**
   * Compute total number of transitions across all state machines
   */
  private computeTotalTransitions(telemetry: StateTelemetry): number {
    return telemetry.totalTransitions || telemetry.stateMachines.reduce(
      (sum, machine) => sum + machine.transitions.length,
      0
    );
  }

  /**
   * Estimate number of parallel states
   * For now, we'll use a heuristic: count state machines as parallel if they exist simultaneously
   */
  private computeParallelStates(telemetry: StateTelemetry): number {
    // Simple heuristic: number of active state machines
    const activeMachines = telemetry.stateMachines.length;

    // If multiple state machines exist, they're likely parallel
    // Also check for explicit parallel states in state machine definitions
    let parallelCount = activeMachines > 1 ? activeMachines : 1;

    // Check for state machines with parallel regions (XState feature)
    telemetry.stateMachines.forEach(machine => {
      // Look for state names that suggest parallel regions
      const parallelStates = machine.states.filter(state =>
        /parallel|concurrent|fork/i.test(state)
      );
      if (parallelStates.length > 0) {
        parallelCount += parallelStates.length;
      }
    });

    return parallelCount;
  }

  /**
   * Compute transition coverage (percentage of states with transitions)
   */
  private computeTransitionCoverage(telemetry: StateTelemetry): number {
    if (telemetry.stateMachines.length === 0) return 100;

    let totalStates = 0;
    let coveredStates = 0;

    telemetry.stateMachines.forEach(machine => {
      totalStates += machine.states.length;

      const statesWithTransitions = new Set(machine.transitions.map(t => t.from));
      const terminalStates = machine.states.filter(state =>
        /success|error|complete|done|final/i.test(state)
      );

      // Count states with transitions + terminal states as covered
      coveredStates += statesWithTransitions.size;
      terminalStates.forEach(state => {
        if (!statesWithTransitions.has(state)) {
          coveredStates++; // Terminal states don't need outgoing transitions
        }
      });
    });

    return totalStates > 0 ? Math.round((coveredStates / totalStates) * 100) : 100;
  }

  /**
   * Determine regime based on SMT and other factors
   * Grok's guidance:
   * - Exploration: SMT > 8 OR explosionFactor > 2^n
   * - Optimization: transitions > 20/state
   * - Stabilization: otherwise
   */
  private determineRegime(
    smt: number,
    explosionFactor: number,
    totalTransitions: number,
    totalStates: number
  ): 'exploration' | 'optimization' | 'stabilization' {
    // Check for exploration regime
    if (smt > 8) {
      return 'exploration';
    }

    // Check explosion factor threshold (2^n where n is number of parallel states)
    // For simplicity, we'll use explosionFactor > 4 as threshold
    if (explosionFactor > 4) {
      return 'exploration';
    }

    // Check for optimization regime (high transition density)
    const transitionsPerState = totalStates > 0 ? totalTransitions / totalStates : 0;
    if (transitionsPerState > 20) {
      return 'optimization';
    }

    // Default to stabilization for well-managed state
    return 'stabilization';
  }

  /**
   * Assess complexity based on SMT and state machine structure
   */
  private assessComplexity(telemetry: StateTelemetry, smt: number): string {
    const stateCount = this.computeTotalStates(telemetry);
    const machineCount = telemetry.stateMachines.length;

    // High complexity: SMT > 10 or many states
    if (smt > 10 || stateCount > 50) {
      return 'O(2^n) - State Explosion';
    }

    // Medium complexity: Multiple machines or moderate states
    if (machineCount > 3 || stateCount > 20) {
      return 'O(n²) - Complex State Graph';
    }

    // Moderate complexity: Decent number of states
    if (stateCount > 10) {
      return 'O(n log n) - Moderate Complexity';
    }

    // Low complexity: Simple state machine
    return 'O(n) - Simple State Machine';
  }

  /**
   * Save baseline for future comparisons
   */
  saveBaseline(normalized: NormalizedStateTelemetry, route: string) {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');

    try {
      mkdirSync(baselineDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `state_${filename}.json`);

    writeFileSync(filepath, JSON.stringify(normalized, null, 2));
    console.log(`[State Normalizer] Baseline saved: ${filepath}`);
  }

  /**
   * Load baseline for comparison
   */
  loadBaseline(route: string): NormalizedStateTelemetry | null {
    const baselineDir = join(process.cwd(), 'tests/ux-sonar/baselines');
    const filename = route.replace(/\//g, '_') || 'root';
    const filepath = join(baselineDir, `state_${filename}.json`);

    try {
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));
      console.log(`[State Normalizer] Baseline loaded: ${filepath}`);
      return data;
    } catch (e) {
      console.log(`[State Normalizer] No baseline found for ${route}`);
      return null;
    }
  }

  /**
   * Compare baselines
   */
  compareBaselines(current: NormalizedStateTelemetry, baseline: NormalizedStateTelemetry) {
    return {
      smtDelta: current.metrics.smt - baseline.metrics.smt,
      explosionFactorDelta: current.metrics.explosionFactor - baseline.metrics.explosionFactor,
      statesDelta: current.metrics.totalStates - baseline.metrics.totalStates,
      transitionsDelta: current.metrics.totalTransitions - baseline.metrics.totalTransitions,
      coverageDelta: current.metrics.transitionCoverage - baseline.metrics.transitionCoverage,
      impossibleStatesDelta: current.metrics.impossibleStateCount - baseline.metrics.impossibleStateCount,
      raceConditionsDelta: current.metrics.raceConditionCount - baseline.metrics.raceConditionCount,
      regimeChange: current.asymmetrica.regime !== baseline.asymmetrica.regime
    };
  }

  /**
   * Calculate state explosion risk
   * Returns percentage (0-100) indicating risk level
   */
  calculateExplosionRisk(telemetry: StateTelemetry): number {
    const smt = this.computeSMT(
      this.computeTotalStates(telemetry),
      this.computeTotalTransitions(telemetry),
      this.computeExplosionFactor(this.computeParallelStates(telemetry))
    );

    // SMT > 10 is unmanageable (Grok's guidance)
    // Risk scales from 0 (SMT=0) to 100 (SMT=10+)
    const risk = Math.min(100, (smt / 10) * 100);

    return Math.round(risk);
  }
}
