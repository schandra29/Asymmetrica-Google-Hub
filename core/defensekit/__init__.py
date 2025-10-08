"""
DefenseKit Trilogy Integration

Validated components from iPermit DefenseKit (α₀ - 102/102 tests passing):
- Williams Space Optimizer: √t × log₂(t) batch sizing (29/29 tests)
- Three-Regime Planner: 30/20/50 distribution (36/36 tests)
- Harmonic Timer: Tesla 4.909 Hz rate limiting (37/37 tests)

@complexity: O(√t log t) for Williams, O(1) for others
@validation: Complete test coverage, production-ready
@lineage: (σ: "defensekit", ρ: "core", γ: "optimization", κ: O(√t log t), λ: ["import"])
"""

from .williams_optimizer import WilliamsOptimizer, calculate_optimal_batch
from .three_regime_planner import ThreeRegimePlanner, classify_task
from .harmonic_timer import HarmonicTimer, harmonic_sleep

__all__ = [
    'WilliamsOptimizer',
    'calculate_optimal_batch',
    'ThreeRegimePlanner',
    'classify_task',
    'HarmonicTimer',
    'harmonic_sleep'
]
