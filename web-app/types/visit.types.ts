import { Document, Types } from "mongoose";

export enum VisitStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  FOLLOW_UP_REQUIRED = "FOLLOW_UP_REQUIRED",
}

export enum DiagnosisType {
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

export enum DiagnosisSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface IVisit extends Document {
  patientId: Types.ObjectId; // Reference to IndividualProfile
  doctorId?: Types.ObjectId; // Reference to DoctorProfile
  institutionId: Types.ObjectId; // Reference to InstitutionProfile
  visitDate: Date;
  chiefComplaint: string;
  notes?: string;
  followUpDate?: Date;
  status: VisitStatus;
  
  createdBy: Types.ObjectId; // User ID
  updatedBy: Types.ObjectId; // User ID
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IDiagnosis extends Document {
  patientId: Types.ObjectId; // Reference to IndividualProfile
  visitId: Types.ObjectId; // Core Entity requirement
  doctorId?: Types.ObjectId;
  conditionName: string;
  diagnosisType: DiagnosisType;
  severity: DiagnosisSeverity;
  notes?: string;

  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription extends Document {
  patientId: Types.ObjectId; // Reference to IndividualProfile
  visitId: Types.ObjectId; // Core Entity requirement
  doctorId?: Types.ObjectId;
  medicines: IMedicine[];

  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
