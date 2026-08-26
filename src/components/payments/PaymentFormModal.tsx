"use client";

import { useEffect, useState, type ReactNode, type SubmitEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "@/constants";
import { formatCurrency, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { IPayment } from "@/models/Payment";

export type PaymentRow = Pick<
  IPayment,
  "amount" | "paymentMethod" | "paymentDate" | "reference" | "status" | "notes"
> & {
  _id: string;
  deal: { _id: string; dealNumber: string } | null;
  customer: { _id: string; firstName: string; lastName: string } | null;
};

type DealOption = {
  _id: string;
  dealNumber: string;
  dealAmount: number;
  customer: { _id: string; firstName: string; lastName: string } | null;
};

interface FormState {
  deal: string;
  amount: string;
  paymentMethod: IPayment["paymentMethod"];
  paymentDate: string;
  reference: string;
  status: IPayment["status"];
  notes: string;
}

function toDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const initialFormState: FormState = {
  deal: "",
  amount: "",
  paymentMethod: "bank_transfer",
  paymentDate: "",
  reference: "",
  status: "pending",
  notes: "",
};

function toFormState(payment?: PaymentRow | null): FormState {
  if (!payment) return initialFormState;

  return {
    deal: payment.deal?._id ?? "",
    amount: String(payment.amount),
    paymentMethod: payment.paymentMethod,
    paymentDate: toDateInput(payment.paymentDate),
    reference: payment.reference ?? "",
    status: payment.status,
    notes: payment.notes ?? "",
  };
}

interface PaymentFormModalProps {
  /** Present => edit mode, pre-filled from this payment. Absent => create mode. */
  payment?: PaymentRow | null;
  /** Required in edit mode (no built-in trigger). Optional in create mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Own trigger button, e.g. "Add Payment". Omit when the dialog is controlled externally. */
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function PaymentFormModal({
  payment,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: PaymentFormModalProps) {
  const isEdit = Boolean(payment);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(payment));
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(payment));
      setError(null);
    }
  }, [open, payment]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    fetch("/api/deals")
      .then((response) => response.json())
      .then((result: ApiResponse<DealOption[]>) => {
        if (!cancelled && result.success && result.data) {
          setDeals(result.data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open]);

  function setOpen(nextOpen: boolean) {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const selectedDeal = deals.find((deal) => deal._id === form.deal);
    if (!isEdit && !selectedDeal?.customer) {
      setError("Select a deal");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      deal: form.deal || undefined,
      customer: selectedDeal?.customer?._id ?? payment?.customer?._id,
      amount: form.amount ? Number(form.amount) : undefined,
      paymentMethod: form.paymentMethod,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
      reference: form.reference || undefined,
      status: form.status,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(isEdit ? `/api/payments/${payment!._id}` : "/api/payments", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} payment`);
        return;
      }

      setOpen(false);
      onSaved?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Payment" : "Add Payment"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this payment's details." : "Record a payment against a deal."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-4 pt-0" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal">Deal</Label>
            <Select
              value={form.deal || undefined}
              onValueChange={(value) => setForm((prev) => ({ ...prev, deal: value }))}
            >
              <SelectTrigger id="deal" className="w-full">
                <SelectValue placeholder={deals.length ? "Select a deal…" : "No deals found"} />
              </SelectTrigger>
              <SelectContent>
                {deals.map((deal) => (
                  <SelectItem key={deal._id} value={deal._id}>
                    {deal.dealNumber}
                    {deal.customer ? ` — ${deal.customer.firstName} ${deal.customer.lastName}` : ""}
                    {" · "}
                    {formatCurrency(deal.dealAmount)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                required
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentDate">Payment date</Label>
              <Input
                id="paymentDate"
                type="date"
                required
                value={form.paymentDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, paymentDate: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentMethod">Method</Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, paymentMethod: value as IPayment["paymentMethod"] }))
                }
              >
                <SelectTrigger id="paymentMethod" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {toTitleCase(method)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as IPayment["status"] }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reference">Reference (optional)</Label>
            <Input
              id="reference"
              placeholder="Transaction / cheque number"
              value={form.reference}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reference: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Anything worth remembering about this payment…"
              value={form.notes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, notes: event.target.value }))
              }
              className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save changes"
                  : "Create payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
