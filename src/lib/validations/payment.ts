import { z } from "zod";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/constants";

export const paymentSchema = z.object({
  deal: z.string().min(1, "Deal is required"),
  customer: z.string().min(1, "Customer is required"),
  amount: z.number().min(0, "Amount must be at least 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentDate: z.coerce.date({ message: "Enter a valid payment date" }),
  reference: z.string().optional(),
  status: z.enum(PAYMENT_STATUSES),
  notes: z.string().optional(),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export const paymentUpdateSchema = paymentSchema.partial();

export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>;
