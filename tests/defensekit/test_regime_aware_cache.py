"""
Test Suite for RegimeAwareCache - Asymmetrica Protocol
Version: 1.0
Date: October 9, 2025

@complexity: O(1) for individual cache tests.
@performance: Individual tests should complete in < 10ms.
@lineage: (σ: "test_regime_aware_cache", ρ: "DefenseKit", γ: "stabilization", κ: O(1), λ: ["RegimeAwareCache → implementation → validation"])

Purpose:
This test suite validates the functionality and protocol compliance of the
RegimeAwareCache component. It ensures that the cache behaves as expected
under all three operational regimes and adheres to the project's architectural
and documentation standards.
"""

import pytest
import re
import time

# Component to be tested
from core.defensekit.regime_aware_cache import RegimeAwareCache
from core.defensekit.three_regime_planner import TaskRegime


@pytest.fixture
def cache() -> RegimeAwareCache:
    """Provides a clean instance of the RegimeAwareCache for each test."""
    return RegimeAwareCache(max_size=3, fifo_ttl_seconds=1)


class TestRegimeAwareCacheProtocol:
    """
    Validates the component's compliance with the Asymmetrica Protocol.
    """

    def test_asymmetrica_protocol_compliance(self):
        """
        Tests that the RegimeAwareCache's docstring complies with the Asymmetrica Protocol.
        (Principle 5: Living Documentation)
        """
        docstring = RegimeAwareCache.__doc__
        assert docstring is not None, "Engine must have a docstring."

        # Check for complexity and lineage annotations
        assert re.search(r"@complexity: O\([^\)]+\)", docstring), "Missing or invalid @complexity tag."
        assert re.search(r"@lineage: \([^)]+\)", docstring), "Missing or invalid @lineage tag."

        # Check for semantic tuple (σ, ρ, γ, κ, λ)
        lineage_content_match = re.search(r"@lineage: \((.*)\)", docstring)
        assert lineage_content_match, "Could not find lineage content."
        lineage_content = lineage_content_match.group(1)

        assert 'σ:' in lineage_content, "Missing semantic tuple tag: σ"
        assert 'ρ:' in lineage_content, "Missing semantic tuple tag: ρ"
        assert 'γ:' in lineage_content, "Missing semantic tuple tag: γ"
        assert 'κ:' in lineage_content, "Missing semantic tuple tag: κ"
        assert 'λ:' in lineage_content, "Missing semantic tuple tag: λ"


class TestRegimeAwareCacheFunctionality:
    """
    Tests the core get/set and eviction logic for each caching strategy.
    """

    def test_stabilization_lru_set_get(self, cache: RegimeAwareCache):
        """Tests basic set/get for the LRU (Stabilization) cache."""
        cache.set("a", 1, TaskRegime.STABILIZATION)
        cache.set("b", 2, TaskRegime.STABILIZATION)
        assert cache.get("a") == 1
        assert cache.get("b") == 2

    def test_stabilization_lru_eviction(self, cache: RegimeAwareCache):
        """Tests that the least recently used item is evicted."""
        cache.set("a", 1, TaskRegime.STABILIZATION)
        cache.set("b", 2, TaskRegime.STABILIZATION)
        cache.set("c", 3, TaskRegime.STABILIZATION)
        cache.get("a")  # Access 'a' to make it recently used
        cache.set("d", 4, TaskRegime.STABILIZATION)  # This should evict 'b'
        assert cache.get("b") is None
        assert cache.get("a") == 1

    def test_optimization_lfu_set_get(self, cache: RegimeAwareCache):
        """Tests basic set/get for the LFU (Optimization) cache."""
        cache.set("a", 1, TaskRegime.OPTIMIZATION)
        cache.set("b", 2, TaskRegime.OPTIMIZATION)
        assert cache.get("a") == 1
        assert cache.get("b") == 2

    def test_optimization_lfu_eviction(self, cache: RegimeAwareCache):
        """Tests that the least frequently used item is evicted."""
        cache.set("a", 1, TaskRegime.OPTIMIZATION)
        cache.set("b", 2, TaskRegime.OPTIMIZATION)
        cache.set("c", 3, TaskRegime.OPTIMIZATION)
        cache.get("a")  # Access 'a' 2 times
        cache.get("a")
        cache.get("b")  # Access 'b' 1 time
        cache.set("d", 4, TaskRegime.OPTIMIZATION)  # Should evict 'c' (used 0 times)
        assert cache.get("c") is None
        assert cache.get("b") == 2
        assert cache.get("a") == 1

    def test_exploration_fifo_set_get(self, cache: RegimeAwareCache):
        """Tests basic set/get for the FIFO (Exploration) cache."""
        cache.set("a", 1, TaskRegime.EXPLORATION)
        cache.set("b", 2, TaskRegime.EXPLORATION)
        assert cache.get("a") == 1
        assert cache.get("b") == 2

    def test_exploration_fifo_eviction(self, cache: RegimeAwareCache):
        """Tests that the first item in is the first item out."""
        cache.set("a", 1, TaskRegime.EXPLORATION)
        cache.set("b", 2, TaskRegime.EXPLORATION)
        cache.set("c", 3, TaskRegime.EXPLORATION)
        cache.set("d", 4, TaskRegime.EXPLORATION) # This should evict 'a'
        assert cache.get("a") is None
        assert cache.get("b") == 2

    def test_exploration_fifo_ttl_expiry(self, cache: RegimeAwareCache):
        """Tests that an item expires and is removed after its TTL."""
        cache.set("a", 1, TaskRegime.EXPLORATION)
        assert cache.get("a") == 1
        time.sleep(1.1)  # Wait for TTL to expire (set to 1s in fixture)
        assert cache.get("a") is None

    def test_get_retrieves_from_any_cache(self, cache: RegimeAwareCache):
        """Tests that get() can retrieve an item regardless of its regime."""
        cache.set("lru_key", "lru_val", TaskRegime.STABILIZATION)
        cache.set("lfu_key", "lfu_val", TaskRegime.OPTIMIZATION)
        cache.set("fifo_key", "fifo_val", TaskRegime.EXPLORATION)

        assert cache.get("lru_key") == "lru_val"
        assert cache.get("lfu_key") == "lfu_val"
        assert cache.get("fifo_key") == "fifo_val"