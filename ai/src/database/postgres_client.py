"""
MediSaar AI — PostgreSQL Client.

Provides database engine, session factory, and lifecycle management.
Engine is lazily created and pool sizes are configurable via settings.
"""

from typing import Optional, Generator

from loguru import logger
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session

from ai.config.settings import settings
from ai.src.database.models import Base


# ── Module-level state (lazy initialized) ────────────────────────
_engine: Optional[Engine] = None
_session_factory: Optional[sessionmaker] = None


def get_engine() -> Engine:
    """
    Get or create the SQLAlchemy engine (lazy singleton).

    Returns:
        Configured SQLAlchemy Engine instance.
    """
    global _engine

    if _engine is None:
        _engine = create_engine(
            settings.database_url.get_secret_value(),

            # Show SQL queries only in debug mode
            echo=settings.sqlalchemy_echo,

            # SQLAlchemy 2.0 style
            future=True,

            # Connection pool settings (configurable)
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_timeout=settings.db_pool_timeout,
            pool_recycle=settings.db_pool_recycle,

            # Prevent stale connection errors
            pool_pre_ping=True,
        )
        logger.info(
            "PostgreSQL engine created (pool_size={ps}, max_overflow={mo})",
            ps=settings.db_pool_size,
            mo=settings.db_max_overflow,
        )

    return _engine


def get_session_factory() -> sessionmaker:
    """
    Get or create the session factory (lazy singleton).

    Returns:
        Configured sessionmaker instance.
    """
    global _session_factory

    if _session_factory is None:
        _session_factory = sessionmaker(
            bind=get_engine(),
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    return _session_factory


def init_db() -> None:
    """
    Initialize database tables.
    Creates all tables if they do not exist.

    Raises:
        Exception: If database initialization fails.
    """
    try:
        logger.info("Initializing PostgreSQL database...")
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        logger.success("Database initialized successfully")

    except Exception as e:
        logger.exception("Database initialization failed: {error}", error=str(e))
        raise


def check_db_health() -> bool:
    """
    Check database connectivity with a simple query.

    Returns:
        True if database is reachable, False otherwise.
    """
    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error("Database health check failed: {error}", error=str(e))
        return False


def dispose_engine() -> None:
    """
    Dispose the database engine and release all pooled connections.
    Called during application shutdown.
    """
    global _engine, _session_factory

    if _engine is not None:
        _engine.dispose()
        logger.info("Database engine disposed")
        _engine = None
        _session_factory = None


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.
    Automatically commits on success and rolls back on error.

    Yields:
        SQLAlchemy Session instance.
    """
    session_factory = get_session_factory()
    db = session_factory()

    try:
        yield db

    except Exception as e:
        logger.exception("Database session error: {error}", error=str(e))
        db.rollback()
        raise

    finally:
        db.close()