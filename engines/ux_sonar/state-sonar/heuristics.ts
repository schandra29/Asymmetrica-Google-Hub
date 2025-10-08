/**
 * State Sonar Heuristics Engine
 * Implements GPT-5's Top 5 State Machine Quality Heuristics
 */

import { StateTelemetry, StateMachineDefinition, RaceCondition, StateTransition } from '../state-radar-engine';

interface StateHeuristic {
  name: string;
  condition: (data: any) => boolean;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
}

interface HeuristicResult {
  heuristic: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
  affectedElements?: string[];
}

export class StateHeuristicsEngine {

  /**
   * Analyze state telemetry against all 5 heuristics
   */
  analyze(telemetry: StateTelemetry): HeuristicResult[] {
    const issues: HeuristicResult[] = [];

    // 1. Impossible State Observed
    const impossibleStateIssues = this.checkImpossibleStates(telemetry);
    if (impossibleStateIssues) issues.push(impossibleStateIssues);

    // 2. Missing Transition (user intent events have no handler)
    const missingTransitionIssues = this.checkMissingTransitions(telemetry);
    if (missingTransitionIssues) issues.push(missingTransitionIssues);

    // 3. Race Condition (concurrent mutations)
    const raceConditionIssues = this.checkRaceConditions(telemetry);
    if (raceConditionIssues) issues.push(raceConditionIssues);

    // 4. Prop Drilling Smell (critical state props pass >3 levels)
    const propDrillingIssues = this.checkPropDrilling(telemetry);
    if (propDrillingIssues) issues.push(propDrillingIssues);

    // 5. Reducer Side Effects (mutations or async inside reducers)
    const sideEffectIssues = this.checkReducerSideEffects(telemetry);
    if (sideEffectIssues) issues.push(sideEffectIssues);

    return issues;
  }

  /**
   * Heuristic 1: Impossible State Observed
   * State violates model/XState definition
   */
  private checkImpossibleStates(telemetry: StateTelemetry): HeuristicResult | null {
    const impossibleStates = telemetry.impossibleStates || [];

    if (impossibleStates.length === 0) return null;

    return {
      heuristic: 'impossible-state',
      severity: 'critical',
      message: `Found ${impossibleStates.length} impossible state(s) that violate state machine definitions.`,
      suggestion: 'Review state machine definitions and ensure all observed states are explicitly defined. Use XState visualizer to verify state graph.',
      affectedElements: impossibleStates.slice(0, 5)
    };
  }

  /**
   * Heuristic 2: Missing Transition
   * User intent events have no handler in current state
   */
  private checkMissingTransitions(telemetry: StateTelemetry): HeuristicResult | null {
    const missingTransitions: string[] = [];

    telemetry.stateMachines.forEach(machine => {
      // Find coverage check transitions (added by checkTransitionCoverage)
      const coverageChecks = machine.transitions.filter(t =>
        t.from === 'coverage-check' || t.event.includes('States without transitions')
      );

      coverageChecks.forEach(check => {
        missingTransitions.push(`${machine.name}: ${check.event}`);
      });

      // Check for states with no outgoing transitions (excluding terminal states)
      const statesWithoutOutgoing = machine.states.filter(state => {
        const hasOutgoing = machine.transitions.some(t => t.from === state);
        // Assume states ending with 'success', 'error', 'complete', 'done' are terminal
        const isTerminal = /success|error|complete|done|final/i.test(state);
        return !hasOutgoing && !isTerminal;
      });

      if (statesWithoutOutgoing.length > 0) {
        missingTransitions.push(
          `${machine.name}: States without transitions: ${statesWithoutOutgoing.join(', ')}`
        );
      }
    });

    if (missingTransitions.length === 0) return null;

    return {
      heuristic: 'missing-transition',
      severity: 'warning',
      message: `Found ${missingTransitions.length} state(s) with missing transitions or event handlers.`,
      suggestion: 'Add event handlers for all user intents in each state. Use XState\'s "on" property to define transitions, or use wildcard handlers for unhandled events.',
      affectedElements: missingTransitions
    };
  }

