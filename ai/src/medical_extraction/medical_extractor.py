from groq import Groq
from .entity_models import (
    MedicalRecord,
    Diagnosis,
    Medicine,
    Allergy,
    LabReport
)

import json
import re
from loguru import logger
from datetime import datetime


class MedicalExtractor:
    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)

    def _clean_json_response(self, text: str) -> str:
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
        hospital_id: str
    ) -> MedicalRecord:
        """
        Extract medical entities from OCR text using Groq LLM
        """

        prompt = f"""
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
{raw_text}

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

        MAX_RETRIES = 3

        for attempt in range(MAX_RETRIES):
            try:
                logger.info(
                    f"Medical extraction attempt "
                    f"{attempt + 1}/{MAX_RETRIES}"
                )

                chat_completion = (
                    self.client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        temperature=0,
                    )
                )

                response_text = (
                    chat_completion
                    .choices[0]
                    .message.content
                )

                logger.info(
                    f"Raw LLM Response:\n{response_text}"
                )

                
                cleaned_json = self._clean_json_response(
                    response_text
                )

                # Parse JSON
                data = json.loads(cleaned_json)

                # Create validated medical record
                record = MedicalRecord(
                    patient_id=patient_id,
                    patient_name=data.get("patient_name"),
                    patient_age=data.get("patient_age"),
                    patient_gender=data.get("patient_gender"),
                    hospital_id=hospital_id,
                    visit_date=datetime.now(),

                    doctor_name=data.get(
                        "doctor_name"
                    ),

                    diagnoses=[
                        Diagnosis(**d)
                        for d in data.get(
                            "diagnoses", []
                        )
                    ],

                    medicines=[
                        Medicine(**m)
                        for m in data.get(
                            "medicines", []
                        )
                    ],

                    allergies=[
                        Allergy(**a)
                        for a in data.get(
                            "allergies", []
                        )
                    ],

                    lab_reports=[
                        LabReport(**lr)
                        for lr in data.get(
                            "lab_reports", []
                        )
                    ],

                    notes=data.get(
                        "notes", ""
                    ),

                    raw_text=raw_text
                )

                logger.success(
                    f"Successfully extracted "
                    f"entities for patient "
                    f"{patient_id}"
                )

                return record

            except json.JSONDecodeError as e:
                logger.error(
                    f"JSON parsing failed: {str(e)}"
                )

            except Exception as e:
                logger.error(
                    f"Extraction attempt "
                    f"{attempt + 1} failed: "
                    f"{str(e)}"
                )

        raise Exception(
            "Medical entity extraction failed "
            "after multiple retries"
        )