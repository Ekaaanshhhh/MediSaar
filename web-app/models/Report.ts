import mongoose, { Schema } from "mongoose";
import { IReport, ReportType } from "../types/report.types";

const ReportSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "Visit", index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportType: { type: String, enum: Object.values(ReportType), required: true },
    title: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    extractedText: { type: String }, // Populated later by Gemini Vision OCR
    reportDate: { type: Date, required: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Report = mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);
