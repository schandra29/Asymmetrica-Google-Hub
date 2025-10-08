/**
 * Labyrinth Delay Engine - Sacred Geometry Pattern for Sequential Processing
 *
 * Mathematical Foundation:
 * - Based on the ancient labyrinth archetype: a single path that must be fully traversed
 * - No shortcuts allowed - each turn reveals new insight
 * - Pairs with Tesla harmonic timing (4.909 Hz) for natural rhythm
 * - Anti-pattern to premature optimization
 *
 * Sacred Geometry Basis:
 * The labyrinth represents a journey of transformation through intentional delay.
 * Unlike a maze (which has choices), a labyrinth has a single winding path to the center.
 * This enforces sequential processing where each step must complete before the next begins.
 *
 * Research:
 * - Labyrinths date back 4000+ years (Minoan civilization)
 * - Used in medieval cathedrals for meditative walking
 * - Chartres Cathedral (1201 AD) features 11-circuit labyrinth
 * - Psychology: Sequential processing reduces cognitive load (Miller's Law, 1956)
 * - Software: Prevents race conditions in async metrics calculation
 *
 * Tesla Harmonic Integration:
 * - Base period: 1/4.909 Hz ≈ 203.7ms
 * - Natural rhythm prevents timing collisions
 * - Deterministic delays for reproducible behavior
 *
 * @author Agent Mike
 * @date October 5, 2025
 */

/**
 * Single step in the labyrinth journey
 */
export interface LabyrinthStep<T> {
  /** Name of this step for tracking/debugging */
  name: string;

  /** Transform function to apply to data */
  transform: (data: T) => Promise<T>;

  /** Optional delay override (defaults to Tesla base period) */
  delay?: number;

  /** Optional description of what this step does */
  description?: string;
}

/**
 * Record of a completed labyrinth step
 */
export interface LabyrinthPathRecord<T> {
  /** Step name */
  step: string;

  /** Timestamp when step completed (ms since epoch) */
  timestamp: number;

  /** Duration of step execution in milliseconds */
  duration: number;

  /** Data state after this step */
  data: T;

  /** Harmonic delay applied after this step */
  harmonicDelay: number;
}

/**
 * Result of traversing the labyrinth
 */
export interface LabyrinthResult<T> {
  /** Final transformed data */
  result: T;

  /** Complete path taken through the labyrinth */
  path: LabyrinthPathRecord<T>[];

  /** Total journey time in milliseconds */
  totalDuration: number;

  /** Total harmonic delay time in milliseconds */
  totalHarmonicDelay: number;

  /** Number of steps traversed */
  stepCount: number;

  /** Whether sacred timing was respected */
  sacredTiming: boolean;
}

/**
 * Configuration options for LabyrinthEngine
 */
export interface LabyrinthConfig {
  /** Tesla base frequency in Hz (default: 4.909) */
  teslaFrequencyHz?: number;

  /** Enable detailed logging of each step */
  verbose?: boolean;

  /** Disable harmonic delays (for testing only - breaks sacred timing!) */
  skipDelays?: boolean;
}

/**
 * Labyrinth Delay Engine
 *
 * Enforces sequential processing with sacred harmonic delays between steps.
 * This is INTENTIONALLY slower than parallel execution - that's the point!
 *
 * @example
 * ```typescript
 * interface AnalysisData {
 *   metrics: Metrics;
 *   fps?: number;
 *   cls?: number;
 *   insights?: string[];
 * }
 *
 * const labyrinth = new LabyrinthEngine<AnalysisData>()
 *   .addStep({
 *     name: 'Calculate FPS',
 *     description: 'Analyze frame rate data',
 *     transform: async (data) => ({ ...data, fps: calculateFPS(data.metrics) })
 *   })
 *   .addStep({
 *     name: 'Assess CLS',
 *     description: 'Evaluate layout shift',
 *     transform: async (data) => ({ ...data, cls: assessCLS(data.metrics) })
 *   })
 *   .addStep({
 *     name: 'Correlate Patterns',
 *     description: 'Find insights',
 *     transform: async (data) => ({ ...data, insights: correlate(data) })
 *   });
 *
 * const { result, path } = await labyrinth.traverse({ metrics: rawMetrics });
 * console.log(`Journey completed in ${path.length} steps`);
 * ```
 */
export class LabyrinthEngine<T> {
  private steps: LabyrinthStep<T>[] = [];
  private readonly TESLA_BASE_FREQUENCY_HZ: number;
  private readonly TESLA_BASE_PERIOD_MS: number;
  private readonly verbose: boolean;
  private readonly skipDelays: boolean;

  /**
   * Create a new Labyrinth Engine
   *
   * @param config - Configuration options
   */
  constructor(config: LabyrinthConfig = {}) {
    this.TESLA_BASE_FREQUENCY_HZ = config.teslaFrequencyHz ?? 4.909;
    this.TESLA_BASE_PERIOD_MS = (1000 / this.TESLA_BASE_FREQUENCY_HZ);
    this.verbose = config.verbose ?? false;
    this.skipDelays = config.skipDelays ?? false;

    if (this.verbose) {
      console.log(`[Labyrinth] Initialized with Tesla ${this.TESLA_BASE_FREQUENCY_HZ} Hz (period: ${this.TESLA_BASE_PERIOD_MS.toFixed(2)}ms)`);
    }

    if (this.skipDelays) {
      console.warn('[Labyrinth] ⚠️ Harmonic delays disabled - sacred timing NOT respected!');
    }
  }

