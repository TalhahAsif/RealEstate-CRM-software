"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, UserSquare2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerFormModal, type CustomerRow } from "@/components/customers/CustomerFormModal";
import { getInitials, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      const response = await fetch("/api/customers");
      const result = (await response.json()) as ApiResponse<CustomerRow[]>;

      if (result.success && result.data) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  async function handleDelete(customer: CustomerRow) {
    if (
      !window.confirm(
        `Delete "${customer.firstName} ${customer.lastName}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(customer._id);
    try {
      const response = await fetch(`/api/customers/${customer._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete customer");
        return;
      }

      await loadCustomers();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<CustomerRow>[] = [
    {
      header: "Name",
      cell: (customer) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(customer.firstName, customer.lastName)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {customer.firstName} {customer.lastName}
          </span>
        </div>
      ),
    },
    { header: "Phone", cell: (customer) => customer.phone },
    {
      header: "Type",
      cell: (customer) => <Badge variant="outline">{toTitleCase(customer.type)}</Badge>,
    },
    {
      header: "Purpose",
      cell: (customer) => (customer.purpose ? toTitleCase(customer.purpose) : "—"),
    },
    {
      header: "Agent",
      cell: (customer) =>
        customer.assignedAgent
          ? `${customer.assignedAgent.firstName} ${customer.assignedAgent.lastName}`
          : "—",
    },
    {
      header: "",
      className: "w-10",
      cell: (customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === customer._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingCustomer(customer)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(customer)}>
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
        title="Customers"
        description="Manage buyers, sellers, landlords, and tenants."
        action={
          <CustomerFormModal
            trigger={
              <Button>
                <Plus />
                Add Customer
              </Button>
            }
            onSaved={loadCustomers}
          />
        }
      />
      <DataTable
        columns={columns}
        data={customers}
        keyExtractor={(customer) => customer._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={UserSquare2}
              title="No customers yet"
              description="Customers converted from leads or added directly will appear here."
            />
          ) : null
        }
      />
      <CustomerFormModal
        customer={editingCustomer}
        open={Boolean(editingCustomer)}
        onOpenChange={(open) => {
          if (!open) setEditingCustomer(null);
        }}
        onSaved={loadCustomers}
      />
    </div>
  );
}
