import { config } from 'dotenv';
import path from 'path';
// Load .env.local variables first
config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
import { InstitutionController } from '../controllers/institution.controller';
import { User } from '../models/User';
import { InstitutionProfile } from '../models/InstitutionProfile';
import { DoctorProfile } from '../models/DoctorProfile';
import { IndividualProfile } from '../models/IndividualProfile';
import { Visit } from '../models/Visit';
import { Diagnosis } from '../models/Diagnosis';
import { Prescription } from '../models/Prescription';
import { Report } from '../models/Report';

import { UserRole } from '../types/user.types';

async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

async function run() {
  await connectToDatabase();

  console.log('--- Starting Database Seeding ---');

  const context = { ip: '127.0.0.1', userAgent: 'SeedScript' };

  // 1. Create Institutions
  let pharmacyUser = await User.findOne({ email: 'pharmacy@example.com' });
  if (!pharmacyUser) {
    const res = await AuthService.registerUser({
      email: 'pharmacy@example.com',
      password: 'Password123',
      name: 'Pharmacy Health Center',
      role: UserRole.INSTITUTION,
      institutionDetails: { institutionType: 'CLINIC', registrationNumber: 'PHAR123' }
    } as any, context);
    pharmacyUser = res.user;
    console.log('Created Pharmacy Institution User.');
  }

  let paliwalUser = await User.findOne({ email: 'paliwal@example.com' });
  if (!paliwalUser) {
    const res = await AuthService.registerUser({
      email: 'paliwal@example.com',
      password: 'Password123',
      name: 'Paliwal Hospital',
      role: UserRole.INSTITUTION,
      institutionDetails: { institutionType: 'HOSPITAL', registrationNumber: 'PAL456' }
    } as any, context);
    paliwalUser = res.user;
    console.log('Created Paliwal Hospital User.');
  }

  const pharmacyProfile = await InstitutionProfile.findOne({ userId: pharmacyUser._id });
  const paliwalProfile = await InstitutionProfile.findOne({ userId: paliwalUser._id });

  // 2. Create Doctors
  let vikasUser = await User.findOne({ email: 'vikas@example.com' });
  if (!vikasUser) {
    const res = await AuthService.registerUser({
      email: 'vikas@example.com',
      password: 'Password123',
      name: 'Dr. Vikas',
      role: UserRole.DOCTOR,
      doctorDetails: { specialization: 'General Physician', licenseNumber: 'VIK123' }
    } as any, context);
    vikasUser = res.user;
    // Associate with Pharmacy
    await DoctorProfile.updateOne(
      { userId: vikasUser._id },
      { $addToSet: { associatedInstitutions: pharmacyProfile?._id } }
    );
    console.log('Created Dr. Vikas.');
  }
  const vikasProfile = await DoctorProfile.findOne({ userId: vikasUser._id });

  let skUser = await User.findOne({ email: 'sk@example.com' });
  if (!skUser) {
    const res = await AuthService.registerUser({
      email: 'sk@example.com',
      password: 'Password123',
      name: 'Dr. SK',
      role: UserRole.DOCTOR,
      doctorDetails: { specialization: 'Cardiologist', licenseNumber: 'SK456' }
    } as any, context);
    skUser = res.user;
    // Associate with Paliwal
    await DoctorProfile.updateOne(
      { userId: skUser._id },
      { $addToSet: { associatedInstitutions: paliwalProfile?._id } }
    );
    console.log('Created Dr. SK.');
  }
  const skProfile = await DoctorProfile.findOne({ userId: skUser._id });

  // 3. Create Patient via Institution flow
  let devaangUser = await User.findOne({ email: 'devaang@example.com' });
  if (!devaangUser) {
    // We can't easily mock the NextRequest for the Controller, so we'll invoke the Service directly
    // Wait, the InstitutionController.addPatient relies on InstitutionService.addPatient.
    // Let's import it and use it.
    const { InstitutionService } = await import('../services/institution.service');
    
    // Create via Pharmacy Institution to mimic real flow
    const patientData = {
      fullName: 'Devaang',
      email: 'devaang@example.com',
      dateOfBirth: '1995-05-15',
      gender: 'MALE',
      bloodGroup: 'O+',
      chiefComplaint: 'General Checkup'
    };
    
    const res = await InstitutionService.addPatient(
      patientData as any,
      pharmacyUser._id.toString(),
      context
    );
    
    devaangUser = await User.findById(res.patientId);
    console.log('Created Patient Devaang via Pharmacy.');
  } else {
    console.log('Patient Devaang already exists.');
  }
  
  const devaangProfile = await IndividualProfile.findOne({ userId: devaangUser!._id });

  // 4. Create Historical Data
  console.log('Creating Historical Data...');
  
  // Clean existing dummy visits for clean state if needed (Optional, skipped for safety)

  const commonProps = {
    patientId: devaangProfile?._id,
    createdBy: pharmacyUser!._id,
    updatedBy: pharmacyUser!._id
  };

  // Pharmacy Visit 1
  const v1 = await Visit.create({
    ...commonProps,
    institutionId: pharmacyProfile?._id,
    doctorId: vikasProfile?._id,
    visitDate: new Date('2026-05-05T10:00:00Z'),
    chiefComplaint: 'Mild Fever and Cough',
    status: 'CLOSED'
  });

  await Diagnosis.create({
    ...commonProps,
    visitId: v1._id,
    doctorId: vikasProfile?._id,
    conditionName: 'Viral Infection',
    diagnosisType: 'PRIMARY',
    severity: 'LOW'
  });

  await Prescription.create({
    ...commonProps,
    visitId: v1._id,
    doctorId: vikasProfile?._id,
    medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice a day', duration: '3 days' }]
  });

  await Report.create({
    ...commonProps,
    visitId: v1._id,
    uploadedBy: pharmacyUser!._id,
    reportType: 'LAB_REPORT',
    title: 'Complete Blood Count',
    cloudinaryUrl: 'https://example.com/report1.pdf',
    reportDate: new Date('2026-05-05T12:00:00Z')
  });

  // Paliwal Visit 1
  const v2 = await Visit.create({
    ...commonProps,
    institutionId: paliwalProfile?._id,
    doctorId: skProfile?._id,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitDate: new Date('2026-06-10T14:30:00Z'),
    chiefComplaint: 'Chest Pain Evaluation',
    status: 'CLOSED'
  });

  await Diagnosis.create({
    ...commonProps,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitId: v2._id,
    doctorId: skProfile?._id,
    conditionName: 'Costochondritis',
    diagnosisType: 'PRIMARY',
    severity: 'MEDIUM'
  });

  await Prescription.create({
    ...commonProps,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitId: v2._id,
    doctorId: skProfile?._id,
    medicines: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'As needed', duration: '5 days' }]
  });

  await Report.create({
    ...commonProps,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitId: v2._id,
    uploadedBy: paliwalUser!._id,
    reportType: 'XRAY',
    title: 'Chest X-Ray',
    cloudinaryUrl: 'https://example.com/report2.pdf',
    reportDate: new Date('2026-06-10T15:00:00Z')
  });

  // Paliwal Visit 2 (Follow up)
  const v3 = await Visit.create({
    ...commonProps,
    institutionId: paliwalProfile?._id,
    doctorId: skProfile?._id,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitDate: new Date('2026-06-12T09:15:00Z'),
    chiefComplaint: 'Follow up for chest pain',
    status: 'ACTIVE'
  });

  await Diagnosis.create({
    ...commonProps,
    createdBy: paliwalUser!._id,
    updatedBy: paliwalUser!._id,
    visitId: v3._id,
    doctorId: skProfile?._id,
    conditionName: 'Costochondritis - Resolving',
    diagnosisType: 'SECONDARY',
    severity: 'LOW'
  });

  console.log('--- Seeding Completed Successfully ---');
  console.log('You can now log in with:');
  console.log('devaang@example.com / Password123 (or generated temp password)');
  process.exit(0);
}

run().catch(console.error);
