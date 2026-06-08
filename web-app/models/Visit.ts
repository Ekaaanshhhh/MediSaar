import mongoose, { Schema } from "mongoose";
import { IVisit, VisitStatus } from "../types/visit.types";

const VisitSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "DoctorProfile", index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "InstitutionProfile", required: true, index: true },
    visitDate: { type: Date, required: true, index: true },
    chiefComplaint: { type: String, required: true },
    notes: { type: String },
    followUpDate: { type: Date },
    status: { type: String, enum: Object.values(VisitStatus), required: true, default: VisitStatus.ACTIVE },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

export const Visit = mongoose.models.Visit || mongoose.model<IVisit>("Visit", VisitSchema);
