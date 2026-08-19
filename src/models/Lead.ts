import { Schema, model, models, type Document, type Types } from "mongoose";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  PROPERTY_TYPES,
} from "@/constants";
import type { LeadSource, LeadStatus, LeadPriority, PropertyType } from "@/types";

export interface ILead extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: Types.ObjectId;
  customer?: Types.ObjectId;
  interestedPropertyTypes: PropertyType[];
  preferredLocations: string[];
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    source: { type: String, enum: LEAD_SOURCES, default: "other" },
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "warm" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    interestedPropertyTypes: [{ type: String, enum: PROPERTY_TYPES }],
    preferredLocations: [{ type: String, trim: true }],
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    notes: { type: String },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

LeadSchema.index({ phone: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ priority: 1 });
LeadSchema.index({ assignedTo: 1 });

export default models.Lead || model<ILead>("Lead", LeadSchema);
