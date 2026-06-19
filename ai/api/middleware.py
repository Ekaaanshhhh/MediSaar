"""
MediSaar AI — Production Middleware.

Provides:
  - RequestIDMiddleware: Correlation ID generation and propagation
  - RequestLoggingMiddleware: Structured request/response logging
  - GlobalExceptionMiddleware: Catch-all exception handler with safe responses
"""

import uuid
import time

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from loguru import logger

from ai.src.exceptions import MediSaarError


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Generates a unique request ID for every incoming request.
    Attaches it to request.state, response headers, and loguru context.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id

        with logger.contextualize(request_id=request_id):
            response = await call_next(request)

        response.headers["X-Request-ID"] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every request with method, path, status code, and duration.
    Skips noisy health check endpoints to reduce log volume.
    """

    SKIP_PATHS = {"/health", "/ready", "/"}

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        request_id = getattr(request.state, "request_id", "unknown")

        logger.info(
            "{method} {path} → {status} ({duration}ms) [rid={rid}]",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration=duration_ms,
            rid=request_id,
        )

        return response


class GlobalExceptionMiddleware(BaseHTTPMiddleware):
    """
    Catches all unhandled exceptions and returns sanitized JSON responses.
    MediSaarError subclasses return their user-safe message.
    Unknown exceptions return a generic 500 — no stack traces leak to clients.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        try:
            return await call_next(request)
        except MediSaarError as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.error(
                "Application error [{rid}]: {detail}",
                rid=request_id,
                detail=exc.detail,
            )
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "error": exc.message,
                    "request_id": request_id,
                },
            )
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.exception(
                "Unhandled exception [{rid}]: {error}",
                rid=request_id,
                error=str(exc),
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error": "An unexpected server error occurred.",
                    "request_id": request_id,
                },
            )
