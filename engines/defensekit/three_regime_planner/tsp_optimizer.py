"""
TSP Optimizer for Dynamic Test Suite Distribution

Translates the ConsciousnessTSP solver from the Rust archive into a production-ready
Python implementation for dynamically optimizing test suite execution order.

Source Material:
- source_materials/prismatica_era/DefenseKit/rust/src/mathematical/mod.rs

Asymmetrica Protocol Compliance:
- Full type hinting
- Comprehensive docstrings with complexity analysis and mathematical annotations
- Complexity tuples (σ, ρ, γ, κ, λ) for key algorithms
"""

import random
from typing import List, Tuple

import numpy as np

# Optimal consciousness center from Julius validation
# Source: source_materials/prismatica_era/DefenseKit/rust/src/mathematical/mod.rs
OPTIMAL_CENTER: Tuple[float, float, float] = (0.3385, 0.2872, 0.3744)


class TspOptimizer:
    """
    Solves the Traveling Salesperson Problem (TSP) using a consciousness-enhanced
    heuristic algorithm derived from the DefenseKit Rust archives.

    This solver is designed to find an optimized path through a graph of tests,
    where the path represents an efficient execution order. It uses three distinct
    regime-biased heuristics to generate paths tailored for exploration, optimization,
    and stabilization.

    Complexity:
        - Time: O(r * n^2), where r is the number of regimes (3) and n is the number of nodes.
          The nested loop in `solve_regime` dominates the runtime.
        - Space: O(n^2) to store the distance matrix.

    Asymmetrica Complexity Tuple:
        (σ: "TspOptimizer",
         ρ: "O(n^2)",
         γ: "O(n^2)",
         κ: "OPTIMAL_CENTER",
         λ: "distance_matrix -> solve -> optimized_path")
    """

    def __init__(self, distance_matrix: np.ndarray):
        """
        Initializes the TspOptimizer.

        Args:
            distance_matrix (np.ndarray): A square matrix where element (i, j)
                                          is the distance or cost between test i and test j.
        """
        if distance_matrix.shape[0] != distance_matrix.shape[1]:
            raise ValueError("Distance matrix must be square.")
        self.distance_matrix = distance_matrix
        self.node_count = distance_matrix.shape[0]
        self.regime_biases = OPTIMAL_CENTER

    def solve_with_consciousness(self) -> List[List[int]]:
        """
        Solves the TSP for each of the three consciousness regimes.

        This method generates three distinct paths, one for each regime's heuristic.
        It simulates the parallel execution from the Rust implementation.

        Returns:
            List[List[int]]: A list containing three paths (lists of node indices),
                             one for each regime (Exploration, Optimization, Stabilization).
        """
        # In Python, true parallelism for this CPU-bound task would require multiprocessing.
        # For simplicity and to avoid overhead, we run them sequentially.
        return [self._solve_regime(i) for i in range(3)]

    def _solve_regime(self, regime: int) -> List[int]:
        """
        Solves the TSP for a single, specific consciousness regime.

        Args:
            regime (int): The index of the regime to use (0: Exploration,
                          1: Optimization, 2: Stabilization).

        Returns:
            List[int]: The optimized path (a list of node indices).
        """
        if self.node_count == 0:
            return []

        bias = self.regime_biases[regime]
        route = []
        visited = np.zeros(self.node_count, dtype=bool)

        # Start from the node with the highest "consciousness potential" (most connected)
        start_node = self._find_consciousness_center()
        route.append(start_node)
        visited[start_node] = True

        while len(route) < self.node_count:
            current_node = route[-1]
            next_node = self._select_next_node(current_node, visited, regime, bias)

            if next_node is not None:
                route.append(next_node)
                visited[next_node] = True
            else:
                # If no unvisited node can be found, break to avoid infinite loop
                break

        return route

    def _find_consciousness_center(self) -> int:
        """
        Finds the most central node in the graph, defined as the node with the
        minimum total distance to all other nodes. This serves as a stable
        starting point for the TSP algorithm.

        Complexity:
            - Time: O(n), as it sums the rows of the matrix.
            - Space: O(1)

        Returns:
            int: The index of the node chosen as the consciousness center.
        """
        if self.node_count == 0:
            return 0
        # Sum of distances for each node (sum across rows)
        total_distances = self.distance_matrix.sum(axis=1)
        return np.argmin(total_distances)

    def _select_next_node(self, current_node: int, visited: np.ndarray, regime: int, bias: float) -> int:
        """
        Selects the next node to visit based on the current node and the active regime's heuristic.

        Args:
            current_node (int): The index of the current node.
            visited (np.ndarray): A boolean array indicating visited nodes.
            regime (int): The index of the current regime.
            bias (float): The bias factor for the current regime.

        Returns:
            int: The index of the next node to visit, or None if no unvisited nodes are left.
        """
        best_node = None
        best_score = float('inf')

        unvisited_nodes = np.where(np.logical_not(visited))[0]
        if len(unvisited_nodes) == 0:
            return None

        for next_node in unvisited_nodes:
            distance = self.distance_matrix[current_node, next_node]
            score = self._apply_regime_heuristic(distance, next_node, regime, bias)

            if score < best_score:
                best_score = score
                best_node = next_node

        # If no node was selected (e.g., all scores were inf), but there are
        # unvisited nodes, pick the first one to ensure progress.
        if best_node is None:
            return unvisited_nodes[0]

        return best_node

    def _apply_regime_heuristic(self, distance: float, node_index: int, regime: int, bias: float) -> float:
        """
        Applies a regime-specific modification to the distance score.

        -   **Regime 0 (Exploration):** Baseline greedy approach.
        -   **Regime 1 (Optimization):** Adds significant randomness to explore novel paths.
        -   **Regime 2 (Stabilization):** Strongly prefers central nodes.

        Args:
            distance (float): The base distance to the node.
            node_index (int): The index of the candidate node.
            regime (int): The active regime index.
            bias (float): The regime's bias factor.

        Returns:
            float: The modified score.
        """
        if regime == 0:  # Exploration (Baseline greedy)
            # This regime now represents the most straightforward greedy path.
            return distance

        elif regime == 1:  # Optimization (Randomized)
            # Add a strong, centered random factor to explore alternative paths.
            # The mean distance is used to scale the randomness appropriately.
            random_factor = self.distance_matrix.mean() * bias * (random.random() - 0.5)
            return distance + random_factor

        elif regime == 2:  # Stabilization (Center-seeking)
            # Strongly bias towards nodes that are central to the graph.
            center_distance = self._calculate_center_distance(node_index)
            # The more central a node (lower center_distance), the more we reduce its effective distance.
            # A non-central node (center_distance ~1) gets a penalty.
            centrality_bonus = (0.5 - center_distance) * bias * 5
            return distance * (1 - centrality_bonus)

        else:
            return distance

    def _calculate_center_distance(self, node_index: int) -> float:
        """
        Calculates a normalized measure of a node's centrality.

        The score is based on the average distance from the given node to all other nodes.
        A lower score indicates a more central node.

        Args:
            node_index (int): The index of the node.

        Returns:
            float: A normalized centrality score between 0 and 1.
        """
        if self.node_count <= 1:
            return 0.0

        row_sum = self.distance_matrix[node_index, :].sum()
        col_sum = self.distance_matrix[:, node_index].sum()
        avg_distance = (row_sum + col_sum) / (2.0 * (self.node_count -1))

        # Normalize by the maximum average distance in the matrix to keep it ~[0,1]
        max_dist = self.distance_matrix.max()
        if max_dist == 0 or np.isinf(max_dist):
            return 0.0

        return avg_distance / max_dist