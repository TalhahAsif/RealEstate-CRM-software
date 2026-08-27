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
import { DEAL_STAGES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse, DealStage } from "@/types";
import type { IDeal } from "@/models/Deal";

export type DealRow = Pick<
  IDeal,
  | "dealNumber"
  | "stage"
  | "dealAmount"
  | "commissionPercentage"
  | "commissionAmount"
  | "notes"
  | "closedAt"
> & {
  _id: string;
  customer: { _id: string; firstName: string; lastName: string };
  property: { _id: string; title: string; propertyId?: string; price?: number };
  agent: { _id: string; firstName: string; lastName: string };
};

interface CustomerOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface PropertyOption {
  _id: string;
  title: string;
  price: number;
}

interface AgentOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface FormState {
  dealNumber: string;
  customer: string;
  property: string;
  agent: string;
  stage: DealStage;
  dealAmount: string;
  commissionPercentage: string;
  commissionAmount: string;
  notes: string;
}

const initialFormState: FormState = {
  dealNumber: "",
  customer: "",
  property: "",
  agent: "",
  stage: "property_selected",
  dealAmount: "",
  commissionPercentage: "",
  commissionAmount: "",
  notes: "",
};

function toFormState(deal?: DealRow | null): FormState {
  if (!deal) return initialFormState;

  return {
    dealNumber: deal.dealNumber ?? "",
    customer: deal.customer?._id ?? "",
    property: deal.property?._id ?? "",
    agent: deal.agent?._id ?? "",
    stage: deal.stage ?? "property_selected",
    dealAmount: deal.dealAmount != null ? String(deal.dealAmount) : "",
    commissionPercentage: deal.commissionPercentage != null ? String(deal.commissionPercentage) : "",
    commissionAmount: deal.commissionAmount != null ? String(deal.commissionAmount) : "",
    notes: deal.notes ?? "",
  };
}

interface DealFormModalProps {
  deal?: DealRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function DealFormModal({
  deal,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: DealFormModalProps) {
  const isEdit = Boolean(deal);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(deal));
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(deal));
      setError(null);
    }
  }, [open, deal]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/properties").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(
        ([custRes, propRes, userRes]: [
          ApiResponse<CustomerOption[]>,
          ApiResponse<PropertyOption[]>,
          ApiResponse<AgentOption[]>
        ]) => {
          if (cancelled) return;
          if (custRes.success && custRes.data) setCustomers(custRes.data);
          if (propRes.success && propRes.data) setProperties(propRes.data);
          if (userRes.success && userRes.data) setAgents(userRes.data);
        }
      )
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open]);

  function setOpen(nextOpen: boolean) {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  // When property changes in form, pre-fill deal amount with property price if blank
  function handlePropertySelect(propId: string) {
    const selectedProp = properties.find((p) => p._id === propId);
    setForm((prev) => ({
      ...prev,
      property: propId,
      dealAmount: selectedProp && !prev.dealAmount ? String(selectedProp.price) : prev.dealAmount,
    }));
  }

  // Auto-calculate commission amount when percentage or deal amount changes
  function handleAmountOrPctChange(amountStr: string, pctStr: string) {
    const amt = Number(amountStr);
    const pct = Number(pctStr);
    let commStr = form.commissionAmount;

    if (!isNaN(amt) && !isNaN(pct) && pctStr !== "") {
      commStr = String((amt * pct) / 100);
    }

    setForm((prev) => ({
      ...prev,
      dealAmount: amountStr,
      commissionPercentage: pctStr,
      commissionAmount: commStr,
    }));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      dealNumber: form.dealNumber || undefined,
      customer: form.customer,
      property: form.property,
      agent: form.agent,
      stage: form.stage,
      dealAmount: Number(form.dealAmount),
      commissionPercentage: form.commissionPercentage ? Number(form.commissionPercentage) : undefined,
      commissionAmount: form.commissionAmount ? Number(form.commissionAmount) : undefined,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(isEdit ? `/api/deals/${deal!._id}` : "/api/deals", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} deal`);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Add Deal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this deal's stage, amount, or parameters."
              : "Create a new deal transaction."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto p-4 pt-0" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dealNumber">Deal Number (optional)</Label>
            <Input
              id="dealNumber"
              placeholder="Auto-generated if left blank"
              value={form.dealNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, dealNumber: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={form.customer}
                onValueChange={(val) => setForm((prev) => ({ ...prev, customer: val }))}
              >
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="property">Property</Label>
              <Select value={form.property} onValueChange={handlePropertySelect}>
                <SelectTrigger id="property">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="agent">Agent</Label>
              <Select
                value={form.agent}
                onValueChange={(val) => setForm((prev) => ({ ...prev, agent: val }))}
              >
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.firstName} {a.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stage">Deal Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, stage: val as DealStage }))
                }
              >
                <SelectTrigger id="stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((stg) => (
                    <SelectItem key={stg} value={stg}>
                      {toTitleCase(stg)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dealAmount">Deal Amount</Label>
              <Input
                id="dealAmount"
                type="number"
                min={0}
                required
                placeholder="500000"
                value={form.dealAmount}
                onChange={(e) => handleAmountOrPctChange(e.target.value, form.commissionPercentage)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="commissionPercentage">Commission %</Label>
              <Input
                id="commissionPercentage"
                type="number"
                step="0.1"
                min={0}
                max={100}
                placeholder="2.5"
                value={form.commissionPercentage}
                onChange={(e) => handleAmountOrPctChange(form.dealAmount, e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="commissionAmount">Commission ($)</Label>
              <Input
                id="commissionAmount"
                type="number"
                min={0}
                placeholder="12500"
                value={form.commissionAmount}
                onChange={(e) => setForm((prev) => ({ ...prev, commissionAmount: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Terms, payment terms, or negotiation details…"
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
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
                  : "Create deal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
