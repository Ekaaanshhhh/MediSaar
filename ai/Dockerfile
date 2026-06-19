FROM python:3.11-slim AS builder

# ── Build stage ──────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY ai/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# ── Runtime stage ────────────────────────────────────────────────
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install runtime system dependencies
# PaddleOCR: libgomp1, libglib2.0-0, libsm6, libxrender1, libxext6, libgl1-mesa-glx
# pdf2image: poppler-utils
# Health check: curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1-mesa-glx \
    poppler-utils \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# Copy application code (relies on .dockerignore to exclude junk)
COPY . .

# Create necessary directories with correct ownership
RUN mkdir -p /app/uploads /app/chroma_db && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check using curl (fast, no Python import overhead)
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start with gunicorn + uvicorn workers for production concurrency
CMD sh -c "gunicorn ai.api.main:app \
     --worker-class uvicorn.workers.UvicornWorker \
     --workers 2 \
     --bind 0.0.0.0:${PORT:-8000} \
     --timeout 120 \
     --graceful-timeout 30 \
     --access-logfile -"