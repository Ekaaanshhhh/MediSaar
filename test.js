const mongoose = require('mongoose');

async function test() {
  await mongoose.connect("mongodb+srv://ekanshsatsangi_db_user:3yNgwZrEZri4h5z5@cluster0.tgbvtzz.mongodb.net/medisaar");
  
  const Report = mongoose.models.Report || mongoose.model("Report", new mongoose.Schema({}, { strict: false }));
  const IndividualProfile = mongoose.models.IndividualProfile || mongoose.model("IndividualProfile", new mongoose.Schema({}, { strict: false }));
  
  const patientId = "6a307db0f6c6ef4121617de6";
  
  const patient = await IndividualProfile.findById(patientId).lean();
  console.log("Patient exists:", !!patient);
  
  const reports = await Report.find({ patientId }).lean();
  console.log("Reports found:", reports.length);
  if (reports.length > 0) {
    console.log("Sample report:", JSON.stringify(reports[0], null, 2));
  }
  
  mongoose.disconnect();
}

test().catch(console.error);
