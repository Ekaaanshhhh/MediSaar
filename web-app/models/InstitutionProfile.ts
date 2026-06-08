import mongoose, { Schema } from "mongoose";
import { IInstitutionProfile, InstitutionType } from "../types/user.types";

const InstitutionProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    institutionName: { type: String, required: true },
    institutionType: { type: String, enum: Object.values(InstitutionType), required: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    logo: { type: String },
  },
  { timestamps: true }
);

export const InstitutionProfile =
  mongoose.models.InstitutionProfile ||
  mongoose.model<IInstitutionProfile>("InstitutionProfile", InstitutionProfileSchema);
