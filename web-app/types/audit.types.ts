import { Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId; // User who performed the action
  action: string; // e.g., 'CREATED_DIAGNOSIS', 'UPLOADED_REPORT', 'GENERATED_AI_SUMMARY'
  entityType: string; // e.g., 'Diagnosis', 'Report', 'IndividualProfile'
  entityId: Types.ObjectId; // Reference to the specific entity
  metadata?: Record<string, any>; // Flexible JSON payload for context
  timestamp: Date;
}
