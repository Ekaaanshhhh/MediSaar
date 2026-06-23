"""
MediSaar AI — Health & Readiness Endpoints.

Provides /health (service health) and /ready (deployment readiness)
endpoints that check actual service state.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from loguru import logger

from ai.src.database.postgres_client import check_db_health
from ai.src.rag.vector_store import VectorStore
from ai.src.services import get_vector_store


router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(
    vector_store: VectorStore = Depends(get_vector_store),
):
    """
    Health check for API services.
    Checks PostgreSQL and Vector DB connectivity.
    """
    services = {}

    # Check PostgreSQL
    try:
        db_healthy = check_db_health()
        services["postgres"] = "healthy" if db_healthy else "unhealthy"
    except Exception:
        logger.exception("Postgres health check failed")
        services["postgres"] = "unhealthy"

    # Check Vector DB (singleton — no new instance per request)
    try:
        if vector_store and vector_store.collection is not None:
            services["vector_db"] = "healthy"
        else:
            services["vector_db"] = "unhealthy"
    except Exception:
        logger.exception("Vector DB health check failed")
        services["vector_db"] = "unhealthy"

    overall_status = (
        "healthy"
        if all(s == "healthy" for s in services.values())
        else "degraded"
    )

    content = {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "MediSaar AI Backend",
        "version": "1.0.0",
        "services": services,
    }

    if overall_status == "degraded":
        return JSONResponse(status_code=503, content=content)

    return content


@router.get("/ready")
async def readiness_check(
    vector_store: VectorStore = Depends(get_vector_store),
):
    """
    Deployment readiness check.
    Returns ready=True only when all critical services are available.
    """
    try:
        db_ok = check_db_health()
        vector_ok = vector_store is not None and vector_store.collection is not None

        ready = db_ok and vector_ok

        return {
            "ready": ready,
            "checks": {
                "postgres": db_ok,
                "vector_db": vector_ok,
            },
        }
    except Exception:
        return {"ready": False, "checks": {}}