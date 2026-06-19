"""
MediSaar AI — AI Summary Generation Endpoint.

Generates AI medical summaries using patient history context
via RAG retrieval and Groq LLM. Stores generated summaries
in PostgreSQL for persistence. All heavy operations are
offloaded to the thread pool executor.
"""

import asyncio
from datetime import datetime, timezone
from functools import partial
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ai.src.database.models import PatientSummary
from ai.src.database.postgres_client import get_db
from ai.src.llm.summary_generator import SummaryGenerator
from ai.src.rag.retrieval import RAGRetrieval
from ai.src.services import get_rag_retrieval, get_summary_generator


router = APIRouter(
    prefix="/summary",
    tags=["Summary"],
)


# ── Request / Response Models ────────────────────────────────────


class SummaryRequest(BaseModel):
    patient_id: str = Field(
        ...,
        min_length=1,
        description="Unique patient ID",
    )
    medical_record: Dict[str, Any]


class SummaryResponse(BaseModel):
    patient_id: str
    summary: str
    critical_info: Dict[str, Any]
    history_found: bool
    generated_at: str
    status: str


# ── Generate Summary Endpoint ────────────────────────────────────


@router.post(
    "/generate",
    response_model=SummaryResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_summary(
    request: SummaryRequest,
    rag_retrieval: RAGRetrieval = Depends(get_rag_retrieval),
    summary_generator: SummaryGenerator = Depends(get_summary_generator),
    db: Session = Depends(get_db),
):
    """
    Generate AI medical summary using patient historical context.
    Stores the generated summary in PostgreSQL.
    """
    try:
        logger.info(
            "Generating summary for patient {pid}",
            pid=request.patient_id,
        )

        loop = asyncio.get_event_loop()

        # ── Retrieve history context ─────────────────────────────
        retrieval_query = SummaryGenerator._build_rag_query(
            request.medical_record
        )

        history_context = await loop.run_in_executor(
            None,
            partial(
                rag_retrieval.retrieve_patient_history,
                patient_id=request.patient_id,
                query=retrieval_query,
                top_k=5,
            ),
        )

        history_found = (
            history_context != RAGRetrieval.NO_RECORDS_MESSAGE
        )

        # ── Generate AI summary (LLM I/O → thread pool) ─────────
        summary = await loop.run_in_executor(
            None,
            partial(
                summary_generator.generate_summary,
                patient_id=request.patient_id,
                medical_record=request.medical_record,
            ),
        )

        # ── Extract critical info ────────────────────────────────
        critical_info = summary_generator.highlight_critical_info(
            request.medical_record,
        )

        # ── Store summary in PostgreSQL ──────────────────────────
        try:
            db_summary = PatientSummary(
                patient_id=request.patient_id,
                summary=summary,
                critical_info=critical_info,
            )
            db.add(db_summary)
            db.commit()

            logger.info(
                "Stored summary in PostgreSQL for patient {pid}",
                pid=request.patient_id,
            )
        except Exception:
            db.rollback()
            # Non-fatal: summary was generated, just failed to persist
            logger.exception(
                "Failed to store summary in PostgreSQL (non-fatal)"
            )

        logger.success(
            "Summary generated for patient {pid}",
            pid=request.patient_id,
        )

        return SummaryResponse(
            patient_id=request.patient_id,
            summary=summary,
            critical_info=critical_info,
            history_found=history_found,
            generated_at=datetime.now(timezone.utc).isoformat(),
            status="success",
        )

    except ValueError as e:
        logger.error("Validation error: {error}", error=str(e))
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        logger.exception(
            "Summary generation failed: {error}",
            error=str(e),
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to generate medical summary",
        )