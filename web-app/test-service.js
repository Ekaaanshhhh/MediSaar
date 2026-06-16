const mongoose = require('mongoose');
const { IndividualService } = require('./services/individual.service');

async function testService() {
  await mongoose.connect("mongodb+srv://ekanshsatsangi_db_user:3yNgwZrEZri4h5z5@cluster0.tgbvtzz.mongodb.net/medisaar");

  const IndividualProfile = mongoose.models.IndividualProfile || mongoose.model("IndividualProfile", new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }, { strict: false }));

  const patientId = "6a307db0f6c6ef4121617de6";
  const patient = await IndividualProfile.findById(patientId).lean();

  if(patient) {
    console.log("Calling getReports for userId:", patient.userId.toString());
    const res = await IndividualService.getReports(patient.userId.toString());
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log("Patient not found");
  }

  mongoose.disconnect();
}

testService().catch(console.error);
