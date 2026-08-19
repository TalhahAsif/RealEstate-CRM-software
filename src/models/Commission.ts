import { Schema, model, models, type Document, type Types } from "mongoose";
import { COMMISSION_STATUSES } from "@/constants";
import type { CommissionStatus } from "@/types";

export interface ICommission extends Document {
  deal: Types.ObjectId;
  agent: Types.ObjectId;
  totalAmount: number;
  companyAmount: number;
  agentAmount: number;
  status: CommissionStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommission>(
  {
    deal: { type: Schema.Types.ObjectId, ref: "Deal", required: true, unique: true },
    agent: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    companyAmount: { type: Number, required: true, min: 0 },
    agentAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: COMMISSION_STATUSES, default: "pending" },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

CommissionSchema.index({ agent: 1 });
CommissionSchema.index({ status: 1 });

export default models.Commission || model<ICommission>("Commission", CommissionSchema);
