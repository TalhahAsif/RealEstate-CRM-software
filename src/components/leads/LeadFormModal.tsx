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
import { LEAD_SOURCES, LEAD_STATUSES, LEAD_PRIORITIES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { ILead } from "@/models/Lead";
import type { IUser } from "@/models/User";

export type LeadRow = Pick<
  ILead,
  "firstName" | "lastName" | "email" | "phone" | "source" | "status" | "priority" | "budgetMin" | "budgetMax" | "notes"
> & {
  _id: string;
  assignedTo?: { _id: string; firstName: string; lastName: string } | null;
};

type AgentOption = Pick<IUser, "firstName" | "lastName"> & { _id: string };

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: ILead["source"];
  status: ILead["status"];
  priority: ILead["priority"];
  assignedTo: string;
  budgetMin: string;
  budgetMax: string;
  notes: string;
}

const UNASSIGNED = "unassigned";

const initialFormState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  source: "other",
  status: "new",
  priority: "warm",
  assignedTo: UNASSIGNED,
  budgetMin: "",
  budgetMax: "",
  notes: "",
};

function toFormState(lead?: LeadRow | null): FormState {
  if (!lead) return initialFormState;

  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email ?? "",
    phone: lead.phone,
    source: lead.source,
    status: lead.status,
    priority: lead.priority,
    assignedTo: lead.assignedTo?._id ?? UNASSIGNED,
    budgetMin: lead.budgetMin != null ? String(lead.budgetMin) : "",
    budgetMax: lead.budgetMax != null ? String(lead.budgetMax) : "",
    notes: lead.notes ?? "",
  };
}

interface LeadFormModalProps {
  /** Present => edit mode, pre-filled from this lead. Absent => create mode. */
  lead?: LeadRow | null;
  /** Required in edit mode (no built-in trigger). Optional in create mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Own trigger button, e.g. "Add Lead". Omit when the dialog is controlled externally. */
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function LeadFormModal({
  lead,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: LeadFormModalProps) {
  const isEdit = Boolean(lead);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(lead));
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(lead));
      setError(null);
    }
  }, [open, lead]);

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
      source: form.source,
      status: form.status,
      priority: form.priority,
      assignedTo: form.assignedTo === UNASSIGNED ? undefined : form.assignedTo,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(isEdit ? `/api/leads/${lead!._id}` : "/api/leads", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} lead`);
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
          <DialogTitle>{isEdit ? "Edit Lead" : "Add Lead"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this lead's details." : "Capture a new lead to start tracking."}
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
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source">Source</Label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, source: value as ILead["source"] }))
                }
              >
                <SelectTrigger id="source" className="w-full">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {toTitleCase(source)}
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
                  setForm((prev) => ({ ...prev, status: value as ILead["status"] }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, priority: value as ILead["priority"] }))
                }
              >
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {toTitleCase(priority)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="assignedTo">Agent (optional)</Label>
            <Select
              value={form.assignedTo}
              onValueChange={(value) => setForm((prev) => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger id="assignedTo" className="w-full">
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
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="budgetMin">Budget min (optional)</Label>
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
              <Label htmlFor="budgetMax">Budget max (optional)</Label>
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
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={3}
              placeholder="Anything worth remembering about this lead…"
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
                  : "Create lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
