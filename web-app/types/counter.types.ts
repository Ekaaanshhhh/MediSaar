import { Document } from "mongoose";

export interface ICounter extends Document<string> {
  _id: string; // This will hold the string key like "mediSaarId"
  sequence_value: number; // The auto-incrementing integer
}
