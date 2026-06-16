from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    status
)

from pathlib import Path
from loguru import logger
from datetime import datetime
import uuid
import os
import json

from ai.config.settings import settings

from ai.src.ocr.ocr_processor import (
    OCRProcessor
)

from ai.src.medical_extraction.medical_extractor import (
    MedicalExtractor
)

from ai.src.rag.embedding_service import (
    EmbeddingService
)

from ai.src.rag.text_chunker import (
    TextChunker
)

from ai.src.rag.vector_store import (
    VectorStore
)

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)


# Initialize Services


ocr_processor = OCRProcessor()

medical_extractor = MedicalExtractor(
    settings.groq_api_key
)

embedding_service = (
    EmbeddingService()
)

chunker = TextChunker()

vector_store = VectorStore(
    embedding_service=embedding_service,
    chunker=chunker,
    persist_dir=settings.chromadb_path
)


# Constants


MAX_FILE_SIZE = (
    10 * 1024 * 1024
)  # 10 MB


@router.post(
    "/medical-document",
    status_code=status.HTTP_200_OK
)
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: str = Form(...),
    hospital_id: str = Form(...)
):
    """
    Upload and process
    medical document.
    """

    temp_path = None

    try:

       
        # Validate filename
       

        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename missing"
            )

       
        # Validate extension
       

        file_ext = (
            Path(file.filename)
            .suffix
            .lstrip(".")
            .lower()
        )

        if (
            file_ext
            not in settings.allowed_file_types
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported "
                    f"file type: "
                    f"{file_ext}"
                )
            )

       
        # Validate MIME type
       

        allowed_mime_types = {
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
        }

        if (
            file.content_type
            not in allowed_mime_types
        ):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format"
            )

       
        # Validate file size
       

        file_content = (
            await file.read()
        )

        if (
            len(file_content)
            > MAX_FILE_SIZE
        ):
            raise HTTPException(
                status_code=413,
                detail=(
                    "File size exceeds "
                    "10MB limit"
                )
            )

        await file.seek(0)

       
        # Create upload directory
       

        os.makedirs(
            settings.upload_dir,
            exist_ok=True
        )

        unique_filename = (
            f"{uuid.uuid4()}_"
            f"{file.filename}"
        )

        temp_path = os.path.join(
            settings.upload_dir,
            unique_filename
        )

        with open(
            temp_path,
            "wb"
        ) as buffer:
            buffer.write(
                file_content
            )

        logger.info(
            f"Processing "
            f"document: "
            f"{file.filename}"
        )

       
        # OCR Processing
       

        try:

            if file_ext == "pdf":
                raw_text = (
                    ocr_processor
                    .extract_from_pdf(
                        temp_path
                    )
                )

            else:
                raw_text = (
                    ocr_processor
                    .extract_from_image(
                        temp_path
                    )
                )

        except Exception:
            logger.exception(
                "OCR failed"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "OCR processing "
                    "failed"
                )
            )

       
        # OCR validation
       

        if (
            not raw_text
            or not raw_text.strip()
        ):
            raise HTTPException(
                status_code=422,
                detail=(
                    "No text extracted "
                    "from document"
                )
            )

        logger.info(
            f"Extracted "
            f"{len(raw_text)} "
            f"characters"
        )

       
        # Medical extraction
       

        try:

            medical_record = (
                medical_extractor
                .extract_entities(
                    raw_text=raw_text,
                    patient_id=patient_id,
                    hospital_id=hospital_id
                )
            )

        except Exception:
            logger.exception(
                "Medical extraction "
                "failed"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Medical extraction "
                    "failed"
                )
            )

       
        # STORE IN CHROMADB
       

        try:
            structured_record = json.dumps(
                    medical_record.model_dump(
                        mode="json"
                    ),
                    indent=2
                )
            vector_store.add_patient_record(
                patient_id=patient_id,
                record_text=structured_record,
                metadata={
                    "hospital_id":
                        hospital_id,

                    "document_type":
                        file_ext,

                    "filename":
                        file.filename,
                    "doctor_name":
                        medical_record.doctor_name,

                    "visit_date":
                                str(
                                    medical_record
                                    .visit_date
                                ),

                    "upload_date":
                                str(
                                    datetime.now()
                                    .date()
                                )

                    
                }
            )

            logger.success(
                f"Stored medical "
                f"record in "
                f"ChromaDB for "
                f"{patient_id}"
            )

        except Exception:
            logger.exception(
                "Failed to store "
                "record in "
                "vector DB"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Failed to store "
                    "record in "
                    "vector database"
                )
            )

        logger.success(
            f"Document processed "
            f"successfully for "
            f"patient: "
            f"{patient_id}"
        )

        return {
            "status": "success",
            "message": (
                "Medical document "
                "processed successfully"
            ),

            "metadata": {
                "patient_id":
                    patient_id,

                "hospital_id":
                    hospital_id,

                "filename":
                    file.filename,

                "file_type":
                    file_ext,

                "text_length":
                    len(raw_text)
            },

            "extracted_data":
                medical_record.dict()
        }

    except HTTPException:
        raise

    except Exception:
        logger.exception(
            "Unexpected "
            "upload error"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected "
                "server error"
            )
        )

    finally:

        if (
            temp_path
            and os.path.exists(
                temp_path
            )
        ):
            os.remove(temp_path)

            logger.info(
                f"Deleted temp "
                f"file: "
                f"{temp_path}"
            )