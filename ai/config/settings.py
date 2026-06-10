from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = True
    
    # Database
    database_url: str = "postgresql://postgres:00000024@localhost:5432/patient_records"
    
    # Vector DB
    chromadb_path: str = "./chroma_db"
    
    # Groq
    groq_api_key: str
    llm_model: str = "llama-3.3-70b-versatile"  
    
    # OCR
    ocr_backend: str = "paddleocr"
    
    # File Upload
    max_file_size_mb: int = 50
    allowed_file_types: List[str] = ["pdf", "jpg", "jpeg", "png"]
    upload_dir: str = "./uploads"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()