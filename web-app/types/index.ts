export type Role = 'INDIVIDUAL' | 'DOCTOR' | 'INSTITUTION';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  avatarUrl?: string;
}

export interface IndividualProfile {
  userId: string;
  medisaarId: string;
  dateOfBirth: string;
  bloodGroup: string;
  allergies: string[];
  currentConditions: string[];
  phone: string;
}

export interface DoctorProfile {
  userId: string;
  medisaarId: string;
  specialization: string;
  experienceYears: number;
  associatedInstitutions: string[]; // array of institution IDs
  phone: string;
}

export interface InstitutionProfile {
  userId: string;
  medisaarId: string;
  type: string; // e.g., 'Hospital', 'Clinic'
  address: string;
  phone: string;
}

export interface Visit {
  id: string;
  patientId: string; // Individual user ID
  doctorId: string; // Doctor user ID
  institutionId: string; // Institution user ID
  date: string;
  status: 'COMPLETED' | 'SCHEDULED' | 'CANCELLED';
  diagnosis?: string;
  notes?: string;
}

export interface Report {
  id: string;
  patientId: string;
  type: 'BLOOD' | 'MRI' | 'CT_SCAN' | 'DISCHARGE_SUMMARY' | 'OTHER';
  title: string;
  date: string;
  fileUrl: string;
  uploaderId: string; // Could be doctor or institution
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  visitId: string;
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  date: string;
}


