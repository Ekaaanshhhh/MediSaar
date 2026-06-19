"""
MediSaar AI — AI Summary Generator.

Generates medical summaries and extracts critical information
using Groq LLM with RAG-retrieved patient history context.
"""

import time
from typing import Dict, Any, Optional

from groq import Groq
from loguru import logger

from ai.src.exceptions import SummaryGenerationError
from ai.src.rag.retrieval import RAGRetrieval


class SummaryGenerator:
    """
    Generates AI medical summaries using patient history context.

    Args:
        groq_api_key: API key for Groq service.
        rag_retrieval: RAGRetrieval instance for history context.
        model: LLM model identifier.
        timeout_seconds: Timeout for each LLM API call.
        max_retries: Maximum generation attempts.
    """

    def __init__(
        self,
        groq_api_key: str,
        rag_retrieval: RAGRetrieval,
        model: str = "llama-3.3-70b-versatile",
        timeout_seconds: int = 30,
        max_retries: int = 2,
    ):
        self.client = Groq(api_key=groq_api_key, timeout=timeout_seconds)
        self.rag = rag_retrieval
        self.model = model
        self.max_retries = max_retries

    def generate_summary(
        self,
        patient_id: str,
        medical_record: dict,
        max_tokens: int = 1500,
    ) -> str:
        """
        Generate an AI medical summary using patient history + current record.

        Args:
            patient_id: Unique patient identifier.
            medical_record: Current medical record dict.
            max_tokens: Maximum tokens for LLM response.

        Returns:
            Generated summary text.

        Raises:
            SummaryGenerationError: If generation fails after retries.
        """
        last_error: Optional[Exception] = None

        for attempt in range(1, self.max_retries + 1):
            try:
                # Retrieve relevant patient history
                query = self._build_rag_query(medical_record)
                context = self.rag.retrieve_patient_history(
                    patient_id=patient_id,
                    query=query,
                    top_k=5,
                )

                prompt = self._build_summary_prompt(medical_record, context)

                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a healthcare AI assistant. "
                                "Be factual, concise, professional, "
                                "and never invent medical information."
                            ),
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.2,
                    max_tokens=max_tokens,
                )

                summary = response.choices[0].message.content.strip()

                logger.info(
                    "Generated summary for patient {pid} ({length} chars)",
                    pid=patient_id,
                    length=len(summary),
                )

                return summary

            except Exception as e:
                last_error = e
                logger.error(
                    "Summary generation attempt {attempt} failed: {error}",
                    attempt=attempt,
                    error=str(e),
                )

                if attempt < self.max_retries:
                    backoff = 2 ** (attempt - 1)
                    time.sleep(backoff)

        raise SummaryGenerationError(
            detail=(
                f"Summary generation failed after {self.max_retries} retries. "
                f"Last error: {str(last_error)}"
            )
        )

    @staticmethod
    def _build_rag_query(medical_record: dict) -> str:
        """Extract key terms from the medical record for RAG query."""
        query_parts = []

        diagnoses = medical_record.get("diagnoses", [])
        for d in diagnoses:
            disease = d.get("disease", "") if isinstance(d, dict) else ""
            if disease:
                query_parts.append(disease)

        lab_reports = medical_record.get("lab_reports", [])
        for lab in lab_reports:
            if isinstance(lab, dict) and lab.get("status") == "abnormal":
                test_name = lab.get("test_name", "")
                if test_name:
                    query_parts.append(test_name)

        return " ".join(query_parts) if query_parts else "patient medical history"

    @staticmethod
    def _build_summary_prompt(medical_record: dict, context: str) -> str:
        """Build the LLM prompt for summary generation."""
        return f"""
You are a medical documentation assistant.

Your task is to summarize ONLY the information
explicitly present in the patient's records.

STRICT RULES:
1. Do NOT diagnose diseases.
2. Do NOT infer causes or mechanisms.
3. Do NOT speculate medically.
4. Do NOT add information not found
   in the provided data.
5. If information is missing,
   write "Not documented".
6. Recommendations must be generic,
   such as physician follow-up or
   clinical evaluation.
7. Base every statement only on
   evidence in the records.

Never explain WHY a medical condition happened
unless explicitly stated in the records.
Avoid pathophysiological explanations.

Generate summary in EXACT format:

Medical Summary

Patient: <patient_name>
Age/Gender: <age> / <gender>
Referring Doctor: <doctor_name>

Primary Findings:
- Key abnormal findings only
- Mention diagnosis only if explicitly stated
- Mention abnormal lab results

Clinical Interpretation:
Provide a neutral evidence-based
summary only from documented findings.

Critical Observations:
- Important abnormal findings

Recommended Follow-up:
Generic physician follow-up only.

CURRENT RECORD:
---BEGIN RECORD---
{medical_record}
---END RECORD---

PATIENT HISTORY:
{context}
"""

    def highlight_critical_info(self, medical_record: dict) -> Dict[str, Any]:
        """
        Extract critical medical information from a record.

        Args:
            medical_record: Medical record dict.

        Returns:
            Dict with critical_diagnoses, abnormal_findings,
            medications, and risk_flags.
        """
        critical: Dict[str, Any] = {
            "critical_diagnoses": [],
            "abnormal_findings": [],
            "medications": [],
            "risk_flags": [],
        }

        diagnoses = medical_record.get("diagnoses", [])
        for d in diagnoses:
            disease = d.get("disease") if isinstance(d, dict) else None
            if disease:
                critical["critical_diagnoses"].append(disease)

        lab_reports = medical_record.get("lab_reports", [])
        for lab in lab_reports:
            if isinstance(lab, dict) and lab.get("status") == "abnormal":
                critical["abnormal_findings"].append(
                    f"{lab.get('test_name', 'Unknown')}: {lab.get('value', 'N/A')}"
                )

        return critical

    def format_medical_record(self, medical_record: Dict) -> str:
        """
        Format a medical record dict into a human-readable string.

        Args:
            medical_record: Medical record dict.

        Returns:
            Formatted string representation.
        """
        diagnoses = ", ".join([
            d.get("disease", "")
            for d in medical_record.get("diagnoses", [])
            if isinstance(d, dict)
        ]) or "Not documented"

        medicines = ", ".join([
            m.get("name", "")
            for m in medical_record.get("medicines", [])
            if isinstance(m, dict)
        ]) or "Not documented"

        allergies_list = medical_record.get("allergies", [])
        allergies = ", ".join([
            a.get("allergen", "") if isinstance(a, dict) else str(a)
            for a in allergies_list
        ]) or "Not documented"

        abnormal_labs = []
        for lab in medical_record.get("lab_reports", []):
            if isinstance(lab, dict) and lab.get("status") == "abnormal":
                abnormal_labs.append(
                    f"{lab.get('test_name', 'Unknown')}: "
                    f"{lab.get('value', 'N/A')} "
                    f"(Normal: {lab.get('normal_range', 'N/A')})"
                )

        abnormal_labs_str = (
            "\n".join(abnormal_labs) if abnormal_labs else "None"
        )

        return f"""
Patient Name: {medical_record.get('patient_name', 'N/A')}
Age: {medical_record.get('patient_age', 'N/A')}
Gender: {medical_record.get('patient_gender', 'N/A')}
Doctor: {medical_record.get('doctor_name', 'N/A')}
Diagnoses: {diagnoses}
Medicines: {medicines}
Allergies: {allergies}
Abnormal Labs: {abnormal_labs_str}
Clinical Notes: {medical_record.get('notes', 'N/A')}
"""