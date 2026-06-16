import { Document, Types } from "mongoose";

export enum UserRole {
  INDIVIDUAL = "INDIVIDUAL",
  DOCTOR = "DOCTOR",
  INSTITUTION = "INSTITUTION",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export enum InstitutionType {
  HOSPITAL = "HOSPITAL",
  CLINIC = "CLINIC",
  DIAGNOSTIC_CENTER = "DIAGNOSTIC_CENTER",
  LABORATORY = "LABORATORY",
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  mustChangePassword: boolean;
  profileId: Types.ObjectId; // Reference to the respective profile
  createdAt: Date;
  updatedAt: Date;
}

export interface IIndividualProfile extends Document {
  userId: Types.ObjectId;
  mediSaarId: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: string;
  profilePhoto?: string;
  currentAISummary?: string; // Latest AI summary snippet
  createdAt: Date;
  updatedAt: Date;
}

export interface IDoctorProfile extends Document {
  userId: Types.ObjectId;
  specialization: string;
  licenseNumber: string;
  qualification: string;
  yearsOfExperience: number;
  associatedInstitutions: Types.ObjectId[]; // Array of InstitutionProfile ObjectIds
  profilePhoto?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInstitutionProfile extends Document {
  userId: Types.ObjectId;
  institutionName: string;
  institutionType: InstitutionType;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}
