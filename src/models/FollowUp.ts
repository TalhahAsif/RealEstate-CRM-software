import { Schema, model, models, type Document, type Types } from "mongoose";
import { FOLLOW_UP_TYPES, FOLLOW_UP_STATUSES } from "@/constants";
import type { FollowUpType, FollowUpStatus } from "@/types";

export interface IFollowUp extends Document {
  lead?: Types.ObjectId;
  customer?: Types.ObjectId;
  assignedTo: Types.ObjectId;
  type: FollowUpType;
  scheduledAt: Date;
  status: FollowUpStatus;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    customer: { type: Schema.Types.ObjectId, ref: "Customer" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: FOLLOW_UP_TYPES, required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: FOLLOW_UP_STATUSES, default: "pending" },
    notes: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

FollowUpSchema.index({ scheduledAt: 1 });
FollowUpSchema.index({ status: 1 });
FollowUpSchema.index({ assignedTo: 1 });

export default models.FollowUp || model<IFollowUp>("FollowUp", FollowUpSchema);
