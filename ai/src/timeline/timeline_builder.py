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
        key: str
    ) -> List[str]:
        """
        Safely extract values from
        list of dicts or objects.
        """

        extracted = []

        for item in items:
            try:
                # Handle dictionary
                if isinstance(item, dict):
                    value = item.get(key)

                # Handle object
                else:
                    value = getattr(
                        item,
                        key,
                        None
                    )

                if value:
                    extracted.append(
                        str(value)
                    )

            except Exception as e:
                logger.warning(
                    f"Failed extracting "
                    f"{key}: {str(e)}"
                )

        return extracted

    @staticmethod
    def build_timeline(
        medical_records: List[Dict]
    ) -> List[Dict[str, Any]]:
        """
        Build chronological timeline
        of patient treatment history.
        """

        if not medical_records:
            logger.warning(
                "No medical records found"
            )
            return []

        timeline = []

        try:
            # Sort oldest → newest
            sorted_records = sorted(
                medical_records,
                key=lambda x: x.get(
                    "visit_date",
                    datetime.min
                )
            )

            for record in sorted_records:

                # Safe extraction
                diagnoses = (
                    TimelineBuilder
                    ._safe_extract(
                        record.get(
                            "diagnoses",
                            []
                        ),
                        "disease"
                    )
                )

                medicines = (
                    TimelineBuilder
                    ._safe_extract(
                        record.get(
                            "medicines",
                            []
                        ),
                        "name"
                    )
                )

                lab_tests = (
                    TimelineBuilder
                    ._safe_extract(
                        record.get(
                            "lab_reports",
                            []
                        ),
                        "test_name"
                    )
                )

                allergies = (
                    TimelineBuilder
                    ._safe_extract(
                        record.get(
                            "allergies",
                            []
                        ),
                        "name"
                    )
                )

                abnormal_findings = (
                    TimelineBuilder
                    ._safe_extract(
                        record.get(
                            "abnormal_findings",
                            []
                        ),
                        "finding"
                    )
                )

                # Determine event type
                event_type = []

                if diagnoses:
                    event_type.append(
                        "Diagnosis"
                    )

                if medicines:
                    event_type.append(
                        "Medication"
                    )

                if lab_tests:
                    event_type.append(
                        "Lab Test"
                    )

                if abnormal_findings:
                    event_type.append(
                        "Abnormal Finding"
                    )

                if allergies:
                    event_type.append(
                        "Allergy"
                    )

                event = {
                    "date":
                        record.get(
                            "visit_date"
                        ),

                    "hospital":
                        record.get(
                            "hospital_name",
                            "Unknown"
                        ),

                    "doctor":
                        record.get(
                            "doctor_name",
                            "Unknown"
                        ),

                    "event_type":
                        event_type
                        if event_type
                        else ["Visit"],

                    "diagnoses":
                        diagnoses,

                    "medications":
                        medicines,

                    "lab_tests":
                        lab_tests,

                    "abnormal_findings":
                        abnormal_findings,

                    "allergies":
                        allergies,

                    "summary":
                        record.get(
                            "summary",
                            ""
                        )
                }

                timeline.append(
                    event
                )

            logger.info(
                f"Built timeline "
                f"with {len(timeline)} "
                f"events"
            )

            return timeline

        except Exception as e:
            logger.error(
                f"Timeline generation "
                f"failed: {str(e)}"
            )

            return []