import mongoose, { Schema } from "mongoose";
import { IAISummary, AISummaryType } from "../types/ai.types";

const AISummarySchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "IndividualProfile", required: true, index: true },
    visitId: { type: Schema.Types.ObjectId, ref: "Visit", required: true, index: true },
    summaryType: { type: String, enum: Object.values(AISummaryType), required: true },
    summaryText: { type: String, required: true },
    generatedByModel: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AISummary = mongoose.models.AISummary || mongoose.model<IAISummary>("AISummary", AISummarySchema);
