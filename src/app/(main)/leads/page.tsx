"use client";

import { useCallback, useEffect, useState } from "react";
import { MoreHorizontal, Pencil, PhoneCall, Plus, Trash2 } from "lucide-react";
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
import { LeadFormModal, type LeadRow } from "@/components/leads/LeadFormModal";
import { getInitials, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { LeadPriority } from "@/types";

const PRIORITY_BADGE_VARIANT: Record<LeadPriority, "destructive" | "default" | "secondary"> = {
  hot: "destructive",
  warm: "default",
  cold: "secondary",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    try {
      const response = await fetch("/api/leads");
      const result = (await response.json()) as ApiResponse<LeadRow[]>;

      if (result.success && result.data) {
        setLeads(result.data);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function handleDelete(lead: LeadRow) {
    if (!window.confirm(`Delete "${lead.firstName} ${lead.lastName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(lead._id);
    try {
      const response = await fetch(`/api/leads/${lead._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete lead");
        return;
      }

      await loadLeads();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<LeadRow>[] = [
    {
      header: "Name",
      cell: (lead) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(lead.firstName, lead.lastName)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">
            {lead.firstName} {lead.lastName}
          </span>
        </div>
      ),
    },
    { header: "Phone", cell: (lead) => lead.phone },
    {
      header: "Status",
      cell: (lead) => <Badge variant="outline">{toTitleCase(lead.status)}</Badge>,
    },
    {
      header: "Priority",
      cell: (lead) => (
        <Badge variant={PRIORITY_BADGE_VARIANT[lead.priority]}>
          {toTitleCase(lead.priority)}
        </Badge>
      ),
    },
    {
      header: "Agent",
      cell: (lead) =>
        lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : "—",
    },
    {
      header: "",
      className: "w-10",
      cell: (lead) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === lead._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingLead(lead)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(lead)}>
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
        title="Leads"
        description="Manage and track your real estate leads."
        action={
          <LeadFormModal
            trigger={
              <Button>
                <Plus />
                Add Lead
              </Button>
            }
            onSaved={loadLeads}
          />
        }
      />
      <DataTable
        columns={columns}
        data={leads}
        keyExtractor={(lead) => lead._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={PhoneCall}
              title="No leads yet"
              description="Leads you capture from your website, referrals, and campaigns will show up here."
            />
          ) : null
        }
      />
      <LeadFormModal
        lead={editingLead}
        open={Boolean(editingLead)}
        onOpenChange={(open) => {
          if (!open) setEditingLead(null);
        }}
        onSaved={loadLeads}
      />
    </div>
  );
}
