import { Schema, model, models, type Document, type Types } from "mongoose";
import { SITE_VISIT_STATUSES } from "@/constants";
import type { SiteVisitStatus } from "@/types";

export interface ISiteVisit extends Document {
  customer?: Types.ObjectId;
  lead?: Types.ObjectId;
  property: Types.ObjectId;
  agent: Types.ObjectId;
  scheduledAt: Date;
  status: SiteVisitStatus;
  notes?: string;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteVisitSchema = new Schema<ISiteVisit>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: SITE_VISIT_STATUSES, default: "scheduled" },
    notes: { type: String },
    feedback: { type: String },
  },
  { timestamps: true }
);

SiteVisitSchema.index({ scheduledAt: 1 });
SiteVisitSchema.index({ status: 1 });
SiteVisitSchema.index({ agent: 1 });
SiteVisitSchema.index({ property: 1 });

export default models.SiteVisit || model<ISiteVisit>("SiteVisit", SiteVisitSchema);
