import { z } from "zod";

export const addPatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  gender: z.string().min(1, "Gender is required"),
  bloodGroup: z.string().optional().default(""),
  emergencyContact: z.string().optional().default(""),
  allergies: z.array(z.string()).optional().default([]),
});

export type AddPatientPayload = z.infer<typeof addPatientSchema>;
