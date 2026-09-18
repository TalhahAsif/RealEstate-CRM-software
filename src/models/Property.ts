import { Schema, model, models, type Document, type Types } from "mongoose";
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
  ACQUISITION_TYPES,
  SOURCE_TYPES,
  PROPERTY_CONDITIONS,
  PROPERTY_FACING,
} from "@/constants";
import type {
  PropertyType,
  ListingType,
  PropertyStatus,
  AreaUnit,
  AcquisitionType,
  SourceType,
  PropertyCondition,
  PropertyFacing,
} from "@/types";

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
  ownerName?: string;
  ownerPhone?: string;
  assignedAgent?: Types.ObjectId;
  project?: Types.ObjectId;
  /** Free-text project/society name when this property isn't linked to a Project record. */
  projectName?: string;
  notes?: string;
  acquisitionType: AcquisitionType;
  brokerName?: string;
  brokerAgency?: string;
  brokerPhone?: string;
  /** For direct properties: came in on its own, or was brought by an agent. */
  propertySource: SourceType;
  /** Set when propertySource is "agent" and the agent is a current CRM user. */
  referringAgent?: Types.ObjectId;
  /** Set when propertySource is "agent" but the agent isn't in the CRM's agent list. */
  referringAgentName?: string;
  condition?: PropertyCondition;
  conditionOther?: string;
  facing?: PropertyFacing;
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
    ownerName: { type: String, trim: true },
    ownerPhone: { type: String, trim: true },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, trim: true },
    notes: { type: String },
    acquisitionType: { type: String, enum: ACQUISITION_TYPES, default: "direct" },
    brokerName: { type: String, trim: true },
    brokerAgency: { type: String, trim: true },
    brokerPhone: { type: String, trim: true },
    propertySource: { type: String, enum: SOURCE_TYPES, default: "walk_in" },
    referringAgent: { type: Schema.Types.ObjectId, ref: "User" },
    referringAgentName: { type: String, trim: true },
    condition: { type: String, enum: PROPERTY_CONDITIONS },
    conditionOther: { type: String, trim: true },
    facing: { type: String, enum: PROPERTY_FACING },
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
