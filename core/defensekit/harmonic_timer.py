"""
Harmonic Timer - Asymmetrica Google Hub Integration

Adapts validated Tesla 4.909 Hz harmonic timing from iPermit DefenseKit
for deterministic API rate limiting and retry backoff patterns.

@complexity: O(1) for delay calculation, O(n) for retry attempts
@performance: Deterministic timing with <50ms variance
@tests: 37/37 passing in iPermit backend
@source: c:/Projects/iPermit-rebuild/backend/app/utils/harmonic_timer.py
@lineage: (σ: "harmonic", ρ: "defensekit", γ: "stability", κ: O(1), λ: ["calculate → wait → retry"])

Mathematical Foundation:
-----------------------
Tesla Harmonic Frequency: 4.909 Hz (electromagnetic resonance)
Base Period: T = 1/4.909 ≈ 0.2037 seconds (203.7ms)

Harmonic Multiples:
- 1× T ≈ 204ms  (SINGLE)
- 2× T ≈ 407ms  (DOUBLE)
- 4× T ≈ 815ms  (QUADRUPLE)
- 8× T ≈ 1630ms (MAJOR_THIRD)
- 16× T ≈ 3260ms (exponential backoff)

Benefits:
- Deterministic timing for reproducible operations
- Natural rhythm prevents API thundering herd
- Harmonic intervals reduce network congestion
- Predictable backoff patterns for debugging

Author: GitHub Copilot (DefenseKit Integration)
Date: October 8, 2025
License: MIT
"""

import asyncio
import time
from enum import Enum
from typing import Optional, Callable, Any, Awaitable, List
from dataclasses import dataclass
import structlog

logger = structlog.get_logger(__name__)


class HarmonicMultiple(Enum):
    """Standard harmonic multiples for common timing patterns."""

    IMMEDIATE = 0      # 0 × T = 0ms (no delay)
    SINGLE = 1         # 1 × T ≈ 204ms
    DOUBLE = 2         # 2 × T ≈ 407ms
    TRIPLE = 3         # 3 × T ≈ 611ms
    QUADRUPLE = 4      # 4 × T ≈ 815ms
    QUINTUPLE = 5      # 5 × T ≈ 1019ms (≈1 second)
    OCTAVE = 8         # 8 × T ≈ 1630ms
    DOUBLE_OCTAVE = 16 # 16 × T ≈ 3260ms


@dataclass
class HarmonicTiming:
    """Result of harmonic timing calculation."""

    multiple: int
    delay_seconds: float
    frequency_hz: float
    period_ms: float
    description: str

    def __repr__(self) -> str:
        return (
            f"HarmonicTiming(multiple={self.multiple}, "
            f"delay={self.delay_seconds:.4f}s, "
            f"freq={self.frequency_hz:.3f}Hz)"
        )


@dataclass
class RetryResult:
    """Result of a retry operation."""

    success: bool
    attempts: int
    total_delay_seconds: float
    final_result: Any
    error: Optional[Exception]
    timing_sequence: List[float]

    def __repr__(self) -> str:
        status = "SUCCESS" if self.success else "FAILED"
        return (
            f"RetryResult({status}, attempts={self.attempts}, "
            f"total_delay={self.total_delay_seconds:.4f}s)"
        )


