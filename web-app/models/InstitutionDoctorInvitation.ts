import mongoose, { Schema, Document } from "mongoose";

export interface IInstitutionDoctorInvitation extends Document {
  institutionId: mongoose.Types.ObjectId;
  invitedEmail: string;
  invitedBy: mongoose.Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  token: string;
  message?: string;
  expiresAt: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionDoctorInvitationSchema: Schema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: "InstitutionProfile", required: true, index: true },
    invitedEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"], default: "PENDING", index: true },
    token: { type: String, required: true, unique: true, index: true },
    message: { type: String },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate pending invitations for the same email and institution
InstitutionDoctorInvitationSchema.index(
  { institutionId: 1, invitedEmail: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export const InstitutionDoctorInvitation =
  mongoose.models.InstitutionDoctorInvitation ||
  mongoose.model<IInstitutionDoctorInvitation>("InstitutionDoctorInvitation", InstitutionDoctorInvitationSchema);
