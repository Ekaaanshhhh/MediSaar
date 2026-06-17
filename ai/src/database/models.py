import uuid

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Text,
    JSON
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func


Base = declarative_base()


class PatientRecord(Base):
    __tablename__ = "patient_records"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    hospital_id = Column(
        String,
        index=True,
        nullable=False
    )

    visit_date = Column(
        DateTime(timezone=True),
        nullable=False
    )

    doctor_name = Column(
        String,
        nullable=True
    )

    diagnoses = Column(
        JSON,
        default=list
    )

    medicines = Column(
        JSON,
        default=list
    )

    allergies = Column(
        JSON,
        default=list
    )

    lab_reports = Column(
        JSON,
        default=list
    )

    notes = Column(
        Text,
        nullable=True
    )

    raw_text = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


class PatientSummary(Base):
    __tablename__ = "patient_summaries"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    patient_id = Column(
        String,
        index=True,
        nullable=False
    )

    summary = Column(
        Text,
        nullable=False
    )

    critical_info = Column(
        JSON,
        default=dict
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )