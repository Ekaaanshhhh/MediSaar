import { Document, Types } from "mongoose";

export enum AISummaryType {
  HEALTH_SNAPSHOT = "HEALTH_SNAPSHOT",
  CLINICAL_SUMMARY = "CLINICAL_SUMMARY",
  MEDICATION_SUMMARY = "MEDICATION_SUMMARY",
  EMERGENCY_SUMMARY = "EMERGENCY_SUMMARY",
}

export interface IAISummary extends Document {
  patientId: Types.ObjectId; // Reference to IndividualProfile
  visitId: Types.ObjectId; // Core Entity requirement
  summaryType: AISummaryType;
  summaryText: string;
  generatedByModel: string; // e.g. "gemini-2.5-pro"
  generatedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
