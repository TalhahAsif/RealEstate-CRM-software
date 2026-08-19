import { Schema, model, models, type Document, type Types } from "mongoose";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
} from "@/constants";
import type { PropertyType, ListingType, PropertyStatus, AreaUnit } from "@/types";

export interface IProperty extends Document {
  propertyId: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  area?: number;
  areaUnit: AreaUnit;
  bedrooms?: number;
  bathrooms?: number;
  floor?: string;
  address?: string;
  city: string;
  location?: string;
  amenities: string[];
  images: string[];
  owner?: Types.ObjectId;
  assignedAgent?: Types.ObjectId;
  project?: Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    propertyId: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    propertyType: { type: String, enum: PROPERTY_TYPES, required: true },
    listingType: { type: String, enum: LISTING_TYPES, required: true },
    status: { type: String, enum: PROPERTY_STATUSES, default: "available" },
    price: { type: Number, required: true, min: 0 },
    area: { type: Number, min: 0 },
    areaUnit: { type: String, enum: AREA_UNITS, default: "sqft" },
    bedrooms: { type: Number, min: 0 },
    bathrooms: { type: Number, min: 0 },
    floor: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    amenities: [{ type: String, trim: true }],
    images: [{ type: String }],
    owner: { type: Schema.Types.ObjectId, ref: "Customer" },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    notes: { type: String },
  },
  { timestamps: true }
);

PropertySchema.index({ status: 1 });
PropertySchema.index({ propertyType: 1 });
PropertySchema.index({ listingType: 1 });
PropertySchema.index({ city: 1 });
PropertySchema.index({ assignedAgent: 1 });
PropertySchema.index({ project: 1 });

export default models.Property || model<IProperty>("Property", PropertySchema);
