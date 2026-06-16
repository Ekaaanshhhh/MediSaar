import { Document, Types } from "mongoose";

export enum ReportType {
  BLOOD_REPORT = "BLOOD_REPORT",
  MRI = "MRI",
  CT_SCAN = "CT_SCAN",
  XRAY = "XRAY",
  PRESCRIPTION_SCAN = "PRESCRIPTION_SCAN",
  DISCHARGE_SUMMARY = "DISCHARGE_SUMMARY",
  LAB_REPORT = "LAB_REPORT",
  INVOICE = "INVOICE",
}

export interface IReport extends Document {
  patientId: Types.ObjectId; // Reference to IndividualProfile
  visitId?: Types.ObjectId; // Optional if uploaded outside a visit
  uploadedBy: Types.ObjectId; // User ID
  reportType: ReportType;
  title: string;
  cloudinaryUrl: string;
  extractedText?: string; // Stored from OCR
  reportDate: Date;

  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
