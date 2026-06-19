"""
MediSaar AI — Singleton Service Registry.

Provides centralized, lazy-initialized singleton instances of all
heavy services (OCR, embeddings, vector store, LLM clients).

All route handlers use FastAPI Depends() to get shared instances,
ensuring only ONE copy of each model/client exists in the process.

Lifecycle:
    - init_services() → called from lifespan startup
    - shutdown_services() → called from lifespan shutdown
    - get_*() → FastAPI dependency functions for route injection
"""

from typing import Optional

from loguru import logger

from ai.config.settings import settings


# ── Private singleton state ──────────────────────────────────────

_ocr_processor = None
_embedding_service = None
_text_chunker = None
_vector_store = None
_rag_retrieval = None
_medical_extractor = None
_summary_generator = None
_initialized = False


def init_services() -> None:
    """
    Initialize all singleton services during app startup.
    Called once from the FastAPI lifespan handler.
    """
    global _ocr_processor, _embedding_service, _text_chunker
    global _vector_store, _rag_retrieval, _medical_extractor
    global _summary_generator, _initialized

    if _initialized:
        logger.warning("Services already initialized, skipping")
        return

    logger.info("Initializing application services...")

    # Import here to avoid circular imports and control load order
    from ai.src.ocr.ocr_processor import OCRProcessor
    from ai.src.rag.embedding_service import EmbeddingService
    from ai.src.rag.text_chunker import TextChunker
    from ai.src.rag.vector_store import VectorStore
    from ai.src.rag.retrieval import RAGRetrieval
    from ai.src.medical_extraction.medical_extractor import MedicalExtractor
    from ai.src.llm.summary_generator import SummaryGenerator

    # 1. OCR Processor (lazy — PaddleOCR models loaded on first use)
    _ocr_processor = OCRProcessor(
        max_pages=settings.ocr_max_pages,
        poppler_path=settings.ocr_poppler_path,
    )
    logger.info("OCR processor created (lazy init)")

    # 2. Embedding Service (loads SentenceTransformer model)
    _embedding_service = EmbeddingService()
    logger.info("Embedding service ready")

    # 3. Text Chunker
    _text_chunker = TextChunker()
    logger.info("Text chunker ready")

    # 4. Vector Store (single ChromaDB PersistentClient)
    _vector_store = VectorStore(
        embedding_service=_embedding_service,
        chunker=_text_chunker,
        persist_dir=settings.chromadb_path,
    )
    logger.info("Vector store ready")

    # 5. RAG Retrieval
    _rag_retrieval = RAGRetrieval(_vector_store)
    logger.info("RAG retrieval ready")

    # 6. Medical Extractor
    _medical_extractor = MedicalExtractor(
        groq_api_key=settings.groq_api_key.get_secret_value(),
        model=settings.llm_model,
        timeout_seconds=settings.llm_timeout_seconds,
    )
    logger.info("Medical extractor ready")

    # 7. Summary Generator
    _summary_generator = SummaryGenerator(
        groq_api_key=settings.groq_api_key.get_secret_value(),
        rag_retrieval=_rag_retrieval,
        model=settings.llm_model,
        timeout_seconds=settings.llm_timeout_seconds,
    )
    logger.info("Summary generator ready")

    _initialized = True
    logger.success("All services initialized successfully")


def shutdown_services() -> None:
    """
    Gracefully shut down all services during app shutdown.
    Releases model memory, closes DB/ChromaDB connections.
    """
    global _ocr_processor, _embedding_service, _text_chunker
    global _vector_store, _rag_retrieval, _medical_extractor
    global _summary_generator, _initialized

    logger.info("Shutting down application services...")

    # Close vector store (ChromaDB)
    if _vector_store is not None:
        _vector_store.close()
        logger.info("Vector store closed")

    # Dispose database engine
    from ai.src.database.postgres_client import dispose_engine
    dispose_engine()

    # Clear references for garbage collection
    _ocr_processor = None
    _embedding_service = None
    _text_chunker = None
    _vector_store = None
    _rag_retrieval = None
    _medical_extractor = None
    _summary_generator = None
    _initialized = False

    logger.success("All services shut down")


# ── FastAPI Dependency Functions ────────────────────────────────


def get_ocr_processor():
    """FastAPI dependency: returns the shared OCR processor."""
    from ai.src.ocr.ocr_processor import OCRProcessor
    if _ocr_processor is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _ocr_processor


def get_embedding_service():
    """FastAPI dependency: returns the shared embedding service."""
    from ai.src.rag.embedding_service import EmbeddingService
    if _embedding_service is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _embedding_service


def get_text_chunker():
    """FastAPI dependency: returns the shared text chunker."""
    from ai.src.rag.text_chunker import TextChunker
    if _text_chunker is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _text_chunker


def get_vector_store():
    """FastAPI dependency: returns the shared vector store."""
    from ai.src.rag.vector_store import VectorStore
    if _vector_store is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _vector_store


def get_rag_retrieval():
    """FastAPI dependency: returns the shared RAG retrieval service."""
    from ai.src.rag.retrieval import RAGRetrieval
    if _rag_retrieval is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _rag_retrieval


def get_medical_extractor():
    """FastAPI dependency: returns the shared medical extractor."""
    from ai.src.medical_extraction.medical_extractor import MedicalExtractor
    if _medical_extractor is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _medical_extractor


def get_summary_generator():
    """FastAPI dependency: returns the shared summary generator."""
    from ai.src.llm.summary_generator import SummaryGenerator
    if _summary_generator is None:
        raise RuntimeError("Services not initialized. Call init_services() first.")
    return _summary_generator