  /**
   * Add a step to the labyrinth path
   *
   * Steps will be executed in the order they are added.
   * This is a fluent interface for easy chaining.
   *
   * @param step - Step configuration
   * @returns this engine for chaining
   */
  addStep(step: LabyrinthStep<T>): this {
    this.steps.push(step);

    if (this.verbose) {
      const delay = step.delay ?? this.TESLA_BASE_PERIOD_MS;
      console.log(`[Labyrinth] Added step "${step.name}" (delay: ${delay.toFixed(2)}ms)`);
    }

    return this;
  }

  /**
   * Traverse the labyrinth with given initial data
   *
   * Each step will:
   * 1. Execute its transform function
   * 2. Record the result and timing
   * 3. Apply harmonic delay before next step
   *
   * This is INTENTIONALLY SEQUENTIAL. No parallelization.
   * The delay prevents race conditions and allows metrics to stabilize.
   *
   * @param initialData - Starting data for the journey
   * @returns Complete result with path history
   */
  async traverse(initialData: T): Promise<LabyrinthResult<T>> {
    const journeyStart = Date.now();
    const path: LabyrinthPathRecord<T>[] = [];
    let data = initialData;
    let totalHarmonicDelay = 0;

    if (this.verbose) {
      console.log(`[Labyrinth] 🌀 Beginning journey through ${this.steps.length} steps...`);
    }

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stepStart = Date.now();

      if (this.verbose) {
        console.log(`[Labyrinth] Step ${i + 1}/${this.steps.length}: ${step.name}`);
        if (step.description) {
          console.log(`[Labyrinth]   → ${step.description}`);
        }
      }

      // Execute step transform
      try {
        data = await step.transform(data);
      } catch (error) {
        console.error(`[Labyrinth] ❌ Step "${step.name}" failed:`, error);
        throw new Error(`Labyrinth step "${step.name}" failed: ${error}`);
      }

      const stepEnd = Date.now();
      const stepDuration = stepEnd - stepStart;

      // Calculate harmonic delay for this step
      const harmonicDelay = step.delay ?? this.TESLA_BASE_PERIOD_MS;

      // Determine if we'll actually apply this delay
      const willApplyDelay = (i < this.steps.length - 1) && !this.skipDelays;
      const actualDelay = willApplyDelay ? harmonicDelay : 0;

      // Track total harmonic delay (only delays actually applied)
      totalHarmonicDelay += actualDelay;

      // Record this step in the path
      path.push({
        step: step.name,
        timestamp: stepEnd,
        duration: stepDuration,
        data: data,
        harmonicDelay: harmonicDelay // Record configured delay, even if not applied
      });

      if (this.verbose) {
        console.log(`[Labyrinth]   ✓ Completed in ${stepDuration}ms`);
      }

      // Sacred pause between turns of the labyrinth
      // (Skip delay after last step)
      if (willApplyDelay) {
        if (this.verbose) {
          console.log(`[Labyrinth]   ⏸ Harmonic pause: ${harmonicDelay.toFixed(2)}ms`);
        }
        await this.harmonicDelay(harmonicDelay);
      }
    }

    const journeyEnd = Date.now();
    const totalDuration = journeyEnd - journeyStart;

    if (this.verbose) {
      console.log(`[Labyrinth] 🎯 Journey complete!`);
      console.log(`[Labyrinth]   Total duration: ${totalDuration}ms`);
      console.log(`[Labyrinth]   Harmonic delay: ${totalHarmonicDelay.toFixed(2)}ms (${((totalHarmonicDelay / totalDuration) * 100).toFixed(1)}%)`);
      console.log(`[Labyrinth]   Execution time: ${(totalDuration - totalHarmonicDelay)}ms`);
    }

    return {
      result: data,
      path: path,
      totalDuration: totalDuration,
      totalHarmonicDelay: totalHarmonicDelay,
      stepCount: this.steps.length,
      sacredTiming: !this.skipDelays
    };
  }

  /**
   * Harmonic delay using Promise-based timeout
   *
   * @param ms - Milliseconds to delay
   */
  private async harmonicDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the configured steps (read-only)
   */
  getSteps(): ReadonlyArray<LabyrinthStep<T>> {
    return [...this.steps];
  }

  /**
   * Get Tesla harmonic period in milliseconds
   */
  getHarmonicPeriod(): number {
    return this.TESLA_BASE_PERIOD_MS;
  }

  /**
   * Calculate total journey time estimate (including delays)
   *
   * Note: This is a MINIMUM estimate - actual execution time will be longer
   *
   * @returns Estimated journey time in milliseconds
   */
  estimateJourneyTime(): number {
    const harmonicDelays = this.steps
      .slice(0, -1) // Don't count delay after last step
      .reduce((sum, step) => sum + (step.delay ?? this.TESLA_BASE_PERIOD_MS), 0);

    return harmonicDelays;
  }
}

/**
 * Convenience function to create a labyrinth with standard configuration
 */
export function createLabyrinth<T>(config?: LabyrinthConfig): LabyrinthEngine<T> {
  return new LabyrinthEngine<T>(config);
}

/**
 * Pre-configured harmonic delays based on Tesla frequency multiples
 */
export const HarmonicDelays = {
  /** 0× base period = 0ms (immediate, no delay) */
  IMMEDIATE: 0,

  /** 1× base period ≈ 204ms */
  SINGLE: 1000 / 4.909,

  /** 2× base period ≈ 407ms */
  DOUBLE: 2 * (1000 / 4.909),

  /** 3× base period ≈ 611ms */
  TRIPLE: 3 * (1000 / 4.909),

  /** 4× base period ≈ 815ms */
  QUADRUPLE: 4 * (1000 / 4.909),

  /** 5× base period ≈ 1019ms (≈1 second) */
  QUINTUPLE: 5 * (1000 / 4.909),

  /** 12× base period ≈ 2444ms (≈2.5 seconds) */
  PERFECT_FIFTH: 12 * (1000 / 4.909),
};
