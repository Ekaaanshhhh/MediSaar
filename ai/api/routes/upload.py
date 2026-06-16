
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
import uuid
import os

from ai.config.settings import settings
from ai.src.ocr.ocr_processor import OCRProcessor
from ai.src.medical_extraction.medical_extractor import (
    MedicalExtractor
)

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

# Initialize services once
ocr_processor = OCRProcessor()
medical_extractor = MedicalExtractor(
    settings.groq_api_key
)

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


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
    Upload and process medical document.

    """

    temp_path = None

    try:
        
        # Validate filename
        
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="Filename is missing"
            )

        
        # Validate extension
        
        file_ext = (
            Path(file.filename)
            .suffix
            .lstrip(".")
            .lower()
        )

        if file_ext not in settings.allowed_file_types:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported file type: "
                    f"{file_ext}"
                )
            )

        
        # Validate content type
        
        allowed_mime_types = {
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
        }

        if file.content_type not in allowed_mime_types:
            raise HTTPException(
                status_code=400,
                detail="Invalid file format"
            )

        
        # Validate file size
        
        file_content = await file.read()

        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=(
                    "File size exceeds "
                    "10 MB limit"
                )
            )

        await file.seek(0)

        
        # Create upload directory
        
        os.makedirs(
            settings.upload_dir,
            exist_ok=True
        )

        
        # Generate unique filename
        
        unique_filename = (
            f"{uuid.uuid4()}_"
            f"{file.filename}"
        )

        temp_path = os.path.join(
            settings.upload_dir,
            unique_filename
        )

        
        # Save uploaded file
        
        with open(temp_path, "wb") as buffer:
            buffer.write(file_content)

        logger.info(
            f"Processing document: "
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

        except Exception as e:
            logger.exception(
                "OCR processing failed"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "OCR processing failed"
                )
            )

        
        # OCR validation
        
        if not raw_text.strip():
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

        
        # Medical entity extraction
        
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
                "Medical extraction failed"
            )

            raise HTTPException(
                status_code=500,
                detail=(
                    "Medical entity "
                    "extraction failed"
                )
            )

        logger.success(
            f"Document processed "
            f"successfully for "
            f"patient: {patient_id}"
        )

        return {
            "status": "success",
            "message": (
                "Medical document "
                "processed successfully"
            ),

            "metadata": {
                "patient_id": patient_id,
                "hospital_id": hospital_id,
                "filename": file.filename,
                "file_type": file_ext,
                "text_length": len(raw_text)
            },

            "extracted_data":
                medical_record.dict()
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.exception(
            "Unexpected upload error"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unexpected server error"
            )
        )

    finally:
        # Cleanup temporary file
        if (
            temp_path
            and os.path.exists(temp_path)
        ):
            os.remove(temp_path)
            logger.info(
                f"Deleted temp file: "
                f"{temp_path}"
            )
