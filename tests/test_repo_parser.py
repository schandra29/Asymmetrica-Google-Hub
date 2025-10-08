import unittest
import shutil
from pathlib import Path
import sys

# Add the project root to the Python path to allow for absolute imports
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from core.synthesis.repo_parser import RepoParser

class TestRepoParser(unittest.TestCase):
    """
    Test suite for the RepoParser component.
    Verifies that the file scanning mechanism correctly identifies
    markdown files in a designated source directory.
    """
    def setUp(self):
        """
        Set up a temporary directory structure with sample markdown files
        for testing the RepoParser.
        """
        self.test_dir = Path("source_materials_test")
        self.test_dir.mkdir(exist_ok=True)

        # Create dummy files
        (self.test_dir / "doc1.md").write_text("This is doc1.")
        (self.test_dir / "doc2.markdown").write_text("This is doc2.")
        (self.test_dir / "not_a_markdown.txt").write_text("This is a text file.")

        # Create a subdirectory with a file
        self.sub_dir = self.test_dir / "subdir"
        self.sub_dir.mkdir(exist_ok=True)
        (self.sub_dir / "doc3.md").write_text("This is doc3 in a subdir.")

    def tearDown(self):
        """
        Clean up the temporary directory and files after each test.
        """
        shutil.rmtree(self.test_dir)

    def test_scan_markdown_files(self):
        """
        Verify that scan_markdown_files correctly finds all .md and .markdown
        files within the test directory and its subdirectories.
        """
        parser = RepoParser(source_dir=self.test_dir)
        documents = parser.scan_markdown_files()

        # --- Verification ---
        print("\n--- Running TestRepoParser: test_scan_markdown_files ---")
        print(f"Scanning directory: {self.test_dir}")
        print(f"Found {len(documents)} markdown files:")
        for doc in documents:
            print(f"  - {doc.relative_path} ({doc.size_bytes} bytes)")

        # --- Assertions ---
        # There should be 3 markdown files found
        self.assertEqual(len(documents), 3)

        # Verify that the correct files were found
        filenames = sorted([doc.filename for doc in documents])
        expected_filenames = sorted(["doc1.md", "doc2.markdown", "doc3.md"])
        self.assertEqual(filenames, expected_filenames)

        print("\n--- Test Passed: Correctly identified all markdown files. ---\n")

if __name__ == '__main__':
    unittest.main()