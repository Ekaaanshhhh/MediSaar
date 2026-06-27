# MediSaar AI - API Documentation

This guide provides the necessary details for the frontend team to integrate with the deployed AI backend.

**Base URL:** `https://medisaar-ai-ici0.onrender.com`

---

## 1. Upload & Store Medical Document
Uploads a medical document (PDF or Image), performs OCR, extracts medical entities via AI, and stores the data in the PostgreSQL database and ChromaDB for future retrieval.

**Endpoint:** `POST /upload/medical-document`

**Content-Type:** `multipart/form-data`

### Request Body (Form Data)
| Key | Type | Description | Required |
|-----|------|-------------|----------|
| `file` | File | The document to upload. Supported formats: `.pdf`, `.png`, `.jpg`, `.jpeg`. (Max size: 10MB) | Yes |
| `patient_id` | String | Unique ID for the patient. Alphanumeric, hyphens, underscores only. | Yes |
| `hospital_id` | String | Unique ID for the hospital. Alphanumeric, hyphens, underscores only. | Yes |

### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Medical document processed successfully",
  "metadata": {
    "patient_id": "patient-123",
    "hospital_id": "hospital-456",
    "filename": "report.pdf",
    "file_type": "pdf",
    "text_length": 4502
  },
  "extracted_data": {
    "diagnoses": ["Hypertension", "Type 2 Diabetes"],
    "medicines": ["Metformin", "Lisinopril"],
    "allergies": ["Penicillin"],
    "lab_reports": [],
    "visit_date": "2023-10-15",
    "doctor_name": "Dr. Smith",
    "notes": "Patient advised to reduce sodium intake."
  }
}
```

---

## 2. Generate AI Summary
Generates a comprehensive AI summary for a patient's medical record, automatically retrieving their historical records to provide context. The generated summary is automatically stored in the database.

**Endpoint:** `POST /summary/generate`

**Content-Type:** `application/json`

### Request Body (JSON)
```json
{
  "patient_id": "patient-123",
  "medical_record": {
    "diagnoses": ["Hypertension"],
    "medicines": ["Metformin"],
    "allergies": ["Penicillin"],
    "lab_reports": [],
    "visit_date": "2023-10-15",
    "doctor_name": "Dr. Smith",
    "notes": "Patient advised to reduce sodium intake."
  }
}
```

### Success Response (200 OK)
```json
{
  "patient_id": "patient-123",
  "summary": "This is the generated AI summary paragraph detailing the patient's current visit combined with their past medical history...",
  "critical_info": {
    "allergies_alert": true,
    "high_risk_diagnoses": [],
    "contraindications": []
  },
  "history_found": true,
  "generated_at": "2026-06-23T18:25:00Z",
  "status": "success"
}
```

---

## 3. Retrieve Patient History
Retrieve relevant patient medical history based on a semantic similarity search query (Powered by ChromaDB Vector Search).

**Endpoint:** `POST /retrieve/patient-history`

**Content-Type:** `application/json`

### Request Body (JSON)
```json
{
  "patient_id": "patient-123",
  "query": "previous blood test results",
  "top_k": 5
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "patient_id": "patient-123",
  "query": "previous blood test results",
  "count": 2,
  "results": [
    {
      "text": "The patient's blood test from January showed slightly elevated cholesterol...",
      "score": 0.85,
      "metadata": {
        "hospital_id": "hospital-456",
        "visit_date": "2023-01-10"
      }
    }
  ]
}
```

---

## 4. Directly Store Patient Record
Manually store a patient record text directly into the Vector Database (without going through the PDF/Image OCR upload pipeline).

**Endpoint:** `POST /store/patient-record`

**Content-Type:** `application/json`

### Request Body (JSON)
```json
{
  "patient_id": "patient-123",
  "record_text": "Patient visited for a routine checkup. Vitals are normal.",
  "metadata": {
    "doctor": "Dr. Smith"
  }
}
```

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Patient record stored successfully",
  "patient_id": "patient-123"
}
```

---

## 5. Health Check
Use this endpoint to verify that the API is awake and running.

**Endpoint:** `GET /health`

### Success Response (200 OK)
```json
{
  "status": "healthy",
  "timestamp": "2026-06-23T18:25:00Z"
}
```
