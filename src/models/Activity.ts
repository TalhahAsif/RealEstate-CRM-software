import { Schema, model, models, type Document, type Types } from "mongoose";

export interface IActivity extends Document {
  user: Types.ObjectId;
  action: string;
  entityType: string;
  entityId: Types.ObjectId;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, trim: true },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivitySchema.index({ entityType: 1, entityId: 1 });
ActivitySchema.index({ user: 1 });
ActivitySchema.index({ createdAt: -1 });

export default models.Activity || model<IActivity>("Activity", ActivitySchema);
