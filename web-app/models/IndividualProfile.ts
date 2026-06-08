import mongoose, { Schema } from "mongoose";
import { IIndividualProfile } from "../types/user.types";

const IndividualProfileSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mediSaarId: { type: String, required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String },
    bloodGroup: { type: String },
    allergies: [{ type: String }],
    emergencyContact: { type: String },
    profilePhoto: { type: String },
    currentAISummary: { type: String },
  },
  { timestamps: true }
);

export const IndividualProfile =
  mongoose.models.IndividualProfile ||
  mongoose.model<IIndividualProfile>("IndividualProfile", IndividualProfileSchema);
