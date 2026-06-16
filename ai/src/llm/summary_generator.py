from typing import Dict, Any
import json

from groq import Groq
from loguru import logger

from ai.src.rag.retrieval import RAGRetrieval


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
        medical_record: dict
    ) -> str:
        """
        Generate AI medical summary
        using patient history + current record
        """

        try:
            # Retrieve relevant patient history
            context = self.rag.retrieve_patient_history(
                patient_id=patient_id,
                query=(str(medical_record)),
                top_k=5
            )

            prompt = f"""
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
{medical_record}

PATIENT HISTORY:
{context}
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
    medical_record: dict
):

        critical = {
        "critical_diagnoses": [],
        "abnormal_findings": [],
        "medications": [],
        "risk_flags": []
    }

        diagnoses = (
        medical_record
        .get("diagnoses", [])
    )

        for d in diagnoses:
            disease = d.get(
            "disease"
        )

            if disease:
                critical[
                "critical_diagnoses"
            ].append(
                disease
            )

        lab_reports = (
        medical_record
        .get("lab_reports", [])
    )

        for lab in lab_reports:

            if (
                lab.get("status")
            == "abnormal"
        ):

                critical[
                "abnormal_findings"
            ].append(
                f"{lab['test_name']}: "
                f"{lab['value']}"
            )

        return critical
    

    def format_medical_record(
    self,
    medical_record: Dict
) -> str:

        diagnoses = ", ".join([
            d["disease"]
            for d in medical_record.get(
                "diagnoses", []
            )
        ]) or "Not documented"

        medicines = ", ".join([
            m["medicine_name"]
            for m in medical_record.get(
                "medicines", []
            )
        ]) or "Not documented"

        allergies = ", ".join(
            medical_record.get(
                "allergies", []
            )
        ) or "Not documented"

        abnormal_labs = []

        for lab in medical_record.get(
            "lab_reports", []
        ):

            if (
                lab.get("status")
                == "abnormal"
            ):

                abnormal_labs.append(
                    f"{lab['test_name']}: "
                    f"{lab['value']} "
                    f"(Normal: "
                    f"{lab['normal_range']})"
                )

        abnormal_labs = (
            "\n".join(abnormal_labs)
            if abnormal_labs
            else "None"
        )

        return f"""
    Patient Name:
    {medical_record.get('patient_name')}

    Age:
    {medical_record.get('patient_age')}

    Gender:
    {medical_record.get('patient_gender')}

    Doctor:
    {medical_record.get('doctor_name')}

    Diagnoses:
    {diagnoses}

    Medicines:
    {medicines}

    Allergies:
    {allergies}

    Abnormal Labs:
    {abnormal_labs}

    Clinical Notes:
    {medical_record.get('notes')}
    """