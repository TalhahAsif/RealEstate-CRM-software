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
import { CUSTOMER_TYPES, CUSTOMER_PURPOSES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { ICustomer } from "@/models/Customer";
import type { IUser } from "@/models/User";

export type CustomerRow = Pick<
  ICustomer,
  "firstName" | "lastName" | "email" | "phone" | "type" | "purpose" | "budgetMin" | "budgetMax" | "bedrooms" | "notes"
> & {
  _id: string;
  assignedAgent?: { _id: string; firstName: string; lastName: string } | null;
};

type AgentOption = Pick<IUser, "firstName" | "lastName"> & { _id: string };

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: ICustomer["type"];
  purpose: ICustomer["purpose"] | "";
  budgetMin: string;
  budgetMax: string;
  bedrooms: string;
  assignedAgent: string;
  notes: string;
}

const UNASSIGNED = "unassigned";

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "buyer",
  purpose: "",
  budgetMin: "",
  budgetMax: "",
  bedrooms: "",
  assignedAgent: UNASSIGNED,
  notes: "",
};

function toFormState(customer?: CustomerRow | null): FormState {
  if (!customer) return initialFormState;

  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email ?? "",
    phone: customer.phone,
    type: customer.type,
    purpose: customer.purpose ?? "",
    budgetMin: customer.budgetMin != null ? String(customer.budgetMin) : "",
    budgetMax: customer.budgetMax != null ? String(customer.budgetMax) : "",
    bedrooms: customer.bedrooms != null ? String(customer.bedrooms) : "",
    assignedAgent: customer.assignedAgent?._id ?? UNASSIGNED,
    notes: customer.notes ?? "",
  };
}

interface CustomerFormModalProps {
  /** Present => edit mode, pre-filled from this customer. Absent => create mode. */
  customer?: CustomerRow | null;
  /** Required in edit mode (no built-in trigger). Optional in create mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Own trigger button, e.g. "Add Customer". Omit when the dialog is controlled externally. */
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function CustomerFormModal({
  customer,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: CustomerFormModalProps) {
  const isEdit = Boolean(customer);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(customer));
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(customer));
      setError(null);
    }
  }, [open, customer]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    fetch("/api/users")
      .then((response) => response.json())
      .then((result: ApiResponse<AgentOption[]>) => {
        if (!cancelled && result.success && result.data) {
          setAgents(result.data);
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
    setIsSubmitting(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone,
      type: form.type,
      purpose: form.purpose || undefined,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      assignedAgent: form.assignedAgent === UNASSIGNED ? undefined : form.assignedAgent,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/customers/${customer!._id}` : "/api/customers",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} customer`);
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
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this customer's details."
              : "Add a buyer, seller, landlord, or tenant."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-4 pt-0" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Jane"
                required
                value={form.firstName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, firstName: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                required
                value={form.lastName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, lastName: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 555 123 4567"
                required
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as ICustomer["type"] }))
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {toTitleCase(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="purpose">Purpose (optional)</Label>
              <Select
                value={form.purpose || undefined}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, purpose: value as ICustomer["purpose"] }))
                }
              >
                <SelectTrigger id="purpose" className="w-full">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_PURPOSES.map((purpose) => (
                    <SelectItem key={purpose} value={purpose}>
                      {toTitleCase(purpose)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedAgent">Agent (optional)</Label>
            <Select
              value={form.assignedAgent}
              onValueChange={(value) => setForm((prev) => ({ ...prev, assignedAgent: value }))}
            >
              <SelectTrigger id="assignedAgent" className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.firstName} {agent.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budgetMin">Budget min</Label>
              <Input
                id="budgetMin"
                type="number"
                min={0}
                value={form.budgetMin}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, budgetMin: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budgetMax">Budget max</Label>
              <Input
                id="budgetMax"
                type="number"
                min={0}
                value={form.budgetMax}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, budgetMax: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bedrooms: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Anything worth remembering about this customer…"
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
                  : "Create customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
