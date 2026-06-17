from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", 8000))
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:00000024@localhost:5432/patient_records"
    )
    sqlalchemy_echo: bool = True

    
    
    # Vector DB
    chromadb_path: str = os.getenv("CHROMADB_PATH", "./chroma_db")
    
    # Groq
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    
    # OCR
    ocr_backend: str = os.getenv("OCR_BACKEND", "paddleocr")
    
    # File Upload
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", 50))
    allowed_file_types: List[str] = ["pdf", "jpg", "jpeg", "png"]
    upload_dir: str = os.getenv("UPLOAD_DIR", "./uploads")
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = "ai/.env"
        case_sensitive = False
        extra="allow"

settings = Settings()