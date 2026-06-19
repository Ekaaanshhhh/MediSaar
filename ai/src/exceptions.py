"""
MediSaar AI — Custom Exception Hierarchy.

All application-specific exceptions inherit from MediSaarError.
Each exception carries:
  - message: user-safe error message (returned to client)
  - detail: internal detail (logged server-side only)
  - status_code: HTTP status code for the response
"""

from typing import Optional


class MediSaarError(Exception):
    """Base exception for all MediSaar application errors."""

    def __init__(
        self,
        message: str = "An internal error occurred.",
        detail: Optional[str] = None,
        status_code: int = 500,
    ):
        self.message = message
        self.detail = detail or message
        self.status_code = status_code
        super().__init__(self.message)


class OCRProcessingError(MediSaarError):
    """Raised when OCR extraction fails."""

    def __init__(
        self,
        detail: str = "OCR processing encountered an error.",
    ):
        super().__init__(
            message="Failed to extract text from the document.",
            detail=detail,
            status_code=500,
        )


class MedicalExtractionError(MediSaarError):
    """Raised when medical entity extraction from LLM fails."""

    def __init__(
        self,
        detail: str = "Medical data extraction failed.",
    ):
        super().__init__(
            message="Failed to extract medical information from the document.",
            detail=detail,
            status_code=500,
        )


class VectorStoreError(MediSaarError):
    """Raised when ChromaDB operations fail."""

    def __init__(
        self,
        detail: str = "Vector store operation failed.",
    ):
        super().__init__(
            message="Failed to store or retrieve records from the vector database.",
            detail=detail,
            status_code=500,
        )


class SummaryGenerationError(MediSaarError):
    """Raised when AI summary generation fails."""

    def __init__(
        self,
        detail: str = "Summary generation encountered an error.",
    ):
        super().__init__(
            message="Failed to generate the medical summary.",
            detail=detail,
            status_code=500,
        )


class RAGRetrievalError(MediSaarError):
    """Raised when RAG-based retrieval fails."""

    def __init__(
        self,
        detail: str = "RAG retrieval encountered an error.",
    ):
        super().__init__(
            message="Failed to retrieve patient history.",
            detail=detail,
            status_code=500,
        )


class ConfigurationError(MediSaarError):
    """Raised when a required configuration is missing or invalid."""

    def __init__(
        self,
        detail: str = "Application configuration is invalid.",
    ):
        super().__init__(
            message="Service configuration error. Please contact support.",
            detail=detail,
            status_code=503,
        )
