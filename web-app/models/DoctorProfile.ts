import mongoose, { Schema } from "mongoose";
import { IDoctorProfile } from "../types/user.types";

const DoctorProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true, index: true },
    qualification: { type: String, required: true },
    yearsOfExperience: { type: Number, required: true },
    associatedInstitutions: [{ type: Schema.Types.ObjectId, ref: "InstitutionProfile" }],
    profilePhoto: { type: String },
  },
  { timestamps: true }
);

export const DoctorProfile =
  mongoose.models.DoctorProfile ||
  mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);
