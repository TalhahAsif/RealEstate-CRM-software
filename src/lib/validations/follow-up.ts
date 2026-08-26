import { z } from "zod";
import { FOLLOW_UP_TYPES, FOLLOW_UP_STATUSES } from "@/constants";

export const followUpSchema = z
  .object({
    lead: z.string().optional(),
    customer: z.string().optional(),
    assignedTo: z.string().min(1, "Assignee is required"),
    type: z.enum(FOLLOW_UP_TYPES),
    scheduledAt: z.coerce.date({ message: "Enter a valid date and time" }),
    status: z.enum(FOLLOW_UP_STATUSES),
    notes: z.string().optional(),
  })
  .refine((data) => Boolean(data.lead) || Boolean(data.customer), {
    message: "Select a lead or a customer for this follow-up",
    path: ["lead"],
  });

export type FollowUpInput = z.infer<typeof followUpSchema>;

export const followUpUpdateSchema = z.object({
  // null clears the reference (used when switching between lead/customer contacts).
  lead: z.string().nullable().optional(),
  customer: z.string().nullable().optional(),
  assignedTo: z.string().min(1).optional(),
  type: z.enum(FOLLOW_UP_TYPES).optional(),
  scheduledAt: z.coerce.date({ message: "Enter a valid date and time" }).optional(),
  status: z.enum(FOLLOW_UP_STATUSES).optional(),
  notes: z.string().optional(),
});

export type FollowUpUpdateInput = z.infer<typeof followUpUpdateSchema>;
