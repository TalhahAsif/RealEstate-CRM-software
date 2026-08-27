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
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUSES,
  AREA_UNITS,
} from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse, PropertyType, ListingType, PropertyStatus, AreaUnit } from "@/types";
import type { IProperty } from "@/models/Property";

export type PropertyRow = Pick<
  IProperty,
  | "propertyId"
  | "title"
  | "description"
  | "propertyType"
  | "listingType"
  | "status"
  | "price"
  | "area"
  | "areaUnit"
  | "bedrooms"
  | "bathrooms"
  | "floor"
  | "address"
  | "city"
  | "location"
  | "amenities"
  | "images"
  | "notes"
> & {
  _id: string;
  owner?: { _id: string; firstName: string; lastName: string } | null;
  assignedAgent?: { _id: string; firstName: string; lastName: string } | null;
  project?: { _id: string; name: string } | null;
};

interface CustomerOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface AgentOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface ProjectOption {
  _id: string;
  name: string;
}

interface FormState {
  propertyId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  status: PropertyStatus;
  price: string;
  area: string;
  areaUnit: AreaUnit;
  bedrooms: string;
  bathrooms: string;
  floor: string;
  address: string;
  city: string;
  location: string;
  owner: string;
  assignedAgent: string;
  project: string;
  notes: string;
}

const UNSET = "none";

const initialFormState: FormState = {
  propertyId: "",
  title: "",
  description: "",
  propertyType: "flat/apartment",
  listingType: "sale",
  status: "available",
  price: "",
  area: "",
  areaUnit: "sqft",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  address: "",
  city: "",
  location: "",
  owner: UNSET,
  assignedAgent: UNSET,
  project: UNSET,
  notes: "",
};

function toFormState(property?: PropertyRow | null): FormState {
  if (!property) return initialFormState;

  return {
    propertyId: property.propertyId ?? "",
    title: property.title,
    description: property.description ?? "",
    propertyType: property.propertyType,
    listingType: property.listingType,
    status: property.status,
    price: property.price != null ? String(property.price) : "",
    area: property.area != null ? String(property.area) : "",
    areaUnit: property.areaUnit ?? "sqft",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    floor: property.floor ?? "",
    address: property.address ?? "",
    city: property.city ?? "",
    location: property.location ?? "",
    owner: property.owner?._id ?? UNSET,
    assignedAgent: property.assignedAgent?._id ?? UNSET,
    project: property.project?._id ?? UNSET,
    notes: property.notes ?? "",
  };
}

interface PropertyFormModalProps {
  property?: PropertyRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function PropertyFormModal({
  property,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: PropertyFormModalProps) {
  const isEdit = Boolean(property);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(property));
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(property));
      setError(null);
    }
  }, [open, property]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    Promise.all([
      fetch("/api/customers").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([customersRes, usersRes, projectsRes]: [ApiResponse<CustomerOption[]>, ApiResponse<AgentOption[]>, ApiResponse<ProjectOption[]>]) => {
        if (cancelled) return;
        if (customersRes.success && customersRes.data) setCustomers(customersRes.data);
        if (usersRes.success && usersRes.data) setAgents(usersRes.data);
        if (projectsRes.success && projectsRes.data) setProjects(projectsRes.data);
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
      propertyId: form.propertyId || undefined,
      title: form.title,
      description: form.description || undefined,
      propertyType: form.propertyType,
      listingType: form.listingType,
      status: form.status,
      price: Number(form.price),
      area: form.area ? Number(form.area) : undefined,
      areaUnit: form.areaUnit,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      floor: form.floor || undefined,
      address: form.address || undefined,
      city: form.city,
      location: form.location || undefined,
      owner: form.owner === UNSET ? undefined : form.owner,
      assignedAgent: form.assignedAgent === UNSET ? undefined : form.assignedAgent,
      project: form.project === UNSET ? undefined : form.project,
      notes: form.notes || undefined,
    };

    try {
      const response = await fetch(
        isEdit ? `/api/properties/${property!._id}` : "/api/properties",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} property`);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Property" : "Add Property"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update property listing details."
              : "Create a new property listing in the inventory."}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto p-4 pt-0"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="2-Bed Luxury Apartment"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="propertyId">Property Code / ID (optional)</Label>
              <Input
                id="propertyId"
                placeholder="Auto-generated if left blank"
                value={form.propertyId}
                onChange={(e) => setForm((prev) => ({ ...prev, propertyId: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={form.propertyType}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, propertyType: val as PropertyType }))
                }
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {toTitleCase(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="listingType">Listing Type</Label>
              <Select
                value={form.listingType}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, listingType: val as ListingType }))
                }
              >
                <SelectTrigger id="listingType">
                  <SelectValue placeholder="Select listing" />
                </SelectTrigger>
                <SelectContent>
                  {LISTING_TYPES.map((type) => (
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
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, status: val as PropertyStatus }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {toTitleCase(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min={0}
                required
                placeholder="250000"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="area">Area (optional)</Label>
              <Input
                id="area"
                type="number"
                min={0}
                placeholder="1200"
                value={form.area}
                onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="areaUnit">Area Unit</Label>
              <Select
                value={form.areaUnit}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, areaUnit: val as AreaUnit }))
                }
              >
                <SelectTrigger id="areaUnit">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  {AREA_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                placeholder="2"
                value={form.bedrooms}
                onChange={(e) => setForm((prev) => ({ ...prev, bedrooms: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                placeholder="2"
                value={form.bathrooms}
                onChange={(e) => setForm((prev) => ({ ...prev, bathrooms: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="floor">Floor / Level</Label>
              <Input
                id="floor"
                placeholder="5th Floor"
                value={form.floor}
                onChange={(e) => setForm((prev) => ({ ...prev, floor: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                required
                placeholder="Austin"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location / Area</Label>
              <Input
                id="location"
                placeholder="Downtown"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={form.address}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="owner">Owner (Customer)</Label>
              <Select
                value={form.owner}
                onValueChange={(val) => setForm((prev) => ({ ...prev, owner: val }))}
              >
                <SelectTrigger id="owner">
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>None</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.firstName} {c.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignedAgent">Assigned Agent</Label>
              <Select
                value={form.assignedAgent}
                onValueChange={(val) => setForm((prev) => ({ ...prev, assignedAgent: val }))}
              >
                <SelectTrigger id="assignedAgent">
                  <SelectValue placeholder="Select agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Unassigned</SelectItem>
                  {agents.map((a) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.firstName} {a.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project">Project</Label>
              <Select
                value={form.project}
                onValueChange={(val) => setForm((prev) => ({ ...prev, project: val }))}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>None</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Short description of property features…"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Internal notes…"
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
                  : "Create property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
