from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from loguru import logger

from ai.src.rag.vector_store import VectorStore
from ai.config.settings import settings
from ai.src.rag.embedding_service import EmbeddingService
from ai.src.rag.text_chunker import TextChunker

embedding_service=EmbeddingService()
chunker=TextChunker()

router = APIRouter()

# Initialize vector store
vector_store = VectorStore(
    embedding_service=embedding_service,
    chunker=chunker,
    persist_dir=settings.chromadb_path
)



# Request Models


class RetrievalRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    query: str = Field(..., min_length=3)
    top_k: int = Field(default=5, ge=1, le=20)


class StoreRecordRequest(BaseModel):
    patient_id: str = Field(..., min_length=1)
    record_text: str = Field(..., min_length=5)
    metadata: Optional[Dict[str, Any]] = None



# Retrieval Endpoint


@router.post("/retrieve/patient-history")
async def retrieve_patient_history(request: RetrievalRequest):
    """
    Retrieve relevant patient medical history
    based on semantic similarity search.
    """
    try:
        results = vector_store.retrieve_similar_records(
            query=request.query,
            patient_id=request.patient_id,
            top_k=request.top_k
        )

        return {
            "success": True,
            "patient_id": request.patient_id,
            "query": request.query,
            "count": len(results),
            "results": results
        }

    except Exception as e:
        logger.exception(
            f"Retrieval failed for patient_id={request.patient_id}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve patient history"
        )



# Store Endpoint


@router.post("/store/patient-record")
async def store_record(request: StoreRecordRequest):
    """
    Store patient record in vector database.
    """
    try:
        vector_store.add_patient_record(
            patient_id=request.patient_id,
            record_text=request.record_text,
            metadata=request.metadata
        )

        return {
            "success": True,
            "message": "Patient record stored successfully",
            "patient_id": request.patient_id
        }

    except Exception as e:
        logger.exception(
            f"Storage failed for patient_id={request.patient_id}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to store patient record"
        )