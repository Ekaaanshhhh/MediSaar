"""
MediSaar AI — Patient Record Retrieval Endpoint.

Provides semantic similarity search and direct storage
for patient medical records in the vector database.
"""

import asyncio
from functools import partial
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from pydantic import BaseModel, Field

from ai.src.rag.vector_store import VectorStore
from ai.src.services import get_vector_store


router = APIRouter(tags=["Retrieval"])


# ── Request / Response Models ────────────────────────────────────


class RetrievalRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    query: str = Field(..., min_length=3)
    top_k: int = Field(default=5, ge=1, le=20)


class StoreRecordRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    record_text: str = Field(..., min_length=5)
    metadata: Optional[Dict[str, Any]] = None


class RetrievalResult(BaseModel):
    text: str
    score: float
    metadata: Dict[str, Any]


class RetrievalResponse(BaseModel):
    success: bool
    patient_id: str
    query: str
    count: int
    results: List[RetrievalResult]


class StoreResponse(BaseModel):
    success: bool
    message: str
    patient_id: str


# ── Retrieval Endpoint ───────────────────────────────────────────


@router.post(
    "/retrieve/patient-history",
    response_model=RetrievalResponse,
)
async def retrieve_patient_history(
    request: RetrievalRequest,
    vector_store: VectorStore = Depends(get_vector_store),
):
    """
    Retrieve relevant patient medical history
    based on semantic similarity search.
    """
    try:
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            partial(
                vector_store.retrieve_similar_records,
                query=request.query,
                patient_id=request.patient_id,
                top_k=request.top_k,
            ),
        )

        return RetrievalResponse(
            success=True,
            patient_id=request.patient_id,
            query=request.query,
            count=len(results),
            results=[RetrievalResult(**r) for r in results],
        )

    except Exception:
        logger.exception(
            "Retrieval failed for patient_id={pid}",
            pid=request.patient_id,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve patient history",
        )


# ── Store Endpoint ───────────────────────────────────────────────


@router.post(
    "/store/patient-record",
    response_model=StoreResponse,
)
async def store_record(
    request: StoreRecordRequest,
    vector_store: VectorStore = Depends(get_vector_store),
):
    """Store patient record in vector database."""
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None,
            partial(
                vector_store.add_patient_record,
                patient_id=request.patient_id,
                record_text=request.record_text,
                metadata=request.metadata,
            ),
        )

        return StoreResponse(
            success=True,
            message="Patient record stored successfully",
            patient_id=request.patient_id,
        )

    except Exception:
        logger.exception(
            "Storage failed for patient_id={pid}",
            pid=request.patient_id,
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to store patient record",
        )