import mongoose, { Schema } from "mongoose";
import { IUser, UserRole } from "../types/user.types";

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: { type: String, enum: ["ACTIVE", "PENDING", "SUSPENDED"], default: "ACTIVE", required: true },
    profileId: { type: Schema.Types.ObjectId }, // Polymorphic depending on role
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
