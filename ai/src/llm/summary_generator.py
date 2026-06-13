from typing import Dict, Any
import json

from groq import Groq
from loguru import logger

from src.rag.retrieval import RAGRetrieval


class SummaryGenerator:
    def __init__(
        self,
        groq_api_key: str,
        rag_retrieval: RAGRetrieval
    ):
        self.client = Groq(api_key=groq_api_key)
        self.rag = rag_retrieval

    def generate_summary(
        self,
        patient_id: str,
        medical_record: str
    ) -> str:
        """
        Generate AI medical summary
        using patient history + current record
        """

        try:
            # Retrieve relevant patient history
            context = self.rag.retrieve_patient_history(
                patient_id=patient_id,
                query=medical_record,
                top_k=5
            )

            prompt = f"""
You are an AI medical summarization assistant.

Generate a concise and professional
medical summary using ONLY the
provided information.

IMPORTANT RULES:
- Use ONLY documented information.
- Do NOT infer diseases,
  complications, or risks.
- Do NOT provide medical advice.
- Do NOT recommend treatment.
- Do NOT make predictions.
- If information is unavailable,
  say "Not documented".
- Summarize facts only.

Current Medical Record:
{medical_record}

Previous Medical History:
{context}

Provide a structured summary including:

1. Key Diagnoses
   - Current diagnosis
   - Historical diagnosis

2. Current Medications

3. Known Allergies
   (HIGH PRIORITY)

4. Abnormal Lab Findings

5. Treatment Progression

6. Important Risk Factors

Keep the summary concise
(200–250 words maximum).

Highlight clinically important findings.
"""

            response = (
                self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a healthcare AI assistant. "
                                "Be factual, concise, professional, "
                                "and never invent medical information."
                            )
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.2,
                    max_tokens=500
                )
            )

            summary = (
                response.choices[0]
                .message
                .content
                .strip()
            )

            logger.info(
                f"Generated summary "
                f"for patient {patient_id}"
            )

            return summary

        except Exception as e:
            logger.error(
                f"Summary generation failed: {str(e)}"
            )

            return (
                "Unable to generate medical summary. "
                "Please review records manually."
            )

    def highlight_critical_info(
        self,
        medical_record: str
    ) -> Dict[str, Any]:
        """
        Extract critical medical information
        from a medical record.
        """

        prompt = f"""
Extract critical medical information
from the record below.

Medical Record:
{medical_record}

Return ONLY valid JSON.

Do NOT include:
- markdown
- explanations
- extra text

Expected JSON format:

{{
    "allergies": [],
    "critical_diagnoses": [],
    "abnormal_findings": [],
    "medications": [],
    "risk_flags": []
}}
"""

        try:
            response = (
                self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a medical extraction assistant. "
                                "Return only valid JSON."
                            )
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.1,
                    max_tokens=300,
                    response_format={
                        "type": "json_object"
                    }
                )
            )

            response_text = (
                response.choices[0]
                .message
                .content
                .strip()
            )

            data = json.loads(response_text)

            logger.info(
                "Critical medical info extracted successfully"
            )

            return data

        except json.JSONDecodeError as e:
            logger.error(
                f"JSON parsing failed: {str(e)}"
            )

            return {
                "allergies": [],
                "critical_diagnoses": [],
                "abnormal_findings": [],
                "medications": [],
                "risk_flags": []
            }

        except Exception as e:
            logger.error(
                f"Critical info extraction failed: {str(e)}"
            )

            return {
                "allergies": [],
                "critical_diagnoses": [],
                "abnormal_findings": [],
                "medications": [],
                "risk_flags": []
            }