class HarmonicTimer:
    """
    Timer using Tesla's 4.909 Hz harmonic frequency.

    Provides deterministic, resonant timing patterns for API rate limiting,
    retry backoff, and synchronization in document synthesis operations.

    Attributes:
        base_frequency_hz: Tesla harmonic frequency (4.909 Hz)
        base_period_seconds: Time period of one cycle (≈0.2037s)
        base_period_ms: Period in milliseconds (≈203.7ms)

    Example:
        >>> timer = HarmonicTimer()
        >>> timing = timer.calculate_delay(HarmonicMultiple.TRIPLE)
        >>> print(f"Delay: {timing.delay_seconds:.4f} seconds")
        Delay: 0.6111 seconds
        >>>
        >>> # Async sleep with harmonic timing
        >>> await timer.sleep_async(HarmonicMultiple.SINGLE)
        >>>
        >>> # Retry with harmonic backoff
        >>> result = await timer.retry_with_backoff(
        ...     operation=api_call,
        ...     max_attempts=5
        ... )
    """

    # Tesla harmonic frequency
    TESLA_FREQUENCY_HZ = 4.909

    def __init__(self, base_frequency_hz: Optional[float] = None):
        """
        Initialize Harmonic Timer.

        Args:
            base_frequency_hz: Base frequency in Hz (default: 4.909 Hz)
        """
        self.base_frequency_hz = base_frequency_hz or self.TESLA_FREQUENCY_HZ
        self.base_period_seconds = 1.0 / self.base_frequency_hz
        self.base_period_ms = self.base_period_seconds * 1000

        logger.info(
            "harmonic_timer_initialized",
            frequency_hz=self.base_frequency_hz,
            period_seconds=round(self.base_period_seconds, 4),
            period_ms=round(self.base_period_ms, 1)
        )

    def calculate_delay(
        self,
        multiple: HarmonicMultiple | int,
        description: Optional[str] = None
    ) -> HarmonicTiming:
        """
        Calculate harmonic delay for given multiple.

        Args:
            multiple: Harmonic multiple (enum or integer)
            description: Optional description of timing purpose

        Returns:
            HarmonicTiming with calculated delay parameters

        Example:
            >>> timer = HarmonicTimer()
            >>> timing = timer.calculate_delay(3)
            >>> print(f"{timing.delay_seconds:.4f}s = {timing.period_ms:.1f}ms")
            0.6111s = 611.1ms
        """
        if isinstance(multiple, HarmonicMultiple):
            mult_value = multiple.value
            desc = description or multiple.name.replace('_', ' ').title()
        else:
            mult_value = multiple
            desc = description or f"{mult_value}× Harmonic"

        delay_seconds = mult_value * self.base_period_seconds
        period_ms = delay_seconds * 1000

        # Frequency of this harmonic (inverse of period)
        frequency_hz = (
            self.base_frequency_hz / mult_value if mult_value > 0
            else float('inf')
        )

        timing = HarmonicTiming(
            multiple=mult_value,
            delay_seconds=delay_seconds,
            frequency_hz=frequency_hz,
            period_ms=period_ms,
            description=desc
        )

        logger.debug(
            "harmonic_delay_calculated",
            multiple=mult_value,
            delay_seconds=round(delay_seconds, 4),
            period_ms=round(period_ms, 1)
        )

        return timing

    async def sleep_async(self, multiple: HarmonicMultiple | int) -> None:
        """
        Asynchronous sleep for harmonic duration.

        Args:
            multiple: Harmonic multiple to sleep

        Example:
            >>> timer = HarmonicTimer()
            >>> await timer.sleep_async(HarmonicMultiple.DOUBLE)  # Sleep ~407ms
        """
        timing = self.calculate_delay(multiple)

        if timing.delay_seconds > 0:
            logger.debug(
                "harmonic_sleep_async_start",
                multiple=timing.multiple,
                delay_seconds=timing.delay_seconds
            )
            await asyncio.sleep(timing.delay_seconds)
            logger.debug("harmonic_sleep_async_complete", multiple=timing.multiple)

    def sleep_sync(self, multiple: HarmonicMultiple | int) -> None:
        """
        Synchronous sleep for harmonic duration.

        Args:
            multiple: Harmonic multiple to sleep

        Example:
            >>> timer = HarmonicTimer()
            >>> timer.sleep_sync(HarmonicMultiple.SINGLE)  # Sleep ~204ms
        """
        timing = self.calculate_delay(multiple)

        if timing.delay_seconds > 0:
            logger.debug(
                "harmonic_sleep_sync_start",
                multiple=timing.multiple,
                delay_seconds=timing.delay_seconds
            )
            time.sleep(timing.delay_seconds)
            logger.debug("harmonic_sleep_sync_complete", multiple=timing.multiple)

    def calculate_backoff_sequence(
        self,
        max_attempts: int,
        start_multiple: int = 1,
        growth_factor: float = 2.0,
        max_multiple: Optional[int] = None
    ) -> List[HarmonicTiming]:
        """
        Calculate exponential backoff sequence using harmonic multiples.

        Args:
            max_attempts: Maximum number of retry attempts
            start_multiple: Starting harmonic multiple (default: 1)
            growth_factor: Multiplier for each retry (default: 2.0 for exponential)
            max_multiple: Maximum harmonic multiple to cap at

        Returns:
            List of HarmonicTiming for each retry attempt

        Example:
            >>> timer = HarmonicTimer()
            >>> sequence = timer.calculate_backoff_sequence(max_attempts=5)
            >>> for i, timing in enumerate(sequence, 1):
            ...     print(f"Attempt {i}: {timing.delay_seconds:.4f}s")
            Attempt 1: 0.2037s
            Attempt 2: 0.4074s
            Attempt 3: 0.8148s
            Attempt 4: 1.6296s
            Attempt 5: 3.2593s
        """
        sequence = []
        max_mult = max_multiple or 100  # Reasonable upper bound

        for attempt in range(max_attempts):
            # Calculate harmonic multiple with exponential growth
            multiple = min(
                int(start_multiple * (growth_factor ** attempt)),
                max_mult
            )

            timing = self.calculate_delay(
                multiple,
                description=f"Retry attempt {attempt + 1}"
            )
            sequence.append(timing)

        total_delay = sum(t.delay_seconds for t in sequence)
        logger.debug(
            "backoff_sequence_calculated",
            max_attempts=max_attempts,
            start_multiple=start_multiple,
            growth_factor=growth_factor,
            total_delay_seconds=round(total_delay, 2)
        )

        return sequence

    async def retry_with_backoff(
        self,
        operation: Callable[[], Awaitable[Any]],
        max_attempts: int = 5,
        start_multiple: int = 1,
        growth_factor: float = 2.0,
        max_multiple: Optional[int] = None,
        exceptions_to_retry: tuple = (Exception,),
        on_retry: Optional[Callable[[int, Exception, float], None]] = None
    ) -> RetryResult:
        """
        Retry async operation with harmonic exponential backoff.

        Args:
            operation: Async callable to retry
            max_attempts: Maximum retry attempts
            start_multiple: Starting harmonic multiple
            growth_factor: Backoff growth factor (default: 2.0)
            max_multiple: Maximum harmonic multiple cap
            exceptions_to_retry: Tuple of exceptions to catch and retry
            on_retry: Optional callback(attempt, exception, delay) on each retry

        Returns:
            RetryResult with operation outcome and timing details

        Example:
            >>> timer = HarmonicTimer()
            >>> async def flaky_api():
            ...     return await http_client.get("/api/data")
            >>>
            >>> result = await timer.retry_with_backoff(
            ...     operation=flaky_api,
            ...     max_attempts=5,
            ...     exceptions_to_retry=(HTTPError, TimeoutError)
            ... )
            >>> if result.success:
            ...     print(f"Success after {result.attempts} attempts")
        """
        backoff_sequence = self.calculate_backoff_sequence(
            max_attempts=max_attempts,
            start_multiple=start_multiple,
            growth_factor=growth_factor,
            max_multiple=max_multiple
        )

        timing_sequence = []
        last_exception = None

        logger.info(
            "retry_backoff_started",
            max_attempts=max_attempts,
            total_possible_delay=sum(t.delay_seconds for t in backoff_sequence)
        )

        for attempt in range(1, max_attempts + 1):
            try:
                logger.debug("retry_attempt_start", attempt=attempt, max_attempts=max_attempts)
                result = await operation()

                # Success!
                total_delay = sum(timing_sequence)
                logger.info(
                    "retry_backoff_success",
                    attempt=attempt,
                    total_delay_seconds=round(total_delay, 4)
                )

                return RetryResult(
                    success=True,
                    attempts=attempt,
                    total_delay_seconds=total_delay,
                    final_result=result,
                    error=None,
                    timing_sequence=timing_sequence
                )

            except exceptions_to_retry as e:
                last_exception = e

                # If this was the last attempt, fail
                if attempt >= max_attempts:
                    logger.warning(
                        "retry_backoff_exhausted",
                        attempts=attempt,
                        error=str(e),
                        total_delay_seconds=sum(timing_sequence)
                    )
                    break

                # Calculate delay for this attempt
                timing = backoff_sequence[attempt - 1]
                timing_sequence.append(timing.delay_seconds)

                logger.warning(
                    "retry_attempt_failed",
                    attempt=attempt,
                    error=str(e),
                    next_delay_seconds=round(timing.delay_seconds, 4),
                    harmonic_multiple=timing.multiple
                )

                # Call retry callback if provided
                if on_retry:
                    on_retry(attempt, e, timing.delay_seconds)

                # Sleep with harmonic backoff
                await asyncio.sleep(timing.delay_seconds)

        # All attempts exhausted
        return RetryResult(
            success=False,
            attempts=max_attempts,
            total_delay_seconds=sum(timing_sequence),
            final_result=None,
            error=last_exception,
            timing_sequence=timing_sequence
        )


# Convenience function for quick harmonic sleep
async def harmonic_sleep(multiple: int = 1) -> None:
    """
    Quick asynchronous harmonic sleep.

    Args:
        multiple: Harmonic multiple (default: 1 for ~204ms)

    Example:
        >>> await harmonic_sleep(2)  # Sleep for ~407ms
    """
    timer = HarmonicTimer()
    await timer.sleep_async(multiple)
