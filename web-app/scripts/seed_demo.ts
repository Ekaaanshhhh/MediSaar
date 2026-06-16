import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { AuthService } from '../services/auth.service';
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
  if (!MONGODB_URI) throw new Error('Please define the MONGODB_URI environment variable');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
}

async function run() {
  await connectToDatabase();
  console.log('--- Starting Idempotent Demo Seeding ---');

  const context = { ip: '127.0.0.1', userAgent: 'SeedDemoScript' };

  // 1. Regency Hospital
  let regencyUser = await User.findOne({ email: 'regency@example.com' });
  if (!regencyUser) {
    const res = await AuthService.registerUser({
      email: 'regency@example.com',
      password: 'Password123',
      name: 'Regency Hospital',
      role: UserRole.INSTITUTION,
      institutionDetails: { institutionType: 'HOSPITAL', registrationNumber: 'REG123' }
    } as any, context);
    regencyUser = res.user;
    console.log('Created Regency Hospital User.');
  } else {
    console.log('Regency Hospital already exists.');
  }
  const regencyProfile = await InstitutionProfile.findOne({ userId: regencyUser._id });

  // 2. Dr. Ekansh
  let ekanshUser = await User.findOne({ email: 'ekansh@example.com' });
  if (!ekanshUser) {
    const res = await AuthService.registerUser({
      email: 'ekansh@example.com',
      password: 'Password123',
      name: 'Dr. Ekansh',
      role: UserRole.DOCTOR,
      doctorDetails: { specialization: 'General Physician', licenseNumber: 'EK123' }
    } as any, context);
    ekanshUser = res.user;
    await DoctorProfile.updateOne(
      { userId: ekanshUser._id },
      { $addToSet: { associatedInstitutions: regencyProfile?._id } }
    );
    console.log('Created Dr. Ekansh.');
  } else {
    console.log('Dr. Ekansh already exists. Updating associations...');
    await DoctorProfile.updateOne(
      { userId: ekanshUser._id },
      { $addToSet: { associatedInstitutions: regencyProfile?._id } }
    );
  }
  const ekanshProfile = await DoctorProfile.findOne({ userId: ekanshUser._id });

  // 3. Dr. Vikas
  let vikasUser = await User.findOne({ email: 'vikas@example.com' });
  if (!vikasUser) {
    const res = await AuthService.registerUser({
      email: 'vikas@example.com',
      password: 'Password123',
      name: 'Dr. Vikas',
      role: UserRole.DOCTOR,
      doctorDetails: { specialization: 'Cardiologist', licenseNumber: 'VIK456' }
    } as any, context);
    vikasUser = res.user;
    await DoctorProfile.updateOne(
      { userId: vikasUser._id },
      { $addToSet: { associatedInstitutions: regencyProfile?._id } }
    );
    console.log('Created Dr. Vikas.');
  } else {
    console.log('Dr. Vikas already exists. Updating associations...');
    await DoctorProfile.updateOne(
      { userId: vikasUser._id },
      { $addToSet: { associatedInstitutions: regencyProfile?._id } }
    );
  }
  const vikasProfile = await DoctorProfile.findOne({ userId: vikasUser._id });

  // 4. Patient Devaang
  let devaangUser = await User.findOne({ email: 'devaang@example.com' });
  if (!devaangUser) {
    const { InstitutionService } = await import('../services/institution.service');
    const patientData = {
      fullName: 'Devaang',
      email: 'devaang@example.com',
      dateOfBirth: '1995-05-15',
      gender: 'MALE',
      bloodGroup: 'O+',
      chiefComplaint: 'Routine Checkup'
    };
    
    const res = await InstitutionService.addPatient(
      patientData as any,
      regencyUser._id.toString(),
      context
    );
    devaangUser = await User.findById(res.patientId);
    console.log('Created Patient Devaang via Regency Hospital.');
    
    // Explicitly set password for demo ease
    const bcrypt = await import('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    devaangUser!.passwordHash = await bcrypt.hash('Password123', salt);
    devaangUser!.mustChangePassword = false;
    await devaangUser!.save();
  } else {
    console.log('Patient Devaang already exists.');
  }
  const devaangProfile = await IndividualProfile.findOne({ userId: devaangUser!._id });

  // 5. Seed Historical Data (Only if not already present)
  console.log('Checking Historical Data...');
  
  const existingVisit = await Visit.findOne({ patientId: devaangProfile?._id, institutionId: regencyProfile?._id });
  if (!existingVisit) {
    const commonProps = {
      patientId: devaangProfile?._id,
      createdBy: regencyUser!._id,
      updatedBy: regencyUser!._id
    };

    // Visit 1
    const v1 = await Visit.create({
      ...commonProps,
      institutionId: regencyProfile?._id,
      doctorId: ekanshProfile?._id,
      visitDate: new Date('2026-06-01T10:00:00Z'),
      chiefComplaint: 'Mild Fever and Cough',
      status: 'CLOSED'
    });

    await Diagnosis.create({
      ...commonProps,
      visitId: v1._id,
      doctorId: ekanshProfile?._id,
      conditionName: 'Viral Infection',
      diagnosisType: 'PRIMARY',
      severity: 'LOW'
    });

    await Prescription.create({
      ...commonProps,
      visitId: v1._id,
      doctorId: ekanshProfile?._id,
      medicines: [{ name: 'Paracetamol', dosage: '500mg', frequency: 'Twice a day', duration: '3 days' }]
    });

    await Report.create({
      ...commonProps,
      visitId: v1._id,
      uploadedBy: regencyUser!._id,
      reportType: 'LAB_REPORT',
      title: 'Complete Blood Count',
      cloudinaryUrl: 'https://placehold.co/400x300/e2e8f0/475569?text=Blood+Report',
      reportDate: new Date('2026-06-01T12:00:00Z')
    });
    
    // Visit 2
    const v2 = await Visit.create({
      ...commonProps,
      institutionId: regencyProfile?._id,
      doctorId: vikasProfile?._id,
      visitDate: new Date('2026-06-10T14:30:00Z'),
      chiefComplaint: 'Chest Pain Evaluation',
      status: 'CLOSED'
    });

    await Diagnosis.create({
      ...commonProps,
      visitId: v2._id,
      doctorId: vikasProfile?._id,
      conditionName: 'Costochondritis',
      diagnosisType: 'PRIMARY',
      severity: 'MEDIUM'
    });

    await Report.create({
      ...commonProps,
      visitId: v2._id,
      uploadedBy: regencyUser!._id,
      reportType: 'XRAY',
      title: 'Chest X-Ray',
      cloudinaryUrl: 'https://placehold.co/400x300/e2e8f0/475569?text=X-Ray',
      reportDate: new Date('2026-06-10T15:00:00Z')
    });

    console.log('Historical data created successfully.');
  } else {
    console.log('Historical data already exists. Skipping...');
  }

  console.log('--- Demo Seeding Completed ---');
  console.log('Demo Accounts:');
  console.log('Institution: regency@example.com / Password123');
  console.log('Doctor: ekansh@example.com / Password123');
  console.log('Doctor: vikas@example.com / Password123');
  console.log('Patient: devaang@example.com / Password123');
  process.exit(0);
}

run().catch(console.error);
