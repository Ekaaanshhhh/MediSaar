from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from loguru import logger
from typing import Dict
from datetime import datetime

from ai.config.settings import settings

from ai.src.rag.embedding_service import (
    EmbeddingService
)
from ai.src.rag.text_chunker import (
    TextChunker
)
from ai.src.rag.vector_store import (
    VectorStore
)
from ai.src.rag.retrieval import (
    RAGRetrieval
)
from ai.src.llm.summary_generator import (
    SummaryGenerator
)

router = APIRouter(
    prefix="/summary",
    tags=["Summary"]
)


# Initialize Dependencies


embedding_service = (
    EmbeddingService()
)

chunker = TextChunker()

vector_store = VectorStore(
    embedding_service=embedding_service,
    chunker=chunker,
    persist_dir=settings.chromadb_path
)

rag_retrieval = RAGRetrieval(
    vector_store
)

summary_generator = SummaryGenerator(
    settings.groq_api_key,
    rag_retrieval
)



# Request Schema


class SummaryRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        description="Unique patient ID"
    )

    medical_record: Dict



# Response Schema


class SummaryResponse(BaseModel):
    patient_id: str
    summary: str
    critical_info: Dict
    history_found: bool
    generated_at: str
    status: str



# Generate Summary Endpoint


@router.post(
    "/generate",
    response_model=SummaryResponse,
    status_code=status.HTTP_200_OK
)
async def generate_summary(
    request: SummaryRequest
):
    """
    Generate AI medical summary
    using patient historical context.
    """

    try:
        logger.info(
            f"Generating summary "
            f"for patient "
            f"{request.patient_id}"
        )

        # Retrieve history context
        retrieval_query = ""

        if request.medical_record.get("diagnoses"):
            diagnoses = [
                d.get("disease", "")
                for d in request.medical_record["diagnoses"]
            ]
            retrieval_query += " ".join(diagnoses)

        if request.medical_record.get("lab_reports"):
            abnormal_tests = [
                lab.get("test_name", "")
                for lab in request.medical_record["lab_reports"]
                if lab.get("status") == "abnormal"
            ]
            retrieval_query += " " + " ".join(abnormal_tests)

        # Fallback query
        if not retrieval_query.strip():
            retrieval_query = (
                "patient medical history"
            )

        history_context = (
            rag_retrieval.retrieve_patient_history(
                patient_id=request.patient_id,
                query=retrieval_query,   # <-- STRING
                top_k=5
            )
        )

        history_found = (
            history_context
            != "No previous medical records found."
        )

        # Generate AI summary
        summary = (
            summary_generator
            .generate_summary(
                patient_id=request.patient_id,
                medical_record=(request.medical_record)
            )
        )

        # Extract critical medical info
        critical_info = (
            summary_generator
            .highlight_critical_info(
                request.medical_record
            )
        )

        logger.success(
            f"Summary generated "
            f"for patient "
            f"{request.patient_id}"
        )

        return SummaryResponse(
            patient_id=request.patient_id,
            summary=summary,
            critical_info=critical_info,
            history_found=history_found,
            generated_at=(
                datetime.utcnow()
                .isoformat()
            ),
            status="success"
        )

    except ValueError as e:
        logger.error(
            f"Validation error: "
            f"{str(e)}"
        )

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        logger.exception(
            f"Summary generation "
            f"failed: {str(e)}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate "
                "medical summary"
            )
        )