  /**
   * Heuristic 3: Race Condition
   * Two pending transitions mutate same state slice concurrently
   */
  private checkRaceConditions(telemetry: StateTelemetry): HeuristicResult | null {
    const raceConditions = telemetry.raceConditions || [];

    if (raceConditions.length === 0) return null;

    const affectedStates = raceConditions.map(rc =>
      `${rc.affectedSlice}: ${rc.conflictingTransitions.length} concurrent transitions`
    );

    return {
      heuristic: 'race-condition',
      severity: 'critical',
      message: `Detected ${raceConditions.length} potential race condition(s) with concurrent state mutations.`,
      suggestion: 'Use XState\'s transient transitions or guard conditions to prevent concurrent mutations. Consider using a queue for async operations. Implement proper state machine hierarchy to manage parallel states safely.',
      affectedElements: affectedStates.slice(0, 5)
    };
  }

  /**
   * Heuristic 4: Prop Drilling Smell
   * Critical state props passed >3 levels deep
   */
  private checkPropDrilling(telemetry: StateTelemetry): HeuristicResult | null {
    const propDrillingPaths = telemetry.propDrillingPaths || [];
    const deepPaths = propDrillingPaths.filter(p => p.depth > 3);

    if (deepPaths.length === 0) return null;

    const affectedProps = deepPaths.map(p =>
      `${p.prop} (depth: ${p.depth}, path: ${p.path.slice(-3).join(' > ')})`
    );

    return {
      heuristic: 'prop-drilling-smell',
      severity: 'warning',
      message: `Found ${deepPaths.length} prop(s) being passed more than 3 levels deep.`,
      suggestion: 'Extract state to React Context, Redux store, or XState actor. Use composition over prop drilling. Consider using a state management library for deeply shared state.',
      affectedElements: affectedProps.slice(0, 5)
    };
  }

  /**
   * Heuristic 5: Reducer Side Effects
   * Mutations or async operations inside reducers
   */
  private checkReducerSideEffects(telemetry: StateTelemetry): HeuristicResult | null {
    // This is difficult to detect at runtime without code analysis
    // We'll check for patterns that suggest side effects

    const sideEffectPatterns: string[] = [];

    // Check for state machines with suspiciously long transitions (might indicate async)
    telemetry.stateMachines.forEach(machine => {
      const transitions = machine.transitions;

      // Group transitions by event to find patterns
      const transitionsByEvent = new Map<string, StateTransition[]>();
      transitions.forEach(t => {
        if (!transitionsByEvent.has(t.event)) {
          transitionsByEvent.set(t.event, []);
        }
        transitionsByEvent.get(t.event)!.push(t);
      });

      // Check for events that look like side effects (fetch, api, async, etc.)
      transitionsByEvent.forEach((transitions, event) => {
        if (/fetch|api|async|request|submit|save/i.test(event)) {
          sideEffectPatterns.push(
            `${machine.name}: Event "${event}" might contain async operations (should use effects/services)`
          );
        }
      });

      // Check for reducer type machines with many state updates
      if (machine.type === 'reducer' && transitions.length > 20) {
        sideEffectPatterns.push(
          `${machine.name}: Reducer has ${transitions.length} transitions (high complexity, might contain side effects)`
        );
      }
    });

    if (sideEffectPatterns.length === 0) return null;

    return {
      heuristic: 'reducer-side-effects',
      severity: 'warning',
      message: `Found ${sideEffectPatterns.length} pattern(s) suggesting potential side effects in reducers.`,
      suggestion: 'Move async operations to effects/services (XState), middleware (Redux), or separate action handlers. Reducers should be pure functions. Use XState\'s invoke/spawn for async operations.',
      affectedElements: sideEffectPatterns.slice(0, 5)
    };
  }

