/**
 * PROTECTIVE GUARDIAN SERVICE
 *
 * This service acts as a resilient wrapper for critical operations, providing
 * confidence scoring, automatic retries with harmonic backoff, and graceful
 * error handling. It is a core component of the Asymmetrica Protocol's
 * commitment to building robust, self-healing systems.
 *
 * @file This file contains the ProtectiveGuardian service class.
 * @author Jules AI (JULES-05)
 * @date 2025-10-10
 */

import { harmonicMean } from '../utils/harmonic-mean';
import { nikhilamCorrection } from '../utils/nikhilam-correction';

// Tesla's harmonic frequency (4.909 Hz) defines the base period for backoff intervals.
const TESLA_PERIOD_MS = 203.7; // 1 / 4.909 Hz ≈ 203.7ms

/**
 * Provides a suite of tools for error handling, quality scoring, and resilient operations.
 *
 * The Protective Guardian encapsulates logic for:
 * - Calculating confidence scores using the harmonic mean.
 * - Automatically retrying failed operations with a Tesla-based harmonic backoff.
 * - Applying Vedic corrections to low-quality data.
 * - Creating error boundaries to prevent service failures.
 *
 * @class ProtectiveGuardian
 */
export class ProtectiveGuardian {
  /**
   * Calculates a confidence score from an array of numerical inputs (e.g., model scores).
   *
   * This method uses the harmonic mean, which is highly sensitive to outliers. A low
   * value in the input array will disproportionately lower the overall score, making
   * this an excellent metric for ensuring high quality and consistency.
   *
   * @param values An array of numbers, typically between 0 and 1.
   * @returns A confidence score between 0 and 1.
   *
   * @example
   * ```typescript
   * const guardian = new ProtectiveGuardian();
   * const scores = [0.98, 0.95, 0.99, 0.45]; // Contains one outlier
   * const confidence = guardian.calculateConfidence(scores); // Result will be pulled down significantly
   * ```
   */
  public calculateConfidence(values: number[]): number {
    return harmonicMean(values);
  }

  /**
   * Applies the Vedic Nikhilam correction to a value.
   *
   * This is a fallback mechanism for low-quality inputs, transforming a deficit
   * into a surplus measure by finding its complement from the next highest power of 10.
   *
   * @param value The positive number to correct.
   * @returns The Nikhilam complement of the value.
   *
   * @example
   * ```typescript
   * const guardian = new ProtectiveGuardian();
   * const lowScore = 0.15;
   * const correctedScore = guardian.nikhilam(lowScore); // 0.85
   * ```
   */
  public nikhilam(value: number): number {
    return nikhilamCorrection(value);
  }

  /**
   * Wraps an asynchronous operation in a retry-on-failure mechanism with harmonic backoff.
   *
   * If the operation fails (throws an error), it will be retried automatically. The delay
   * between retries follows a harmonic progression based on Tesla's 4.909 Hz frequency,
   * creating a resilient, naturally paced backoff sequence.
   *
   * @param operation The async function to execute.
   * @param maxAttempts The maximum number of attempts before failing. Defaults to 3 (initial + 2 retries).
   * @returns A promise that resolves with the result of the operation if successful.
   * @throws Throws the last error if all attempts fail.
   *
   * @remarks
   * The backoff intervals are: 203.7ms, 407.4ms, 814.8ms, etc.
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.withErrorBoundaries(operation)();
      } catch (error) {
        if (attempt === maxAttempts) {
          console.error(`Operation failed after ${maxAttempts} attempts.`, error);
          throw error;
        }

        const backoffMs = Math.pow(2, attempt - 1) * TESLA_PERIOD_MS;
        console.warn(`Attempt ${attempt} failed. Retrying in ${backoffMs.toFixed(1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
    // This line should be unreachable due to the throw in the loop.
    throw new Error('Operation failed after all retry attempts.');
  }

  /**
   * Creates a generic error boundary around any function.
   *
   * This higher-order function wraps the provided function in a try-catch block.
   * Any exception thrown during the function's execution is caught and re-thrown,
   * ensuring that errors are always handled and can be logged or managed by upstream services.
   *
   * @param fn The function to wrap in an error boundary.
   * @returns A new function that, when called, executes the original function within the boundary.
   *
   * @example
   * ```typescript
   * const guardian = new ProtectiveGuardian();
   * const riskyFunction = () => JSON.parse("{ invalid json }");
   * const safeFunction = guardian.withErrorBoundaries(riskyFunction);
   *
   * try {
   *   safeFunction();
   * } catch (e) {
   *   // The error is gracefully caught here.
   *   console.error("Caught error:", e);
   * }
   * ```
   */
  public withErrorBoundaries<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> {
    return (...args: Parameters<T>): ReturnType<T> => {
      try {
        return fn(...args);
      } catch (error) {
        // In a real application, you would add structured logging here.
        console.error("An exception was caught by the Protective Guardian's error boundary.", {
          functionName: fn.name,
          error,
        });
        throw error; // Re-throw the error to be handled by the caller.
      }
    };
  }
}