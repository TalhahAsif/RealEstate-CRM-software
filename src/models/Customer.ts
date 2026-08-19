import { Schema, model, models, type Document, type Types } from "mongoose";
import { CUSTOMER_TYPES, CUSTOMER_PURPOSES, PROPERTY_TYPES } from "@/constants";
import type { CustomerType, CustomerPurpose, PropertyType } from "@/types";

export interface ICustomer extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  type: CustomerType;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations: string[];
  preferredPropertyTypes: PropertyType[];
  bedrooms?: number;
  purpose?: CustomerPurpose;
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
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    preferredLocations: [{ type: String, trim: true }],
    preferredPropertyTypes: [{ type: String, enum: PROPERTY_TYPES }],
    bedrooms: { type: Number, min: 0 },
    purpose: { type: String, enum: CUSTOMER_PURPOSES },
    notes: { type: String },
    assignedAgent: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ type: 1 });
CustomerSchema.index({ assignedAgent: 1 });

export default models.Customer || model<ICustomer>("Customer", CustomerSchema);
