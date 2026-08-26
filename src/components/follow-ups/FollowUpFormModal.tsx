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
import { FOLLOW_UP_TYPES, FOLLOW_UP_STATUSES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { IFollowUp } from "@/models/FollowUp";

export type FollowUpRow = Pick<IFollowUp, "type" | "scheduledAt" | "status" | "notes"> & {
  _id: string;
  lead?: { _id: string; firstName: string; lastName: string } | null;
  customer?: { _id: string; firstName: string; lastName: string } | null;
  assignedTo: { _id: string; firstName: string; lastName: string };
};

type PersonOption = { _id: string; firstName: string; lastName: string };

type ContactType = "lead" | "customer";

interface FormState {
  contactType: ContactType;
  contactId: string;
  assignedTo: string;
  type: IFollowUp["type"];
  scheduledAt: string;
  status: IFollowUp["status"];
  notes: string;
}

function toDateTimeLocal(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const initialFormState: FormState = {
  contactType: "lead",
  contactId: "",
  assignedTo: "",
  type: "call",
  scheduledAt: "",
  status: "pending",
  notes: "",
};

function toFormState(followUp?: FollowUpRow | null): FormState {
  if (!followUp) return initialFormState;

  const contactType: ContactType = followUp.customer ? "customer" : "lead";

  return {
    contactType,
    contactId: (contactType === "customer" ? followUp.customer?._id : followUp.lead?._id) ?? "",
    assignedTo: followUp.assignedTo._id,
    type: followUp.type,
    scheduledAt: toDateTimeLocal(followUp.scheduledAt),
    status: followUp.status,
    notes: followUp.notes ?? "",
  };
}

interface FollowUpFormModalProps {
  /** Present => edit mode, pre-filled from this follow-up. Absent => create mode. */
  followUp?: FollowUpRow | null;
  /** Required in edit mode (no built-in trigger). Optional in create mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Own trigger button, e.g. "Add Follow-up". Omit when the dialog is controlled externally. */
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function FollowUpFormModal({
  followUp,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: FollowUpFormModalProps) {
  const isEdit = Boolean(followUp);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(followUp));
  const [leads, setLeads] = useState<PersonOption[]>([]);
  const [customers, setCustomers] = useState<PersonOption[]>([]);
  const [agents, setAgents] = useState<PersonOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(followUp));
      setError(null);
    }
  }, [open, followUp]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadOptions() {
      try {
        const [leadsRes, customersRes, usersRes] = await Promise.all([
          fetch("/api/leads").then((r) => r.json()) as Promise<ApiResponse<PersonOption[]>>,
          fetch("/api/customers").then((r) => r.json()) as Promise<ApiResponse<PersonOption[]>>,
          fetch("/api/users").then((r) => r.json()) as Promise<ApiResponse<PersonOption[]>>,
        ]);

        if (cancelled) return;
        if (leadsRes.success && leadsRes.data) setLeads(leadsRes.data);
        if (customersRes.success && customersRes.data) setCustomers(customersRes.data);
        if (usersRes.success && usersRes.data) setAgents(usersRes.data);
      } catch {
        // best-effort load; selects just stay empty on failure
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  function setOpen(nextOpen: boolean) {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  const contactOptions = form.contactType === "lead" ? leads : customers;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.contactId) {
      setError(`Select a ${form.contactType}`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      lead: form.contactType === "lead" ? form.contactId : isEdit ? null : undefined,
      customer: form.contactType === "customer" ? form.contactId : isEdit ? null : undefined,
      assignedTo: form.assignedTo,
      type: form.type,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      status: form.status,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/follow-ups/${followUp!._id}` : "/api/follow-ups",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} follow-up`);
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
          <DialogTitle>{isEdit ? "Edit Follow-up" : "Add Follow-up"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this follow-up's details."
              : "Schedule a call, message, or meeting with a lead or customer."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-4 pt-0" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactType">Contact type</Label>
              <Select
                value={form.contactType}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    contactType: value as ContactType,
                    contactId: "",
                  }))
                }
              >
                <SelectTrigger id="contactType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="contactId">
                {form.contactType === "lead" ? "Lead" : "Customer"}
              </Label>
              <Select
                value={form.contactId || undefined}
                onValueChange={(value) => setForm((prev) => ({ ...prev, contactId: value }))}
              >
                <SelectTrigger id="contactId" className="w-full">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {contactOptions.map((person) => (
                    <SelectItem key={person._id} value={person._id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedTo">Assigned to</Label>
            <Select
              value={form.assignedTo || undefined}
              onValueChange={(value) => setForm((prev) => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger id="assignedTo" className="w-full">
                <SelectValue placeholder="Select an agent…" />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.firstName} {agent.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value as IFollowUp["type"] }))
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {toTitleCase(type)}
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
                  setForm((prev) => ({ ...prev, status: value as IFollowUp["status"] }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOLLOW_UP_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scheduledAt">Scheduled at</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              required
              value={form.scheduledAt}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="What's this follow-up about?"
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
                  : "Create follow-up"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
