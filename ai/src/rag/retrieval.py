from typing import List, Dict
from .vector_store import VectorStore
from loguru import logger


class RAGRetrieval:

    def __init__(
        self,
        vector_store: VectorStore
    ):
        self.vector_store = vector_store

    def retrieve_patient_history(
        self,
        patient_id: str,
        query: str,
        top_k: int = 5
    ) -> str:

        try:
            similar_records = (
                self.vector_store
                .retrieve_similar_records(
                    query=query,
                    patient_id=patient_id,
                    top_k=top_k
                )
            )

            if not similar_records:
                return (
                    "No previous medical "
                    "records found."
                )

            context_parts = [
                "PATIENT MEDICAL HISTORY",
                "",
                "Relevant historical records:"
            ]

            seen_texts = set()

            for i, record in enumerate(
                similar_records,
                1
            ):
                text = record["text"].strip()

                # Remove duplicates
                if text in seen_texts:
                    continue

                seen_texts.add(text)

                metadata = record.get(
                    "metadata", {}
                )

                relevance = record.get(
                    "score",
                    "N/A"
                )

                document_type = (
                    metadata.get(
                        "document_type",
                        "Unknown"
                    )
                )

                hospital = metadata.get(
                    "hospital",
                    "Unknown"
                )

                date = metadata.get(
                    "date",
                    "Unknown"
                )

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

            context = "\n".join(
                context_parts
            )

            logger.info(
                f"Retrieved "
                f"{len(similar_records)} "
                f"records for RAG"
            )

            return context

        except Exception as e:
            logger.error(
                f"RAG retrieval failed: "
                f"{str(e)}"
            )
            raise