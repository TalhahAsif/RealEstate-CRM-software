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
import { toRupees, fromRupees, type CurrencyUnit } from "@/lib/utils/currency";
import { AmountInput } from "@/components/shared/AmountInput";
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
  dealAmountValue: string;
  dealAmountUnit: CurrencyUnit;
  commissionPercentage: string;
  commissionAmountValue: string;
  commissionAmountUnit: CurrencyUnit;
  notes: string;
}

const initialFormState: FormState = {
  dealNumber: "",
  customer: "",
  property: "",
  agent: "",
  stage: "property_selected",
  dealAmountValue: "",
  dealAmountUnit: "lac",
  commissionPercentage: "",
  commissionAmountValue: "",
  commissionAmountUnit: "lac",
  notes: "",
};

function toFormState(deal?: DealRow | null): FormState {
  if (!deal) return initialFormState;

  const dealAmount = fromRupees(deal.dealAmount);
  const commissionAmount = fromRupees(deal.commissionAmount);

  return {
    dealNumber: deal.dealNumber ?? "",
    customer: deal.customer?._id ?? "",
    property: deal.property?._id ?? "",
    agent: deal.agent?._id ?? "",
    stage: deal.stage ?? "property_selected",
    dealAmountValue: dealAmount.amount,
    dealAmountUnit: dealAmount.unit,
    commissionPercentage: deal.commissionPercentage != null ? String(deal.commissionPercentage) : "",
    commissionAmountValue: commissionAmount.amount,
    commissionAmountUnit: commissionAmount.unit,
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
    setForm((prev) => {
      if (!selectedProp || prev.dealAmountValue) {
        return { ...prev, property: propId };
      }
      const prefill = fromRupees(selectedProp.price);
      return { ...prev, property: propId, dealAmountValue: prefill.amount, dealAmountUnit: prefill.unit };
    });
  }

  // Auto-calculate commission amount when the deal amount, its unit, or the percentage changes
  function recomputeCommission(
    dealAmountValue: string,
    dealAmountUnit: CurrencyUnit,
    pctStr: string
  ): { commissionAmountValue: string; commissionAmountUnit: CurrencyUnit } | null {
    const dealRaw = toRupees(dealAmountValue, dealAmountUnit);
    const pct = Number(pctStr);

    if (dealRaw == null || Number.isNaN(pct) || pctStr === "") return null;

    const commission = fromRupees((dealRaw * pct) / 100);
    return { commissionAmountValue: commission.amount, commissionAmountUnit: commission.unit };
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
      dealAmount: toRupees(form.dealAmountValue, form.dealAmountUnit) ?? 0,
      commissionPercentage: form.commissionPercentage ? Number(form.commissionPercentage) : undefined,
      commissionAmount: toRupees(form.commissionAmountValue, form.commissionAmountUnit),
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

          <div className="grid grid-cols-2 gap-3">
            <AmountInput
              id="dealAmount"
              label="Deal Amount"
              required
              amount={form.dealAmountValue}
              unit={form.dealAmountUnit}
              onAmountChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  dealAmountValue: value,
                  ...(recomputeCommission(value, prev.dealAmountUnit, prev.commissionPercentage) ?? {}),
                }))
              }
              onUnitChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  dealAmountUnit: value,
                  ...(recomputeCommission(prev.dealAmountValue, value, prev.commissionPercentage) ?? {}),
                }))
              }
            />

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
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    commissionPercentage: e.target.value,
                    ...(recomputeCommission(prev.dealAmountValue, prev.dealAmountUnit, e.target.value) ?? {}),
                  }))
                }
              />
            </div>

            <AmountInput
              id="commissionAmount"
              label="Commission"
              amount={form.commissionAmountValue}
              unit={form.commissionAmountUnit}
              onAmountChange={(value) => setForm((prev) => ({ ...prev, commissionAmountValue: value }))}
              onUnitChange={(value) => setForm((prev) => ({ ...prev, commissionAmountUnit: value }))}
            />
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
