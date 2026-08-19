import { z } from "zod";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  PROPERTY_TYPES,
} from "@/constants";

export const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address").optional(),
  phone: z.string().min(7, "Enter a valid phone number"),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  priority: z.enum(LEAD_PRIORITIES),
  assignedTo: z.string().optional(),
  interestedPropertyTypes: z.array(z.enum(PROPERTY_TYPES)).default([]),
  preferredLocations: z.array(z.string()).default([]),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type LeadInput = z.infer<typeof leadSchema>;
