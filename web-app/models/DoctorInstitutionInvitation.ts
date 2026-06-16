import mongoose, { Schema, Document } from "mongoose";

export interface IDoctorInstitutionInvitation extends Document {
  doctorId: mongoose.Types.ObjectId;
  institutionId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  message: string;
  specializationRequested?: string;
  expiresAt?: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorInstitutionInvitationSchema: Schema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "InstitutionProfile", required: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING", index: true },
    message: { type: String, required: true },
    specializationRequested: { type: String },
    expiresAt: { type: Date },
    respondedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate pending invitations between the same doctor and institution
DoctorInstitutionInvitationSchema.index(
  { doctorId: 1, institutionId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export const DoctorInstitutionInvitation =
  mongoose.models.DoctorInstitutionInvitation ||
  mongoose.model<IDoctorInstitutionInvitation>("DoctorInstitutionInvitation", DoctorInstitutionInvitationSchema);
