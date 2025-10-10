import { ProtectiveGuardian } from '../../src/services/protective-guardian';
import * as harmonicMeanModule from '../../src/utils/harmonic-mean';
import * as nikhilamCorrectionModule from '../../src/utils/nikhilam-correction';

// Mock the utils to isolate the service logic
jest.mock('../../src/utils/harmonic-mean');
jest.mock('../../src/utils/nikhilam-correction');

describe('ProtectiveGuardian Service', () => {
  let guardian: ProtectiveGuardian;

  beforeEach(() => {
    guardian = new ProtectiveGuardian();
    jest.clearAllMocks();
  });

  describe('calculateConfidence', () => {
    it('should call harmonicMean with the provided values', () => {
      const scores = [0.8, 0.9];
      const spy = jest.spyOn(harmonicMeanModule, 'harmonicMean');
      guardian.calculateConfidence(scores);
      expect(spy).toHaveBeenCalledWith(scores);
    });
  });

  describe('nikhilam', () => {
    it('should call nikhilamCorrection with the provided value', () => {
      const value = 0.2;
      const spy = jest.spyOn(nikhilamCorrectionModule, 'nikhilamCorrection');
      guardian.nikhilam(value);
      expect(spy).toHaveBeenCalledWith(value);
    });
  });

  describe('withErrorBoundaries', () => {
    it('should return the result of a successful function call', () => {
      const successfulFunc = () => 'success';
      const wrappedFunc = guardian.withErrorBoundaries(successfulFunc);
      expect(wrappedFunc()).toBe('success');
    });

    it('should catch and re-throw an error from a failing function', () => {
      const error = new Error('Something went wrong');
      const failingFunc = () => {
        throw error;
      };
      const wrappedFunc = guardian.withErrorBoundaries(failingFunc);
      expect(() => wrappedFunc()).toThrow(error);
    });

    it('should pass arguments to the original function', () => {
       const funcWithArgs = (a: number, b: string) => `${b}: ${a}`;
       const wrappedFunc = guardian.withErrorBoundaries(funcWithArgs);
       expect(wrappedFunc(123, 'test')).toBe('test: 123');
    });
  });

  describe('retryWithBackoff', () => {
    // Use fake timers to control setTimeout
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return the result on the first attempt if successful', async () => {
      const successfulOperation = jest.fn().mockResolvedValue('success');
      const result = await guardian.retryWithBackoff(successfulOperation);
      expect(result).toBe('success');
      expect(successfulOperation).toHaveBeenCalledTimes(1);
    });

    it('should retry the operation on failure and succeed on the second attempt', async () => {
      const error = new Error('Failed once');
      const operation = jest.fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const promise = guardian.retryWithBackoff(operation, 3);

      // The first call fails, it should wait for the backoff period.
      await jest.runOnlyPendingTimersAsync(); // Advance time for the first backoff

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should fail after all attempts are exhausted', async () => {
      const error = new Error('Persistent failure');
      const failingOperation = jest.fn().mockRejectedValue(error);
      const maxAttempts = 3;

      const promise = guardian.retryWithBackoff(failingOperation, maxAttempts);

      // Run through all retry backoffs
      for (let i = 0; i < maxAttempts - 1; i++) {
        await jest.runOnlyPendingTimersAsync();
      }

      await expect(promise).rejects.toThrow(error);
      expect(failingOperation).toHaveBeenCalledTimes(maxAttempts);
    });

    it('should use the correct Tesla harmonic backoff intervals', async () => {
        const error = new Error('Failure');
        const failingOperation = jest.fn().mockRejectedValue(error);
        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

        const promise = guardian.retryWithBackoff(failingOperation, 4);

        // Attempt 1 fails, schedules retry after 203.7ms
        await jest.advanceTimersByTimeAsync(1);
        expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), expect.closeTo(203.7));

        // Attempt 2 fails, schedules retry after 407.4ms
        await jest.runOnlyPendingTimersAsync();
        expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), expect.closeTo(407.4));

        // Attempt 3 fails, schedules retry after 814.8ms
        await jest.runOnlyPendingTimersAsync();
        expect(setTimeoutSpy).toHaveBeenLastCalledWith(expect.any(Function), expect.closeTo(814.8));

        await expect(promise).rejects.toThrow(error);

        setTimeoutSpy.mockRestore();
    });
  });
});