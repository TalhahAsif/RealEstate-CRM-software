"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Tag, Trash2, UserSquare2 } from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerFormModal, type CustomerRow } from "@/components/customers/CustomerFormModal";
import { getInitials, toTitleCase } from "@/lib/utils/format";
import { CUSTOMER_STATUSES } from "@/constants";
import type { ApiResponse, CustomerStatus } from "@/types";

const STATUS_BADGE_VARIANT: Record<CustomerStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  purchased: "outline",
  rented: "outline",
  on_hold: "secondary",
};

export default function CustomersPage() {
  const router = useRouter();
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

  async function handleStatusChange(customer: CustomerRow, status: CustomerStatus) {
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

      await loadCustomers();
    } catch {
      alert("Something went wrong. Please try again.");
    }
  }

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
      header: "Status",
      cell: (customer) => (
        <Badge variant={STATUS_BADGE_VARIANT[customer.status] ?? "secondary"}>
          {toTitleCase(customer.status)}
        </Badge>
      ),
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
      stopRowClick: true,
      cell: (customer) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === customer._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/customers/${customer._id}`}>
                <Eye />
                View
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditingCustomer(customer)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Tag />
                Mark as
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {CUSTOMER_STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    disabled={customer.status === status}
                    onSelect={() => handleStatusChange(customer, status)}
                  >
                    {toTitleCase(status)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
        description="Manage buyers and renters."
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
        onRowClick={(customer) => router.push(`/customers/${customer._id}`)}
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
