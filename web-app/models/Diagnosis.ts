import mongoose, { Schema } from "mongoose";
import { IDiagnosis, DiagnosisType, DiagnosisSeverity } from "../types/visit.types";

const DiagnosisSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "Visit", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile" },
    conditionName: { type: String, required: true },
    diagnosisType: { type: String, enum: Object.values(DiagnosisType), required: true },
    severity: { type: String, enum: Object.values(DiagnosisSeverity), required: true },
    notes: { type: String },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Diagnosis = mongoose.models.Diagnosis || mongoose.model<IDiagnosis>("Diagnosis", DiagnosisSchema);
