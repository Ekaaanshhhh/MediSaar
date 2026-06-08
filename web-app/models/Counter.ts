import mongoose, { Schema } from "mongoose";
import { ICounter } from "../types/counter.types";

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
});

export const Counter = mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);
