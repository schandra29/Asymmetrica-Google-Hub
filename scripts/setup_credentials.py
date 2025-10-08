"""
Google Credentials Setup Helper

Guides user through Google Cloud service account setup and credential configuration.

@complexity: O(1) - Interactive script
@lineage: (σ: "setup", ρ: "scripts", γ: "stabilization", κ: O(1), λ: ["prompt → validate → save"])
"""

from pathlib import Path
import sys

def main():
    print("=" * 70)
    print("ASYMMETRICA GOOGLE HUB - Credentials Setup")
    print("=" * 70)
    print()

    print("Step 1: Create Google Cloud Project")
    print("  1. Go to: https://console.cloud.google.com/")
    print("  2. Create new project or select existing")
    print("  3. Note your project ID")
    print()

    print("Step 2: Enable Google Docs API")
    print("  1. In Cloud Console, go to 'APIs & Services' > 'Library'")
    print("  2. Search for 'Google Docs API'")
    print("  3. Click 'Enable'")
    print()

    print("Step 3: Create Service Account")
    print("  1. Go to 'APIs & Services' > 'Credentials'")
    print("  2. Click 'Create Credentials' > 'Service Account'")
    print("  3. Name: 'asymmetrica-hub-service'")
    print("  4. Role: 'Editor' (or custom with Docs/Drive access)")
    print("  5. Click 'Done'")
    print()

    print("Step 4: Generate JSON Key")
    print("  1. Click on the service account you just created")
    print("  2. Go to 'Keys' tab")
    print("  3. Click 'Add Key' > 'Create new key'")
    print("  4. Select 'JSON'")
    print("  5. Download the file")
    print()

    print("Step 5: Save Credentials")
    credentials_path = Path(__file__).parent.parent / "credentials.json"
    print(f"  1. Rename downloaded file to 'credentials.json'")
    print(f"  2. Move to: {credentials_path}")
    print(f"  3. Ensure file is in .gitignore (NEVER commit!)")
    print()

    print("Step 6: Share Google Doc with Service Account")
    print("  1. Open the downloaded credentials.json")
    print("  2. Find 'client_email' field (e.g., asymmetrica-hub@...iam.gserviceaccount.com)")
    print("  3. Open your target Google Doc")
    print("  4. Click 'Share' button")
    print("  5. Add the service account email as Editor")
    print()

    print("=" * 70)
    print("Setup Complete Checklist:")
    print("=" * 70)
    print("[ ] Google Cloud project created")
    print("[ ] Google Docs API enabled")
    print("[ ] Service account created")
    print("[ ] JSON key downloaded and saved as credentials.json")
    print("[ ] Google Doc shared with service account email")
    print("[ ] .env file configured with GOOGLE_DOC_ID")
    print()

    print("Next Steps:")
    print("  1. Run: python config.py (to validate configuration)")
    print("  2. Run: python main.py (to start synthesis)")
    print()
    print("=" * 70)

if __name__ == "__main__":
    main()
