"""
Google API Authentication Handler

Handles service account authentication for Google Workspace APIs with
secure credential management and token refresh.

@complexity: O(1) - Authentication operations
@security: Service account with domain-wide delegation
@lineage: (σ: "auth", ρ: "google_api", γ: "stability", κ: O(1), λ: ["load_credentials → authenticate → validate"])

Author: Asymmetrica R&D Laboratory
Date: October 8, 2025
"""

from pathlib import Path
from typing import List, Optional
import structlog

from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = structlog.get_logger(__name__)


class GoogleAuthHandler:
    """
    Google API Authentication Handler.

    Manages service account authentication for Google Docs and Drive APIs
    with automatic token refresh and scope validation.

    Attributes:
        credentials_path: Path to service account JSON file
        scopes: List of Google API scopes required
        credentials: Google service account credentials object
        is_authenticated: Whether credentials are currently valid

    Example:
        >>> auth = GoogleAuthHandler(
        ...     credentials_path=Path("./credentials.json"),
        ...     scopes=['https://www.googleapis.com/auth/documents']
        ... )
        >>> auth.authenticate()
        >>> docs_service = auth.get_service('docs', 'v1')
    """

    def __init__(
        self,
        credentials_path: Path,
        scopes: Optional[List[str]] = None
    ):
        """
        Initialize Google Auth Handler.

        Args:
            credentials_path: Path to service account JSON credentials
            scopes: List of API scopes (default: Docs + Drive)
        """
        self.credentials_path = credentials_path
        self.scopes = scopes or [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive.file'
        ]
        self.credentials = None
        self.is_authenticated = False

        logger.info(
            "google_auth_handler_initialized",
            credentials_path=str(credentials_path),
            scopes=self.scopes
        )

    def authenticate(self) -> bool:
        """
        Authenticate using service account credentials.

        Returns:
            True if authentication successful, False otherwise

        Raises:
            FileNotFoundError: If credentials file not found
            ValueError: If credentials are invalid

        Example:
            >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
            >>> if auth.authenticate():
            ...     print("Authentication successful!")
        """
        if not self.credentials_path.exists():
            error_msg = f"Credentials file not found: {self.credentials_path}"
            logger.error("credentials_file_not_found", path=str(self.credentials_path))
            raise FileNotFoundError(error_msg)

        try:
            # Load service account credentials
            self.credentials = service_account.Credentials.from_service_account_file(
                str(self.credentials_path),
                scopes=self.scopes
            )

            # Validate credentials by refreshing token
            if self.credentials.expired or not self.credentials.valid:
                self.credentials.refresh(Request())

            self.is_authenticated = True

            logger.info(
                "google_auth_success",
                service_account_email=self.credentials.service_account_email,
                scopes=len(self.scopes)
            )

            return True

        except Exception as e:
            logger.error(
                "google_auth_failed",
                error=str(e),
                credentials_path=str(self.credentials_path)
            )
            self.is_authenticated = False
            raise ValueError(f"Authentication failed: {e}")

    def get_service(self, service_name: str, version: str):
        """
        Get authenticated Google API service.

        Args:
            service_name: Name of the service (e.g., 'docs', 'drive')
            version: API version (e.g., 'v1', 'v3')

        Returns:
            Authenticated Google API service object

        Raises:
            RuntimeError: If not authenticated
            HttpError: If service build fails

        Example:
            >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
            >>> auth.authenticate()
            >>> docs_service = auth.get_service('docs', 'v1')
            >>> drive_service = auth.get_service('drive', 'v3')
        """
        if not self.is_authenticated:
            error_msg = "Not authenticated. Call authenticate() first."
            logger.error("service_requested_without_auth")
            raise RuntimeError(error_msg)

        try:
            service = build(service_name, version, credentials=self.credentials)

            logger.info(
                "google_service_built",
                service_name=service_name,
                version=version
            )

            return service

        except HttpError as e:
            logger.error(
                "google_service_build_failed",
                service_name=service_name,
                version=version,
                error=str(e)
            )
            raise

    def refresh_credentials(self) -> bool:
        """
        Refresh authentication credentials.

        Returns:
            True if refresh successful, False otherwise

        Example:
            >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
            >>> auth.authenticate()
            >>> # ... later ...
            >>> auth.refresh_credentials()  # Refresh before expiry
        """
        if not self.credentials:
            logger.warning("refresh_credentials_called_without_auth")
            return self.authenticate()

        try:
            self.credentials.refresh(Request())
            self.is_authenticated = True

            logger.info("google_credentials_refreshed")
            return True

        except Exception as e:
            logger.error("google_credentials_refresh_failed", error=str(e))
            self.is_authenticated = False
            return False

    def validate_scopes(self, required_scopes: List[str]) -> bool:
        """
        Validate that current credentials have required scopes.

        Args:
            required_scopes: List of scopes to check

        Returns:
            True if all required scopes present, False otherwise

        Example:
            >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
            >>> auth.authenticate()
            >>> has_docs = auth.validate_scopes(['https://www.googleapis.com/auth/documents'])
        """
        if not self.credentials:
            logger.warning("validate_scopes_called_without_auth")
            return False

        current_scopes = set(self.credentials.scopes or [])
        required = set(required_scopes)

        missing = required - current_scopes

        if missing:
            logger.warning(
                "missing_required_scopes",
                missing_scopes=list(missing)
            )
            return False

        logger.debug("scopes_validated", scopes=list(required))
        return True

    def get_auth_info(self) -> dict:
        """
        Get authentication information for debugging.

        Returns:
            Dictionary with authentication status and details

        Example:
            >>> auth = GoogleAuthHandler(credentials_path=Path("./credentials.json"))
            >>> auth.authenticate()
            >>> info = auth.get_auth_info()
            >>> print(f"Authenticated as: {info['service_account_email']}")
        """
        if not self.credentials:
            return {
                "is_authenticated": False,
                "service_account_email": None,
                "scopes": self.scopes,
                "credentials_path": str(self.credentials_path)
            }

        return {
            "is_authenticated": self.is_authenticated,
            "service_account_email": self.credentials.service_account_email,
            "scopes": self.credentials.scopes or self.scopes,
            "credentials_path": str(self.credentials_path),
            "token_valid": self.credentials.valid,
            "token_expired": self.credentials.expired
        }
