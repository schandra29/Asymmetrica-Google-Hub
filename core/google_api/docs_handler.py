"""
Google Docs API Handler with Harmonic Rate Limiting

Provides read/write operations for Google Docs with Tesla 4.909 Hz
harmonic rate limiting for deterministic API usage.

@complexity: O(n) for document operations where n = content length
@rate_limit: ~4.9 requests/second (Tesla harmonic)
@lineage: (σ: "docs_handler", ρ: "google_api", γ: "balance", κ: O(n), λ: ["auth → rate_limit → api_call"])

Author: Asymmetrica R&D Laboratory
Date: October 8, 2025
"""

from typing import Optional, List, Dict
import structlog

from googleapiclient.errors import HttpError

from .auth import GoogleAuthHandler
from ..defensekit.harmonic_timer import HarmonicTimer, HarmonicMultiple

logger = structlog.get_logger(__name__)


class GoogleDocsHandler:
    """
    Google Docs API Handler with Harmonic Rate Limiting.

    Manages read/write operations to Google Docs with Tesla 4.909 Hz
    harmonic timing to prevent API rate limit violations.

    Attributes:
        auth_handler: Google authentication handler
        timer: Harmonic timer for rate limiting
        docs_service: Google Docs API service object
        rate_limit_multiple: Harmonic multiple for rate limiting (default: 1)

    Example:
        >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
        >>> auth.authenticate()
        >>> docs = GoogleDocsHandler(auth_handler=auth)
        >>> await docs.append_to_doc(
        ...     doc_id="1GzcIPyX...",
        ...     content="New synthesis results..."
        ... )
    """

    def __init__(
        self,
        auth_handler: GoogleAuthHandler,
        rate_limit_multiple: int = 1
    ):
        """
        Initialize Google Docs Handler.

        Args:
            auth_handler: Authenticated GoogleAuthHandler instance
            rate_limit_multiple: Harmonic multiple for rate limiting (default: 1)
        """
        self.auth_handler = auth_handler
        self.timer = HarmonicTimer()
        self.rate_limit_multiple = rate_limit_multiple
        self.docs_service = None
        self.api_call_count = 0

        logger.info(
            "google_docs_handler_initialized",
            rate_limit_hz=4.909 / rate_limit_multiple,
            harmonic_multiple=rate_limit_multiple
        )

    def _ensure_service(self):
        """Ensure Docs API service is initialized."""
        if self.docs_service is None:
            self.docs_service = self.auth_handler.get_service('docs', 'v1')

    async def _rate_limited_call(self, operation_name: str):
        """
        Apply harmonic rate limiting before API call.

        Args:
            operation_name: Name of the operation for logging
        """
        await self.timer.sleep_async(self.rate_limit_multiple)
        self.api_call_count += 1

        logger.debug(
            "harmonic_rate_limit_applied",
            operation=operation_name,
            total_calls=self.api_call_count,
            delay_ms=self.timer.calculate_delay(self.rate_limit_multiple).period_ms
        )

    async def read_document(self, doc_id: str) -> Dict:
        """
        Read Google Doc content with rate limiting.

        Args:
            doc_id: Google Doc ID

        Returns:
            Document object with content and metadata

        Raises:
            HttpError: If API call fails

        Example:
            >>> doc = await docs.read_document("1GzcIPyX...")
            >>> print(doc['title'])
            "Asymmetrica Synthesis Report"
        """
        self._ensure_service()
        await self._rate_limited_call("read_document")

        try:
            document = self.docs_service.documents().get(documentId=doc_id).execute()

            logger.info(
                "document_read_success",
                doc_id=doc_id,
                title=document.get('title'),
                revision_id=document.get('revisionId')
            )

            return document

        except HttpError as e:
            logger.error(
                "document_read_failed",
                doc_id=doc_id,
                error=str(e)
            )
            raise

    async def append_to_doc(
        self,
        doc_id: str,
        content: str,
        heading: Optional[str] = None
    ) -> Dict:
        """
        Append content to end of Google Doc with rate limiting.

        Args:
            doc_id: Google Doc ID
            content: Text content to append
            heading: Optional heading to insert before content

        Returns:
            API response with revision details

        Raises:
            HttpError: If API call fails

        Example:
            >>> await docs.append_to_doc(
            ...     doc_id="1GzcIPyX...",
            ...     content="New synthesis batch complete!",
            ...     heading="Batch #42 Results"
            ... )
        """
        self._ensure_service()
        await self._rate_limited_call("append_to_doc")

        try:
            # Get current document to find end index
            document = self.docs_service.documents().get(documentId=doc_id).execute()
            end_index = document['body']['content'][-1]['endIndex'] - 1

            # Build requests list
            requests = []

            # Add heading if provided
            if heading:
                requests.extend([
                    {
                        'insertText': {
                            'location': {'index': end_index},
                            'text': f'\n\n{heading}\n'
                        }
                    },
                    {
                        'updateParagraphStyle': {
                            'range': {
                                'startIndex': end_index + 2,
                                'endIndex': end_index + 2 + len(heading) + 1
                            },
                            'paragraphStyle': {
                                'namedStyleType': 'HEADING_2'
                            },
                            'fields': 'namedStyleType'
                        }
                    }
                ])
                end_index += len(heading) + 3

            # Add content
            requests.append({
                'insertText': {
                    'location': {'index': end_index},
                    'text': f'{content}\n'
                }
            })

            # Execute batch update
            result = self.docs_service.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': requests}
            ).execute()

            logger.info(
                "document_append_success",
                doc_id=doc_id,
                content_length=len(content),
                has_heading=heading is not None,
                revision_id=result.get('documentId')
            )

            return result

        except HttpError as e:
            logger.error(
                "document_append_failed",
                doc_id=doc_id,
                error=str(e)
            )
            raise

    async def create_document(
        self,
        title: str,
        initial_content: Optional[str] = None
    ) -> str:
        """
        Create new Google Doc with rate limiting.

        Args:
            title: Document title
            initial_content: Optional initial content

        Returns:
            Document ID of created document

        Raises:
            HttpError: If API call fails

        Example:
            >>> doc_id = await docs.create_document(
            ...     title="New Synthesis Report",
            ...     initial_content="Report initialized..."
            ... )
            >>> print(f"Created: {doc_id}")
        """
        self._ensure_service()
        await self._rate_limited_call("create_document")

        try:
            # Create document
            document = self.docs_service.documents().create(
                body={'title': title}
            ).execute()

            doc_id = document['documentId']

            # Add initial content if provided
            if initial_content:
                await self.append_to_doc(doc_id, initial_content)

            logger.info(
                "document_created",
                doc_id=doc_id,
                title=title,
                has_initial_content=initial_content is not None
            )

            return doc_id

        except HttpError as e:
            logger.error(
                "document_create_failed",
                title=title,
                error=str(e)
            )
            raise

    async def insert_at_index(
        self,
        doc_id: str,
        content: str,
        index: int
    ) -> Dict:
        """
        Insert content at specific index with rate limiting.

        Args:
            doc_id: Google Doc ID
            content: Text content to insert
            index: Character index for insertion

        Returns:
            API response with revision details

        Raises:
            HttpError: If API call fails

        Example:
            >>> await docs.insert_at_index(
            ...     doc_id="1GzcIPyX...",
            ...     content="URGENT: ",
            ...     index=1  # Insert at beginning
            ... )
        """
        self._ensure_service()
        await self._rate_limited_call("insert_at_index")

        try:
            result = self.docs_service.documents().batchUpdate(
                documentId=doc_id,
                body={
                    'requests': [{
                        'insertText': {
                            'location': {'index': index},
                            'text': content
                        }
                    }]
                }
            ).execute()

            logger.info(
                "document_insert_success",
                doc_id=doc_id,
                index=index,
                content_length=len(content)
            )

            return result

        except HttpError as e:
            logger.error(
                "document_insert_failed",
                doc_id=doc_id,
                index=index,
                error=str(e)
            )
            raise

    def get_api_stats(self) -> Dict[str, any]:
        """
        Get API usage statistics.

        Returns:
            Dictionary with API call counts and rate limit info

        Example:
            >>> stats = docs.get_api_stats()
            >>> print(f"Total API calls: {stats['total_calls']}")
        """
        return {
            "total_calls": self.api_call_count,
            "rate_limit_hz": 4.909 / self.rate_limit_multiple,
            "harmonic_multiple": self.rate_limit_multiple,
            "base_period_ms": self.timer.base_period_ms
        }
