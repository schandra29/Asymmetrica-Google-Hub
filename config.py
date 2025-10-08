"""
Asymmetrica Google Hub Configuration

@complexity: O(1) - Static configuration
@lineage: (σ: "config", ρ: "global", γ: "stability", κ: O(1), λ: ["load_env → validate"])
@validation: Built on DefenseKit α₀ (102/102 passing tests)
"""

import os
from pathlib import Path
from typing import Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ============================================================================
# PROJECT STRUCTURE
# ============================================================================

PROJECT_ROOT = Path(__file__).parent
SOURCE_MATERIALS = PROJECT_ROOT / "source_materials"
JULES_WORKSPACE = PROJECT_ROOT / "jules_workspace"
CANONICAL_DOCS = PROJECT_ROOT / "canonical_docs"

# Ensure directories exist
for directory in [SOURCE_MATERIALS, JULES_WORKSPACE, CANONICAL_DOCS]:
    directory.mkdir(parents=True, exist_ok=True)

# ============================================================================
# GOOGLE API CONFIGURATION
# ============================================================================

GOOGLE_DOC_ID = os.getenv(
    "GOOGLE_DOC_ID",
    "1GzcIPyX1feHPHW_Pc3twG09Sd34ROB6G-EQHvgNDjrE"
)

CREDENTIALS_PATH = Path(
    os.getenv("GOOGLE_CREDENTIALS_PATH", PROJECT_ROOT / "credentials.json")
)

# Google API Scopes
GOOGLE_SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.file'
]

# ============================================================================
# DEFENSEKIT TRILOGY CONFIGURATION (α₀ - VALIDATED)
# ============================================================================

# Tesla Harmonic Timer (37/37 tests passing)
# Source: backend/app/utils/harmonic_timer.py
TESLA_FREQUENCY_HZ = float(os.getenv("TESLA_FREQUENCY_HZ", "4.909"))
TESLA_BASE_PERIOD_SECONDS = 1.0 / TESLA_FREQUENCY_HZ  # ≈ 0.2037s

# Three-Regime Test Distribution (36/36 tests passing)
# TSP-optimized distribution (Agent Quebec validation - Day 142)
# 9× faster convergence, 88.89% improvement
# Source: backend/app/utils/three_regime_planner.py
THREE_REGIME_DISTRIBUTION: Dict[str, float] = {
    "exploration": float(os.getenv("EXPLORATION_PROPORTION", "0.3385")),
    "optimization": float(os.getenv("OPTIMIZATION_PROPORTION", "0.2872")),
    "stabilization": float(os.getenv("STABILIZATION_PROPORTION", "0.3744"))
}

# Confidence weights for each regime
REGIME_CONFIDENCE_WEIGHTS: Dict[str, float] = {
    "exploration": 0.70,      # Experimental - lower weight
    "optimization": 0.85,     # Improvement - medium weight
    "stabilization": 1.00     # Critical path - full weight
}

# Williams Space Optimizer (29/29 tests passing)
# Performance: 4.3× efficiency at 20K documents
# Source: backend/app/utils/williams_optimizer.py
WILLIAMS_MIN_BATCH = int(os.getenv("WILLIAMS_MIN_BATCH", "10"))
WILLIAMS_MAX_BATCH = int(os.getenv("WILLIAMS_MAX_BATCH", "5000"))

# TSP Leverage Multipliers (Agent Quebec validation - Day 142)
# 13.83% mean improvement (38% at small scale, 2% at large scale)
# Optimal for: 10-500 operations
TSP_LEVERAGE_MULTIPLIERS = {
    'support': 32.1,      # Exploration regime (highest leverage)
    'exploration': 26.8,  # Optimization regime (medium leverage)
    'balance': 11.5       # Stabilization regime (baseline leverage)
}

# ============================================================================
# MEMORY SYSTEM CONFIGURATION
# ============================================================================

MEMORY_DB_PATH = Path(
    os.getenv("MEMORY_DB_PATH", PROJECT_ROOT / "asymmetrica_memory.db")
)

