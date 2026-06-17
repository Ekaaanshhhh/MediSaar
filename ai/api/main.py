from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from ai.config.settings import settings

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
from ai.src.database.postgres_client import init_db


# ----------------------------------
# App lifecycle
# ----------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown lifecycle.
    """

    try:
        logger.info("Starting AI Medical Records API...")

        # Initialize PostgreSQL
        init_db()

        logger.success("Application startup complete")

        yield

    except Exception as e:
        logger.exception(f"Startup failed: {e}")
        raise

    finally:
        logger.info("Shutting down API...")



app = FastAPI(
    title="AI Medical Records API",
    description="Cross-Hospital Patient Record Management - AI Module",
    version="1.0.0",

    lifespan=lifespan,

    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS
# ----------------------------------
app.add_middleware(
    CORSMiddleware,

    # Change in production
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
        "service": "AI Medical Records API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }



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

