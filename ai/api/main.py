"""
MediSaar AI — FastAPI Application Entry Point.

Configures the FastAPI app with:
  - Lifespan-managed startup/shutdown (no deprecated on_event)
  - Production middleware (request ID, logging, global exception handler)
  - Secure CORS configuration
  - Conditional API docs exposure
"""

import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from ai.config.settings import settings
from ai.src.database.postgres_client import init_db
from ai.src.services import init_services, shutdown_services
from ai.api.middleware import (
    GlobalExceptionMiddleware,
    RequestIDMiddleware,
    RequestLoggingMiddleware,
)
from ai.api.routes.upload import router as upload_router
from ai.api.routes.summary import router as summary_router
from ai.api.routes.retrieval import router as retrieval_router
from ai.api.routes.health import router as health_router


# ── Logging Configuration ────────────────────────────────────────

def _configure_logging() -> None:
    """Configure Loguru for structured production logging."""
    logger.remove()  # Remove default handler

    if settings.is_production:
        # Production: JSON structured logs to stdout
        logger.add(
            sys.stdout,
            level=settings.log_level,
            format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level:<8} | {extra[request_id]!s:>36} | {message}",
            serialize=False,
            backtrace=False,
            diagnose=False,
        )
    else:
        # Development: human-readable colored logs
        logger.add(
            sys.stdout,
            level=settings.log_level,
            format=(
                "<green>{time:HH:mm:ss.SSS}</green> | "
                "<level>{level:<8}</level> | "
                "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
                "{message}"
            ),
            colorize=True,
            backtrace=True,
            diagnose=True,
        )

    # Default context for request_id (used before middleware sets it)
    logger.configure(extra={"request_id": "startup"})


# ── App Lifespan ─────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.

    Startup: initializes logging, database, and all AI services.
    Shutdown: gracefully releases all resources.
    """
    try:
        _configure_logging()
        logger.info("Starting MediSaar AI API (env={env})...", env=settings.environment)

        # Initialize PostgreSQL
        init_db()

        # Initialize all singleton services (OCR, embeddings, ChromaDB, LLM)
        init_services()

        logger.success("Application startup complete")

        yield

    except Exception as e:
        logger.exception("Startup failed: {error}", error=str(e))
        raise

    finally:
        logger.info("Shutting down MediSaar AI API...")
        shutdown_services()
        logger.info("Shutdown complete")


# ── App Instance ─────────────────────────────────────────────────

app = FastAPI(
    title="AI Medical Records API",
    description="Cross-Hospital Patient Record Management - AI Module",
    version="1.0.0",
    lifespan=lifespan,

    # Conditionally expose API docs (disabled in production)
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
    openapi_url=None if settings.is_production else "/openapi.json",
)


# ── Middleware (order matters: first added = outermost) ──────────

# Global exception handler (outermost — catches everything)
app.add_middleware(GlobalExceptionMiddleware)

# Request logging
app.add_middleware(RequestLoggingMiddleware)

# Request ID (innermost middleware — sets ID before logging uses it)
app.add_middleware(RequestIDMiddleware)

# CORS — use explicit origins, no wildcard with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────────────

app.include_router(upload_router)
app.include_router(summary_router)
app.include_router(retrieval_router)
app.include_router(health_router)


@app.get("/")
async def root():
    """Root endpoint — service identification."""
    return {
        "service": "AI Medical Records API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if not settings.is_production else "disabled",
    }
