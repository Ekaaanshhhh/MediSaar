from fastapi import FastAPI
from loguru import logger

from ai.api.routes.upload import (
    router as upload_router
)

from ai.api.routes.summary import (
    router as summary_router
)

from ai.api.routes.retrieval import (
    router as retrieval_router
)
from ai.api.routes.health import (
    router as health_router
)


app = FastAPI(
    title="MediSaar API",
    description=(
        "AI-Powered Cross-Hospital "
        "Patient Record System"
    ),
    version="1.0.0"
)


# Include Routes

app.include_router(upload_router)
app.include_router(summary_router)
app.include_router(retrieval_router)
app.include_router(health_router)


# Root Route

@app.get("/")
async def root():
    return {
        "message": "MediSaar API Running",
        "status": "success"
    }


# # Health Check

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "service": "MediSaar Backend"
#     }


# Startup Event

@app.on_event("startup")
async def startup_event():
    logger.info(
        "MediSaar API Started"
    )


# Shutdown Event

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(
        "MediSaar API Stopped"
    )