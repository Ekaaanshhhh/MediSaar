from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Medicine(BaseModel):
    name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None


class Allergy(BaseModel):
    allergen: str
    reaction: Optional[str] = None
    severity: Optional[str] = None


class LabReport(BaseModel):
    test_name: str
    value: str
    normal_range: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = None


class Diagnosis(BaseModel):
    disease: str
    date: Optional[str] = None
    status: Optional[str] = None
    evidence: Optional[str] = None


class MedicalRecord(BaseModel):
    patient_id: str
    patient_name: Optional[str] = None 
    patient_age: Optional[int] = None 
    patient_gender: Optional[str] = None
    hospital_id: str
    visit_date: datetime
    doctor_name: Optional[str] = None

    diagnoses: List[Diagnosis] = []
    medicines: List[Medicine] = []
    allergies: List[Allergy] = []
    lab_reports: List[LabReport] = []

    notes: str = ""
    raw_text: str