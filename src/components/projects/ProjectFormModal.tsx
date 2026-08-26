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
import { PROJECT_STATUSES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { IProject } from "@/models/Project";

export type ProjectRow = Pick<
  IProject,
  "name" | "description" | "developer" | "location" | "city" | "status" | "totalUnits"
> & { _id: string };

interface FormState {
  name: string;
  description: string;
  developer: string;
  location: string;
  city: string;
  status: IProject["status"];
  totalUnits: string;
}

const initialFormState: FormState = {
  name: "",
  description: "",
  developer: "",
  location: "",
  city: "",
  status: "upcoming",
  totalUnits: "",
};

function toFormState(project?: ProjectRow | null): FormState {
  if (!project) return initialFormState;

  return {
    name: project.name,
    description: project.description ?? "",
    developer: project.developer ?? "",
    location: project.location ?? "",
    city: project.city,
    status: project.status,
    totalUnits: project.totalUnits != null ? String(project.totalUnits) : "",
  };
}

interface ProjectFormModalProps {
  /** Present => edit mode, pre-filled from this project. Absent => create mode. */
  project?: ProjectRow | null;
  /** Required in edit mode (no built-in trigger). Optional in create mode. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Own trigger button, e.g. "Add Project". Omit when the dialog is controlled externally. */
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function ProjectFormModal({
  project,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: ProjectFormModalProps) {
  const isEdit = Boolean(project);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(project));
      setError(null);
    }
  }, [open, project]);

  function setOpen(nextOpen: boolean) {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      developer: form.developer || undefined,
      location: form.location || undefined,
      city: form.city,
      status: form.status,
      totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/projects/${project!._id}` : "/api/projects",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} project`);
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
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this development's details."
              : "Create a new development to group properties under."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4 p-4 pt-0" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="Skyline Residences"
              required
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="developer">Developer (optional)</Label>
              <Input
                id="developer"
                placeholder="Acme Developers"
                value={form.developer}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, developer: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Dubai"
                required
                value={form.city}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, city: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="location">Location (optional)</Label>
            <Input
              id="location"
              placeholder="Downtown, near Metro Station"
              value={form.location}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, location: event.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value as IProject["status"] }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="totalUnits">Total units (optional)</Label>
              <Input
                id="totalUnits"
                type="number"
                min={0}
                placeholder="120"
                value={form.totalUnits}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, totalUnits: event.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="A short summary of this development…"
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
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
                  : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
