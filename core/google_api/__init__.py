"""
Google API Integration Layer

Provides authenticated access to Google Docs and Drive APIs with
harmonic rate limiting for deterministic API usage patterns.

@lineage: (σ: "google_api", ρ: "core", γ: "stability", κ: O(1), λ: ["auth → api → rate_limit"])
"""

from .auth import GoogleAuthHandler
from .docs_handler import GoogleDocsHandler

__all__ = ['GoogleAuthHandler', 'GoogleDocsHandler']
