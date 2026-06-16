import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPatientAssociationRequest extends Document {
  patientId: Types.ObjectId;
  institutionId: Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

const PatientAssociationRequestSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "InstitutionProfile", required: true, index: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING", index: true },
    message: { type: String },
    respondedAt: { type: Date }
  },
  { timestamps: true }
);

// Prevent multiple pending requests between the same patient and institution
PatientAssociationRequestSchema.index({ patientId: 1, institutionId: 1, status: 1 });

export const PatientAssociationRequest =
  mongoose.models.PatientAssociationRequest ||
  mongoose.model<IPatientAssociationRequest>("PatientAssociationRequest", PatientAssociationRequestSchema);
