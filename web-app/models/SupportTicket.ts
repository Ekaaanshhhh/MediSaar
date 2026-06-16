import mongoose, { Schema } from "mongoose";

const SupportTicketSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, default: "OPEN", enum: ["OPEN", "IN_PROGRESS", "CLOSED"], index: true }
  },
  { timestamps: true }
);

export const SupportTicket = mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
