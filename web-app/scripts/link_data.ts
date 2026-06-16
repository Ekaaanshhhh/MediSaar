import mongoose from 'mongoose';
import { User } from '../models/User';
import { IndividualProfile } from '../models/IndividualProfile';
import { DoctorProfile } from '../models/DoctorProfile';
import { InstitutionProfile } from '../models/InstitutionProfile';
import { Visit } from '../models/Visit';
import connectToDatabase from '../lib/mongodb';
import bcrypt from 'bcryptjs';

async function main() {
  await connectToDatabase();

  // 1. Find or Create Devang
  let devangUser = await User.findOne({ email: 'devang@example.com' });
  if (!devangUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Password123!', salt);
    devangUser = await User.create({
      name: 'Devang',
      email: 'devang@example.com',
      passwordHash: hash,
      role: 'INDIVIDUAL',
      isVerified: true
    });
    console.log("Created Devang User");
  }

  let devangProfile = await IndividualProfile.findOne({ userId: devangUser._id });
  if (!devangProfile) {
    devangProfile = await IndividualProfile.create({
      userId: devangUser._id,
      mediSaarId: `MS-DEV-${Date.now()}`,
      bloodGroup: "O+",
      gender: "Male"
    });
    console.log("Created Devang Profile");
  }

  // 2. Find Ekansh Doctor
  const ekanshUser = await User.findOne({ email: 'ekansh@example.com', role: 'DOCTOR' });
  if (!ekanshUser) {
    console.error("Ekansh user not found");
    process.exit(1);
  }
  const ekanshProfile = await DoctorProfile.findOne({ userId: ekanshUser._id });
  if (!ekanshProfile) {
    console.error("Ekansh doctor profile not found");
    process.exit(1);
  }

  // 3. Find Regency Institution
  const regencyUser = await User.findOne({ email: 'regency@example.com', role: 'INSTITUTION' });
  if (!regencyUser) {
    console.error("Regency user not found");
    process.exit(1);
  }
  const regencyProfile = await InstitutionProfile.findOne({ userId: regencyUser._id });
  if (!regencyProfile) {
    console.error("Regency institution profile not found");
    process.exit(1);
  }

  // 4. Enroll Ekansh under Regency
  if (!ekanshProfile.associatedInstitutions.includes(regencyProfile._id)) {
    ekanshProfile.associatedInstitutions.push(regencyProfile._id);
    await ekanshProfile.save();
    console.log("Enrolled Ekansh under Regency");
  } else {
    console.log("Ekansh already enrolled under Regency");
  }

  // 5. Create Visit for Devang by Ekansh at Regency
  const existingVisit = await Visit.findOne({
    patientId: devangProfile._id,
    doctorId: ekanshProfile._id,
    institutionId: regencyProfile._id
  });

  if (!existingVisit) {
    await Visit.create({
      patientId: devangProfile._id,
      doctorId: ekanshProfile._id,
      institutionId: regencyProfile._id,
      visitDate: new Date(),
      chiefComplaint: "Routine Checkup",
      diagnosis: "Healthy",
      notes: "Patient is doing well.",
      createdBy: ekanshUser._id,
      updatedBy: ekanshUser._id
    });
    console.log("Created Visit for Devang with Ekansh at Regency");
  } else {
    console.log("Visit already exists");
  }

  console.log("Architecture fed successfully!");
  process.exit(0);
}

main().catch(console.error);
