import sys
from pathlib import Path

# Add the project root to the Python path to allow for absolute imports
# of modules in `core` and `engines`.
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))