import { Schema, model, models, type Document, type Types } from "mongoose";
import {
  CUSTOMER_TYPES,
  CUSTOMER_PURPOSES,
  CUSTOMER_STATUSES,
  POSSESSION_TYPES,
  PROPERTY_TYPES,
  ACQUISITION_TYPES,
  SOURCE_TYPES,
} from "@/constants";
import type {
  CustomerType,
  CustomerPurpose,
  CustomerStatus,
  PossessionType,
  PropertyType,
  AcquisitionType,
  SourceType,
} from "@/types";

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  type: CustomerType;
  status: CustomerStatus;
  acquisitionType: AcquisitionType;
  brokerName?: string;
  brokerAgency?: string;
  brokerPhone?: string;
  /** How this customer came in: walked in on their own, or was brought by an agent. */
  customerSource: SourceType;
  /** Set when customerSource is "agent" and the agent is a current CRM user. */
  referringAgent?: Types.ObjectId;
  /** Set when customerSource is "agent" but the agent isn't in the CRM's agent list. */
  referringAgentName?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations: string[];
  preferredPropertyTypes: PropertyType[];
  bedrooms?: number;
  purpose?: CustomerPurpose;
  possessionType?: PossessionType;
  possessionDate?: Date;
  notes?: string;
  assignedAgent?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    type: { type: String, enum: CUSTOMER_TYPES, required: true },
    status: { type: String, enum: CUSTOMER_STATUSES, default: "active" },
    acquisitionType: { type: String, enum: ACQUISITION_TYPES, default: "direct" },
    brokerName: { type: String, trim: true },
    brokerAgency: { type: String, trim: true },
    brokerPhone: { type: String, trim: true },
    customerSource: { type: String, enum: SOURCE_TYPES, default: "walk_in" },
    referringAgent: { type: Schema.Types.ObjectId, ref: "User" },
    referringAgentName: { type: String, trim: true },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    preferredLocations: [{ type: String, trim: true }],
    preferredPropertyTypes: [{ type: String, enum: PROPERTY_TYPES }],
    bedrooms: { type: Number, min: 0 },
    purpose: { type: String, enum: CUSTOMER_PURPOSES },
    possessionType: { type: String, enum: POSSESSION_TYPES },
    possessionDate: { type: Date },
    notes: { type: String },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ type: 1 });
CustomerSchema.index({ status: 1 });
CustomerSchema.index({ assignedAgent: 1 });

export default models.Customer || model<ICustomer>("Customer", CustomerSchema);
