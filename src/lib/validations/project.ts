import { z } from "zod";
import { PROJECT_STATUSES } from "@/constants";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  developer: z.string().optional(),
  location: z.string().optional(),
  city: z.string().min(1, "City is required"),
  status: z.enum(PROJECT_STATUSES),
  totalUnits: z.number().min(0).optional(),
  images: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const projectUpdateSchema = projectSchema.partial();

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
