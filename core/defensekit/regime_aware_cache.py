from collections import OrderedDict
import time
from typing import Any, Dict, Optional

from core.defensekit.three_regime_planner import TaskRegime


class RegimeAwareCache:
    """
    Regime-Aware Cache - Asymmetrica Protocol
    Version: 1.0
    Date: October 9, 2025

    @complexity: O(1) for average get/set operations.
    @performance: Designed for high-throughput, low-latency scenarios.
    @lineage: (σ: "RegimeAwareCache", ρ: "DefenseKit", γ: "stabilization", κ: O(1), λ: ["SUCCESS_PATTERNS_AUDIT → component_roadmap → implementation"])

    Purpose:
    This module provides a cache that dynamically adapts its eviction policy
    based on the operational regime identified by the ThreeRegimePlanner.
    It embodies the principles of adaptability and resonance central to the
    Asymmetrica project.

    - EXPLORATION: Uses a First-In, First-Out (FIFO) policy with a Time-to-Live (TTL)
                   to prioritize novelty and prevent stale data during discovery phases.
    - OPTIMIZATION: Uses a Least Frequently Used (LFU) policy to retain items
                    that have proven their value through repeated access.
    - STABILIZATION: Uses a Least Recently Used (LRU) policy to keep the most
                     relevant, recently-accessed data readily available.
    """

    def __init__(self, max_size: int = 128, fifo_ttl_seconds: int = 3600):
        self.max_size = max_size
        self.fifo_ttl_seconds = fifo_ttl_seconds

        # Stabilization (LRU)
        self._lru_cache: OrderedDict[Any, Any] = OrderedDict()

        # Optimization (LFU)
        self._lfu_cache: Dict[Any, Any] = {}
        self._lfu_freq: Dict[Any, int] = {}

        # Exploration (FIFO with TTL)
        self._fifo_cache: OrderedDict[Any, tuple[Any, float]] = OrderedDict()  # key -> (value, timestamp)

    def set(self, key: Any, value: Any, regime: TaskRegime):
        """
        Adds an item to the cache using the strategy for the specified regime.
        """
        if regime == TaskRegime.STABILIZATION:
            self._set_lru(key, value)
        elif regime == TaskRegime.OPTIMIZATION:
            self._set_lfu(key, value)
        elif regime == TaskRegime.EXPLORATION:
            self._set_fifo(key, value)

    def get(self, key: Any) -> Optional[Any]:
        """
        Retrieves an item from the cache, checking all internal caches.
        The search order is LRU, LFU, then FIFO, reflecting the general
        priority of the data.
        """
        # 1. Check LRU Cache
        if key in self._lru_cache:
            self._lru_cache.move_to_end(key)
            return self._lru_cache[key]

        # 2. Check LFU Cache
        if key in self._lfu_cache:
            self._lfu_freq[key] += 1
            return self._lfu_cache[key]

        # 3. Check FIFO Cache (and handle TTL expiry)
        if key in self._fifo_cache:
            value, timestamp = self._fifo_cache[key]
            if time.time() - timestamp <= self.fifo_ttl_seconds:
                return value
            else:
                # Item has expired, remove it
                del self._fifo_cache[key]
                return None

        return None

    def _set_lru(self, key: Any, value: Any):
        """Sets a key-value pair in the LRU cache."""
        if key in self._lru_cache:
            self._lru_cache.move_to_end(key)
        self._lru_cache[key] = value
        if len(self._lru_cache) > self.max_size:
            self._lru_cache.popitem(last=False)

    def _set_lfu(self, key: Any, value: Any):
        """Sets a key-value pair in the LFU cache."""
        if key in self._lfu_cache:
            self._lfu_freq[key] += 1
        else:
            if len(self._lfu_cache) >= self.max_size:
                # Evict the least frequently used item
                min_freq_key = min(self._lfu_freq, key=self._lfu_freq.get)
                del self._lfu_cache[min_freq_key]
                del self._lfu_freq[min_freq_key]
            self._lfu_freq[key] = 1
        self._lfu_cache[key] = value

    def _set_fifo(self, key: Any, value: Any):
        """Sets a key-value pair in the FIFO cache with a TTL."""
        # First, proactively clean any expired items before adding a new one
        self._clean_expired_fifo()

        if key not in self._fifo_cache and len(self._fifo_cache) >= self.max_size:
            self._fifo_cache.popitem(last=False)

        self._fifo_cache[key] = (value, time.time())

    def _clean_expired_fifo(self):
        """Removes all expired items from the FIFO cache."""
        now = time.time()
        expired_keys = [
            k for k, (_, ts) in self._fifo_cache.items()
            if now - ts > self.fifo_ttl_seconds
        ]
        for k in expired_keys:
            del self._fifo_cache[k]