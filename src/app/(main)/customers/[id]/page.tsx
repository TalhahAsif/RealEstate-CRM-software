"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building, MapPin, Pencil } from "lucide-react";
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
import { CustomerFormModal, type CustomerRow } from "@/components/customers/CustomerFormModal";
import { formatCurrency, formatDate, getInitials, toTitleCase } from "@/lib/utils/format";
import { CUSTOMER_STATUSES } from "@/constants";
import type { ApiResponse, PropertyStatus, CustomerStatus } from "@/types";
import type { IProperty } from "@/models/Property";

type MatchedProperty = Pick<
  IProperty,
  | "propertyId"
  | "title"
  | "propertyType"
  | "listingType"
  | "status"
  | "price"
  | "area"
  | "areaUnit"
  | "bedrooms"
  | "city"
  | "location"
> & { _id: string; matchScore: number };

const STATUS_BADGE_VARIANT: Record<PropertyStatus, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  reserved: "secondary",
  on_hold: "secondary",
  sold: "outline",
  rented: "outline",
  inactive: "destructive",
};

const CUSTOMER_STATUS_BADGE_VARIANT: Record<CustomerStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  purchased: "outline",
  rented: "outline",
  on_hold: "secondary",
};

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [matches, setMatches] = useState<MatchedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [customerRes, matchesRes] = await Promise.all([
        fetch(`/api/customers/${params.id}`).then((r) => r.json()) as Promise<ApiResponse<CustomerRow>>,
        fetch(`/api/customers/${params.id}/matches`).then((r) => r.json()) as Promise<ApiResponse<MatchedProperty[]>>,
      ]);

      if (customerRes.success && customerRes.data) {
        setCustomer(customerRes.data);
      }
      if (matchesRes.success && matchesRes.data) {
        setMatches(matchesRes.data);
      }
    } catch (error) {
      console.error("Error loading customer:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: CustomerStatus) {
    if (!customer) return;
    try {
      const response = await fetch(`/api/customers/${customer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to update customer status");
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

  if (!customer) {
    return (
      <EmptyState
        icon={Building}
        title="Customer not found"
        description="This customer may have been deleted."
        action={
          <Button variant="outline" onClick={() => router.push("/customers")}>
            Back to customers
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => router.push("/customers")}>
            <ArrowLeft />
            <span className="sr-only">Back</span>
          </Button>
          <Avatar size="lg">
            <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{toTitleCase(customer.type)}</Badge>
              <Badge variant={CUSTOMER_STATUS_BADGE_VARIANT[customer.status]}>
                {toTitleCase(customer.status)}
              </Badge>
              {customer.purpose ? <Badge variant="secondary">{toTitleCase(customer.purpose)}</Badge> : null}
              {customer.acquisitionType === "broker" ? (
                <Badge variant="outline">Through Broker</Badge>
              ) : (
                <Badge variant="outline">Direct</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={customer.status} onValueChange={(val) => handleStatusChange(val as CustomerStatus)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {CUSTOMER_STATUSES.map((status) => (
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
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{customer.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agent</span>
                <span className="font-medium">
                  {customer.assignedAgent
                    ? `${customer.assignedAgent.firstName} ${customer.assignedAgent.lastName}`
                    : "Unassigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Came via</span>
                <span className="font-medium">
                  {customer.customerSource === "agent"
                    ? customer.referringAgent
                      ? `${customer.referringAgent.firstName} ${customer.referringAgent.lastName}`
                      : customer.referringAgentName || "Agent"
                    : "Walk-in"}
                </span>
              </div>
            </CardContent>
          </Card>

          {customer.acquisitionType === "broker" ? (
            <Card>
              <CardHeader>
                <CardTitle>Broker</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{customer.brokerName || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agency</span>
                  <span className="font-medium">{customer.brokerAgency || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number</span>
                  <span className="font-medium">{customer.brokerPhone || "—"}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">
                  {customer.budgetMin != null || customer.budgetMax != null
                    ? `${customer.budgetMin != null ? formatCurrency(customer.budgetMin) : "Any"} – ${
                        customer.budgetMax != null ? formatCurrency(customer.budgetMax) : "Any"
                      }`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bedrooms</span>
                <span className="font-medium">{customer.bedrooms ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Preferred types</span>
                <div className="flex flex-wrap gap-1">
                  {customer.preferredPropertyTypes?.length
                    ? customer.preferredPropertyTypes.map((t) => (
                        <Badge key={t} variant="outline">
                          {toTitleCase(t)}
                        </Badge>
                      ))
                    : <span className="font-medium">Any</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Preferred locations</span>
                <div className="flex flex-wrap gap-1">
                  {customer.preferredLocations?.length
                    ? customer.preferredLocations.map((loc) => (
                        <Badge key={loc} variant="outline">
                          {loc}
                        </Badge>
                      ))
                    : <span className="font-medium">Any</span>}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Possession</span>
                <span className="font-medium">
                  {customer.possessionType === "ready_to_move"
                    ? "Ready to Move"
                    : customer.possessionType === "by_date" && customer.possessionDate
                      ? `By ${formatDate(customer.possessionDate)}`
                      : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {customer.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="text-sm whitespace-pre-wrap text-muted-foreground">
                {customer.notes}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Matching properties</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <EmptyState
                  icon={Building}
                  title="No matching properties yet"
                  description="Properties that fit this customer's budget, type, and location preferences will show up here."
                />
              ) : (
                <div className="flex flex-col divide-y">
                  {matches.map((property) => (
                    <Link
                      key={property._id}
                      href={`/properties/${property._id}`}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{property.title}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {[property.location, property.city].filter(Boolean).join(", ") || "—"}
                          {" • "}
                          {toTitleCase(property.propertyType)}
                          {property.bedrooms != null ? ` • ${property.bedrooms} bed` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_BADGE_VARIANT[property.status]}>
                          {toTitleCase(property.status)}
                        </Badge>
                        <span className="font-medium whitespace-nowrap">
                          {formatCurrency(property.price)}
                          {property.listingType === "rent" ? "/mo" : ""}
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

      <CustomerFormModal
        customer={customer}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={load}
      />
    </div>
  );
}
