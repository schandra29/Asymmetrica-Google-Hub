"""
Repository Parser - Document Discovery & Scanning

Scans source_materials directory for markdown files and extracts
metadata for synthesis processing.

@complexity: O(n) where n = number of files
@lineage: (σ: "repo_parser", ρ: "synthesis", γ: "exploration", κ: O(n), λ: ["scan → parse → metadata"])

Author: Asymmetrica R&D Laboratory
Date: October 8, 2025
"""

from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass
import structlog

logger = structlog.get_logger(__name__)


@dataclass
class DocumentMetadata:
    """Metadata for a source document."""

    file_path: Path
    filename: str
    size_bytes: int
    extension: str
    subdirectory: str
    relative_path: str

    def __repr__(self) -> str:
        return f"Document({self.filename}, {self.size_bytes} bytes, {self.subdirectory})"


class RepoParser:
    """
    Repository parser for source material discovery.

    Scans source_materials directory recursively to find all markdown
    files and extract metadata for batch processing.

    Attributes:
        source_dir: Root directory to scan
        extensions: File extensions to include (default: .md, .markdown)
        scanned_documents: List of discovered documents

    Example:
        >>> parser = RepoParser(source_dir=Path("./source_materials"))
        >>> docs = parser.scan_markdown_files()
        >>> print(f"Found {len(docs)} documents")
    """

    def __init__(
        self,
        source_dir: Path,
        extensions: Optional[List[str]] = None
    ):
        """
        Initialize Repository Parser.

        Args:
            source_dir: Root directory to scan
            extensions: File extensions to include (default: ['.md', '.markdown'])
        """
        self.source_dir = source_dir
        self.extensions = extensions or ['.md', '.markdown']
        self.scanned_documents = []

        logger.info(
            "repo_parser_initialized",
            source_dir=str(source_dir),
            extensions=self.extensions
        )

    def scan_markdown_files(self) -> List[DocumentMetadata]:
        """
        Scan source directory for markdown files.

        Returns:
            List of DocumentMetadata for discovered files

        Example:
            >>> parser = RepoParser(source_dir=Path("./source_materials"))
            >>> docs = parser.scan_markdown_files()
            >>> for doc in docs:
            ...     print(f"{doc.filename}: {doc.size_bytes} bytes")
        """
        if not self.source_dir.exists():
            logger.warning(
                "source_directory_not_found",
                source_dir=str(self.source_dir)
            )
            return []

        documents = []

        for ext in self.extensions:
            for file_path in self.source_dir.rglob(f"*{ext}"):
                if file_path.is_file():
                    metadata = self._extract_metadata(file_path)
                    documents.append(metadata)

        self.scanned_documents = documents

        logger.info(
            "markdown_scan_complete",
            total_documents=len(documents),
            extensions=self.extensions
        )

        return documents

    def _extract_metadata(self, file_path: Path) -> DocumentMetadata:
        """
        Extract metadata from file path.

        Args:
            file_path: Path to file

        Returns:
            DocumentMetadata object
        """
        stat = file_path.stat()

        # Determine subdirectory relative to source_dir
        relative = file_path.relative_to(self.source_dir)
        subdirectory = str(relative.parent) if relative.parent != Path('.') else "root"

        metadata = DocumentMetadata(
            file_path=file_path,
            filename=file_path.name,
            size_bytes=stat.st_size,
            extension=file_path.suffix,
            subdirectory=subdirectory,
            relative_path=str(relative)
        )

        logger.debug(
            "metadata_extracted",
            filename=file_path.name,
            size_bytes=stat.st_size,
            subdirectory=subdirectory
        )

        return metadata

    def get_summary(self) -> Dict[str, any]:
        """
        Get scan summary statistics.

        Returns:
            Dictionary with scan statistics

        Example:
            >>> parser = RepoParser(source_dir=Path("./source_materials"))
            >>> parser.scan_markdown_files()
            >>> summary = parser.get_summary()
            >>> print(f"Total size: {summary['total_size_mb']} MB")
        """
        if not self.scanned_documents:
            return {
                "total_documents": 0,
                "total_size_bytes": 0,
                "total_size_mb": 0.0,
                "by_subdirectory": {}
            }

        total_size = sum(doc.size_bytes for doc in self.scanned_documents)

        # Group by subdirectory
        by_subdir = {}
        for doc in self.scanned_documents:
            subdir = doc.subdirectory
            if subdir not in by_subdir:
                by_subdir[subdir] = {
                    'count': 0,
                    'size_bytes': 0
                }
            by_subdir[subdir]['count'] += 1
            by_subdir[subdir]['size_bytes'] += doc.size_bytes

        return {
            "total_documents": len(self.scanned_documents),
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "by_subdirectory": by_subdir
        }
