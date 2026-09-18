"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Building, Eye, MoreHorizontal, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PropertyFormModal, type PropertyRow } from "@/components/properties/PropertyFormModal";
import { formatCurrency, toTitleCase } from "@/lib/utils/format";
import { PROPERTY_STATUSES } from "@/constants";
import type { ApiResponse, PropertyStatus } from "@/types";

const STATUS_BADGE_VARIANT: Record<PropertyStatus, "default" | "secondary" | "outline" | "destructive"> = {
  available: "default",
  reserved: "secondary",
  on_hold: "secondary",
  sold: "outline",
  rented: "outline",
  inactive: "destructive",
};

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      const response = await fetch("/api/properties");
      const result = (await response.json()) as ApiResponse<PropertyRow[]>;

      if (result.success && result.data) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  async function handleStatusChange(property: PropertyRow, status: PropertyStatus) {
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

      await loadProperties();
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

  async function handleDelete(property: PropertyRow) {
    if (!window.confirm(`Delete property "${property.title}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(property._id);
    try {
      const response = await fetch(`/api/properties/${property._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete property");
        return;
      }

      await loadProperties();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<PropertyRow>[] = [
    {
      header: "Property ID",
      cell: (property) => <span className="font-mono text-xs text-muted-foreground">{property.propertyId}</span>,
    },
    {
      header: "Title",
      cell: (property) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{property.title}</span>
          <span className="text-xs text-muted-foreground">{property.city}</span>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (property) => <Badge variant="outline">{toTitleCase(property.propertyType)}</Badge>,
    },
    {
      header: "Listing",
      cell: (property) => (
        <Badge variant={property.listingType === "sale" ? "default" : "secondary"}>
          {toTitleCase(property.listingType)}
        </Badge>
      ),
    },
    {
      header: "Price",
      cell: (property) => (
        <span className="font-medium">
          {formatCurrency(property.price)}
          {property.listingType === "rent" ? "/mo" : ""}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (property) => (
        <Badge variant={STATUS_BADGE_VARIANT[property.status]}>
          {toTitleCase(property.status)}
        </Badge>
      ),
    },
    {
      header: "Agent",
      cell: (property) =>
        property.assignedAgent
          ? `${property.assignedAgent.firstName} ${property.assignedAgent.lastName}`
          : "—",
    },
    {
      header: "",
      className: "w-10",
      stopRowClick: true,
      cell: (property) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === property._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/properties/${property._id}`}>
                <Eye />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditingProperty(property)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tag />
                Mark as
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {PROPERTY_STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={property.status === status}
                    onSelect={() => handleStatusChange(property, status)}
                  >
                    {toTitleCase(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(property)}>
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Properties"
        description="Browse and manage your property listings."
        action={
          <PropertyFormModal
            trigger={
              <Button>
                <Plus />
                Add Property
              </Button>
            }
            onSaved={loadProperties}
          />
        }
      />
      <DataTable
        columns={columns}
        data={properties}
        keyExtractor={(p) => p._id}
        onRowClick={(property) => router.push(`/properties/${property._id}`)}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={Building}
              title="No properties listed yet"
              description="Properties you list for sale or rent will appear here."
            />
          ) : null
        }
      />
      <PropertyFormModal
        property={editingProperty}
        open={Boolean(editingProperty)}
        onOpenChange={(open) => {
          if (!open) setEditingProperty(null);
        }}
        onSaved={loadProperties}
      />
    </div>
  );
}
