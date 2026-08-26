"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaymentFormModal, type PaymentRow } from "@/components/payments/PaymentFormModal";
import { formatCurrency, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { PaymentStatus } from "@/types";

const STATUS_BADGE_VARIANT: Record<PaymentStatus, "outline" | "default" | "destructive" | "secondary"> = {
  pending: "outline",
  paid: "default",
  failed: "destructive",
  refunded: "secondary",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState<PaymentRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      const response = await fetch("/api/payments");
      const result = (await response.json()) as ApiResponse<PaymentRow[]>;

      if (result.success && result.data) {
        setPayments(result.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function handleDelete(payment: PaymentRow) {
    if (
      !window.confirm(
        `Delete this ${formatCurrency(payment.amount)} payment? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(payment._id);
    try {
      const response = await fetch(`/api/payments/${payment._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete payment");
        return;
      }

      await loadPayments();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<PaymentRow>[] = [
    { header: "Deal", cell: (payment) => payment.deal?.dealNumber ?? "—" },
    {
      header: "Customer",
      cell: (payment) =>
        payment.customer ? `${payment.customer.firstName} ${payment.customer.lastName}` : "—",
    },
    {
      header: "Amount",
      cell: (payment) => <span className="font-medium">{formatCurrency(payment.amount)}</span>,
    },
    { header: "Method", cell: (payment) => toTitleCase(payment.paymentMethod) },
    {
      header: "Status",
      cell: (payment) => (
        <Badge variant={STATUS_BADGE_VARIANT[payment.status]}>{toTitleCase(payment.status)}</Badge>
      ),
    },
    {
      header: "",
      className: "w-10",
      cell: (payment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === payment._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingPayment(payment)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(payment)}>
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
        title="Payments"
        description="Record and track payments against deals."
        action={
          <PaymentFormModal
            trigger={
              <Button>
                <Plus />
                Add Payment
              </Button>
            }
            onSaved={loadPayments}
          />
        }
      />
      <DataTable
        columns={columns}
        data={payments}
        keyExtractor={(payment) => payment._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={Wallet}
              title="No payments yet"
              description="Payments logged against your deals will show up here."
            />
          ) : null
        }
      />
      <PaymentFormModal
        payment={editingPayment}
        open={Boolean(editingPayment)}
        onOpenChange={(open) => {
          if (!open) setEditingPayment(null);
        }}
        onSaved={loadPayments}
      />
    </div>
  );
}
