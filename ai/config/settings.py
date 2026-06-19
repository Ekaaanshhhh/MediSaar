"""
MediSaar AI — Application Configuration.

Uses Pydantic Settings for type-safe environment variable binding.
All values are read from environment variables or .env file automatically.
Do NOT use os.getenv() — Pydantic handles env var loading natively.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, field_validator
from typing import List, Literal, Optional
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """Application settings with validation and secure defaults."""

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ──────────────────────────────────────────────
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = False

    # ── API ──────────────────────────────────────────────────────
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    # ── CORS ─────────────────────────────────────────────────────
    allowed_origins: List[str] = ["http://localhost:3000"]

    # ── Database ─────────────────────────────────────────────────
    database_url: SecretStr = SecretStr(
        "postgresql://postgres:00000024@localhost:5432/patient_records"
    )
    sqlalchemy_echo: bool = False
    db_pool_size: int = 5
    db_max_overflow: int = 10
    db_pool_timeout: int = 30
    db_pool_recycle: int = 1800

    # ── Vector DB ────────────────────────────────────────────────
    chromadb_path: str = "./chroma_db"

    # ── Groq LLM ────────────────────────────────────────────────
    groq_api_key: SecretStr = SecretStr("")
    llm_model: str = "llama-3.3-70b-versatile"
    llm_max_tokens: int = 1500
    llm_timeout_seconds: int = 30

    # ── OCR ──────────────────────────────────────────────────────
    ocr_poppler_path: Optional[str] = None
    ocr_max_pages: int = 50

    # ── File Upload ──────────────────────────────────────────────
    max_file_size_mb: int = 10
    allowed_file_types: List[str] = ["pdf", "jpg", "jpeg", "png"]
    upload_dir: str = "./uploads"

    # ── Timeouts ─────────────────────────────────────────────────
    request_timeout_seconds: int = 120

    # ── Logging ──────────────────────────────────────────────────
    log_level: str = "INFO"

    # ── Postgres (for docker-compose) ────────────────────────────
    postgres_user: str = "postgres"
    postgres_password: SecretStr = SecretStr("00000024")
    postgres_db: str = "patient_records"

    # ── Computed helpers ─────────────────────────────────────────

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * 1024 * 1024

    @field_validator("groq_api_key")
    @classmethod
    def validate_groq_key(cls, v: SecretStr) -> SecretStr:
        """Warn if Groq API key is empty — LLM features will fail."""
        if not v.get_secret_value():
            import warnings
            warnings.warn(
                "GROQ_API_KEY is not set. LLM features will be unavailable.",
                stacklevel=2,
            )
        return v


settings = Settings()