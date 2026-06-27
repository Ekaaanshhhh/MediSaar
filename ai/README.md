# MediSaar AI Module

The MediSaar AI Module is a high-performance Python backend service designed to process, store, and analyze unstructured medical documents. It powers the core intelligence of the MediSaar platform.

**Production API Base URL:** `https://medisaar-ai-ici0.onrender.com`

---

## 🏗️ Core Architecture

This service is built using modern AI and backend frameworks:
- **Web Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous, High-throughput)
- **Database (Relational):** PostgreSQL (Persistent storage of patient history and metadata)
- **Database (Vector):** [ChromaDB](https://www.trychroma.com/) (Semantic similarity search for Retrieval-Augmented Generation)
- **Optical Character Recognition (OCR):** PaddleOCR (Extracts text from scanned PDFs and Images)
- **Language Models (LLM):** Groq API (Lightning-fast medical entity extraction and summarization)
- **Embeddings:** HuggingFace `all-MiniLM-L6-v2` via SentenceTransformers

## 🚀 Key Capabilities

1. **Document Digitization Pipeline:** Upload scanned medical reports (PDF/JPEG/PNG). The system automatically runs OCR, extracts raw text, and uses LLMs to parse out structured `Diagnoses`, `Medicines`, and `Allergies`.
2. **Dual-Storage Engine:** Medical records are simultaneously saved as structured JSON in PostgreSQL and as embedded vectors in ChromaDB.
3. **Retrieval-Augmented Generation (RAG):** When a doctor requests a summary, the system performs a semantic search across the patient's entire history in ChromaDB and generates a comprehensive, context-aware AI summary of their health status.

---

## 🛠️ Local Development Setup

To run the AI module locally, you must have [Docker](https://www.docker.com/) and Docker Compose installed.

### 1. Environment Variables
Copy the example environment file and fill in your Groq API key:
```bash
cp .env.example .env
```
Ensure you add your `GROQ_API_KEY`.

### 2. Run with Docker Compose
We use Docker Compose to spin up both the FastAPI application and the PostgreSQL database simultaneously.
```bash
docker-compose up --build
```
The API will be available at `http://localhost:8000`.

*(Note: Local deployment disables API documentation hiding. You can view the Swagger UI at `http://localhost:8000/docs`)*

---

## 🌐 API Reference

*(Note: Swagger `/docs` is intentionally disabled in the production environment for security purposes.)*

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload/medical-document` | `POST` | Upload a PDF/Image for OCR processing, entity extraction, and storage. |
| `/summary/generate` | `POST` | Generate an AI summary based on a patient's historical records. |
| `/retrieve/patient-history` | `POST` | Semantic search through a patient's past medical records. |
| `/store/patient-record` | `POST` | Manually store a raw text record directly into the Vector DB. |
| `/health` | `GET` | System health check and status verification. |

## 📦 Deployment

This module is configured for continuous deployment on [Render](https://render.com). 
The configuration is managed via Infrastructure as Code in the `render.yaml` blueprint located in the project root. It deploys a Docker Web Service using the `Dockerfile` inside this directory and provisions a managed PostgreSQL database.
