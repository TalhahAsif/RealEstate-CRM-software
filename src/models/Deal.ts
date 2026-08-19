import { Schema, model, models, type Document, type Types } from "mongoose";
import { DEAL_STAGES } from "@/constants";
import type { DealStage } from "@/types";

export interface IDeal extends Document {
  dealNumber: string;
  customer: Types.ObjectId;
  property: Types.ObjectId;
  agent: Types.ObjectId;
  stage: DealStage;
  dealAmount: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  notes?: string;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    dealNumber: { type: String, required: true, unique: true, trim: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    property: { type: Schema.Types.ObjectId, ref: "Property", required: true },
    agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    stage: { type: String, enum: DEAL_STAGES, default: "property_selected" },
    dealAmount: { type: Number, required: true, min: 0 },
    commissionPercentage: { type: Number, min: 0, max: 100 },
    commissionAmount: { type: Number, min: 0 },
    notes: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

DealSchema.index({ stage: 1 });
DealSchema.index({ agent: 1 });
DealSchema.index({ customer: 1 });

export default models.Deal || model<IDeal>("Deal", DealSchema);
