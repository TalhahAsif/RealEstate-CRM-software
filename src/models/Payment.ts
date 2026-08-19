import { Schema, model, models, type Document, type Types } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/constants";
import type { PaymentMethod, PaymentStatus } from "@/types";

export interface IPayment extends Document {
  deal: Types.ObjectId;
  customer: Types.ObjectId;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  reference?: string;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    deal: { type: Schema.Types.ObjectId, ref: "Deal", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentDate: { type: Date, required: true },
    reference: { type: String, trim: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    notes: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ deal: 1 });
PaymentSchema.index({ status: 1 });

export default models.Payment || model<IPayment>("Payment", PaymentSchema);
