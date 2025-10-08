/**
 * Standalone Labyrinth Engine Test Runner
 *
 * Runs without Playwright/webserver to validate core functionality
 */

import { LabyrinthEngine, HarmonicDelays, createLabyrinth } from './utils/labyrinth-engine';

// Simple test framework
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertCloseTo(actual: number, expected: number, tolerance: number, message: string) {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${message} - Expected ${expected} ± ${tolerance}, got ${actual} (diff: ${diff})`);
  }
}

async function test(name: string, fn: () => Promise<void>) {
  testsRun++;
  try {
    await fn();
    testsPassed++;
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    testsFailed++;
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${error instanceof Error ? error.message : error}`);
  }
}

// Test Suite
async function runTests() {
  console.log('🌀 Labyrinth Delay Engine - Standalone Test Suite\n');

  await test('Sequential execution without parallelization', async () => {
    interface TestData {
      executionLog: string[];
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
      .addStep({
        name: 'Step 1',
        transform: async (data) => {
          data.executionLog.push('Step 1 started');
          await new Promise(resolve => setTimeout(resolve, 10));
          data.executionLog.push('Step 1 completed');
          return { ...data, value: data.value + 1 };
        }
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => {
          data.executionLog.push('Step 2 started');
          await new Promise(resolve => setTimeout(resolve, 10));
          data.executionLog.push('Step 2 completed');
          return { ...data, value: data.value * 2 };
        }
      });

    const result = await labyrinth.traverse({ executionLog: [], value: 5 });

    assert(result.result.executionLog.length === 4, 'Should have 4 log entries');
    assert(result.result.executionLog[0] === 'Step 1 started', 'First log should be Step 1 started');
    assert(result.result.executionLog[3] === 'Step 2 completed', 'Last log should be Step 2 completed');
    assert(result.result.value === 12, 'Final value should be 12: (5+1)*2');
  });

  await test('Path history tracking', async () => {
    const labyrinth = new LabyrinthEngine<{ count: number }>({ skipDelays: true })
      .addStep({
        name: 'Increment',
        transform: async (data) => ({ ...data, count: data.count + 1 })
      })
      .addStep({
        name: 'Double',
        transform: async (data) => ({ ...data, count: data.count * 2 })
      })
      .addStep({
        name: 'Square',
        transform: async (data) => ({ ...data, count: data.count * data.count })
      });

    const result = await labyrinth.traverse({ count: 2 });

    assert(result.path.length === 3, 'Should have 3 path records');
    assert(result.path[0].step === 'Increment', 'First step should be Increment');
    assert(result.path[0].data.count === 3, 'After increment: 2+1=3');
    assert(result.path[1].data.count === 6, 'After double: 3*2=6');
    assert(result.path[2].data.count === 36, 'After square: 6*6=36');
    assert(result.result.count === 36, 'Final result should be 36');
  });

  await test('Harmonic timing with Tesla frequency', async () => {
    const TESLA_BASE = 1000 / 4.909; // ~203.7ms

    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Step 1',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const startTime = Date.now();
    const result = await labyrinth.traverse({ value: 0 });
    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    // Should have 1 delay (after step 1, but not after step 2)
    assertCloseTo(result.totalHarmonicDelay, TESLA_BASE, 10, 'Total harmonic delay');
    assert(actualDuration >= TESLA_BASE * 0.9, 'Actual duration should be >= harmonic delay');
    assert(result.sacredTiming === true, 'Sacred timing should be true');
  });

  await test('Custom delay overrides', async () => {
    const customDelay = 50;

    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Custom Delay Step',
        delay: customDelay,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Final Step',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 0 });

    assert(result.path[0].harmonicDelay === customDelay, 'Should use custom delay');
    assertCloseTo(result.totalHarmonicDelay, customDelay, 5, 'Total delay should match custom');
  });

  await test('Skip delays configuration', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>({ skipDelays: true })
      .addStep({
        name: 'Step 1',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const startTime = Date.now();
    const result = await labyrinth.traverse({ value: 0 });
    const endTime = Date.now();

    assert(endTime - startTime < 50, 'Should complete quickly with delays skipped');
    assert(result.sacredTiming === false, 'Sacred timing should be false');
    assert(result.totalHarmonicDelay === 0, 'No harmonic delay');
  });

  await test('Error propagation from failed steps', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>({ skipDelays: true })
      .addStep({
        name: 'Good Step',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Failing Step',
        transform: async (data) => {
          throw new Error('Intentional test failure');
        }
      });

    let errorThrown = false;
    try {
      await labyrinth.traverse({ value: 0 });
    } catch (error) {
      errorThrown = true;
      assert(
        error instanceof Error && error.message.includes('Failing Step'),
        'Error should reference failing step'
      );
    }

    assert(errorThrown, 'Should throw error from failing step');
  });

  await test('Empty step list handling', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>();
    const result = await labyrinth.traverse({ value: 42 });

    assert(result.result.value === 42, 'Should return input unchanged');
    assert(result.path.length === 0, 'Path should be empty');
    assert(result.stepCount === 0, 'Step count should be 0');
  });

  await test('HarmonicDelays constants', async () => {
    const TESLA_BASE = 1000 / 4.909;

    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Single',
        delay: HarmonicDelays.SINGLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Double',
        delay: HarmonicDelays.DOUBLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Triple',
        delay: HarmonicDelays.TRIPLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 0 });

    assertCloseTo(result.path[0].harmonicDelay, TESLA_BASE, 5, 'Single harmonic');
    assertCloseTo(result.path[1].harmonicDelay, 2 * TESLA_BASE, 5, 'Double harmonic');
    assertCloseTo(result.path[2].harmonicDelay, 3 * TESLA_BASE, 5, 'Triple harmonic');
  });

  await test('Fluent interface chaining', async () => {
    const result = await new LabyrinthEngine<{ operations: string[] }>({ skipDelays: true })
      .addStep({
        name: 'Op1',
        transform: async (data) => {
          data.operations.push('op1');
          return data;
        }
      })
      .addStep({
        name: 'Op2',
        transform: async (data) => {
          data.operations.push('op2');
          return data;
        }
      })
      .traverse({ operations: [] });

    assert(result.result.operations.length === 2, 'Should have 2 operations');
    assert(result.result.operations[0] === 'op1', 'First operation should be op1');
  });

  await test('Convenience factory function', async () => {
    const labyrinth = createLabyrinth<{ value: number }>({ skipDelays: true })
      .addStep({
        name: 'Test',
        transform: async (data) => ({ ...data, value: data.value + 5 })
      });

    const result = await labyrinth.traverse({ value: 10 });
    assert(result.result.value === 15, 'Should use factory correctly');
  });

  await test('Journey time estimation', async () => {
    const TESLA_BASE = 1000 / 4.909;

    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({ name: 'S1', transform: async (d) => d })
      .addStep({ name: 'S2', delay: HarmonicDelays.DOUBLE, transform: async (d) => d })
      .addStep({ name: 'S3', transform: async (d) => d });

    const estimate = labyrinth.estimateJourneyTime();

    // Expected: TESLA_BASE + DOUBLE (no delay after final step)
    const expected = TESLA_BASE + HarmonicDelays.DOUBLE;
    assertCloseTo(estimate, expected, 5, 'Journey time estimate');
  });

  await test('Performance: Intentional slowdown demonstration', async () => {
    // Fast version (parallel)
    const fastStart = Date.now();
    await Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3)
    ]);
    const fastDuration = Date.now() - fastStart;

    // Slow version (labyrinth)
    const labyrinth = new LabyrinthEngine<{ count: number }>()
      .addStep({ name: 'S1', transform: async (d) => ({ ...d, count: d.count + 1 }) })
      .addStep({ name: 'S2', transform: async (d) => ({ ...d, count: d.count + 1 }) })
      .addStep({ name: 'S3', transform: async (d) => ({ ...d, count: d.count + 1 }) });

    const slowStart = Date.now();
    const slowResult = await labyrinth.traverse({ count: 0 });
    const slowDuration = Date.now() - slowStart;

    assert(slowDuration > fastDuration, 'Labyrinth should be intentionally slower');
    assert(slowResult.result.count === 3, 'Result should still be correct');

    console.log(`   📊 Fast: ${fastDuration}ms | Slow: ${slowDuration}ms | Slowdown: ${(slowDuration / Math.max(fastDuration, 1)).toFixed(1)}x`);
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`Tests Run: ${testsRun}`);
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log('='.repeat(60));

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Sacred timing validated! 🌀✨');
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