  /**
   * Generate code fix example for a specific heuristic
   */
  generateCodeExample(heuristic: string, data?: any): string {
    const examples: { [key: string]: string } = {
      'impossible-state': `/* Instead of allowing impossible states: */
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState(null);
// ❌ Possible: isLoading=true, data=value, error=value (impossible!)

/* Use XState to make impossible states impossible: */
import { createMachine } from 'xstate';

const machine = createMachine({
  id: 'fetch',
  initial: 'idle',
  states: {
    idle: { on: { FETCH: 'loading' } },
    loading: {
      on: {
        SUCCESS: 'success',
        ERROR: 'error'
      }
    },
    success: { /* data available */ },
    error: { /* error available */ }
  }
});
// ✅ Only valid states possible!`,

      'missing-transition': `/* Instead of ignoring events: */
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: { START: 'active' }
      // ❌ Missing CANCEL handler
    },
    active: {
      on: { STOP: 'idle' }
    }
  }
});

/* Handle all events or use wildcard: */
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        START: 'active',
        CANCEL: 'idle' // ✅ Explicit handler
      }
    },
    active: {
      on: {
        STOP: 'idle',
        '*': { actions: 'logUnhandledEvent' } // ✅ Wildcard
      }
    }
  }
});`,

      'race-condition': `/* Instead of uncontrolled concurrent updates: */
function handleClick() {
  setState({ loading: true });
  fetch('/api/data').then(data => {
    setState({ data, loading: false });
  });
  // ❌ Multiple setState calls, race conditions possible
}

/* Use XState to manage async safely: */
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: { target: 'success', actions: 'setData' },
        onError: { target: 'error', actions: 'setError' }
      }
      // ✅ Prevents concurrent fetches, clear state transitions
    },
    success: {},
    error: {}
  }
});`,

      'prop-drilling-smell': `/* Instead of prop drilling: */
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} />;
}
function Layout({ user }) {
  return <Sidebar user={user} />;
}
function Sidebar({ user }) {
  return <Menu user={user} />;
}
function Menu({ user }) {
  return <UserProfile user={user} />; // ❌ 4 levels deep!
}

/* Use Context or state management: */
const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={user}>
      <Layout /> {/* ✅ No prop drilling */}
    </UserContext.Provider>
  );
}

function UserProfile() {
  const user = useContext(UserContext); // ✅ Direct access
  return <div>{user.name}</div>;
}`,

      'reducer-side-effects': `/* Instead of side effects in reducer: */
function reducer(state, action) {
  switch (action.type) {
    case 'SUBMIT':
      fetch('/api/submit', { ... }); // ❌ Async in reducer!
      return { ...state, submitting: true };
    default:
      return state;
  }
}

/* Use XState services/effects: */
const machine = createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: { SUBMIT: 'submitting' }
    },
    submitting: {
      invoke: {
        src: 'submitData', // ✅ Side effect in service
        onDone: 'success',
        onError: 'error'
      }
    },
    success: {},
    error: {}
  }
}, {
  services: {
    submitData: async (context, event) => {
      return await fetch('/api/submit', { ... });
    }
  }
});`
    };

    return examples[heuristic] || '// No code example available';
  }

  /**
   * Generate praise for clean state architecture
   */
  generatePraise(telemetry: StateTelemetry): string[] {
    const praise: string[] = [];

    if (telemetry.impossibleStates.length === 0) {
      praise.push('✅ Zero impossible states detected! State machine is well-defined.');
    }

    if (telemetry.raceConditions.length === 0) {
      praise.push('✅ No race conditions found! State transitions are properly managed.');
    }

    const propDrillingCount = telemetry.propDrillingPaths.filter(p => p.depth > 3).length;
    if (propDrillingCount === 0) {
      praise.push('✅ Clean state architecture! No excessive prop drilling detected.');
    }

    // Check transition coverage
    let allStatesCovered = true;
    telemetry.stateMachines.forEach(machine => {
      const statesWithTransitions = new Set(machine.transitions.map(t => t.from));
      machine.states.forEach(state => {
        const isTerminal = /success|error|complete|done|final/i.test(state);
        if (!statesWithTransitions.has(state) && !isTerminal) {
          allStatesCovered = false;
        }
      });
    });

    if (allStatesCovered && telemetry.stateMachines.length > 0) {
      praise.push('✅ 100% transition coverage! All states have proper event handlers.');
    }

    return praise;
  }
}
