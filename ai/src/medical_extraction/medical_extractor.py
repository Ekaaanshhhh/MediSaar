"""
MediSaar AI — Medical Entity Extraction.

Uses Groq LLM to extract structured medical entities from OCR text.
Includes retry logic with exponential backoff, timeout handling,
and custom exception reporting.
"""

import json
import re
import time
from datetime import datetime, timezone
from typing import Optional

from groq import Groq
from loguru import logger

from ai.src.exceptions import MedicalExtractionError
from ai.src.medical_extraction.entity_models import (
    Allergy,
    Diagnosis,
    LabReport,
    MedicalRecord,
    Medicine,
)


class MedicalExtractor:
    """
    Extracts structured medical entities from raw OCR text using Groq LLM.

    Args:
        groq_api_key: API key for Groq service.
        model: LLM model identifier.
        timeout_seconds: Timeout for each LLM API call.
        max_retries: Maximum extraction attempts.
    """

    # Maximum raw text length to prevent prompt injection via massive payloads
    MAX_INPUT_LENGTH = 15_000

    def __init__(
        self,
        groq_api_key: str,
        model: str = "llama-3.3-70b-versatile",
        timeout_seconds: int = 30,
        max_retries: int = 3,
    ):
        self.client = Groq(api_key=groq_api_key, timeout=timeout_seconds)
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

    def _clean_json_response(self, text: str) -> str:
        """Strip markdown fences and extract the JSON object from LLM output."""
        text = text.strip()

        # Remove markdown code blocks if present
        text = re.sub(r"```json", "", text)
        text = re.sub(r"```", "", text)

        # Extract JSON object
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("No valid JSON found in response")

        return match.group(0)

    def extract_entities(
        self,
        raw_text: str,
        patient_id: str,
        hospital_id: str,
    ) -> MedicalRecord:
        """
        Extract medical entities from OCR text using Groq LLM.

        Args:
            raw_text: Raw text extracted from OCR.
            patient_id: Unique patient identifier.
            hospital_id: Unique hospital identifier.

        Returns:
            Validated MedicalRecord with extracted entities.

        Raises:
            MedicalExtractionError: If extraction fails after all retries.
        """
        # Truncate excessively long input to prevent abuse
        if len(raw_text) > self.MAX_INPUT_LENGTH:
            logger.warning(
                "Input text truncated from {orig} to {max} chars",
                orig=len(raw_text),
                max=self.MAX_INPUT_LENGTH,
            )
            raw_text = raw_text[: self.MAX_INPUT_LENGTH]

        prompt = self._build_extraction_prompt(raw_text)

        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                logger.info(
                    "Medical extraction attempt {attempt}/{max}",
                    attempt=attempt,
                    max=self.max_retries,
                )

                chat_completion = self.client.chat.completions.create(
                    model=self.model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0,
                )

                response_text = chat_completion.choices[0].message.content

                # Log extraction status without PHI data
                logger.info(
                    "LLM response received: {length} chars",
                    length=len(response_text) if response_text else 0,
                )

                cleaned_json = self._clean_json_response(response_text)
                data = json.loads(cleaned_json)

                # Handle patient_age that may come as string from LLM
                patient_age = data.get("patient_age")
                if isinstance(patient_age, str):
                    try:
                        patient_age = int(
                            re.sub(r"[^\d]", "", patient_age)
                        ) or None
                    except (ValueError, TypeError):
                        patient_age = None

                record = MedicalRecord(
                    patient_id=patient_id,
                    patient_name=data.get("patient_name"),
                    patient_age=patient_age,
                    patient_gender=data.get("patient_gender"),
                    hospital_id=hospital_id,
                    visit_date=datetime.now(timezone.utc),
                    doctor_name=data.get("doctor_name"),
                    diagnoses=[
                        Diagnosis(**d)
                        for d in data.get("diagnoses", [])
                    ],
                    medicines=[
                        Medicine(**m)
                        for m in data.get("medicines", [])
                    ],
                    allergies=[
                        Allergy(**a)
                        for a in data.get("allergies", [])
                    ],
                    lab_reports=[
                        LabReport(**lr)
                        for lr in data.get("lab_reports", [])
                    ],
                    notes=data.get("notes", ""),
                    raw_text=raw_text,
                )

                logger.success(
                    "Extracted medical entities for patient {pid}: "
                    "{n_diag} diagnoses, {n_med} medicines, {n_lab} labs",
                    pid=patient_id,
                    n_diag=len(record.diagnoses),
                    n_med=len(record.medicines),
                    n_lab=len(record.lab_reports),
                )

                return record

            except json.JSONDecodeError as e:
                last_error = e
                logger.error(
                    "JSON parsing failed on attempt {attempt}: {error}",
                    attempt=attempt,
                    error=str(e),
                )

            except Exception as e:
                last_error = e
                logger.error(
                    "Extraction attempt {attempt} failed: {error}",
                    attempt=attempt,
                    error=str(e),
                )

            # Exponential backoff between retries
            if attempt < self.max_retries:
                backoff = 2 ** (attempt - 1)
                logger.info("Retrying in {sec}s...", sec=backoff)
                time.sleep(backoff)

        raise MedicalExtractionError(
            detail=(
                f"Medical entity extraction failed after {self.max_retries} "
                f"retries. Last error: {str(last_error)}"
            )
        )

    @staticmethod
    def _build_extraction_prompt(raw_text: str) -> str:
        """Build the LLM prompt for medical entity extraction."""
        return f"""
You are an expert in medical information extraction system.

Extract structured medical entities from the patient report.

STRICT RULES:
1. Return ONLY valid JSON.
2. Never hallucinate missing information.
3. If data is missing, use null.
4. Ignore unrelated/noisy OCR text.
5. If a category has no data, return an empty list.
6. Do NOT invent diagnoses, medicines, or lab reports.

MEDICINE EXTRACTION RULES:
- Separate medicine name and dosage.
- Extract dosage if available.
- Keep frequency separate.
- Example:
"Cetirizine 10mg once daily"
becomes:
{{
    "name": "Cetirizine",
    "dosage": "10mg",
    "frequency": "once daily",
    "duration": null
}}
Extract:
- patient_name
- patient_age
- patient_gender
IMPORTANT RULES: 
1. ONLY extract explicitly mentioned diagnoses. 

2. DO NOT assume or infer diagnoses. 

3. If report contains words like: 
    - suspected 
    - possible 
    - probable 
    - query 
    - rule out 
    - likely 
    - further confirm
Then mark diagnosis status as:
 "suspected" 

DO NOT mark it as "active".

5. If report explicitly labels results as:

 "Low", "High", "Borderline", "Critical" 

 Use that label for status. 
 
 Do NOT override with your own reasoning.

For diagnoses, also include:
"evidence" → exact supporting text from report

6. If no information exists, return empty list.

DATE EXTRACTION RULES:

1. Extract dates whenever explicitly present.

2. If exact year is corrupted or partially unreadable
(example: "202X", "2X"),
still extract the readable portion.

Example:
"02 Dec, 202X"
becomes:
"02 Dec"

3. Prefer report/visit dates in this order:
- Reported on
- Collected on
- Registered on
- Visit date

4. For lab reports:
If a common report date exists in the document,
reuse it for all lab reports.

5. If no date exists, return null.

LAB REPORT EXTRACTION RULES:
- Extract test_name, value, normal_range, and status separately.
- "normal" or "abnormal" refers to status.
- normal_range should contain medical reference values only.

Example:
"Blood Glucose: 180 mg/dL (abnormal, normal: 70-100)"
becomes:
{{
    "test_name": "Blood Glucose",
    "value": "180 mg/dL",
    "normal_range": "70-100",
    "status": "abnormal"
}}

Example:
"Blood Pressure: 120/80 mmHg (normal)"
becomes:
{{
    "test_name": "Blood Pressure",
    "value": "120/80 mmHg",
    "normal_range": null,
    "status": "normal"
}}
If report explicitly labels:
Low / High / Borderline / Critical

prefer report label over inferred range comparison.

LAB STATUS RULE:
Convert all lab interpretations into only:
- "normal"
- "abnormal"

Examples:
HIGH → abnormal
LOW → abnormal
elevated → abnormal
positive → abnormal
negative → normal

Include dosage units (mg, ml, mcg) whenever available.
Always preserve measurement units (g/dL, %, pg, fL, mg/dL, cumm, etc.) in BOTH value and normal_range whenever available.
Never remove units.

OCR CLEANING RULES:

1. Ignore broken OCR words and random text.

Examples:
"tholog", "oorc", "7P/6", "H.Otatah"

should be ignored unless medically meaningful.

2. Prefer medically meaningful labels over noisy OCR.

Example:
"Total WBC count"
should be extracted as:
"WBC COUNT"

Patient Report:
---BEGIN REPORT---
{raw_text}
---END REPORT---

Return JSON in EXACTLY this structure:

{{
    "patient_name": null,
    "patient_age": null,
    "patient_gender": null,
    
    "diagnoses": [
        {{
            "disease": "",
            "date": null,
            "status": "active",
             "evidence": ""
        }}
    ],
    "medicines": [
        {{
            "name": "",
            "dosage": null,
            "frequency": null,
            "duration": null
        }}
    ],
    "allergies": [
        {{
            "allergen": "",
            "reaction": null,
            "severity": null
        }}
    ],
    "lab_reports": [
        {{
            "test_name": "",
            "value": "",
            "normal_range": null,
            "date": null,
            "status": null
        }}
    ],
    "doctor_name": null,
    "notes": ""
}}

Return ONLY JSON.
"""