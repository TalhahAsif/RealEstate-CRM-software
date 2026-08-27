"use client";

import { useCallback, useEffect, useState } from "react";
import { DollarSign, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { DealFormModal, type DealRow } from "@/components/deals/DealFormModal";
import { formatCurrency, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse, DealStage } from "@/types";

const STAGE_BADGE_VARIANT: Record<DealStage, "default" | "secondary" | "outline" | "destructive"> = {
  property_selected: "outline",
  site_visit: "secondary",
  negotiation: "secondary",
  booking: "default",
  closed: "default",
  cancelled: "destructive",
};

export default function DealsPage() {
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDeal, setEditingDeal] = useState<DealRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDeals = useCallback(async () => {
    try {
      const response = await fetch("/api/deals");
      const result = (await response.json()) as ApiResponse<DealRow[]>;

      if (result.success && result.data) {
        setDeals(result.data);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  async function handleDelete(deal: DealRow) {
    if (!window.confirm(`Delete deal "${deal.dealNumber}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(deal._id);
    try {
      const response = await fetch(`/api/deals/${deal._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete deal");
        return;
      }

      await loadDeals();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<DealRow>[] = [
    {
      header: "Deal #",
      cell: (deal) => <span className="font-mono text-xs text-muted-foreground">{deal.dealNumber}</span>,
    },
    {
      header: "Customer",
      cell: (deal) =>
        deal.customer ? (
          <span className="font-medium">{deal.customer.firstName} {deal.customer.lastName}</span>
        ) : (
          "—"
        ),
    },
    {
      header: "Property",
      cell: (deal) =>
        deal.property ? (
          <span className="font-medium text-foreground">{deal.property.title}</span>
        ) : (
          "—"
        ),
    },
    {
      header: "Stage",
      cell: (deal) => (
        <Badge variant={STAGE_BADGE_VARIANT[deal.stage]}>
          {toTitleCase(deal.stage)}
        </Badge>
      ),
    },
    {
      header: "Deal Amount",
      cell: (deal) => <span className="font-medium">{formatCurrency(deal.dealAmount)}</span>,
    },
    {
      header: "Commission",
      cell: (deal) => (
        <span className="text-muted-foreground">
          {deal.commissionAmount != null ? formatCurrency(deal.commissionAmount) : "—"}
          {deal.commissionPercentage != null ? ` (${deal.commissionPercentage}%)` : ""}
        </span>
      ),
    },
    {
      header: "Agent",
      cell: (deal) =>
        deal.agent ? `${deal.agent.firstName} ${deal.agent.lastName}` : "—",
    },
    {
      header: "",
      className: "w-10",
      cell: (deal) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === deal._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingDeal(deal)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(deal)}>
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
        title="Deals"
        description="Track active transactions, commissions, and sales pipeline."
        action={
          <DealFormModal
            trigger={
              <Button>
                <Plus />
                Add Deal
              </Button>
            }
            onSaved={loadDeals}
          />
        }
      />
      <DataTable
        columns={columns}
        data={deals}
        keyExtractor={(d) => d._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={DollarSign}
              title="No deals tracked yet"
              description="Deals created for customers and property sales will appear here."
            />
          ) : null
        }
      />
      <DealFormModal
        deal={editingDeal}
        open={Boolean(editingDeal)}
        onOpenChange={(open) => {
          if (!open) setEditingDeal(null);
        }}
        onSaved={loadDeals}
      />
    </div>
  );
}
