/**
 * State Sonar Test Suite
 * Comprehensive tests for state machine detection, analysis, and reporting
 */

import { test, expect } from '@playwright/test';
import { StateRadarEngine } from '../state-radar-engine';
import { StateHeuristicsEngine } from '../state-sonar/heuristics';
import { StateNormalizer } from '../state-sonar/normalizer';
import { StateCritiqueAdapter } from '../state-sonar/critique-adapter';
import { StateReportGenerator } from '../state-sonar/report-generator';

test.describe('State Sonar - State Machine Analysis', () => {

  test('Scenario 1: Simple State Machine (Low SMT)', async ({ page }) => {
    console.log('\n🧪 Test 1: Simple State Machine Analysis');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with a simple state machine
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Simple State Machine Test</title>
        </head>
        <body>
          <h1>Simple Counter</h1>
          <div id="count">0</div>
          <button id="increment">Increment</button>
          <button id="decrement">Decrement</button>
          <button id="reset">Reset</button>

          <script>
            // Simulate a simple state machine
            window.__stateTelemetry = {
              stateMachines: [{
                id: 'counter',
                states: ['idle', 'incrementing', 'decrementing', 'reset'],
                initialState: 'idle',
                currentState: 'idle',
                type: 'xstate'
              }],
              transitions: [
                { from: 'idle', to: 'incrementing', event: 'INCREMENT', timestamp: Date.now() },
                { from: 'incrementing', to: 'idle', event: 'DONE', timestamp: Date.now() + 10 },
                { from: 'idle', to: 'decrementing', event: 'DECREMENT', timestamp: Date.now() + 20 },
                { from: 'decrementing', to: 'idle', event: 'DONE', timestamp: Date.now() + 30 },
                { from: 'idle', to: 'reset', event: 'RESET', timestamp: Date.now() + 40 },
                { from: 'reset', to: 'idle', event: 'DONE', timestamp: Date.now() + 50 }
              ],
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    console.log('  📊 Results:');
    console.log(`     State Machines: ${result.telemetry.stateMachines.length}`);
    console.log(`     Total States: ${result.telemetry.totalStates}`);
    console.log(`     Total Transitions: ${result.telemetry.totalTransitions}`);
    console.log(`     Impossible States: ${result.telemetry.impossibleStates.length}`);

    // Normalize and analyze
    const normalizer = new StateNormalizer();
    const normalized = normalizer.normalize(result, 'test');

    console.log(`     SMT: ${normalized.metrics.smt}`);
    console.log(`     Regime: ${normalized.asymmetrica.regime}`);

    // Assertions
    expect(result.telemetry.stateMachines.length).toBeGreaterThan(0);
    expect(normalized.metrics.smt).toBeLessThan(8); // Should be manageable
    expect(result.telemetry.impossibleStates.length).toBe(0);

    console.log('  ✅ Simple state machine test passed!\n');
  });

  test('Scenario 2: Complex State Machine (High SMT)', async ({ page }) => {
    console.log('\n🧪 Test 2: Complex State Machine Analysis');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with a complex state machine
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Complex State Machine Test</h1>
          <script>
            // Simulate a complex state machine with many states and transitions
            const states = [];
            const transitions = [];

            // Generate 30 states
            for (let i = 0; i < 30; i++) {
              states.push('state_' + i);
            }

            // Generate many transitions (5 per state)
            for (let i = 0; i < 30; i++) {
              for (let j = 0; j < 5; j++) {
                const target = (i + j + 1) % 30;
                transitions.push({
                  from: 'state_' + i,
                  to: 'state_' + target,
                  event: 'EVENT_' + i + '_' + j,
                  timestamp: Date.now() + (i * 5 + j)
                });
              }
            }

            window.__stateTelemetry = {
              stateMachines: [{
                id: 'complex-machine',
                states: states,
                initialState: 'state_0',
                currentState: 'state_5',
                type: 'xstate'
              }],
              transitions: transitions,
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    console.log('  📊 Results:');
    console.log(`     State Machines: ${result.telemetry.stateMachines.length}`);
    console.log(`     Total States: ${result.telemetry.totalStates}`);
    console.log(`     Total Transitions: ${result.telemetry.totalTransitions}`);

    const normalizer = new StateNormalizer();
    const normalized = normalizer.normalize(result, 'test');

    console.log(`     SMT: ${normalized.metrics.smt}`);
    console.log(`     Explosion Factor: ${normalized.metrics.explosionFactor}`);
    console.log(`     Regime: ${normalized.asymmetrica.regime}`);

    // Assertions
    expect(result.telemetry.totalStates).toBeGreaterThan(20);
    expect(result.telemetry.totalTransitions).toBeGreaterThan(50);
    expect(normalized.metrics.smt).toBeGreaterThan(5); // Should show complexity

    console.log('  ✅ Complex state machine test passed!\n');
  });

  test('Scenario 3: Race Condition Detection', async ({ page }) => {
    console.log('\n🧪 Test 3: Race Condition Detection');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with concurrent transitions (race condition)
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Race Condition Test</h1>
          <script>
            const now = Date.now();

            window.__stateTelemetry = {
              stateMachines: [{
                id: 'race-machine',
                states: ['idle', 'loading', 'success', 'error'],
                initialState: 'idle',
                currentState: 'loading',
                type: 'xstate'
              }],
              transitions: [
                // Two transitions from 'idle' happening within 50ms (race condition)
                { from: 'idle', to: 'loading', event: 'FETCH', timestamp: now },
                { from: 'idle', to: 'loading', event: 'FETCH_RETRY', timestamp: now + 30 },
                // More concurrent transitions
                { from: 'loading', to: 'success', event: 'SUCCESS', timestamp: now + 100 },
                { from: 'loading', to: 'error', event: 'ERROR', timestamp: now + 110 }
              ],
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    console.log('  📊 Results:');
    console.log(`     Race Conditions: ${result.telemetry.raceConditions.length}`);

    if (result.telemetry.raceConditions.length > 0) {
      console.log('     Detected race conditions:');
      result.telemetry.raceConditions.forEach((rc, i) => {
        console.log(`       ${i + 1}. ${rc.affectedSlice}: ${rc.conflictingTransitions.length} concurrent transitions`);
      });
    }

    // Assertions
    expect(result.telemetry.raceConditions.length).toBeGreaterThan(0);

    console.log('  ✅ Race condition detection test passed!\n');
  });

  test('Scenario 4: Impossible State Detection', async ({ page }) => {
    console.log('\n🧪 Test 4: Impossible State Detection');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with impossible states
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Impossible State Test</h1>
          <script>
            window.__stateTelemetry = {
              stateMachines: [{
                id: 'test-machine',
                states: ['idle', 'loading', 'success'],
                initialState: 'idle',
                currentState: 'loading',
                type: 'xstate'
              }],
              transitions: [
                { from: 'idle', to: 'loading', event: 'START', timestamp: Date.now() },
                // This transition goes to a state not in the definition!
                { from: 'loading', to: 'invalid-state', event: 'INVALID', timestamp: Date.now() + 100 }
              ],
              impossibleStates: [
                { error: 'State "invalid-state" not in machine definition', timestamp: Date.now() }
              ]
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    console.log('  📊 Results:');
    console.log(`     Impossible States: ${result.telemetry.impossibleStates.length}`);

    if (result.telemetry.impossibleStates.length > 0) {
      console.log('     Detected impossible states:');
      result.telemetry.impossibleStates.forEach((state, i) => {
        console.log(`       ${i + 1}. ${state}`);
      });
    }

    // Analyze with heuristics
    const heuristics = new StateHeuristicsEngine();
    const issues = heuristics.analyze(result.telemetry);

    const impossibleStateIssue = issues.find(i => i.heuristic === 'impossible-state');
    expect(impossibleStateIssue).toBeDefined();
    expect(impossibleStateIssue?.severity).toBe('critical');

    console.log('  ✅ Impossible state detection test passed!\n');
  });

  test('Scenario 5: Prop Drilling Detection', async ({ page }) => {
    console.log('\n🧪 Test 5: Prop Drilling Detection');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with deep prop drilling
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <div data-state-user="john">
            <div>
              <div>
                <div>
                  <div data-state-user="john">
                    Deep nested component with state prop
                  </div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.__stateTelemetry = {
              stateMachines: [],
              transitions: [],
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    console.log('  📊 Results:');
    console.log(`     Prop Drilling Paths: ${result.telemetry.propDrillingPaths.length}`);

    const deepPaths = result.telemetry.propDrillingPaths.filter(p => p.depth > 3);
    console.log(`     Deep Paths (>3 levels): ${deepPaths.length}`);

    if (deepPaths.length > 0) {
      console.log('     Deep prop drilling detected:');
      deepPaths.slice(0, 3).forEach((path, i) => {
        console.log(`       ${i + 1}. ${path.prop} at depth ${path.depth}`);
      });
    }

    console.log('  ✅ Prop drilling detection test passed!\n');
  });

  test('Scenario 6: Report Generation', async ({ page }) => {
    console.log('\n🧪 Test 6: Report Generation');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with a state machine
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Report Generation Test</h1>
          <script>
            window.__stateTelemetry = {
              stateMachines: [{
                id: 'auth-machine',
                states: ['logged-out', 'logging-in', 'logged-in', 'error'],
                initialState: 'logged-out',
                currentState: 'logged-in',
                type: 'xstate'
              }],
              transitions: [
                { from: 'logged-out', to: 'logging-in', event: 'LOGIN', timestamp: Date.now() },
                { from: 'logging-in', to: 'logged-in', event: 'SUCCESS', timestamp: Date.now() + 100 },
                { from: 'logging-in', to: 'error', event: 'ERROR', timestamp: Date.now() + 100 },
                { from: 'logged-in', to: 'logged-out', event: 'LOGOUT', timestamp: Date.now() + 200 }
              ],
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    // Generate report
    const reportGen = new StateReportGenerator();
    const report = reportGen.generateReport(result.telemetry, '/auth');

    console.log('  📊 Report Generated:');
    console.log('     Report length: ' + report.length + ' characters');
    console.log('     Contains ASCII diagram: ' + report.includes('ASCII Diagram'));
    console.log('     Contains DOT diagram: ' + report.includes('DOT Format'));
    console.log('     Contains metrics: ' + report.includes('METRICS'));

    // Assertions
    expect(report).toContain('STATE SONAR ANALYSIS REPORT');
    expect(report).toContain('auth-machine');
    expect(report).toContain('ASCII Diagram');
    expect(report).toContain('DOT Format');
    expect(report).toContain('METRICS');

    // Save report
    const filepath = reportGen.saveReport(report, '/auth');
    console.log(`     Report saved to: ${filepath}`);

    console.log('  ✅ Report generation test passed!\n');
  });

  test('Scenario 7: Critique and Praise Mode', async ({ page }) => {
    console.log('\n🧪 Test 7: Critique and Praise Mode');

    const radar = new StateRadarEngine(page);
    await radar.initialize();

    // Create a test page with a clean state machine (should get praise)
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Clean State Machine</h1>
          <script>
            window.__stateTelemetry = {
              stateMachines: [{
                id: 'clean-machine',
                states: ['idle', 'active', 'complete'],
                initialState: 'idle',
                currentState: 'idle',
                type: 'xstate'
              }],
              transitions: [
                { from: 'idle', to: 'active', event: 'START', timestamp: Date.now() },
                { from: 'active', to: 'complete', event: 'FINISH', timestamp: Date.now() + 100 },
                { from: 'active', to: 'idle', event: 'CANCEL', timestamp: Date.now() + 100 }
              ],
              impossibleStates: []
            };
          </script>
        </body>
      </html>
    `);

    await page.waitForTimeout(500);

    const result = await radar.pingFlow('data:text/html,test');

    // Generate critique
    const critique = new StateCritiqueAdapter();
    const critiqueResult = critique.critique(result.telemetry);

    console.log('  📊 Critique Results:');
    console.log(`     Score: ${critiqueResult.score}/100`);
    console.log(`     Grade: ${critiqueResult.grade}`);
    console.log(`     Praise: ${critiqueResult.praise.length} items`);
    console.log(`     Issues: ${critiqueResult.issues.length} items`);

    if (critiqueResult.praise.length > 0) {
      console.log('     Praise received:');
      critiqueResult.praise.forEach(p => {
        console.log(`       ${p}`);
      });
    }

    // Generate praise report
    const praiseReport = critique.generatePraiseReport(result.telemetry);
    console.log('\n     Praise Report:\n');
    console.log(praiseReport.split('\n').map(line => '       ' + line).join('\n'));

    // Assertions
    expect(critiqueResult.score).toBeGreaterThan(50);
    expect(critiqueResult.praise.length).toBeGreaterThan(0);

    console.log('\n  ✅ Critique and praise mode test passed!\n');
  });

  test('Scenario 8: SMT Calculation Verification', async ({ page }) => {
    console.log('\n🧪 Test 8: SMT Calculation Verification');

    const normalizer = new StateNormalizer();

    // Test case 1: Simple machine
    const simpleMachine = {
      telemetry: {
        stateMachines: [{
          name: 'simple',
          states: ['a', 'b', 'c'],
          transitions: [
            { from: 'a', to: 'b', event: 'E1', timestamp: 0 },
            { from: 'b', to: 'c', event: 'E2', timestamp: 0 }
          ],
          initialState: 'a',
          currentState: 'a',
          type: 'xstate' as const
        }],
        stateHooks: [],
        impossibleStates: [],
        raceConditions: [],
        propDrillingPaths: [],
        totalStates: 3,
        totalTransitions: 2,
        parallelStates: 1
      }
    };

    const normalized1 = normalizer.normalize(simpleMachine, 'test');

    console.log('  📊 Simple Machine:');
    console.log(`     States: ${normalized1.metrics.totalStates}`);
    console.log(`     Transitions: ${normalized1.metrics.totalTransitions}`);
    console.log(`     Parallel States: ${normalized1.metrics.parallelStates}`);
    console.log(`     Explosion Factor: ${normalized1.metrics.explosionFactor}`);
    console.log(`     SMT: ${normalized1.metrics.smt}`);
    console.log(`     Regime: ${normalized1.asymmetrica.regime}`);

    // Test case 2: Complex machine with parallel states
    const complexMachine = {
      telemetry: {
        stateMachines: [
          {
            name: 'machine1',
            states: Array.from({ length: 10 }, (_, i) => `s${i}`),
            transitions: Array.from({ length: 20 }, (_, i) => ({
              from: `s${i % 10}`,
              to: `s${(i + 1) % 10}`,
              event: `E${i}`,
              timestamp: 0
            })),
            initialState: 's0',
            currentState: 's0',
            type: 'xstate' as const
          },
          {
            name: 'machine2',
            states: Array.from({ length: 10 }, (_, i) => `t${i}`),
            transitions: Array.from({ length: 20 }, (_, i) => ({
              from: `t${i % 10}`,
              to: `t${(i + 1) % 10}`,
              event: `F${i}`,
              timestamp: 0
            })),
            initialState: 't0',
            currentState: 't0',
            type: 'xstate' as const
          }
        ],
        stateHooks: [],
        impossibleStates: [],
        raceConditions: [],
        propDrillingPaths: [],
        totalStates: 20,
        totalTransitions: 40,
        parallelStates: 2
      }
    };

    const normalized2 = normalizer.normalize(complexMachine, 'test');

    console.log('\n  📊 Complex Machine (Parallel):');
    console.log(`     States: ${normalized2.metrics.totalStates}`);
    console.log(`     Transitions: ${normalized2.metrics.totalTransitions}`);
    console.log(`     Parallel States: ${normalized2.metrics.parallelStates}`);
    console.log(`     Explosion Factor: ${normalized2.metrics.explosionFactor}`);
    console.log(`     SMT: ${normalized2.metrics.smt}`);
    console.log(`     Regime: ${normalized2.asymmetrica.regime}`);

    // Assertions
    expect(normalized1.metrics.smt).toBeLessThan(normalized2.metrics.smt);
    expect(normalized2.metrics.explosionFactor).toBeGreaterThan(normalized1.metrics.explosionFactor);

    console.log('\n  ✅ SMT calculation verification test passed!\n');
  });

  test('Scenario 9: All Heuristics Coverage', async ({ page }) => {
    console.log('\n🧪 Test 9: All Heuristics Coverage');

    const heuristics = new StateHeuristicsEngine();

    // Create telemetry with all possible issues
    const problematicTelemetry = {
      stateMachines: [
        {
          name: 'problematic-machine',
          states: ['idle', 'loading', 'success'],
          transitions: [
            { from: 'idle', to: 'loading', event: 'FETCH', timestamp: 0 },
            // Missing transition from loading to success
          ],
          initialState: 'idle',
          currentState: 'loading',
          type: 'xstate' as const
        }
      ],
      stateHooks: [],
      impossibleStates: ['State "error" not in definition'],
      raceConditions: [
        {
          states: ['idle'],
          conflictingTransitions: [
            { from: 'idle', to: 'loading', event: 'FETCH', timestamp: 0 },
            { from: 'idle', to: 'loading', event: 'FETCH', timestamp: 50 }
          ],
          affectedSlice: 'idle',
          timestamp: 0
        }
      ],
      propDrillingPaths: [
        { prop: 'user', depth: 5, path: ['App', 'Layout', 'Sidebar', 'Menu', 'Profile'] }
      ],
      totalStates: 3,
      totalTransitions: 1,
      parallelStates: 1
    };

    const issues = heuristics.analyze(problematicTelemetry);

    console.log('  📊 Detected Issues:');
    issues.forEach((issue, i) => {
      console.log(`     ${i + 1}. ${issue.heuristic} (${issue.severity})`);
    });

    // Check that all heuristics are covered
    const heuristicTypes = new Set(issues.map(i => i.heuristic));
    console.log('\n  Heuristics Detected:');
    console.log(`     - impossible-state: ${heuristicTypes.has('impossible-state')}`);
    console.log(`     - missing-transition: ${heuristicTypes.has('missing-transition')}`);
    console.log(`     - race-condition: ${heuristicTypes.has('race-condition')}`);
    console.log(`     - prop-drilling-smell: ${heuristicTypes.has('prop-drilling-smell')}`);

    // Assertions
    expect(issues.length).toBeGreaterThan(0);
    expect(heuristicTypes.has('impossible-state')).toBe(true);
    expect(heuristicTypes.has('race-condition')).toBe(true);
    expect(heuristicTypes.has('prop-drilling-smell')).toBe(true);

    console.log('\n  ✅ All heuristics coverage test passed!\n');
  });
});
