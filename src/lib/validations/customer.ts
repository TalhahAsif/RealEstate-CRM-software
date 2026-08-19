import { z } from "zod";
import { CUSTOMER_TYPES, CUSTOMER_PURPOSES, PROPERTY_TYPES } from "@/constants";

export const customerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address").optional(),
  phone: z.string().min(7, "Enter a valid phone number"),
  type: z.enum(CUSTOMER_TYPES),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredLocations: z.array(z.string()).default([]),
  preferredPropertyTypes: z.array(z.enum(PROPERTY_TYPES)).default([]),
  bedrooms: z.number().min(0).optional(),
  purpose: z.enum(CUSTOMER_PURPOSES).optional(),
  notes: z.string().optional(),
  assignedAgent: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
