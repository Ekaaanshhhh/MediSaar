import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPatientAssociation extends Document {
  patientId: Types.ObjectId;
  institutionId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PatientAssociationSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "InstitutionProfile", required: true, index: true },
  },
  { timestamps: true }
);

// Prevent duplicate associations
PatientAssociationSchema.index({ patientId: 1, institutionId: 1 }, { unique: true });

export const PatientAssociation =
  mongoose.models.PatientAssociation ||
  mongoose.model<IPatientAssociation>("PatientAssociation", PatientAssociationSchema);
