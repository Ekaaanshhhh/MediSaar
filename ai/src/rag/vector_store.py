"""
MediSaar AI — ChromaDB Vector Store.

Stores and retrieves patient medical records as vector embeddings.
Uses deterministic chunk IDs for deduplication and coerces metadata
values to strings for ChromaDB compatibility.
"""

import hashlib
from typing import Dict, List, Optional

import chromadb
from loguru import logger

from ai.src.exceptions import VectorStoreError
from ai.src.rag.embedding_service import EmbeddingService
from ai.src.rag.text_chunker import TextChunker


class VectorStore:
    """
    ChromaDB-backed vector store for patient medical records.

    Args:
        embedding_service: Shared EmbeddingService instance.
        chunker: Shared TextChunker instance.
        persist_dir: Directory for ChromaDB persistent storage.
    """

    # ChromaDB batch size limit
    MAX_BATCH_SIZE = 5000

    def __init__(
        self,
        embedding_service: EmbeddingService,
        chunker: TextChunker,
        persist_dir: str = "./chroma_db",
    ):
        self.embedding_service = embedding_service
        self.chunker = chunker

        try:
            self.client = chromadb.PersistentClient(
                path=persist_dir,
            )

            self.collection = self.client.get_or_create_collection(
                name="patient_records",
                metadata={"hnsw:space": "cosine"},
            )

            logger.info("Vector store initialized at {path}", path=persist_dir)

        except Exception as e:
            logger.error("Vector store initialization failed: {error}", error=str(e))
            raise VectorStoreError(
                detail=f"ChromaDB initialization failed: {str(e)}"
            )

    @staticmethod
    def _sanitize_metadata(metadata: Optional[Dict]) -> Dict[str, str]:
        """
        Coerce all metadata values to strings for ChromaDB compatibility.
        ChromaDB only accepts str, int, float, or bool metadata values.
        """
        if not metadata:
            return {}

        sanitized = {}
        for key, value in metadata.items():
            if value is None:
                sanitized[key] = ""
            elif isinstance(value, (str, int, float, bool)):
                sanitized[key] = str(value)
            else:
                sanitized[key] = str(value)
        return sanitized

    @staticmethod
    def _deterministic_id(patient_id: str, chunk_content: str, index: int) -> str:
        """
        Generate a deterministic chunk ID from patient_id + content hash.
        Enables deduplication — re-uploading the same content won't create duplicates.
        """
        content_hash = hashlib.sha256(
            f"{patient_id}:{chunk_content}:{index}".encode()
        ).hexdigest()[:16]
        return f"{patient_id}_{content_hash}"

    def add_patient_record(
        self,
        patient_id: str,
        record_text: str,
        metadata: Optional[Dict] = None,
    ) -> None:
        """
        Chunk, embed, and store a patient record in ChromaDB.

        Args:
            patient_id: Unique patient identifier.
            record_text: Full text of the medical record.
            metadata: Optional metadata dict to attach to each chunk.

        Raises:
            VectorStoreError: If storage operation fails.
        """
        try:
            chunks = self.chunker.split_text(record_text)

            if not chunks:
                logger.warning("No chunks generated for patient {pid}", pid=patient_id)
                return

            embeddings = self.embedding_service.embed_batch(chunks)
            sanitized_meta = self._sanitize_metadata(metadata)

            ids = []
            documents = []
            metadatas = []

            for idx, chunk in enumerate(chunks):
                chunk_id = self._deterministic_id(patient_id, chunk, idx)

                chunk_metadata = {
                    "patient_id": patient_id,
                    "chunk_index": str(idx),
                    **sanitized_meta,
                }

                ids.append(chunk_id)
                documents.append(chunk)
                metadatas.append(chunk_metadata)

            # Batch insert respecting ChromaDB limits
            for batch_start in range(0, len(ids), self.MAX_BATCH_SIZE):
                batch_end = batch_start + self.MAX_BATCH_SIZE
                self.collection.upsert(
                    ids=ids[batch_start:batch_end],
                    embeddings=embeddings[batch_start:batch_end].tolist(),
                    documents=documents[batch_start:batch_end],
                    metadatas=metadatas[batch_start:batch_end],
                )

            logger.info(
                "Stored {count} chunks for patient {pid}",
                count=len(chunks),
                pid=patient_id,
            )

        except VectorStoreError:
            raise
        except Exception as e:
            logger.error("Failed to add record: {error}", error=str(e))
            raise VectorStoreError(
                detail=f"Failed to store patient record: {str(e)}"
            )

    def retrieve_similar_records(
        self,
        query: str,
        patient_id: str,
        top_k: int = 5,
    ) -> List[Dict]:
        """
        Retrieve the most similar record chunks for a patient.

        Args:
            query: Search query text.
            patient_id: Filter results to this patient.
            top_k: Maximum number of results to return.

        Returns:
            List of dicts with 'text', 'score', and 'metadata' keys.

        Raises:
            VectorStoreError: If retrieval fails.
        """
        try:
            query_embedding = self.embedding_service.embed_text(query)

            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                where={"patient_id": patient_id},
                n_results=top_k,
            )

            retrieved = []

            documents = results.get("documents", [[]])[0]
            distances = results.get("distances", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]

            for doc, dist, meta in zip(documents, distances, metadatas):
                similarity = round(1 - dist, 3)
                retrieved.append({
                    "text": doc,
                    "score": similarity,
                    "metadata": meta,
                })

            logger.info(
                "Retrieved {count} chunks for patient {pid}",
                count=len(retrieved),
                pid=patient_id,
            )

            return retrieved

        except VectorStoreError:
            raise
        except Exception as e:
            logger.error("Retrieval failed: {error}", error=str(e))
            raise VectorStoreError(
                detail=f"Record retrieval failed: {str(e)}"
            )

    def close(self) -> None:
        """Release ChromaDB client resources."""
        try:
            if hasattr(self, "client") and self.client is not None:
                # PersistentClient doesn't have explicit close,
                # but we clear references to allow GC
                self.client = None
                self.collection = None
                logger.info("Vector store closed")
        except Exception as e:
            logger.warning("Vector store close warning: {error}", error=str(e))