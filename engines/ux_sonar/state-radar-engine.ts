/**
 * StateRadarEngine - State Machine Telemetry Collector
 * Captures state machines, transitions, and detects impossible states, race conditions
 * Based on Grok's State Sonar specifications
 */

import { Page } from '@playwright/test';

export interface StateTransition {
  from: string;
  to: string;
  event: string;
  timestamp: number;
}

export interface StateMachineDefinition {
  name: string;
  states: string[];
  transitions: StateTransition[];
  initialState: string;
  currentState: string;
  type: 'xstate' | 'reducer' | 'useState' | 'unknown';
}

export interface StateHookUsage {
  type: 'useState' | 'useReducer' | 'useMachine';
  initialState: any;
  stateCount: number;
  location: string;
}

export interface PropDrillingPath {
  prop: string;
  depth: number;
  path: string[];
}

export interface RaceCondition {
  states: string[];
  conflictingTransitions: StateTransition[];
  affectedSlice: string;
  timestamp: number;
}

export interface StateTelemetry {
  stateMachines: StateMachineDefinition[];
  stateHooks: StateHookUsage[];
  impossibleStates: string[];
  raceConditions: RaceCondition[];
  propDrillingPaths: PropDrillingPath[];
  totalStates: number;
  totalTransitions: number;
  parallelStates: number;
}

export interface StateRadarResult {
  route: string;
  duration: number;
  telemetry: StateTelemetry;
  timestamp: number;
}

export class StateRadarEngine {
  private telemetry: StateTelemetry = {
    stateMachines: [],
    stateHooks: [],
    impossibleStates: [],
    raceConditions: [],
    propDrillingPaths: [],
    totalStates: 0,
    totalTransitions: 0,
    parallelStates: 0
  };
  private startTime: number = 0;

  constructor(private page: Page) {}

  async initialize() {
    // Inject state machine inspection utilities
    await this.page.addInitScript(() => {
      (window as any).__stateTelemetry = {
        stateMachines: [],
        transitions: [],
        stateSnapshots: [],
        impossibleStates: []
      };

      // Track XState machines if available
      if (typeof window !== 'undefined') {
        const originalCreateMachine = (window as any).createMachine;
        if (originalCreateMachine) {
          (window as any).createMachine = function(...args: any[]) {
            const machine = originalCreateMachine.apply(this, args);
            (window as any).__stateTelemetry.stateMachines.push({
              id: machine.id || 'unnamed',
              states: Object.keys(machine.states || {}),
              type: 'xstate'
            });
            return machine;
          };
        }
      }

      // Intercept console errors that might indicate state issues
      const originalError = console.error;
      console.error = (...args) => {
        const errorMsg = args.join(' ');
        if (errorMsg.includes('state') || errorMsg.includes('transition')) {
          (window as any).__stateTelemetry.impossibleStates.push({
            error: errorMsg,
            timestamp: Date.now()
          });
        }
        originalError.apply(console, args);
      };

      // Track state transitions via custom events
      (window as any).__trackTransition = (from: string, to: string, event: string) => {
        (window as any).__stateTelemetry.transitions.push({
          from,
          to,
          event,
          timestamp: Date.now()
        });
      };
    });
  }

  async pingFlow(route: string): Promise<StateRadarResult> {
    this.startTime = Date.now();
    this.telemetry = {
      stateMachines: [],
      stateHooks: [],
      impossibleStates: [],
      raceConditions: [],
      propDrillingPaths: [],
      totalStates: 0,
      totalTransitions: 0,
      parallelStates: 0
    };

    await this.page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1500);

    // Collect state machine telemetry
    await this.detectStateMachines();
    await this.analyzeTransitions();
    await this.findImpossibleStates();
    await this.detectRaceConditions();
    await this.checkTransitionCoverage();
    await this.detectPropDrilling();

    const duration = Date.now() - this.startTime;

