import { Counter } from "../models/Counter";

/**
 * Generates a sequential and unique MediSaar ID in the format: MSR-YYYY-XXXXXX
 * (e.g. MSR-2026-000001)
 * 
 * This uses MongoDB's atomic findOneAndUpdate to guarantee sequential uniqueness
 * even during concurrent patient registrations.
 */
export async function generateMediSaarId(): Promise<string> {
  const currentYear = new Date().getFullYear().toString();
  const counterId = `mediSaarId_${currentYear}`;

  try {
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true } // upsert creates the doc if it doesn't exist yet
    );

    const sequenceNumber = counter.sequence_value;
    // Pad the number with leading zeros to ensure it's at least 6 digits long
    const paddedSequence = sequenceNumber.toString().padStart(6, "0");

    return `MSR-${currentYear}-${paddedSequence}`;
  } catch (error) {
    console.error("Error generating MediSaar ID:", error);
    throw new Error("Could not generate unique MediSaar ID");
  }
}
