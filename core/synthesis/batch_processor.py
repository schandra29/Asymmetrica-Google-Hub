"""
Batch Processor - Williams-Optimized Document Batching

Orchestrates batch processing of documents using Williams optimizer
for batch sizing and Harmonic timer for rate limiting.

@complexity: O(n) for document processing, O(√t log t) for batch optimization
@lineage: (σ: "batch_processor", ρ: "synthesis", γ: "optimization", κ: O(n), λ: ["optimize → batch → process"])

Author: Asymmetrica R&D Laboratory
Date: October 8, 2025
"""

from typing import List, Callable, Any
from dataclasses import dataclass
import structlog

from .repo_parser import DocumentMetadata
from ..defensekit.williams_optimizer import WilliamsOptimizer
from ..defensekit.harmonic_timer import HarmonicTimer

logger = structlog.get_logger(__name__)


@dataclass
class Batch:
    """Batch of documents for processing."""

    batch_id: int
    documents: List[DocumentMetadata]
    total_size_bytes: int

    def __repr__(self) -> str:
        return f"Batch#{self.batch_id}(docs={len(self.documents)}, size={self.total_size_bytes} bytes)"


class BatchProcessor:
    """
    Williams-optimized batch processor.

    Creates optimal batches using Williams √t × log₂(t) formula and
    processes them with Tesla 4.909 Hz harmonic rate limiting.

    Attributes:
        williams: WilliamsOptimizer for batch sizing
        timer: HarmonicTimer for rate limiting
        batch_history: List of processed batches

    Example:
        >>> processor = BatchProcessor(
        ...     williams=WilliamsOptimizer(),
        ...     timer=HarmonicTimer()
        ... )
        >>> batches = processor.create_batches(documents, optimal_size=50)
        >>> for batch in batches:
        ...     await processor.process_batch(batch, synthesis_fn)
    """

    def __init__(
        self,
        williams: WilliamsOptimizer,
        timer: HarmonicTimer
    ):
        """
        Initialize Batch Processor.

        Args:
            williams: WilliamsOptimizer instance
            timer: HarmonicTimer instance
        """
        self.williams = williams
        self.timer = timer
        self.batch_history = []

        logger.info("batch_processor_initialized")

    def create_batches(
        self,
        documents: List[DocumentMetadata],
        batch_size: int
    ) -> List[Batch]:
        """
        Create batches from document list.

        Args:
            documents: List of DocumentMetadata to batch
            batch_size: Size of each batch

        Returns:
            List of Batch objects

        Example:
            >>> processor = BatchProcessor(williams, timer)
            >>> batches = processor.create_batches(docs, batch_size=50)
            >>> print(f"Created {len(batches)} batches")
        """
        batches = []
        batch_id = 1

        for i in range(0, len(documents), batch_size):
            batch_docs = documents[i:i + batch_size]
            total_size = sum(doc.size_bytes for doc in batch_docs)

            batch = Batch(
                batch_id=batch_id,
                documents=batch_docs,
                total_size_bytes=total_size
            )
            batches.append(batch)
            batch_id += 1

        logger.info(
            "batches_created",
            total_batches=len(batches),
            batch_size=batch_size,
            total_documents=len(documents)
        )

        return batches

    async def process_batch(
        self,
        batch: Batch,
        synthesis_fn: Callable[[Batch], Any]
    ) -> Any:
        """
        Process batch with harmonic rate limiting.

        Args:
            batch: Batch to process
            synthesis_fn: Async function to synthesize batch

        Returns:
            Result from synthesis_fn

        Example:
            >>> async def synthesize(batch):
            ...     return f"Processed {len(batch.documents)} docs"
            >>> result = await processor.process_batch(batch, synthesize)
        """
        # Apply harmonic rate limiting
        await self.timer.sleep_async(1)

        logger.info(
            "batch_processing_started",
            batch_id=batch.batch_id,
            document_count=len(batch.documents),
            total_size_bytes=batch.total_size_bytes
        )

        # Process batch
        result = await synthesis_fn(batch)

        # Track history
        self.batch_history.append(batch)

        logger.info(
            "batch_processing_complete",
            batch_id=batch.batch_id,
            document_count=len(batch.documents)
        )

        return result

    def get_statistics(self) -> dict:
        """
        Get batch processing statistics.

        Returns:
            Dictionary with processing stats

        Example:
            >>> stats = processor.get_statistics()
            >>> print(f"Batches processed: {stats['batches_processed']}")
        """
        if not self.batch_history:
            return {
                "batches_processed": 0,
                "documents_processed": 0,
                "total_size_bytes": 0
            }

        total_docs = sum(len(b.documents) for b in self.batch_history)
        total_size = sum(b.total_size_bytes for b in self.batch_history)

        return {
            "batches_processed": len(self.batch_history),
            "documents_processed": total_docs,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2)
        }
