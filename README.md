# MediSaar: Cross-Hospital Patient Record Management

MediSaar is an advanced healthcare platform designed to seamlessly manage and retrieve patient medical records across multiple hospital networks. It utilizes artificial intelligence to automatically parse, store, and summarize unstructured medical documents.

## Project Architecture

This repository contains a full-stack application divided into two core modules:

### 1. Web Application (Frontend)
A modern, responsive user interface built with **Next.js**. 
- **Tech Stack:** Next.js (App Router), React, TailwindCSS.
- **Directory:** `/web-app` (or root depending on setup)
- **Features:** Dashboard for doctors, file upload interface, and patient history view.

### 2. AI Module (Backend)
A high-performance Python backend powered by **FastAPI**.
- **Tech Stack:** FastAPI, PostgreSQL, ChromaDB, PaddleOCR, LangChain, Groq LLM.
- **Directory:** `/ai`
- **Features:** Optical Character Recognition (OCR) for medical reports, Entity Extraction (Diagnoses, Medicines, Allergies), and Retrieval-Augmented Generation (RAG) for patient history summarization.
- **Live API Endpoint:** `https://medisaar-ai-ici0.onrender.com`

---

## Getting Started

To run the full stack locally, you will need Node.js and Docker installed on your machine.

### Run the Frontend
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run the AI Backend
Please see the detailed instructions in the [AI Module Documentation](./ai/README.md).

---

## Deployment
- **Frontend:** Designed to be deployed on Vercel.
- **Backend:** Designed to be deployed as a Docker Web Service on Render (see `render.yaml`).
