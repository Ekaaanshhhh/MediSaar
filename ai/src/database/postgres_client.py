from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from ai.config.settings import settings
from ai.src.database.models import Base

from loguru import logger


# Create PostgreSQL engine
engine = create_engine(
    settings.database_url,

    # Show SQL queries only in debug mode
    echo=settings.debug,

    # SQLAlchemy 2.0 style
    future=True,

    # Connection pool settings
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,

    # Prevent stale DB connection errors
    pool_pre_ping=True
)


# Session factory
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False
)


def init_db():
    """
    Initialize database tables.
    Creates all tables if they do not exist.
    """

    try:
        logger.info("Initializing PostgreSQL database...")

        Base.metadata.create_all(bind=engine)

        logger.success("Database initialized successfully")

    except Exception as e:
        logger.exception(f"Database initialization failed: {e}")
        raise


def get_db():
    """
    Dependency for FastAPI database session.
    Automatically closes session after request.
    """

    db = SessionLocal()

    try:
        yield db

    except Exception as e:
        logger.exception(f"Database session error: {e}")
        db.rollback()
        raise

    finally:
        db.close()