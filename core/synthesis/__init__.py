"""
Synthesis Components

Document parsing, batch processing, and neutral historian translation.

@lineage: (σ: "synthesis", ρ: "core", γ: "balance", κ: O(n), λ: ["scan → batch → synthesize"])
"""

from .repo_parser import RepoParser
from .batch_processor import BatchProcessor

__all__ = ['RepoParser', 'BatchProcessor']