    return {
      route,
      duration,
      telemetry: this.telemetry,
      timestamp: Date.now()
    };
  }

  /**
   * Detect state machines in the application
   * Looks for XState machines, Redux stores, MobX stores, and useState/useReducer hooks
   */
  async detectStateMachines() {
    const machineData = await this.page.evaluate(() => {
      const telemetry = (window as any).__stateTelemetry || {};
      const stateMachines: any[] = telemetry.stateMachines || [];

      // Detect React state hooks by scanning React Fiber tree
      const reactHooks: any[] = [];

      // Try to detect React DevTools global hook
      if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

        // Count components with state
        if (hook.renderers && hook.renderers.size > 0) {
          hook.renderers.forEach((renderer: any) => {
            if (renderer.getCurrentFiber) {
              try {
                const fiber = renderer.getCurrentFiber();
                // This is a simplified detection - real implementation would traverse fiber tree
                reactHooks.push({
                  type: 'react-hook',
                  detected: true
                });
              } catch (e) {
                // Fiber traversal failed
              }
            }
          });
        }
      }

      // Detect Redux store
      let reduxStore = null;
      if ((window as any).__REDUX_DEVTOOLS_EXTENSION__) {
        reduxStore = {
          type: 'redux',
          hasStore: true
        };
      }

      // Detect MobX stores
      let mobxStore = null;
      if ((window as any).__mobxInstanceCount) {
        mobxStore = {
          type: 'mobx',
          instanceCount: (window as any).__mobxInstanceCount
        };
      }

      return {
        xstateMachines: stateMachines,
        reactHooks,
        reduxStore,
        mobxStore
      };
    });

    // Process detected state machines
    machineData.xstateMachines.forEach((machine: any) => {
      this.telemetry.stateMachines.push({
        name: machine.id,
        states: machine.states,
        transitions: [],
        initialState: machine.initialState || machine.states[0] || 'unknown',
        currentState: machine.currentState || machine.initialState || 'unknown',
        type: 'xstate'
      });
      this.telemetry.totalStates += machine.states.length;
    });

    if (machineData.reduxStore) {
      this.telemetry.stateMachines.push({
        name: 'Redux Store',
        states: ['global'],
        transitions: [],
        initialState: 'global',
        currentState: 'global',
        type: 'reducer'
      });
      this.telemetry.totalStates += 1;
    }

    // Track React hooks usage
    if (machineData.reactHooks.length > 0) {
      this.telemetry.stateHooks.push({
        type: 'useState',
        initialState: {},
        stateCount: machineData.reactHooks.length,
        location: 'React components'
      });
    }
  }

  /**
   * Analyze state transitions
   */
  async analyzeTransitions() {
    const transitionData = await this.page.evaluate(() => {
      const telemetry = (window as any).__stateTelemetry || {};
      return telemetry.transitions || [];
    });

    transitionData.forEach((transition: any) => {
      // Find the state machine this transition belongs to
      const machine = this.telemetry.stateMachines.find(m =>
        m.states.includes(transition.from) || m.states.includes(transition.to)
      );

      if (machine) {
        machine.transitions.push({
          from: transition.from,
          to: transition.to,
          event: transition.event,
          timestamp: transition.timestamp
        });
        this.telemetry.totalTransitions++;
      }
    });
  }

  /**
   * Find impossible states (states observed but not in the definition)
   */
  async findImpossibleStates() {
    const impossibleStateData = await this.page.evaluate(() => {
      const telemetry = (window as any).__stateTelemetry || {};
      const impossibleStates: string[] = [];

      // Check for state-related errors in console
      const stateErrors = telemetry.impossibleStates || [];

      stateErrors.forEach((error: any) => {
        if (error.error) {
          impossibleStates.push(error.error);
        }
      });

      // Detect impossible states by checking current state against defined states
      const stateMachines = telemetry.stateMachines || [];
      const transitions = telemetry.transitions || [];

      transitions.forEach((transition: any) => {
        const machine = stateMachines.find((m: any) =>
          m.states && m.states.includes(transition.from)
        );

        if (machine && transition.to && !machine.states.includes(transition.to)) {
          impossibleStates.push(`State "${transition.to}" not in machine definition`);
        }
      });

      return impossibleStates;
    });

    this.telemetry.impossibleStates = impossibleStateData;
  }

  /**
   * Detect race conditions (concurrent transitions mutating same state)
   */
  async detectRaceConditions() {
    const raceConditions: RaceCondition[] = [];

    // Group transitions by time window (within 100ms)
    const timeWindow = 100;
    const transitionGroups: Map<number, StateTransition[]> = new Map();

    this.telemetry.stateMachines.forEach(machine => {
      machine.transitions.forEach(transition => {
        const timeKey = Math.floor(transition.timestamp / timeWindow);
        if (!transitionGroups.has(timeKey)) {
          transitionGroups.set(timeKey, []);
        }
        transitionGroups.get(timeKey)!.push(transition);
      });
    });

    // Check each time window for concurrent transitions
    transitionGroups.forEach((transitions, _timeKey) => {
      if (transitions.length > 1) {
        // Check if any transitions affect the same state
        const stateMap = new Map<string, StateTransition[]>();

        transitions.forEach(t => {
          if (!stateMap.has(t.from)) {
            stateMap.set(t.from, []);
          }
          stateMap.get(t.from)!.push(t);
        });

        stateMap.forEach((transitionsFromSameState, state) => {
          if (transitionsFromSameState.length > 1) {
            raceConditions.push({
              states: [state],
              conflictingTransitions: transitionsFromSameState,
              affectedSlice: state,
              timestamp: transitionsFromSameState[0].timestamp
            });
          }
        });
      }
    });

    this.telemetry.raceConditions = raceConditions;
  }

  /**
   * Check transition coverage (missing event handlers)
   */
  async checkTransitionCoverage() {
    // For each state machine, check if all states have transitions
    this.telemetry.stateMachines.forEach(machine => {
      const statesWithTransitions = new Set<string>();

      machine.transitions.forEach(t => {
        statesWithTransitions.add(t.from);
      });

      // Find states without outgoing transitions (might be terminal or missing handlers)
      const statesWithoutTransitions = machine.states.filter(
        state => !statesWithTransitions.has(state)
      );

      // If a state has no outgoing transitions and it's not explicitly marked as terminal,
      // it might be missing event handlers
      if (statesWithoutTransitions.length > 0) {
        // Store this information for the heuristics engine
        machine.transitions.push({
          from: 'coverage-check',
          to: 'missing-transitions',
          event: `States without transitions: ${statesWithoutTransitions.join(', ')}`,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Detect prop drilling (state passed >3 levels deep)
   */
  async detectPropDrilling() {
    const propDrillingData = await this.page.evaluate(() => {
      const propPaths: any[] = [];

      // This is a simplified detection - real implementation would analyze React component tree
      // For now, we'll detect deeply nested elements which might indicate prop drilling

      function traverseElements(element: Element, path: string[] = [], depth: number = 0) {
        if (depth > 5) return; // Limit traversal depth

        // Check for state-related props (data attributes, aria attributes)
        const stateProps = Array.from(element.attributes)
          .filter(attr =>
            attr.name.startsWith('data-state') ||
            attr.name.startsWith('aria-') ||
            attr.name.includes('state')
          )
          .map(attr => attr.name);

        if (stateProps.length > 0 && depth > 3) {
          stateProps.forEach(prop => {
            propPaths.push({
              prop,
              depth,
              path: [...path, element.tagName.toLowerCase()]
            });
          });
        }

        // Traverse children
        Array.from(element.children).forEach(child => {
          traverseElements(child, [...path, element.tagName.toLowerCase()], depth + 1);
        });
      }

      const root = document.body;
      if (root) {
        traverseElements(root);
      }

      return propPaths;
    });

    this.telemetry.propDrillingPaths = propDrillingData;
  }

  async cleanup() {
    this.telemetry = {
      stateMachines: [],
      stateHooks: [],
      impossibleStates: [],
      raceConditions: [],
      propDrillingPaths: [],
      totalStates: 0,
      totalTransitions: 0,
      parallelStates: 0
    };
  }
}
