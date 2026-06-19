"""
MediSaar AI — RAG Retrieval Service.

Retrieves and formats patient medical history context
from the vector store for use in LLM prompts.
"""

from typing import List, Dict

from loguru import logger

from ai.src.exceptions import RAGRetrievalError
from ai.src.rag.vector_store import VectorStore


class RAGRetrieval:
    """
    Retrieves relevant patient history from ChromaDB
    and formats it as context for LLM summarization.

    Args:
        vector_store: Shared VectorStore instance.
    """

    NO_RECORDS_MESSAGE = "No previous medical records found."

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store

    def retrieve_patient_history(
        self,
        patient_id: str,
        query: str,
        top_k: int = 5,
    ) -> str:
        """
        Retrieve and format patient history as a context string.

        Args:
            patient_id: Patient to retrieve history for.
            query: Semantic search query.
            top_k: Maximum number of records to retrieve.

        Returns:
            Formatted context string for LLM prompt injection.

        Raises:
            RAGRetrievalError: If retrieval fails.
        """
        try:
            similar_records = self.vector_store.retrieve_similar_records(
                query=query,
                patient_id=patient_id,
                top_k=top_k,
            )

            if not similar_records:
                return self.NO_RECORDS_MESSAGE

            context_parts = [
                "PATIENT MEDICAL HISTORY",
                "",
                "Relevant historical records:",
            ]

            seen_texts = set()

            for i, record in enumerate(similar_records, 1):
                text = record["text"].strip()

                # Remove duplicates
                if text in seen_texts:
                    continue
                seen_texts.add(text)

                metadata = record.get("metadata", {})
                relevance = record.get("score", "N/A")

                # Use correct metadata keys (matching what upload stores)
                document_type = metadata.get("document_type", "Unknown")
                hospital = metadata.get("hospital_id", "Unknown")
                date = metadata.get("upload_date", "Unknown")

                context_parts.append(
                    f"""
Record {i}
Relevance Score: {relevance}
Document Type: {document_type}
Hospital: {hospital}
Date: {date}

Content:
{text}

--------------------------------
"""
                )

            context = "\n".join(context_parts)

            logger.info(
                "Retrieved {count} records for RAG context",
                count=len(similar_records),
            )

            return context

        except Exception as e:
            logger.error("RAG retrieval failed: {error}", error=str(e))
            raise RAGRetrievalError(
                detail=f"Patient history retrieval failed: {str(e)}"
            )