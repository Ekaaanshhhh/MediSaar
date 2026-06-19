"""
MediSaar AI — Text Chunker.

Splits text into overlapping chunks for embedding and vector storage.
Uses LangChain's RecursiveCharacterTextSplitter.
"""

from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from loguru import logger


class TextChunker:
    """
    Splits text into chunks suitable for embedding generation.

    Args:
        chunk_size: Maximum characters per chunk.
        chunk_overlap: Overlap between consecutive chunks.
    """

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 100,
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", ", ", " "],
        )

        logger.debug(
            "TextChunker initialized | chunk_size={size}, overlap={overlap}",
            size=chunk_size,
            overlap=chunk_overlap,
        )

    def split_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks.

        Args:
            text: Input text to split.

        Returns:
            List of text chunks. Empty list if input is blank.
        """
        if not text.strip():
            return []

        chunks = self.text_splitter.split_text(text)

        logger.debug("Created {count} chunks", count=len(chunks))

        return chunks