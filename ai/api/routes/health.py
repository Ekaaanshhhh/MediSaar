from fastapi import APIRouter
from datetime import datetime
from loguru import logger

from ai.config.settings import settings
from ai.src.rag.vector_store import VectorStore
from ai.src.rag.embedding_service import EmbeddingService
from ai.src.rag.text_chunker import TextChunker

router = APIRouter()
embedding_service=EmbeddingService()
chunker=TextChunker()


@router.get("/health")
async def health_check():
    """
    Health check for API services
    """

    services = {}

    # Check Vector DB
    try:
        vector_store = VectorStore(
            embedding_service=embedding_service,
            chunker=chunker,
            persist_dir=settings.chromadb_path
        )

        services["vector_db"] = "healthy"

    except Exception as e:
        logger.exception("Vector DB health check failed")
        services["vector_db"] = "unhealthy"

    overall_status = (
        "healthy"
        if all(
            status == "healthy"
            for status in services.values()
        )
        else "degraded"
    )

    return {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "MediSaar Backend",
        "version": "1.0.0",
        "services": services
    }


@router.get("/ready")
async def readiness_check():
    """
    Kubernetes / deployment readiness check
    """
    return {
        "ready": True
    }