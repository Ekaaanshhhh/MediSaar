const mongoose = require('mongoose');

async function testGetReports() {
  await mongoose.connect("mongodb+srv://ekanshsatsangi_db_user:3yNgwZrEZri4h5z5@cluster0.tgbvtzz.mongodb.net/medisaar");
  
  const Report = mongoose.models.Report || mongoose.model("Report", new mongoose.Schema({}, { strict: false }));

  const patientId = "6a307db0f6c6ef4121617de6";
  const reports = await Report.find({ patientId: new mongoose.Types.ObjectId(patientId) }).lean();
  console.log("Reports found for patient:", JSON.stringify(reports, null, 2));

  mongoose.disconnect();
}

testGetReports().catch(console.error);
