import mongoose, { Schema } from "mongoose";
import { IAuditLog } from "../types/audit.types";

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    metadata: { type: Schema.Types.Mixed }, // Flexible payload for historical tracking
    timestamp: { type: Date, default: Date.now, index: true },
  },
  // Automatically manage timestamps but we explicitly define timestamp field for semantic reasons
  { timestamps: { createdAt: "timestamp", updatedAt: false } }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
