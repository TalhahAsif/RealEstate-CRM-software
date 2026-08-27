import { z } from "zod";
import { DEAL_STAGES } from "@/constants";

export const dealSchema = z.object({
  dealNumber: z.string().optional(),
  customer: z.string().min(1, "Customer is required"),
  property: z.string().min(1, "Property is required"),
  agent: z.string().min(1, "Agent is required"),
  stage: z.enum(DEAL_STAGES).default("property_selected"),
  dealAmount: z.number().min(0, "Deal amount must be a positive number"),
  commissionPercentage: z.number().min(0).max(100).optional(),
  commissionAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
  closedAt: z.string().optional(),
});

export type DealInput = z.infer<typeof dealSchema>;

export const dealUpdateSchema = dealSchema.partial();

export type DealUpdateInput = z.infer<typeof dealUpdateSchema>;
