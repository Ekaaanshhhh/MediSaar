"""
MediSaar AI — OCR Processor.

Extracts text from PDF and image files using PaddleOCR.
Supports lazy initialization, memory cleanup, and configurable page limits.
"""

import os
import platform
import threading
from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image
from loguru import logger

from ai.src.exceptions import OCRProcessingError


class OCRProcessor:
    """
    OCR engine wrapper with lazy initialization and resource cleanup.

    Args:
        language: Language code for OCR extraction.
        max_pages: Maximum number of PDF pages to process.
        poppler_path: Path to Poppler binaries (Windows only, None for Linux).
    """

    def __init__(
        self,
        language: str = "en",
        max_pages: int = 50,
        poppler_path: Optional[str] = None,
    ):
        self.language = language
        self.max_pages = max_pages
        self.poppler_path = poppler_path
        self._ocr_engine = None  # Lazy initialized
        self._lock = threading.Lock()

    def _get_ocr_engine(self):
        """Lazy-load OCR engine on first use."""
        if self._ocr_engine is None:
            logger.info("Initializing PaddleOCR engine")
            from paddleocr import PaddleOCR

            self._ocr_engine = PaddleOCR(
                use_angle_cls=True,
                lang=self.language,
                show_log=False,
            )
            logger.info("OCR engine initialized successfully")
        return self._ocr_engine

    def extract_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from a PDF file by converting pages to images.

        Args:
            pdf_path: Absolute path to the PDF file.

        Returns:
            Concatenated text from all processed pages.

        Raises:
            OCRProcessingError: If PDF extraction fails.
        """
        try:
            import pdf2image

            # Determine poppler path: explicit setting, or None (Linux auto-detects)
            poppler = self.poppler_path
            if poppler is None and platform.system() == "Windows":
                # Fallback for Windows dev environments
                default_win_path = r"C:\poppler\Library\bin"
                if os.path.isdir(default_win_path):
                    poppler = default_win_path

            # Get page count first to enforce limit
            page_count = pdf2image.pdfinfo_from_path(
                pdf_path, poppler_path=poppler
            ).get("Pages", 0)

            if isinstance(page_count, str):
                page_count = int(page_count)

            if page_count > self.max_pages:
                logger.warning(
                    "PDF has {pages} pages, limiting to {max}",
                    pages=page_count,
                    max=self.max_pages,
                )
                page_count = self.max_pages

            full_text = ""

            # Process pages one batch at a time to limit memory usage
            for page_num in range(1, page_count + 1):
                logger.info(
                    "Processing PDF page {page}/{total}",
                    page=page_num,
                    total=page_count,
                )

                images = pdf2image.convert_from_path(
                    pdf_path,
                    first_page=page_num,
                    last_page=page_num,
                    poppler_path=poppler,
                )

                if images:
                    text = self._extract_from_image(images[0])
                    full_text += f"\n--- PAGE {page_num} ---\n{text}"

                    # Explicit memory cleanup
                    images[0].close()
                    del images

            return full_text

        except OCRProcessingError:
            raise
        except Exception as e:
            logger.error("PDF extraction failed: {error}", error=str(e))
            raise OCRProcessingError(
                detail=f"PDF extraction failed: {str(e)}"
            )

    def extract_from_image(self, image_path: str) -> str:
        """
        Extract text from an image file.

        Args:
            image_path: Absolute path to the image file.

        Returns:
            Extracted text from the image.

        Raises:
            OCRProcessingError: If image extraction fails.
        """
        image = None
        try:
            image = Image.open(image_path)
            # Verify image integrity before processing
            image.verify()
            # Re-open after verify (verify closes the file)
            image = Image.open(image_path)
            return self._extract_from_image(image)
        except OCRProcessingError:
            raise
        except Exception as e:
            logger.error("Image extraction failed: {error}", error=str(e))
            raise OCRProcessingError(
                detail=f"Image extraction failed: {str(e)}"
            )
        finally:
            if image is not None:
                image.close()

    def _extract_from_image(self, image: Image.Image) -> str:
        """
        Internal: Run OCR on a PIL Image object.

        Args:
            image: PIL Image to process.

        Returns:
            Extracted text as a single string.

        Raises:
            OCRProcessingError: If OCR engine fails.
        """
        image_np = None
        try:
            image_np = np.array(image)
            ocr_engine = self._get_ocr_engine()

            with self._lock:
                result = ocr_engine.ocr(image_np, cls=True)

            extracted_text = []
            if result and result[0]:
                for line in result[0]:
                    extracted_text.append(line[1][0])

            return "\n".join(extracted_text)

        except Exception as e:
            logger.error("OCR extraction failed: {error}", error=str(e))
            raise OCRProcessingError(
                detail=f"OCR engine failed: {str(e)}"
            )
        finally:
            # Explicit memory cleanup for large numpy arrays
            if image_np is not None:
                del image_np