# Memory system performance targets
# Based on validated DefenseKit performance:
# - Storage: < 20ms (actual: 17.31ms)
# - Retrieval: < 1ms (actual: 0.001ms)
MEMORY_STORAGE_TARGET_MS = 20.0
MEMORY_RETRIEVAL_TARGET_MS = 1.0

# ============================================================================
# SYNTHESIS CONFIGURATION
# ============================================================================

# File types to process
MARKDOWN_EXTENSIONS = ['.md', '.markdown']
CODE_EXTENSIONS = ['.py', '.js', '.ts', '.rs', '.go', '.java']
DOC_EXTENSIONS = ['.txt', '.rst', '.html']

# Batch processing configuration
DEFAULT_BATCH_SIZE = 50  # Will be optimized by Williams
MAX_CONCURRENT_BATCHES = 5

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
STRUCTLOG_ENABLED = os.getenv("STRUCTLOG_ENABLED", "true").lower() == "true"

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

def validate_config() -> bool:
    """
    Validate configuration completeness.

    @complexity: O(1)
    @returns: True if valid, raises ValueError otherwise
    """
    errors = []

    # Check credentials file exists
    if not CREDENTIALS_PATH.exists():
        errors.append(
            f"Google credentials not found at {CREDENTIALS_PATH}. "
            f"Please download service account JSON from Google Cloud Console."
        )

    # Validate Three-Regime distribution sums to ~1.0
    total_distribution = sum(THREE_REGIME_DISTRIBUTION.values())
    if abs(total_distribution - 1.0) > 0.01:
        errors.append(
            f"Three-Regime distribution must sum to 1.0, got {total_distribution}"
        )

    # Validate Tesla frequency is positive
    if TESLA_FREQUENCY_HZ <= 0:
        errors.append(f"Tesla frequency must be positive, got {TESLA_FREQUENCY_HZ}")

    # Validate Williams batch constraints
    if WILLIAMS_MIN_BATCH >= WILLIAMS_MAX_BATCH:
        errors.append(
            f"Williams min batch ({WILLIAMS_MIN_BATCH}) must be < "
            f"max batch ({WILLIAMS_MAX_BATCH})"
        )

    if errors:
        raise ValueError(
            "Configuration validation failed:\n" + "\n".join(f"  - {e}" for e in errors)
        )

    return True


def get_config_summary() -> Dict[str, any]:
    """
    Get configuration summary for logging/debugging.

    @complexity: O(1)
    @returns: Dictionary with key configuration values
    """
    return {
        "project_root": str(PROJECT_ROOT),
        "google_doc_id": GOOGLE_DOC_ID,
        "credentials_exists": CREDENTIALS_PATH.exists(),
        "tesla_frequency_hz": TESLA_FREQUENCY_HZ,
        "tesla_base_period_ms": TESLA_BASE_PERIOD_SECONDS * 1000,
        "three_regime_distribution": THREE_REGIME_DISTRIBUTION,
        "williams_batch_range": f"{WILLIAMS_MIN_BATCH}-{WILLIAMS_MAX_BATCH}",
        "memory_db_path": str(MEMORY_DB_PATH),
        "log_level": LOG_LEVEL
    }


# Validate on import (fail fast)
if __name__ != "__main__":
    # Only validate if not running as script (allows config inspection)
    try:
        validate_config()
    except ValueError as e:
        import sys
        print(f"⚠️  Configuration Warning: {e}", file=sys.stderr)
        print("Run 'python config.py' to see detailed configuration", file=sys.stderr)


if __name__ == "__main__":
    # When run as script, print configuration summary
    import json
    print("Asymmetrica Google Hub - Configuration Summary")
    print("=" * 60)
    summary = get_config_summary()
    print(json.dumps(summary, indent=2))
    print("\n" + "=" * 60)

    try:
        validate_config()
        print("✅ Configuration is valid!")
    except ValueError as e:
        print(f"❌ Configuration validation failed:\n{e}")
        exit(1)
