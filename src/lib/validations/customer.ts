import { z } from "zod";
import {
  CUSTOMER_TYPES,
  CUSTOMER_PURPOSES,
  CUSTOMER_STATUSES,
  POSSESSION_TYPES,
  PROPERTY_TYPES,
  ACQUISITION_TYPES,
} from "@/constants";

const customerBaseSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address").optional(),
  phone: z.string().min(7, "Enter a valid phone number"),
  type: z.enum(CUSTOMER_TYPES),
  status: z.enum(CUSTOMER_STATUSES).default("active"),
  acquisitionType: z.enum(ACQUISITION_TYPES).default("direct"),
  brokerName: z.string().optional(),
  brokerAgency: z.string().optional(),
  brokerPhone: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredLocations: z.array(z.string()).default([]),
  preferredPropertyTypes: z.array(z.enum(PROPERTY_TYPES)).default([]),
  bedrooms: z.number().min(0).optional(),
  purpose: z.enum(CUSTOMER_PURPOSES).optional(),
  possessionType: z.enum(POSSESSION_TYPES).optional(),
  possessionDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  assignedAgent: z.string().optional(),
});

function refineCustomer<
  T extends {
    acquisitionType?: string;
    brokerName?: string;
    possessionType?: string;
    possessionDate?: Date;
  },
>(data: T, ctx: z.RefinementCtx) {
  if (data.acquisitionType === "broker" && !data.brokerName?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Broker name is required when acquisition type is through broker",
      path: ["brokerName"],
    });
  }
  if (data.possessionType === "by_date" && !data.possessionDate) {
    ctx.addIssue({
      code: "custom",
      message: "Possession date is required when possession is by a specific date",
      path: ["possessionDate"],
    });
  }
}

export const customerSchema = customerBaseSchema.superRefine(refineCustomer);

export type CustomerInput = z.infer<typeof customerSchema>;

export const customerUpdateSchema = customerBaseSchema.partial().superRefine(refineCustomer);

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
