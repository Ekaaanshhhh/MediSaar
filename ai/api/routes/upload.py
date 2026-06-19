"""
MediSaar AI — Medical Document Upload Endpoint.

Handles file upload, validation, OCR extraction, medical entity
parsing, and dual storage (PostgreSQL + ChromaDB). All CPU-bound
and I/O operations are run in a thread pool executor to avoid
blocking the event loop.
"""

import asyncio
import json
import os
import re
import uuid
from datetime import datetime, timezone
from functools import partial
from pathlib import Path
from typing import Dict, Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from loguru import logger
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ai.config.settings import settings
from ai.src.database.models import PatientRecord
from ai.src.database.postgres_client import get_db
from ai.src.medical_extraction.medical_extractor import MedicalExtractor
from ai.src.ocr.ocr_processor import OCRProcessor
from ai.src.rag.vector_store import VectorStore
from ai.src.services import (
    get_medical_extractor,
    get_ocr_processor,
    get_vector_store,
)


router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


# ── Input Validation ─────────────────────────────────────────────

# Allow alphanumeric, hyphens, underscores (basic sanitization)
_SAFE_ID_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]+$")


def _validate_id(value: str, field_name: str) -> str:
    """Validate that an ID contains only safe characters."""
    if not value or not value.strip():
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} is required.",
        )
    if not _SAFE_ID_PATTERN.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} contains invalid characters. Use alphanumeric, hyphens, or underscores.",
        )
    return value.strip()


# ── Response Model ───────────────────────────────────────────────

class UploadMetadata(BaseModel):
    patient_id: str
    hospital_id: str
    filename: str
    file_type: str
    text_length: int


class UploadResponse(BaseModel):
    status: str
    message: str
    metadata: UploadMetadata
    extracted_data: Dict[str, Any]


# ── Upload Endpoint ──────────────────────────────────────────────


@router.post(
    "/medical-document",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
)
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    hospital_id: str = Form(...),
    ocr_processor: OCRProcessor = Depends(get_ocr_processor),
    medical_extractor: MedicalExtractor = Depends(get_medical_extractor),
    vector_store: VectorStore = Depends(get_vector_store),
    db: Session = Depends(get_db),
):
    """
    Upload and process a medical document.

    Pipeline: Validate → Save → OCR → Medical Extraction → PostgreSQL → ChromaDB
    """
    # Validate IDs
    patient_id = _validate_id(patient_id, "patient_id")
    hospital_id = _validate_id(hospital_id, "hospital_id")

    temp_path = None

    try:
        # ── Validate filename ────────────────────────────────────
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename missing")

        # ── Validate extension ───────────────────────────────────
        file_ext = Path(file.filename).suffix.lstrip(".").lower()
        if file_ext not in settings.allowed_file_types:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_ext}",
            )

        # ── Validate MIME type ───────────────────────────────────
        allowed_mime_types = {
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg",
        }
        if file.content_type not in allowed_mime_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format",
            )

        # ── Stream file to disk with size check ──────────────────
        os.makedirs(settings.upload_dir, exist_ok=True)

        safe_filename = f"{uuid.uuid4()}_{re.sub(r'[^a-zA-Z0-9._-]', '_', file.filename)}"
        temp_path = os.path.join(settings.upload_dir, safe_filename)

        total_size = 0
        max_size = settings.max_file_size_bytes

        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                total_size += len(chunk)
                if total_size > max_size:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File size exceeds {settings.max_file_size_mb}MB limit",
                    )
                buffer.write(chunk)

        logger.info(
            "Processing document: {filename} ({size} bytes)",
            filename=file.filename,
            size=total_size,
        )

        loop = asyncio.get_event_loop()

        # ── OCR Processing (CPU-bound → thread pool) ─────────────
        try:
            if file_ext == "pdf":
                raw_text = await loop.run_in_executor(
                    None,
                    ocr_processor.extract_from_pdf,
                    temp_path,
                )
            else:
                raw_text = await loop.run_in_executor(
                    None,
                    ocr_processor.extract_from_image,
                    temp_path,
                )
        except HTTPException:
            raise
        except Exception:
            logger.exception("OCR failed")
            raise HTTPException(
                status_code=500,
                detail="OCR processing failed",
            )

        # ── OCR validation ───────────────────────────────────────
        if not raw_text or not raw_text.strip():
            raise HTTPException(
                status_code=422,
                detail="No text extracted from document",
            )

        logger.info("Extracted {chars} characters", chars=len(raw_text))

        # ── Medical extraction (LLM I/O → thread pool) ───────────
        try:
            medical_record = await loop.run_in_executor(
                None,
                partial(
                    medical_extractor.extract_entities,
                    raw_text=raw_text,
                    patient_id=patient_id,
                    hospital_id=hospital_id,
                ),
            )
        except HTTPException:
            raise
        except Exception:
            logger.exception("Medical extraction failed")
            raise HTTPException(
                status_code=500,
                detail="Medical extraction failed",
            )

        # ── Store in PostgreSQL (persistent record) ──────────────
        try:
            record_data = medical_record.model_dump(mode="json")

            db_record = PatientRecord(
                patient_id=patient_id,
                hospital_id=hospital_id,
                visit_date=medical_record.visit_date,
                doctor_name=medical_record.doctor_name,
                diagnoses=record_data.get("diagnoses", []),
                medicines=record_data.get("medicines", []),
                allergies=record_data.get("allergies", []),
                lab_reports=record_data.get("lab_reports", []),
                notes=medical_record.notes,
                raw_text=raw_text,
            )

            db.add(db_record)
            db.commit()
            db.refresh(db_record)

            logger.success(
                "Stored medical record in PostgreSQL for patient {pid} (id={rid})",
                pid=patient_id,
                rid=db_record.id,
            )
        except HTTPException:
            raise
        except Exception:
            db.rollback()
            logger.exception("Failed to store record in PostgreSQL")
            raise HTTPException(
                status_code=500,
                detail="Failed to store record in database",
            )

        # ── Store in ChromaDB (embeddings for retrieval) ─────────
        try:
            structured_record = json.dumps(record_data, indent=2)

            await loop.run_in_executor(
                None,
                partial(
                    vector_store.add_patient_record,
                    patient_id=patient_id,
                    record_text=structured_record,
                    metadata={
                        "hospital_id": hospital_id,
                        "document_type": file_ext,
                        "filename": file.filename,
                        "doctor_name": medical_record.doctor_name or "",
                        "visit_date": str(medical_record.visit_date),
                        "upload_date": str(datetime.now(timezone.utc).date()),
                        "postgres_record_id": db_record.id,
                    },
                ),
            )

            logger.success(
                "Stored embeddings in ChromaDB for patient {pid}",
                pid=patient_id,
            )
        except HTTPException:
            raise
        except Exception:
            # ChromaDB failure is non-fatal — Postgres has the record
            logger.exception("Failed to store embeddings in ChromaDB (non-fatal)")

        logger.success(
            "Document processed successfully for patient: {pid}",
            pid=patient_id,
        )

        return UploadResponse(
            status="success",
            message="Medical document processed successfully",
            metadata=UploadMetadata(
                patient_id=patient_id,
                hospital_id=hospital_id,
                filename=file.filename,
                file_type=file_ext,
                text_length=len(raw_text),
            ),
            extracted_data=record_data,
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("Unexpected upload error")
        raise HTTPException(
            status_code=500,
            detail="Unexpected server error",
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info("Deleted temp file: {path}", path=temp_path)