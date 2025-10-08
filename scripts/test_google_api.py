"""
Google API Connection Test

Tests Google authentication and Docs API access.

@complexity: O(1) - Single API test call
@lineage: (σ: "test_api", ρ: "scripts", γ: "validation", κ: O(1), λ: ["auth → test_read → test_write"])
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import GOOGLE_DOC_ID, CREDENTIALS_PATH, validate_config
from core.google_api import GoogleAuthHandler, GoogleDocsHandler


async def test_google_api():
    """Test Google API authentication and basic operations."""

    print("=" * 70)
    print("GOOGLE API CONNECTION TEST")
    print("=" * 70)
    print()

    # Step 1: Validate configuration
    print("[1/4] Validating configuration...")
    try:
        validate_config()
        print("✓ Configuration valid")
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        return False
    print()

    # Step 2: Test authentication
    print("[2/4] Testing authentication...")
    try:
        auth = GoogleAuthHandler(credentials_path=CREDENTIALS_PATH)
        auth.authenticate()
        print(f"✓ Authenticated as: {auth.credentials.service_account_email}")
    except Exception as e:
        print(f"✗ Authentication failed: {e}")
        return False
    print()

    # Step 3: Test document read
    print("[3/4] Testing document read access...")
    try:
        docs = GoogleDocsHandler(auth_handler=auth)
        document = await docs.read_document(GOOGLE_DOC_ID)
        print(f"✓ Document read successful")
        print(f"  Title: {document.get('title', 'N/A')}")
        print(f"  Revision: {document.get('revisionId', 'N/A')}")
    except Exception as e:
        print(f"✗ Document read failed: {e}")
        return False
    print()

    # Step 4: Test document write (append test message)
    print("[4/4] Testing document write access...")
    try:
        test_content = "\n---\nAsymmetrica Hub API Test - Connection successful!\n"
        await docs.append_to_doc(
            doc_id=GOOGLE_DOC_ID,
            content=test_content,
            heading="API Test"
        )
        print(f"✓ Document write successful")
        print(f"  Appended test message to document")
    except Exception as e:
        print(f"✗ Document write failed: {e}")
        return False
    print()

    # Step 5: Get API stats
    stats = docs.get_api_stats()
    print("API Statistics:")
    print(f"  Total calls: {stats['total_calls']}")
    print(f"  Rate limit: {stats['rate_limit_hz']:.2f} Hz")
    print(f"  Harmonic multiple: {stats['harmonic_multiple']}")
    print()

    print("=" * 70)
    print("ALL TESTS PASSED ✓")
    print("=" * 70)
    print()
    print(f"Check your Google Doc: https://docs.google.com/document/d/{GOOGLE_DOC_ID}")
    print()

    return True


if __name__ == "__main__":
    success = asyncio.run(test_google_api())
    sys.exit(0 if success else 1)
