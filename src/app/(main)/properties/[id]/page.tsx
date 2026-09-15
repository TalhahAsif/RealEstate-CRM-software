"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, UserSquare2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { PropertyFormModal, type PropertyRow } from "@/components/properties/PropertyFormModal";
import { formatCurrency, getInitials, toTitleCase } from "@/lib/utils/format";
import { hasBedrooms } from "@/lib/utils/property";
import { PROPERTY_FEATURES, PROPERTY_STATUSES } from "@/constants";
import type { ApiResponse, PropertyStatus } from "@/types";
import type { ICustomer } from "@/models/Customer";

type MatchedCustomer = Pick<
  ICustomer,
  "firstName" | "lastName" | "phone" | "type" | "purpose" | "budgetMin" | "budgetMax"
> & { _id: string; matchScore: number };

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  reserved: "secondary",
  on_hold: "secondary",
  sold: "outline",
  rented: "outline",
  inactive: "destructive",
};

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<PropertyRow | null>(null);
  const [matches, setMatches] = useState<MatchedCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propertyRes, matchesRes] = await Promise.all([
        fetch(`/api/properties/${params.id}`).then((r) => r.json()) as Promise<ApiResponse<PropertyRow>>,
        fetch(`/api/properties/${params.id}/matches`).then((r) => r.json()) as Promise<ApiResponse<MatchedCustomer[]>>,
      ]);

      if (propertyRes.success && propertyRes.data) {
        setProperty(propertyRes.data);
      }
      if (matchesRes.success && matchesRes.data) {
        setMatches(matchesRes.data);
      }
    } catch (error) {
      console.error("Error loading property:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: PropertyStatus) {
    if (!property) return;
    try {
      const response = await fetch(`/api/properties/${property._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to update property status");
        return;
      }

      await load();
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!property) {
    return (
      <EmptyState
        icon={UserSquare2}
        title="Property not found"
        description="This property may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/properties")}>
            Back to properties
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/properties")}>
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">{property.title}</h1>
              <span className="font-mono text-xs text-muted-foreground">{property.propertyId}</span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{toTitleCase(property.propertyType)}</Badge>
              <Badge variant={property.listingType === "sale" ? "default" : "secondary"}>
                {toTitleCase(property.listingType)}
              </Badge>
              <Badge variant={STATUS_BADGE_VARIANT[property.status]}>{toTitleCase(property.status)}</Badge>
              {property.acquisitionType === "broker" ? (
                <Badge variant="outline">Through Broker</Badge>
              ) : (
                <Badge variant="outline">Direct</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={property.status} onValueChange={(val) => handleStatusChange(val as PropertyStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {toTitleCase(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">
                  {formatCurrency(property.price)}
                  {property.listingType === "rent" ? "/mo" : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Area</span>
                <span className="font-medium">
                  {property.area != null ? `${property.area} ${property.areaUnit}` : "—"}
                </span>
              </div>
              {hasBedrooms(property.propertyType) ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bedrooms</span>
                  <span className="font-medium">{property.bedrooms ?? "—"}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bathrooms</span>
                <span className="font-medium">{property.bathrooms ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Floor</span>
                <span className="font-medium">{property.floor || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">
                  {property.condition
                    ? property.condition === "other"
                      ? property.conditionOther || "Other"
                      : toTitleCase(property.condition)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Facing</span>
                <span className="font-medium">
                  {property.facing ? toTitleCase(property.facing) : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">City</span>
                <span className="font-medium">{property.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">{property.location || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right font-medium">{property.address || "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{property.ownerName || "—"}</span>
              </div>
              {property.ownerName ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner number</span>
                  <span className="font-medium">{property.ownerPhone || "—"}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent</span>
                <span className="font-medium">
                  {property.assignedAgent
                    ? `${property.assignedAgent.firstName} ${property.assignedAgent.lastName}`
                    : "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project</span>
                <span className="font-medium">{property.project?.name || "—"}</span>
              </div>
            </CardContent>
          </Card>

          {property.acquisitionType === "broker" ? (
            <Card>
              <CardHeader>
                <CardTitle>Broker</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{property.brokerName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agency</span>
                  <span className="font-medium">{property.brokerAgency || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number</span>
                  <span className="font-medium">{property.brokerPhone || "—"}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {property.amenities?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {property.amenities.map((amenity) => (
                  <Badge key={amenity} variant="outline">
                    {(PROPERTY_FEATURES as readonly string[]).includes(amenity)
                      ? toTitleCase(amenity)
                      : amenity}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {property.description || property.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm whitespace-pre-wrap text-muted-foreground">
                {property.description ? <p>{property.description}</p> : null}
                {property.notes ? <p>{property.notes}</p> : null}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Matching customers</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <EmptyState
                  icon={UserSquare2}
                  title="No matching customers yet"
                  description="Customers whose budget, type, and location preferences fit this property will show up here."
                />
              ) : (
                <div className="flex flex-col divide-y">
                  {matches.map((customer) => (
                    <Link
                      key={customer._id}
                      href={`/customers/${customer._id}`}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">{customer.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{toTitleCase(customer.type)}</Badge>
                        <span className="font-medium whitespace-nowrap">
                          {customer.budgetMin != null || customer.budgetMax != null
                            ? `${customer.budgetMin != null ? formatCurrency(customer.budgetMin) : "Any"} – ${
                                customer.budgetMax != null ? formatCurrency(customer.budgetMax) : "Any"
                              }`
                            : "—"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PropertyFormModal
        property={property}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />
    </div>
  );
}
