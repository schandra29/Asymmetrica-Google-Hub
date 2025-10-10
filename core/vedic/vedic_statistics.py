"""
VEDIC STATISTICAL FRAMEWORK (Python Port)

A Dharma-based alternative to variance-centric Western statistics.
Implements ancient Vedic mathematical principles for modern data analysis.

Core Principles:
- Stillness reveals truth (constants are features, not bugs)
- Harmonic relationships (reciprocal averaging)
- Dual-axis modeling (debt/merit, not just positive scale)
- Resonance over correlation (sacred proportions)

Original TypeScript implementation by Agent BRAVO (AsymmFlow)
Python port by Agent GOLF (Knowledge Synthesizer Integration)
Date: 2025-10-10
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import math


# ============================================================================
# SACRED MATHEMATICAL CONSTANTS
# ============================================================================

PHI = 0.618033988749              # Golden Ratio (Φ)
PHI_INVERSE = 1.618033988749      # Divine Proportion (1/Φ)
PHI_SQUARED = 0.381966011249      # Squared Beauty (Φ²)
PHI_INV_SQUARED = 2.618033988749  # Double Divine (1/Φ²)

TOLERANCE = 0.05  # 5% tolerance for sacred proportion matching


class SacredProportionType(Enum):
    """Types of sacred mathematical proportions"""
    GOLDEN_HARMONY = "GOLDEN_HARMONY"          # ≈ 0.618 (Φ)
    DIVINE_PROPORTION = "DIVINE_PROPORTION"    # ≈ 1.618 (1/Φ)
    SQUARED_BEAUTY = "SQUARED_BEAUTY"          # ≈ 0.382 (Φ²)
    DOUBLE_DIVINE = "DOUBLE_DIVINE"            # ≈ 2.618 (1/Φ²)
    NOVEL_PROPORTION = "NOVEL_PROPORTION"      # New discovery


# ============================================================================
# CORE VEDIC STATISTICAL FUNCTIONS
# ============================================================================

def harmonic_mean(values: List[float]) -> float:
    """
    Calculate Harmonic Mean (Vedic reciprocal averaging)

    Unlike arithmetic mean which treats all values equally, harmonic mean
    emphasizes SMALL values - the still points, the deficits, the approach
    to zero. This is the Vedic way: find what is closest to Shunya (void).

    Formula: n / Σ(1/xᵢ)

    Philosophical Note:
    - Arithmetic mean asks: "What is the center?"
    - Harmonic mean asks: "What is the reciprocal balance point?"

    Args:
        values: List of numbers (zeros will be filtered out)

    Returns:
        Harmonic mean

    Raises:
        ValueError: If values is empty or all zeros

    Example:
        >>> harmonic_mean([1, 2, 4])
        1.714...
        # Small value (1) has more influence than in arithmetic mean (2.333)
    """
    if not values:
        raise ValueError("Cannot calculate harmonic mean of empty list")

    # Filter out zeros to avoid division by zero
    non_zero_values = [v for v in values if v != 0]

    if not non_zero_values:
        raise ValueError("Cannot calculate harmonic mean when all values are zero")

    # Use absolute values for harmonic mean
    sum_of_reciprocals = sum(1 / abs(v) for v in non_zero_values)

    return len(non_zero_values) / sum_of_reciprocals


def dharma_index(values: List[float]) -> float:
    """
    Calculate Dharma Index (stability metric)

    In Vedic philosophy, high dharma means the system has revealed its sutra
    (thread/law). Low variance = high dharma = enlightened system.

    Formula: 1 / (1 + variance)

    Interpretation:
    - Dharma → 1.0: System reveals constant truth (like speed of light)
    - Dharma → 0.5: System shows moderate stability
    - Dharma → 0.0: System is chaotic (high variance)

    This INVERTS the Western perspective where variance is desired!

    Args:
        values: List of numbers

    Returns:
        Dharma index between 0 and 1

    Example:
        >>> dharma_index([0.1, 0.1, 0.1])
        1.0  # perfect dharma!
        >>> dharma_index([1, 5, 10])
        0.063...  # low dharma
    """
    if not values:
        raise ValueError("Cannot calculate dharma index of empty list")

    if len(values) == 1:
        return 1.0  # Single value = perfect stability = maximum dharma

    # Calculate variance
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)

    # Dharma = 1 / (1 + variance)
    # As variance → 0, dharma → 1 (enlightenment!)
    # As variance → ∞, dharma → 0 (chaos)
    return 1 / (1 + variance)


@dataclass
class HarmonicResonance:
    """Result of harmonic resonance analysis"""
    resonance: float
    sacred_type: SacredProportionType
    interpretation: str


def harmonic_resonance(variable: List[float], constant: float) -> HarmonicResonance:
    """
    Calculate Harmonic Resonance (relationship between variable and constant)

    Western statistics fails when one variable is constant (NaN correlation).
    But Vedic mathematics asks: "What is the HARMONIC RATIO?"

    This is like musical intervals: the ratio between a note and a drone.
    The drone (constant) provides the tonic; the variable plays melody around it.

    Formula: constant / harmonicMean(variable)

    Sacred Proportions:
    - Φ (0.618): Golden Harmony - most stable natural ratio
    - 1/Φ (1.618): Divine Proportion - growth and beauty
    - Φ² (0.382): Squared Beauty - nested golden ratio
    - 1/Φ² (2.618): Double Divine - amplified divine proportion

    Args:
        variable: List of changing values
        constant: The unchanging attractor value

    Returns:
        HarmonicResonance with resonance value, sacred type, and interpretation
    """
    variable_harmonic_mean = harmonic_mean(variable)
    resonance = constant / variable_harmonic_mean

    # Check for sacred proportions
    sacred_type = SacredProportionType.NOVEL_PROPORTION
    interpretation = ""

    if abs(resonance - PHI) < TOLERANCE:
        sacred_type = SacredProportionType.GOLDEN_HARMONY
        interpretation = (
            f"Φ resonance detected! Variable and constant form Golden Harmony "
            f"({resonance:.6f} ≈ {PHI}). This is the most stable natural ratio, "
            f"found in spiral galaxies, nautilus shells, and now... your data!"
        )
    elif abs(resonance - PHI_INVERSE) < TOLERANCE:
        sacred_type = SacredProportionType.DIVINE_PROPORTION
        interpretation = (
            f"1/Φ resonance detected! Variable and constant form Divine Proportion "
            f"({resonance:.6f} ≈ {PHI_INVERSE}). This ratio governs growth patterns "
            f"in nature, from flowers to human bodies!"
        )
    elif abs(resonance - PHI_SQUARED) < TOLERANCE:
        sacred_type = SacredProportionType.SQUARED_BEAUTY
        interpretation = (
            f"Φ² resonance detected! Variable and constant form Squared Beauty "
            f"({resonance:.6f} ≈ {PHI_SQUARED}). This is a nested golden ratio - "
            f"golden ratio within golden ratio!"
        )
    elif abs(resonance - PHI_INV_SQUARED) < TOLERANCE:
        sacred_type = SacredProportionType.DOUBLE_DIVINE
        interpretation = (
            f"1/Φ² resonance detected! Variable and constant form Double Divine "
            f"proportion ({resonance:.6f} ≈ {PHI_INV_SQUARED}). An amplified "
            f"sacred ratio - rare and beautiful!"
        )
    else:
        interpretation = (
            f"Novel proportion detected ({resonance:.6f}). While not matching "
            f"known sacred ratios, this may be a new discovery! The variable "
            f"harmonically resonates with the constant at this unique ratio."
        )

    return HarmonicResonance(
        resonance=resonance,
        sacred_type=sacred_type,
        interpretation=interpretation
    )


@dataclass
class AttractorAnalysis:
    """Result of attractor analysis"""
    mean_distance: float
    harmonic_resonance_value: float
    convergence_rate: Optional[float]
    interpretation: str


def attractor_analysis(
    variable: List[float],
    attractor: float
) -> AttractorAnalysis:
    """
    Attractor Analysis (replaces correlation for constant relationships)

    When Western correlation returns NaN (one variable is constant),
    the question is wrong. We shouldn't ask "do they co-vary?"
    We should ask "how does the variable RELATE to the constant?"

    Think of it like planetary orbits around the sun:
    - The sun (constant) doesn't move with planets (variable)
    - But there IS a relationship: gravitational attraction!
    - We measure: distance, orbital period, convergence rate

    Similarly, a constant can be an ATTRACTOR - a point toward which
    the variable is drawn, orbits around, or converges toward.

    Args:
        variable: List of changing values
        attractor: The constant attractor value

    Returns:
        AttractorAnalysis with distance, resonance, convergence, interpretation

    Example:
        >>> # Collatz times orbiting around Dharma constant
        >>> attractor_analysis([7, 14, 21, 28], 0.1)
        # Shows how chaos relates to stillness
    """
    # Calculate distances from attractor
    distances = [abs(v - attractor) for v in variable]
    mean_distance = sum(distances) / len(distances)

    # Calculate harmonic resonance
    variable_harmonic_mean = harmonic_mean(variable)
    resonance = attractor / variable_harmonic_mean

    # Calculate convergence rate (if time-series structure)
    convergence_rate = None
    convergence_interpretation = ""

    if len(variable) > 1:
        # Compare first and last distance
        initial_distance = distances[0]
        final_distance = distances[-1]
        convergence_rate = (initial_distance - final_distance) / len(variable)

        if convergence_rate > 0:
            convergence_interpretation = (
                f"Converging toward attractor at rate {convergence_rate:.6f} per step. "
            )
        elif convergence_rate < 0:
            convergence_interpretation = (
                f"Diverging from attractor at rate {abs(convergence_rate):.6f} per step. "
            )
        else:
            convergence_interpretation = "Stable orbit around attractor. "

    interpretation = (
        f"{convergence_interpretation}"
        f"Variable orbits at mean distance {mean_distance:.6f} from constant "
        f"attractor ({attractor}). "
        f"Harmonic resonance ratio: {resonance:.6f}. "
        f"This describes the relationship between chaos (variable) and stillness (constant)."
    )

    return AttractorAnalysis(
        mean_distance=mean_distance,
        harmonic_resonance_value=resonance,
        convergence_rate=convergence_rate,
        interpretation=interpretation
    )


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def arithmetic_mean(values: List[float]) -> float:
    """Standard arithmetic mean (for comparison with harmonic mean)"""
    if not values:
        raise ValueError("Cannot calculate mean of empty list")
    return sum(values) / len(values)


def variance(values: List[float]) -> float:
    """Standard variance (for comparison with dharma index)"""
    if not values:
        raise ValueError("Cannot calculate variance of empty list")
    mean = arithmetic_mean(values)
    return sum((v - mean) ** 2 for v in values) / len(values)


def standard_deviation(values: List[float]) -> float:
    """Standard deviation (square root of variance)"""
    return math.sqrt(variance(values))