import { z } from "zod";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
} from "@/constants";

export const propertySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  propertyType: z.enum(PROPERTY_TYPES),
  listingType: z.enum(LISTING_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.number().min(0, "Price must be a positive number"),
  area: z.number().min(0).optional(),
  areaUnit: z.enum(AREA_UNITS),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  floor: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  location: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  owner: z.string().optional(),
  assignedAgent: z.string().optional(),
  project: z.string().optional(),
  notes: z.string().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
