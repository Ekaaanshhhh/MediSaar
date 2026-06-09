from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Medicine(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: Optional[str]

class Allergy(BaseModel):
    allergen: str
    reaction: Optional[str]
    severity: Optional[str]

class LabReport(BaseModel):
    test_name: str
    value: str
    normal_range: Optional[str]
    date: Optional[datetime]
    status: Optional[str]  # "normal", "abnormal"

class Diagnosis(BaseModel):
    disease: str
    date: Optional[datetime]
    status: Optional[str]

class MedicalRecord(BaseModel):
    patient_id: str
    hospital_id: str
    visit_date: datetime
    doctor_name: Optional[str]
    diagnoses: List[Diagnosis]
    medicines: List[Medicine]
    allergies: List[Allergy]
    lab_reports: List[LabReport]
    notes: str
    raw_text: str