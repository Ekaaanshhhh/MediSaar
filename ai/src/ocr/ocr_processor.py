import os
from pathlib import Path
from PIL import Image
from paddleocr import PaddleOCR
from loguru import logger
from typing import List, Tuple
import numpy as np

class OCRProcessor:
    def __init__(self, backend: str = "paddleocr", language: str = "en"):
        self.backend = backend
        self.language = language
        
        if backend == "paddleocr":
            self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
        else:
            import easyocr
            self.ocr = easyocr.Reader(['en'])
    
    def extract_from_pdf(self, pdf_path: str) -> str:
        try:
            import pdf2image
            images = pdf2image.convert_from_path(pdf_path)
            full_text = ""
            
            for page_num, image in enumerate(images):
                logger.info(f"Processing page {page_num + 1}/{len(images)}")
                text = self._extract_from_image(image)
                full_text += f"\n--- PAGE {page_num + 1} ---\n{text}"
            
            return full_text
        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}")
            raise
    
    def extract_from_image(self, image_path: str) -> str:
        try:
            image = Image.open(image_path)
            return self._extract_from_image(image)
        except Exception as e:
            logger.error(f"Image extraction failed: {str(e)}")
            raise
    
    def _extract_from_image(self, image: Image.Image) -> str:
        try:
            image_np = np.array(image)

            if self.backend == "paddleocr":
                result = self.ocr.ocr(image_np, cls=True)

                extracted_text = []

                if result and result[0]:
                    for line in result[0]:
                        extracted_text.append(line[1][0])

                return "\n".join(extracted_text)

            else:
                result = self.ocr.readtext(image_np)
                return "\n".join([line[1] for line in result])

        except Exception as e:
            logger.error(f"OCR extraction failed: {str(e)}")
            raise

# Usage
ocr = OCRProcessor()