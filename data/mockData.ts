import { addDays, subDays, subMonths, format } from 'date-fns';

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

// ----------------------------------------------------------------------
// MOCK DATA GENERATION
// ----------------------------------------------------------------------
const today = new Date();

export const users: User[] = [
  // INDIVIDUALS
  { id: 'ind-1', email: 'john@example.com', role: 'INDIVIDUAL', name: 'John Doe', avatarUrl: 'https://i.pravatar.cc/150?u=ind-1' },
  { id: 'ind-2', email: 'jane@example.com', role: 'INDIVIDUAL', name: 'Jane Smith', avatarUrl: 'https://i.pravatar.cc/150?u=ind-2' },
  { id: 'ind-3', email: 'alice@example.com', role: 'INDIVIDUAL', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=ind-3' },
  // DOCTORS
  { id: 'doc-1', email: 'dr.smith@example.com', role: 'DOCTOR', name: 'Dr. Sarah Smith', avatarUrl: 'https://i.pravatar.cc/150?u=doc-1' },
  { id: 'doc-2', email: 'dr.jones@example.com', role: 'DOCTOR', name: 'Dr. Mike Jones', avatarUrl: 'https://i.pravatar.cc/150?u=doc-2' },
  // INSTITUTIONS
  { id: 'inst-1', email: 'admin@cityhospital.com', role: 'INSTITUTION', name: 'City General Hospital', avatarUrl: 'https://ui-avatars.com/api/?name=City+Hospital&background=0F766E&color=fff' },
  { id: 'inst-2', email: 'admin@healthclinic.com', role: 'INSTITUTION', name: 'Sunrise Health Clinic', avatarUrl: 'https://ui-avatars.com/api/?name=Sunrise+Clinic&background=14B8A6&color=fff' },
];

export const individualProfiles: IndividualProfile[] = [
  {
    userId: 'ind-1',
    medisaarId: 'MS-IND-8492',
    dateOfBirth: '1985-04-12',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    currentConditions: ['Type 2 Diabetes', 'Hypertension'],
    phone: '+1 555-0101',
  },
  {
    userId: 'ind-2',
    medisaarId: 'MS-IND-7381',
    dateOfBirth: '1990-08-25',
    bloodGroup: 'A-',
    allergies: [],
    currentConditions: ['Asthma'],
    phone: '+1 555-0102',
  },
  {
    userId: 'ind-3',
    medisaarId: 'MS-IND-6270',
    dateOfBirth: '1975-11-03',
    bloodGroup: 'B+',
    allergies: ['Dust'],
    currentConditions: ['Hyperthyroidism'],
    phone: '+1 555-0103',
  }
];

export const doctorProfiles: DoctorProfile[] = [
  {
    userId: 'doc-1',
    medisaarId: 'MS-DOC-101',
    specialization: 'Cardiologist',
    experienceYears: 12,
    associatedInstitutions: ['inst-1', 'inst-2'],
    phone: '+1 555-0201',
  },
  {
    userId: 'doc-2',
    medisaarId: 'MS-DOC-102',
    specialization: 'Endocrinologist',
    experienceYears: 8,
    associatedInstitutions: ['inst-1'],
    phone: '+1 555-0202',
  }
];

export const institutionProfiles: InstitutionProfile[] = [
  {
    userId: 'inst-1',
    medisaarId: 'MS-INST-001',
    type: 'Hospital',
    address: '123 Medical Way, Cityville, ST 12345',
    phone: '+1 555-0301',
  },
  {
    userId: 'inst-2',
    medisaarId: 'MS-INST-002',
    type: 'Clinic',
    address: '456 Health Blvd, Townsburg, ST 67890',
    phone: '+1 555-0302',
  }
];

export const visits: Visit[] = [
  {
    id: 'v-1',
    patientId: 'ind-1',
    doctorId: 'doc-2',
    institutionId: 'inst-1',
    date: format(subDays(today, 15), 'yyyy-MM-dd'),
    status: 'COMPLETED',
    diagnosis: 'Uncontrolled Type 2 Diabetes',
    notes: 'Patient advised to strictly follow diet and increase medication dosage.',
  },
  {
    id: 'v-2',
    patientId: 'ind-1',
    doctorId: 'doc-1',
    institutionId: 'inst-1',
    date: format(addDays(today, 5), 'yyyy-MM-dd'),
    status: 'SCHEDULED',
  },
  {
    id: 'v-3',
    patientId: 'ind-2',
    doctorId: 'doc-1',
    institutionId: 'inst-2',
    date: format(subMonths(today, 2), 'yyyy-MM-dd'),
    status: 'COMPLETED',
    diagnosis: 'Routine checkup - Asthma stable',
    notes: 'Continue current inhaler usage.',
  }
];

export const reports: Report[] = [
  {
    id: 'rep-1',
    patientId: 'ind-1',
    type: 'BLOOD',
    title: 'HbA1c Blood Test Results',
    date: format(subDays(today, 16), 'yyyy-MM-dd'),
    fileUrl: '/mock-reports/hba1c.pdf',
    uploaderId: 'inst-1',
  },
  {
    id: 'rep-2',
    patientId: 'ind-1',
    type: 'CT_SCAN',
    title: 'Cardiac CT Angiography',
    date: format(subMonths(today, 6), 'yyyy-MM-dd'),
    fileUrl: '/mock-reports/ctscan.pdf',
    uploaderId: 'inst-1',
  }
];

export const prescriptions: Prescription[] = [
  {
    id: 'px-1',
    patientId: 'ind-1',
    doctorId: 'doc-2',
    visitId: 'v-1',
    date: format(subDays(today, 15), 'yyyy-MM-dd'),
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
      { name: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: '30 days' },
    ]
  },
  {
    id: 'px-2',
    patientId: 'ind-2',
    doctorId: 'doc-1',
    visitId: 'v-3',
    date: format(subMonths(today, 2), 'yyyy-MM-dd'),
    medications: [
      { name: 'Albuterol Inhaler', dosage: '90mcg', frequency: 'As needed', duration: '6 months' }
    ]
  }
];

// Helper to get full patient data
export const getPatientDetails = (userId: string) => {
  const user = users.find(u => u.id === userId);
  const profile = individualProfiles.find(p => p.userId === userId);
  const patientVisits = visits.filter(v => v.patientId === userId);
  const patientReports = reports.filter(r => r.patientId === userId);
  const patientPrescriptions = prescriptions.filter(p => p.patientId === userId);

  return { user, profile, visits: patientVisits, reports: patientReports, prescriptions: patientPrescriptions };
};
