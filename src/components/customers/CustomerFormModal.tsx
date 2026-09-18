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
import {
  CUSTOMER_TYPES,
  CUSTOMER_PURPOSES,
  CUSTOMER_STATUSES,
  POSSESSION_TYPES,
  ACQUISITION_TYPES,
  SOURCE_TYPES,
  PROPERTY_TYPES,
} from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import { toRupees, fromRupees, type CurrencyUnit } from "@/lib/utils/currency";
import { hasBedrooms } from "@/lib/utils/property";
import { AmountInput } from "@/components/shared/AmountInput";
import { TagInput } from "@/components/shared/TagInput";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiResponse, PropertyType } from "@/types";
import type { ICustomer } from "@/models/Customer";
import type { IUser } from "@/models/User";

export type CustomerRow = Pick<
  ICustomer,
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "type"
  | "status"
  | "purpose"
  | "budgetMin"
  | "budgetMax"
  | "bedrooms"
  | "notes"
  | "acquisitionType"
  | "brokerName"
  | "brokerAgency"
  | "brokerPhone"
  | "preferredLocations"
  | "preferredPropertyTypes"
  | "possessionType"
  | "possessionDate"
  | "customerSource"
  | "referringAgentName"
> & {
  _id: string;
  assignedAgent?: { _id: string; firstName: string; lastName: string } | null;
  referringAgent?: { _id: string; firstName: string; lastName: string } | null;
};

type AgentOption = Pick<IUser, "firstName" | "lastName"> & { _id: string };

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: ICustomer["type"];
  status: ICustomer["status"];
  purpose: ICustomer["purpose"] | "";
  acquisitionType: ICustomer["acquisitionType"];
  brokerName: string;
  brokerAgency: string;
  brokerPhone: string;
  customerSource: ICustomer["customerSource"];
  referringAgent: string;
  referringAgentName: string;
  budgetMinAmount: string;
  budgetMinUnit: CurrencyUnit;
  budgetMaxAmount: string;
  budgetMaxUnit: CurrencyUnit;
  bedrooms: string;
  preferredLocations: string[];
  preferredPropertyTypes: string[];
  possessionType: ICustomer["possessionType"] | "";
  possessionDate: string;
  assignedAgent: string;
  notes: string;
}

const UNASSIGNED = "unassigned";
const OTHER_AGENT = "other";

const STEPS = [
  { key: "basic", label: "Basic Info" },
  { key: "origin", label: "Origin" },
  { key: "classification", label: "Classification" },
  { key: "preferences", label: "Preferences" },
  { key: "possession", label: "Possession & Notes" },
] as const;

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "buyer",
  status: "active",
  purpose: "",
  acquisitionType: "direct",
  brokerName: "",
  brokerAgency: "",
  brokerPhone: "",
  customerSource: "walk_in",
  referringAgent: UNASSIGNED,
  referringAgentName: "",
  budgetMinAmount: "",
  budgetMinUnit: "lac",
  budgetMaxAmount: "",
  budgetMaxUnit: "lac",
  bedrooms: "",
  preferredLocations: [],
  preferredPropertyTypes: [],
  possessionType: "",
  possessionDate: "",
  assignedAgent: UNASSIGNED,
  notes: "",
};

function toDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toFormState(customer?: CustomerRow | null): FormState {
  if (!customer) return initialFormState;

  const budgetMin = fromRupees(customer.budgetMin);
  const budgetMax = fromRupees(customer.budgetMax);

  return {
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email ?? "",
    phone: customer.phone,
    type: customer.type,
    status: customer.status ?? "active",
    purpose: customer.purpose ?? "",
    acquisitionType: customer.acquisitionType ?? "direct",
    brokerName: customer.brokerName ?? "",
    brokerAgency: customer.brokerAgency ?? "",
    brokerPhone: customer.brokerPhone ?? "",
    customerSource: customer.customerSource ?? "walk_in",
    referringAgent:
      customer.referringAgent?._id ??
      (customer.referringAgentName ? OTHER_AGENT : UNASSIGNED),
    referringAgentName: customer.referringAgentName ?? "",
    budgetMinAmount: budgetMin.amount,
    budgetMinUnit: budgetMin.unit,
    budgetMaxAmount: budgetMax.amount,
    budgetMaxUnit: budgetMax.unit,
    bedrooms: customer.bedrooms != null ? String(customer.bedrooms) : "",
    preferredLocations: customer.preferredLocations ?? [],
    preferredPropertyTypes: customer.preferredPropertyTypes ?? [],
    possessionType: customer.possessionType ?? "",
    possessionDate: customer.possessionDate ? toDateInput(customer.possessionDate) : "",
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) {
      setForm(toFormState(customer));
      setError(null);
      setStep(0);
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

  const showBedrooms = form.preferredPropertyTypes.some((type) =>
    hasBedrooms(type as PropertyType)
  );

  function validateForm(): string | null {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setStep(0);
      return "First and last name are required.";
    }
    if (form.acquisitionType === "broker" && !form.brokerName.trim()) {
      setStep(0);
      return "Broker name is required.";
    }
    if (
      form.customerSource === "agent" &&
      form.referringAgent === OTHER_AGENT &&
      !form.referringAgentName.trim()
    ) {
      setStep(1);
      return "Agent's name is required.";
    }
    if (!form.phone.trim()) {
      setStep(1);
      return "Phone is required.";
    }
    if (form.possessionType === "by_date" && !form.possessionDate) {
      setStep(4);
      return "Possession date is required.";
    }
    return null;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email || undefined,
      phone: form.phone,
      type: form.type,
      status: form.status,
      purpose: form.type === "buyer" ? form.purpose || undefined : undefined,
      acquisitionType: form.acquisitionType,
      brokerName: form.acquisitionType === "broker" ? form.brokerName || undefined : undefined,
      brokerAgency: form.acquisitionType === "broker" ? form.brokerAgency || undefined : undefined,
      brokerPhone: form.acquisitionType === "broker" ? form.brokerPhone || undefined : undefined,
      customerSource: form.customerSource,
      referringAgent:
        form.customerSource === "agent" &&
        form.referringAgent !== UNASSIGNED &&
        form.referringAgent !== OTHER_AGENT
          ? form.referringAgent
          : undefined,
      referringAgentName:
        form.customerSource === "agent" && form.referringAgent === OTHER_AGENT
          ? form.referringAgentName.trim() || undefined
          : undefined,
      budgetMin: toRupees(form.budgetMinAmount, form.budgetMinUnit),
      budgetMax: toRupees(form.budgetMaxAmount, form.budgetMaxUnit),
      bedrooms: showBedrooms && form.bedrooms ? Number(form.bedrooms) : undefined,
      preferredLocations: form.preferredLocations,
      preferredPropertyTypes: form.preferredPropertyTypes,
      possessionType: form.possessionType || undefined,
      possessionDate:
        form.possessionType === "by_date" && form.possessionDate
          ? new Date(form.possessionDate).toISOString()
          : undefined,
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
              : "Add a buyer, investor, or renter."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5 border-b border-input px-4 pb-3">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                i === step
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-muted-foreground hover:bg-accent"
              )}
            >
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full text-[10px]",
                  i === step ? "bg-primary-foreground text-primary" : "bg-muted"
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>
        <form className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4 pt-3" onSubmit={handleSubmit}>
          {step === 0 && (
          <>
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acquisitionType">Sourced</Label>
            <Select
              value={form.acquisitionType}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  acquisitionType: value as ICustomer["acquisitionType"],
                }))
              }
            >
              <SelectTrigger id="acquisitionType" className="w-full">
                <SelectValue placeholder="Direct or through broker" />
              </SelectTrigger>
              <SelectContent>
                {ACQUISITION_TYPES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option === "direct" ? "Direct" : "Through Broker"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {form.acquisitionType === "broker" && (
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-input p-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brokerName">Broker name</Label>
                <Input
                  id="brokerName"
                  placeholder="Broker's name"
                  required
                  value={form.brokerName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, brokerName: event.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brokerAgency">Agency name</Label>
                <Input
                  id="brokerAgency"
                  placeholder="Agency name"
                  value={form.brokerAgency}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, brokerAgency: event.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brokerPhone">Broker number</Label>
                <Input
                  id="brokerPhone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={form.brokerPhone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, brokerPhone: event.target.value }))
                  }
                />
              </div>
            </div>
          )}
          </>
          )}

          {step === 1 && (
          <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerSource">Customer came via</Label>
              <Select
                value={form.customerSource}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    customerSource: value as ICustomer["customerSource"],
                    referringAgent: value === "agent" ? prev.referringAgent : UNASSIGNED,
                    referringAgentName: value === "agent" ? prev.referringAgentName : "",
                  }))
                }
              >
                <SelectTrigger id="customerSource" className="w-full">
                  <SelectValue placeholder="Walk-in or agent" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "walk_in" ? "Walk-in" : "Agent"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.customerSource === "agent" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="referringAgent">Which agent</Label>
                <Select
                  value={form.referringAgent}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      referringAgent: value,
                      referringAgentName: value === OTHER_AGENT ? prev.referringAgentName : "",
                    }))
                  }
                >
                  <SelectTrigger id="referringAgent" className="w-full">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.firstName} {agent.lastName}
                      </SelectItem>
                    ))}
                    <SelectItem value={OTHER_AGENT}>Other (not listed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {form.customerSource === "agent" && form.referringAgent === OTHER_AGENT && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="referringAgentName">Agent&apos;s name</Label>
              <Input
                id="referringAgentName"
                placeholder="Agent's name"
                required
                value={form.referringAgentName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, referringAgentName: event.target.value }))
                }
              />
            </div>
          )}
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
          </>
          )}

          {step === 2 && (
          <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    type: value as ICustomer["type"],
                    purpose: value === "buyer" ? prev.purpose : "",
                  }))
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
            {form.type === "buyer" && (
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
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, status: value as ICustomer["status"] }))
              }
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CUSTOMER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {toTitleCase(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          </>
          )}

          {step === 3 && (
          <>
          <div className="grid grid-cols-2 gap-3">
            <AmountInput
              id="budgetMin"
              label="Budget min"
              amount={form.budgetMinAmount}
              unit={form.budgetMinUnit}
              onAmountChange={(value) => setForm((prev) => ({ ...prev, budgetMinAmount: value }))}
              onUnitChange={(value) => setForm((prev) => ({ ...prev, budgetMinUnit: value }))}
            />
            <AmountInput
              id="budgetMax"
              label="Budget max"
              amount={form.budgetMaxAmount}
              unit={form.budgetMaxUnit}
              onAmountChange={(value) => setForm((prev) => ({ ...prev, budgetMaxAmount: value }))}
              onUnitChange={(value) => setForm((prev) => ({ ...prev, budgetMaxUnit: value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="preferredLocations">Preferred locations</Label>
            <TagInput
              id="preferredLocations"
              placeholder="Downtown, DHA Phase 6…"
              values={form.preferredLocations}
              onChange={(values) =>
                setForm((prev) => ({ ...prev, preferredLocations: values }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Preferred property types</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {PROPERTY_TYPES.map((propertyType) => (
                <label key={propertyType} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.preferredPropertyTypes.includes(propertyType)}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        preferredPropertyTypes: event.target.checked
                          ? [...prev.preferredPropertyTypes, propertyType]
                          : prev.preferredPropertyTypes.filter((t) => t !== propertyType),
                      }))
                    }
                  />
                  {toTitleCase(propertyType)}
                </label>
              ))}
            </div>
          </div>
          {showBedrooms && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                className="max-w-32"
                value={form.bedrooms}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, bedrooms: event.target.value }))
                }
              />
            </div>
          )}
          </>
          )}

          {step === 4 && (
          <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="possessionType">Possession needed (optional)</Label>
              <Select
                value={form.possessionType || undefined}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    possessionType: value as ICustomer["possessionType"],
                  }))
                }
              >
                <SelectTrigger id="possessionType" className="w-full">
                  <SelectValue placeholder="Select possession" />
                </SelectTrigger>
                <SelectContent>
                  {POSSESSION_TYPES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "ready_to_move" ? "Ready to Move" : "Possession by Date"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.possessionType === "by_date" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="possessionDate">Possession date</Label>
                <Input
                  id="possessionDate"
                  type="date"
                  required
                  value={form.possessionDate}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, possessionDate: event.target.value }))
                  }
                />
              </div>
            )}
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
          </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < STEPS.length - 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                >
                  Next
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                    ? "Save changes"
                    : "Create customer"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
