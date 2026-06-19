"""
MediSaar AI — Patient Timeline Builder.

Builds chronological patient treatment timeline
from extracted medical records.
"""

from typing import List, Dict, Any
from datetime import datetime

from loguru import logger


class TimelineBuilder:
    """
    Builds chronological patient timeline
    from extracted medical records.
    """

    @staticmethod
    def _safe_extract(
        items: List[Any],
        key: str,
    ) -> List[str]:
        """
        Safely extract values from a list of dicts or objects.

        Args:
            items: List of dicts or objects.
            key: Key/attribute name to extract.

        Returns:
            List of string values.
        """
        extracted = []

        for item in items:
            try:
                if isinstance(item, dict):
                    value = item.get(key)
                else:
                    value = getattr(item, key, None)

                if value:
                    extracted.append(str(value))
            except Exception as e:
                logger.warning(
                    "Failed extracting {key}: {error}",
                    key=key,
                    error=str(e),
                )

        return extracted

    @staticmethod
    def _parse_date(date_value: Any) -> datetime:
        """
        Safely parse a date value for sorting.

        Handles datetime objects, ISO format strings,
        and returns datetime.min for unparseable values.
        """
        if isinstance(date_value, datetime):
            return date_value

        if isinstance(date_value, str):
            for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
                try:
                    return datetime.strptime(date_value, fmt)
                except ValueError:
                    continue

        return datetime.min

    @staticmethod
    def build_timeline(
        medical_records: List[Dict],
    ) -> List[Dict[str, Any]]:
        """
        Build chronological timeline of patient treatment history.

        Args:
            medical_records: List of medical record dicts.

        Returns:
            Sorted list of timeline events.
        """
        if not medical_records:
            logger.warning("No medical records provided for timeline")
            return []

        timeline = []

        try:
            # Sort oldest → newest with safe date parsing
            sorted_records = sorted(
                medical_records,
                key=lambda x: TimelineBuilder._parse_date(
                    x.get("visit_date", datetime.min)
                ),
            )

            for record in sorted_records:

                diagnoses = TimelineBuilder._safe_extract(
                    record.get("diagnoses", []),
                    "disease",
                )

                medicines = TimelineBuilder._safe_extract(
                    record.get("medicines", []),
                    "name",
                )

                lab_tests = TimelineBuilder._safe_extract(
                    record.get("lab_reports", []),
                    "test_name",
                )

                # Fixed: allergy model uses 'allergen' not 'name'
                allergies = TimelineBuilder._safe_extract(
                    record.get("allergies", []),
                    "allergen",
                )

                abnormal_findings = TimelineBuilder._safe_extract(
                    record.get("abnormal_findings", []),
                    "finding",
                )

                # Determine event type
                event_type = []
                if diagnoses:
                    event_type.append("Diagnosis")
                if medicines:
                    event_type.append("Medication")
                if lab_tests:
                    event_type.append("Lab Test")
                if abnormal_findings:
                    event_type.append("Abnormal Finding")
                if allergies:
                    event_type.append("Allergy")

                event = {
                    "date": record.get("visit_date"),
                    "hospital": record.get("hospital_name", "Unknown"),
                    "doctor": record.get("doctor_name", "Unknown"),
                    "event_type": event_type if event_type else ["Visit"],
                    "diagnoses": diagnoses,
                    "medications": medicines,
                    "lab_tests": lab_tests,
                    "abnormal_findings": abnormal_findings,
                    "allergies": allergies,
                    "summary": record.get("summary", ""),
                }

                timeline.append(event)

            logger.info(
                "Built timeline with {count} events",
                count=len(timeline),
            )

            return timeline

        except Exception as e:
            logger.error(
                "Timeline generation failed: {error}",
                error=str(e),
            )
            return []