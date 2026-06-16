from sentence_transformers import SentenceTransformer
from typing import List
from loguru import logger
import numpy as np


class EmbeddingService:

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2"
    ):
        try:
            logger.info(
                f"Loading embedding model: {model_name}"
            )

            self.model = SentenceTransformer(
                model_name
            )

            logger.info(
                "Embedding model loaded successfully"
            )

        except Exception as e:
            logger.error(
                f"Embedding model load failed: {str(e)}"
            )
            raise

    def embed_text(
        self,
        text: str
    ) -> np.ndarray:

        embedding = self.model.encode(
            text,
            convert_to_numpy=True
        )

        return embedding

    def embed_batch(
        self,
        texts: List[str]
    ) -> np.ndarray:
        embeddings = self.model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True
        )

        return embeddings