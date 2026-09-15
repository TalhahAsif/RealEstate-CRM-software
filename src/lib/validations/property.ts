import { z } from "zod";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
  ACQUISITION_TYPES,
  PROPERTY_CONDITIONS,
  PROPERTY_FACING,
} from "@/constants";

const propertyBaseSchema = z.object({
  propertyId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  propertyType: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  status: z.enum(PROPERTY_STATUSES).default("available"),
  price: z.number().min(0, "Price must be a positive number"),
  area: z.number().min(0).optional(),
  areaUnit: z.enum(AREA_UNITS).default("sqft"),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floor: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  location: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  assignedAgent: z.string().optional(),
  project: z.string().optional(),
  notes: z.string().optional(),
  acquisitionType: z.enum(ACQUISITION_TYPES).default("direct"),
  brokerName: z.string().optional(),
  brokerAgency: z.string().optional(),
  brokerPhone: z.string().optional(),
  condition: z.enum(PROPERTY_CONDITIONS).optional(),
  conditionOther: z.string().optional(),
  facing: z.enum(PROPERTY_FACING).optional(),
});

function refineProperty<
  T extends {
    acquisitionType?: string;
    brokerName?: string;
    condition?: string;
    conditionOther?: string;
  },
>(data: T, ctx: z.RefinementCtx) {
  if (data.acquisitionType === "broker" && !data.brokerName?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Broker name is required when acquisition type is through broker",
      path: ["brokerName"],
    });
  }
  if (data.condition === "other" && !data.conditionOther?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Please specify the condition",
      path: ["conditionOther"],
    });
  }
}

export const propertySchema = propertyBaseSchema.superRefine(refineProperty);

export type PropertyInput = z.infer<typeof propertySchema>;

export const propertyUpdateSchema = propertyBaseSchema.partial().superRefine(refineProperty);

export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
