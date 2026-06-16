import mongoose from 'mongoose';
import { User } from '../models/User';
import { DoctorProfile } from '../models/DoctorProfile';
import { InstitutionProfile } from '../models/InstitutionProfile';
import { DoctorInstitutionInvitation } from '../models/DoctorInstitutionInvitation';
import connectToDatabase from '../lib/mongodb';

async function main() {
  await connectToDatabase();

  const doctorEmails = ["vikas@example.com", "sk@example.com"];
  const instEmails = ["regency@example.com", "pharmacy@example.com"]; // Assuming Paliwal/Pharmacy might use these or we find them by name

  const vikasUser = await User.findOne({ email: doctorEmails[0] });
  const skUser = await User.findOne({ email: doctorEmails[1] });
  
  // Find institutions
  const paliwalInst = await InstitutionProfile.findOne().populate('userId', 'name').then(res => {
    // Just find any institution or try to find Paliwal
    return InstitutionProfile.findOne({}); // We will just get the first one for Paliwal if it's the only one, or we can search by name if it exists. 
  });
  
  // To be safe, let's find the institutions by querying Users first if we can, or just grab any institution
  const instUsers = await User.find({ role: 'INSTITUTION' }).limit(2);
  if (instUsers.length < 2) {
    console.log("Need at least 2 institutions in DB to seed properly.");
    // We can just use the same one if needed, but let's try
  }

  const instProfile1 = instUsers[0] ? await InstitutionProfile.findOne({ userId: instUsers[0]._id }) : null;
  const instProfile2 = instUsers[1] ? await InstitutionProfile.findOne({ userId: instUsers[1]._id }) : instProfile1;

  if (!vikasUser || !skUser || !instProfile1 || !instProfile2) {
    console.log("Missing required users to seed invitations. Make sure vikas@example.com and sk@example.com exist.");
    process.exit(1);
  }

  const vikasProfile = await DoctorProfile.findOne({ userId: vikasUser._id });
  const skProfile = await DoctorProfile.findOne({ userId: skUser._id });

  if (vikasProfile && instProfile1) {
    const inv1 = await DoctorInstitutionInvitation.findOneAndUpdate(
      { doctorId: vikasProfile._id, institutionId: instProfile1._id, status: 'PENDING' },
      {
        invitedBy: instUsers[0]._id,
        message: "Join our cardiology department.",
        specializationRequested: "Cardiology"
      },
      { upsert: true, new: true }
    );
    console.log(`Created invitation for Vikas from ${instUsers[0].name}`);
  }

  if (skProfile && instProfile2) {
    const inv2 = await DoctorInstitutionInvitation.findOneAndUpdate(
      { doctorId: skProfile._id, institutionId: instProfile2._id, status: 'PENDING' },
      {
        invitedBy: instUsers[1] ? instUsers[1]._id : instUsers[0]._id,
        message: "Join our outpatient consultation team.",
        specializationRequested: "General Physician"
      },
      { upsert: true, new: true }
    );
    console.log(`Created invitation for SK from ${instUsers[1] ? instUsers[1].name : instUsers[0].name}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch(console.error);
