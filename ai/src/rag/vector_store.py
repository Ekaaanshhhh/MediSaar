import uuid
import chromadb
from loguru import logger
from typing import List, Dict, Optional

from src.rag.embedding_service import EmbeddingService
from src.rag.text_chunker import TextChunker


class VectorStore:
    def __init__(
        self,
        embedding_service: EmbeddingService,
        chunker: TextChunker,
        persist_dir: str = "./chroma_db"
    ):
        self.embedding_service = embedding_service
        self.chunker = chunker

        self.client = chromadb.PersistentClient(
            path=persist_dir
        )

        self.collection = (
            self.client.get_or_create_collection(
                name="patient_records",
                metadata={
                    "hnsw:space": "cosine"
                }
            )
        )

        logger.info(
            "Vector store initialized"
        )

    def add_patient_record(
        self,
        patient_id: str,
        record_text: str,
        metadata: Optional[Dict] = None
    ) -> None:

        try:
            chunks = self.chunker.split_text(
                record_text
            )

            if not chunks:
                logger.warning(
                    "No chunks generated"
                )
                return

            embeddings = (
                self.embedding_service.embed_batch(
                    chunks
                )
            )

            ids = []
            documents = []
            metadatas = []

            for idx, chunk in enumerate(chunks):

                chunk_id = (
                    f"{patient_id}_"
                    f"{uuid.uuid4()}"
                )

                chunk_metadata = {
                    "patient_id": patient_id,
                    "chunk_index": idx,
                    **(metadata or {})
                }

                ids.append(chunk_id)
                documents.append(chunk)
                metadatas.append(chunk_metadata)

            self.collection.add(
                ids=ids,
                embeddings=embeddings.tolist(),
                documents=documents,
                metadatas=metadatas
            )

            logger.info(
                f"Stored {len(chunks)} chunks "
                f"for patient {patient_id}"
            )

        except Exception as e:
            logger.error(
                f"Failed to add record: {str(e)}"
            )
            raise

    def retrieve_similar_records(
        self,
        query: str,
        patient_id: str,
        top_k: int = 5
    ) -> List[Dict]:

        try:
            query_embedding = (
                self.embedding_service
                .embed_text(query)
            )

            results = self.collection.query(
                query_embeddings=[
                    query_embedding.tolist()
                ],
                where={
                    "patient_id": patient_id
                },
                n_results=top_k
            )

            retrieved = []

            documents = results.get(
                "documents", [[]]
            )[0]

            distances = results.get(
                "distances", [[]]
            )[0]

            metadatas = results.get(
                "metadatas", [[]]
            )[0]

            for doc, dist, meta in zip(
                documents,
                distances,
                metadatas
            ):

                similarity = round(
                    1 - dist,
                    3
                )

                retrieved.append({
                    "text": doc,
                    "score": similarity,
                    "metadata": meta
                })

            logger.info(
                f"Retrieved "
                f"{len(retrieved)} chunks "
                f"for patient {patient_id}"
            )

            return retrieved

        except Exception as e:
            logger.error(
                f"Retrieval failed: {str(e)}"
            )
            raise
    def close(self):
        try:
            self.client.reset()
        except Exception:
            pass