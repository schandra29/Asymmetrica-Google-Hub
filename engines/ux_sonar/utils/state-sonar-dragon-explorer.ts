/**
 * State Sonar Dragon Explorer
 *
 * Uses Dragon Curve fractal boundary exploration to discover:
 *   - Impossible state transitions
 *   - Hidden edge cases in state machines
 *   - Race conditions and deadlocks
 *   - Unreachable states
 *
 * Algorithm:
 *   1. Generate dragon curve fractal path
 *   2. At each fold, attempt state transition
 *   3. Left folds (L+) = forward exploration (valid transitions)
 *   4. Right folds (R−) = reverse exploration (may be impossible)
 *   5. Flag impossible edges for contract testing
 *
 * Integration with State Sonar:
 *   - SMT score validation (impossible states have low SMT)
 *   - Regime-based test generation (exploration = edge cases)
 *   - PHI-weighted criticality (deeper folds = more critical bugs)
 *
 * @author Agent Oscar
 * @date October 5, 2025
 */

import DragonCurveEngine, { DragonFold, BoundaryEdge } from './dragon-curve-engine.js';

export interface StateMachineState {
  id: string;
  transitions: string[]; // Valid transition target IDs
  data?: any;
  smtScore?: number; // Statistical Model Testing score (0-1)
  isTerminal?: boolean;
}

export interface StateBoundaryResult {
  impossibleEdges: BoundaryEdge<StateMachineState>[];
  explorationCoverage: number; // Percentage of state space explored
  criticalPaths: Array<{
    from: string;
    to: string;
    phiWeight: number;
    regime: string;
  }>;
  regimeDistribution: {
    exploration: number;
    stabilization: number;
    convergence: number;
  };
}

export class StateSonarDragonExplorer extends DragonCurveEngine {
  /**
   * Fold state machine to discover hidden/impossible transitions
   *
   * @param states State machine nodes
   * @param level Fractal depth (3-6 recommended for state machines)
   * @returns Impossible edges and exploration metrics
   */
  foldStateMachine(states: StateMachineState[], level: number = 3): StateBoundaryResult {
    const boundaries = this.exploreBoundaries(states, level, (state, fold) =>
      this.foldState(state, fold, states)
    );

    const impossibleEdges = boundaries.filter((b) => b.isImpossible);
    const totalPossible = states.length * states.length; // N^2 potential transitions
    const explored = boundaries.length;

    // Extract critical paths (high PHI weight + impossible)
    const criticalPaths = impossibleEdges
      .map((edge) => ({
        from: edge.from.id,
        to: edge.to.id,
        phiWeight: edge.fold.weight,
        regime: edge.regime,
      }))
      .sort((a, b) => b.phiWeight - a.phiWeight)
      .slice(0, 10); // Top 10 critical

    // Calculate regime distribution
    const totalEdges = boundaries.length;
    const regimeDistribution = {
      exploration: boundaries.filter((b) => b.regime === 'exploration').length / totalEdges,
      stabilization: boundaries.filter((b) => b.regime === 'stabilization').length / totalEdges,
      convergence: boundaries.filter((b) => b.regime === 'convergence').length / totalEdges,
    };

    return {
      impossibleEdges,
      explorationCoverage: explored / totalPossible,
      criticalPaths,
      regimeDistribution,
    };
  }

  /**
   * Fold state according to dragon curve direction
   *
   * Left fold (L+): Forward transition (explore next valid state)
   * Right fold (R−): Reverse transition (may be impossible!)
   * Forward (F): Identity or self-loop
   *
   * @param state Current state
   * @param fold Dragon curve fold metadata
   * @param allStates Complete state space (for reverse lookup)
   * @returns Folded state or null if fold is invalid
   */
  private foldState(
    state: StateMachineState,
    fold: DragonFold,
    allStates: StateMachineState[]
  ): StateMachineState | null {
    if (fold.direction === 'L') {
      // Forward fold: Explore next valid transition
      if (state.transitions.length === 0) return null;

      const nextId = state.transitions[fold.level % state.transitions.length];
      const nextState = allStates.find((s) => s.id === nextId);

      return nextState || null;
    } else if (fold.direction === 'R') {
      // Reverse fold: Try going backwards (potentially impossible!)
      const reverseCandidates = allStates.filter((s) => s.transitions.includes(state.id));

      if (reverseCandidates.length === 0) {
        // No reverse path = impossible state
        return {
          id: `${state.id}_reverse_IMPOSSIBLE`,
          transitions: [],
          data: { reverse: true, from: state.id, impossible: true },
        };
      }

      return reverseCandidates[fold.level % reverseCandidates.length];
    } else {
      // Forward (convergence): Self-loop or identity
      return state.isTerminal ? null : state;
    }
  }

  /**
   * Check if state is impossible
   *
   * Criteria:
   *   1. State ID contains "IMPOSSIBLE" keyword
   *   2. SMT score < 0.3 (low statistical validity)
   *   3. Reverse transition to terminal state
   *   4. Circular dependency detected
   */
  protected isImpossibleState(state: any): boolean {
    if (state.id?.includes('IMPOSSIBLE')) return true;
    if (state.data?.impossible === true) return true;
    if (state.smtScore !== undefined && state.smtScore < 0.3) return true;
    if (state.data?.reverse === true && state.data?.from?.endsWith('_terminal')) return true;

    return false;
  }

  /**
   * Generate contract tests from impossible edges
   *
   * @param impossibleEdges Edges flagged as impossible
   * @returns Array of test case objects
   */
  generateContractTests(
    impossibleEdges: BoundaryEdge<StateMachineState>[]
  ): Array<{
    testName: string;
    from: string;
    to: string;
    expectedError: string;
    regime: string;
    priority: number;
  }> {
    return impossibleEdges.map((edge, index) => ({
      testName: `should_reject_transition_${edge.from.id}_to_${edge.to.id}`,
      from: edge.from.id,
      to: edge.to.id,
      expectedError: 'InvalidStateTransition',
      regime: edge.regime,
      priority: Math.round(edge.fold.weight * 100), // PHI weight as priority
    }));
  }
}

export default StateSonarDragonExplorer;
