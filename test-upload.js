const mongoose = require('mongoose');

async function testUpload() {
  await mongoose.connect("mongodb+srv://ekanshsatsangi_db_user:3yNgwZrEZri4h5z5@cluster0.tgbvtzz.mongodb.net/medisaar");
  
  const Report = mongoose.models.Report || mongoose.model("Report", new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "IndividualProfile", required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reportType: { type: String, required: true },
    title: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    reportDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  }, { strict: false }));
  
  const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const instUser = await User.findOne({ role: "INSTITUTION" }).lean();
  
  const patientId = "6a307db0f6c6ef4121617de6";
  
  try {
    const report = await Report.create({
      patientId: new mongoose.Types.ObjectId(patientId),
      uploadedBy: instUser._id,
      reportType: "BLOOD_REPORT",
      title: "Test Blood Report",
      cloudinaryUrl: "https://example.com/test.jpg",
      reportDate: new Date(),
      createdBy: instUser._id,
      updatedBy: instUser._id,
    });
    console.log("Report created:", report._id);
  } catch(e) {
    console.error("Error creating report:", e.message);
  }
  
  mongoose.disconnect();
}

testUpload().catch(console.error);
