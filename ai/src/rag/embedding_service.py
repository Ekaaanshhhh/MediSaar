"""
MediSaar AI — Embedding Service.

Thread-safe wrapper around SentenceTransformers for generating
text embeddings. Supports single-text and batch operations.
"""

import threading
from typing import List

import numpy as np
from loguru import logger
from sentence_transformers import SentenceTransformer


class EmbeddingService:
    """
    Thread-safe embedding service using SentenceTransformers.

    Args:
        model_name: HuggingFace model identifier for embeddings.
    """

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
    ):
        try:
            logger.info(
                "Loading embedding model: {model}",
                model=model_name,
            )
            self.model = SentenceTransformer(model_name)
            self._lock = threading.Lock()
            logger.info("Embedding model loaded successfully")

        except Exception as e:
            logger.error(
                "Embedding model load failed: {error}",
                error=str(e),
            )
            raise

    def embed_text(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text string.

        Args:
            text: Input text to embed.

        Returns:
            Numpy array of the embedding vector.
        """
        with self._lock:
            embedding = self.model.encode(
                text,
                convert_to_numpy=True,
            )
        return embedding

    def embed_batch(
        self,
        texts: List[str],
        batch_size: int = 32,
    ) -> np.ndarray:
        """
        Generate embeddings for a batch of texts.

        Args:
            texts: List of text strings to embed.
            batch_size: Number of texts per encoding batch.

        Returns:
            Numpy array of shape (len(texts), embedding_dim).
        """
        with self._lock:
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
        return embeddings