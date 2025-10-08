/**
 * Labyrinth Delay Engine Contract Tests
 *
 * These tests validate that the Labyrinth enforces sequential execution
 * with harmonic timing delays between steps.
 *
 * Test Coverage:
 * 1. Sequential execution (no parallelization)
 * 2. Harmonic delay timing validation
 * 3. Path history tracking
 * 4. Error handling and propagation
 * 5. Sacred timing compliance
 *
 * @author Agent Mike
 * @date October 5, 2025
 */

import { test, expect } from '@playwright/test';
import { LabyrinthEngine, HarmonicDelays, createLabyrinth } from '../utils/labyrinth-engine';

test.describe('Labyrinth Delay Engine - Sequential Execution', () => {

  test('should execute steps in order without parallelization', async () => {
    interface TestData {
      executionLog: string[];
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
      .addStep({
        name: 'Step 1',
        transform: async (data) => {
          data.executionLog.push('Step 1 started');
          await new Promise(resolve => setTimeout(resolve, 50));
          data.executionLog.push('Step 1 completed');
          return { ...data, value: data.value + 1 };
        }
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => {
          data.executionLog.push('Step 2 started');
          await new Promise(resolve => setTimeout(resolve, 30));
          data.executionLog.push('Step 2 completed');
          return { ...data, value: data.value * 2 };
        }
      })
      .addStep({
        name: 'Step 3',
        transform: async (data) => {
          data.executionLog.push('Step 3 started');
          await new Promise(resolve => setTimeout(resolve, 20));
          data.executionLog.push('Step 3 completed');
          return { ...data, value: data.value + 10 };
        }
      });

    const initialData: TestData = {
      executionLog: [],
      value: 5
    };

    const result = await labyrinth.traverse(initialData);

    // Verify sequential execution order
    expect(result.result.executionLog).toEqual([
      'Step 1 started',
      'Step 1 completed',
      'Step 2 started',
      'Step 2 completed',
      'Step 3 started',
      'Step 3 completed'
    ]);

    // Verify data transformation: (5 + 1) * 2 + 10 = 22
    expect(result.result.value).toBe(22);

    // Verify path length
    expect(result.path.length).toBe(3);
    expect(result.stepCount).toBe(3);
  });

  test('should record complete path history with timestamps', async () => {
    interface TestData {
      count: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
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

    // Verify path records
    expect(result.path.length).toBe(3);

    expect(result.path[0].step).toBe('Increment');
    expect(result.path[0].data.count).toBe(3); // 2 + 1
    expect(result.path[0].timestamp).toBeGreaterThan(0);
    expect(result.path[0].duration).toBeGreaterThanOrEqual(0);

    expect(result.path[1].step).toBe('Double');
    expect(result.path[1].data.count).toBe(6); // 3 * 2

    expect(result.path[2].step).toBe('Square');
    expect(result.path[2].data.count).toBe(36); // 6 * 6

    // Verify timestamps are sequential
    expect(result.path[1].timestamp).toBeGreaterThanOrEqual(result.path[0].timestamp);
    expect(result.path[2].timestamp).toBeGreaterThanOrEqual(result.path[1].timestamp);

    // Verify final result
    expect(result.result.count).toBe(36);
  });

  test('should handle empty step list gracefully', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>();

    const result = await labyrinth.traverse({ value: 42 });

    expect(result.result.value).toBe(42);
    expect(result.path.length).toBe(0);
    expect(result.stepCount).toBe(0);
    expect(result.totalHarmonicDelay).toBe(0);
  });

  test('should propagate errors from failed steps', async () => {
    interface TestData {
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
      .addStep({
        name: 'Good Step',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Failing Step',
        transform: async (data) => {
          throw new Error('Intentional failure for testing');
        }
      })
      .addStep({
        name: 'Should Not Execute',
        transform: async (data) => ({ ...data, value: data.value + 100 })
      });

    await expect(labyrinth.traverse({ value: 10 }))
      .rejects
      .toThrow('Labyrinth step "Failing Step" failed');
  });
});

test.describe('Labyrinth Delay Engine - Harmonic Timing', () => {

  test('should apply Tesla harmonic delays between steps', async () => {
    interface TestData {
      value: number;
    }

    const TESLA_BASE_PERIOD = 1000 / 4.909; // ~203.7ms

    const labyrinth = new LabyrinthEngine<TestData>()
      .addStep({
        name: 'Step 1',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Step 3',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const startTime = Date.now();
    const result = await labyrinth.traverse({ value: 0 });
    const endTime = Date.now();
    const actualDuration = endTime - startTime;

    // Expected delay: 2 × TESLA_BASE_PERIOD (delay after step 1 and 2, but not step 3)
    const expectedMinDelay = 2 * TESLA_BASE_PERIOD;

    // Verify total harmonic delay
    expect(result.totalHarmonicDelay).toBeCloseTo(2 * TESLA_BASE_PERIOD, -1);

    // Verify actual duration is >= expected delay (allowing for execution time)
    expect(actualDuration).toBeGreaterThanOrEqual(expectedMinDelay * 0.9); // 10% tolerance

    // Verify sacred timing flag
    expect(result.sacredTiming).toBe(true);

    // Verify path records include harmonic delays
    expect(result.path[0].harmonicDelay).toBeCloseTo(TESLA_BASE_PERIOD, -1);
    expect(result.path[1].harmonicDelay).toBeCloseTo(TESLA_BASE_PERIOD, -1);
  });

  test('should support custom delay overrides', async () => {
    interface TestData {
      value: number;
    }

    const customDelay = 100; // 100ms custom delay

    const labyrinth = new LabyrinthEngine<TestData>()
      .addStep({
        name: 'Fast Step',
        delay: customDelay,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Final Step',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 0 });

    // Verify custom delay was used
    expect(result.path[0].harmonicDelay).toBe(customDelay);
    expect(result.totalHarmonicDelay).toBeCloseTo(customDelay, -1);
  });

  test('should support immediate delay (no pause)', async () => {
    interface TestData {
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>()
      .addStep({
        name: 'Immediate Step',
        delay: HarmonicDelays.IMMEDIATE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Final Step',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 0 });

    // Verify immediate delay (0ms)
    expect(result.path[0].harmonicDelay).toBe(0);
    expect(result.totalHarmonicDelay).toBe(0);
  });

  test('should skip delays when configured', async () => {
    interface TestData {
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>({ skipDelays: true })
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

    // Should be fast (< 50ms) since delays are skipped
    expect(actualDuration).toBeLessThan(50);

    // Sacred timing should be false
    expect(result.sacredTiming).toBe(false);

    // Total harmonic delay should be 0 (delays were skipped)
    expect(result.totalHarmonicDelay).toBe(0);
  });

  test('should use different harmonic delay constants correctly', async () => {
    interface TestData {
      value: number;
    }

    const labyrinth = new LabyrinthEngine<TestData>()
      .addStep({
        name: 'Single Harmonic',
        delay: HarmonicDelays.SINGLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Double Harmonic',
        delay: HarmonicDelays.DOUBLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      })
      .addStep({
        name: 'Triple Harmonic',
        delay: HarmonicDelays.TRIPLE,
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 0 });

    const TESLA_BASE = 1000 / 4.909;

    expect(result.path[0].harmonicDelay).toBeCloseTo(TESLA_BASE, -1);
    expect(result.path[1].harmonicDelay).toBeCloseTo(2 * TESLA_BASE, -1);
    expect(result.path[2].harmonicDelay).toBeCloseTo(3 * TESLA_BASE, -1);

    const expectedTotal = TESLA_BASE + (2 * TESLA_BASE) + (3 * TESLA_BASE);
    expect(result.totalHarmonicDelay).toBeCloseTo(expectedTotal, -1);
  });
});

test.describe('Labyrinth Delay Engine - Fluent Interface', () => {

  test('should support fluent chaining of steps', async () => {
    interface TestData {
      operations: string[];
    }

    const result = await new LabyrinthEngine<TestData>({ skipDelays: true })
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
      .addStep({
        name: 'Op3',
        transform: async (data) => {
          data.operations.push('op3');
          return data;
        }
      })
      .traverse({ operations: [] });

    expect(result.result.operations).toEqual(['op1', 'op2', 'op3']);
  });

  test('should support convenience factory function', async () => {
    const labyrinth = createLabyrinth<{ value: number }>({ skipDelays: true })
      .addStep({
        name: 'Increment',
        transform: async (data) => ({ ...data, value: data.value + 1 })
      });

    const result = await labyrinth.traverse({ value: 5 });
    expect(result.result.value).toBe(6);
  });
});

test.describe('Labyrinth Delay Engine - Metadata and Utilities', () => {

  test('should provide read-only access to configured steps', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Step 1',
        transform: async (data) => data
      })
      .addStep({
        name: 'Step 2',
        description: 'This is step 2',
        transform: async (data) => data
      });

    const steps = labyrinth.getSteps();

    expect(steps.length).toBe(2);
    expect(steps[0].name).toBe('Step 1');
    expect(steps[1].name).toBe('Step 2');
    expect(steps[1].description).toBe('This is step 2');
  });

  test('should calculate journey time estimate', async () => {
    const TESLA_BASE = 1000 / 4.909;

    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Step 1',
        transform: async (data) => data
      })
      .addStep({
        name: 'Step 2',
        delay: HarmonicDelays.DOUBLE,
        transform: async (data) => data
      })
      .addStep({
        name: 'Step 3',
        transform: async (data) => data
      });

    const estimate = labyrinth.estimateJourneyTime();

    // Expected: TESLA_BASE (after step 1) + DOUBLE (after step 2)
    // Note: No delay after final step
    const expected = TESLA_BASE + HarmonicDelays.DOUBLE;

    expect(estimate).toBeCloseTo(expected, -1);
  });

  test('should expose Tesla harmonic period', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>();
    const period = labyrinth.getHarmonicPeriod();

    const TESLA_BASE = 1000 / 4.909;
    expect(period).toBeCloseTo(TESLA_BASE, 1);
  });

  test('should support custom Tesla frequency', async () => {
    const customFrequency = 10; // 10 Hz
    const customPeriod = 1000 / customFrequency; // 100ms

    const labyrinth = new LabyrinthEngine<{ value: number }>({
      teslaFrequencyHz: customFrequency,
      skipDelays: false
    })
      .addStep({
        name: 'Step 1',
        transform: async (data) => data
      })
      .addStep({
        name: 'Step 2',
        transform: async (data) => data
      });

    const result = await labyrinth.traverse({ value: 0 });

    // Should use custom period
    expect(result.path[0].harmonicDelay).toBeCloseTo(customPeriod, -1);
  });
});

test.describe('Labyrinth Delay Engine - Performance Characteristics', () => {

  test('should demonstrate intentional slowdown (sacred timing)', async () => {
    interface TestData {
      count: number;
    }

    // Version WITHOUT Labyrinth (parallel execution simulation)
    const fastStart = Date.now();
    const fastResults = await Promise.all([
      Promise.resolve(1),
      Promise.resolve(2),
      Promise.resolve(3),
      Promise.resolve(4),
      Promise.resolve(5)
    ]);
    const fastDuration = Date.now() - fastStart;

    // Version WITH Labyrinth (sequential + harmonic delays)
    const labyrinth = new LabyrinthEngine<TestData>()
      .addStep({ name: 'S1', transform: async (data) => ({ ...data, count: data.count + 1 }) })
      .addStep({ name: 'S2', transform: async (data) => ({ ...data, count: data.count + 1 }) })
      .addStep({ name: 'S3', transform: async (data) => ({ ...data, count: data.count + 1 }) })
      .addStep({ name: 'S4', transform: async (data) => ({ ...data, count: data.count + 1 }) })
      .addStep({ name: 'S5', transform: async (data) => ({ ...data, count: data.count + 1 }) });

    const slowStart = Date.now();
    const slowResult = await labyrinth.traverse({ count: 0 });
    const slowDuration = Date.now() - slowStart;

    // Labyrinth should be INTENTIONALLY slower
    expect(slowDuration).toBeGreaterThan(fastDuration);

    // But correctness is maintained
    expect(slowResult.result.count).toBe(5);
    expect(slowResult.sacredTiming).toBe(true);

    console.log(`[Performance Test] Fast (parallel): ${fastDuration}ms`);
    console.log(`[Performance Test] Slow (labyrinth): ${slowDuration}ms`);
    console.log(`[Performance Test] Slowdown factor: ${(slowDuration / Math.max(fastDuration, 1)).toFixed(2)}x`);
    console.log(`[Performance Test] Harmonic delay: ${slowResult.totalHarmonicDelay.toFixed(2)}ms`);
  });

  test('should track execution time vs harmonic delay time', async () => {
    const labyrinth = new LabyrinthEngine<{ value: number }>()
      .addStep({
        name: 'Fast Step',
        transform: async (data) => {
          // Simulate 10ms work
          await new Promise(resolve => setTimeout(resolve, 10));
          return { ...data, value: data.value + 1 };
        }
      })
      .addStep({
        name: 'Slow Step',
        transform: async (data) => {
          // Simulate 50ms work
          await new Promise(resolve => setTimeout(resolve, 50));
          return { ...data, value: data.value + 1 };
        }
      });

    const result = await labyrinth.traverse({ value: 0 });

    const executionTime = result.totalDuration - result.totalHarmonicDelay;

    // Execution time should be ~60ms (10ms + 50ms)
    expect(executionTime).toBeGreaterThanOrEqual(50);
    expect(executionTime).toBeLessThan(100);

    // Harmonic delay should be ~2 × TESLA_BASE
    const TESLA_BASE = 1000 / 4.909;
    expect(result.totalHarmonicDelay).toBeCloseTo(TESLA_BASE, -1);

    // Total duration = execution + harmonic delay
    expect(result.totalDuration).toBeCloseTo(executionTime + result.totalHarmonicDelay, -2);
  });
});
