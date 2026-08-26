"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarCheck, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { FollowUpFormModal, type FollowUpRow } from "@/components/follow-ups/FollowUpFormModal";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse } from "@/types";
import type { FollowUpStatus } from "@/types";

const STATUS_BADGE_VARIANT: Record<FollowUpStatus, "outline" | "default" | "destructive"> = {
  pending: "outline",
  completed: "default",
  cancelled: "destructive",
};

function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadFollowUps = useCallback(async () => {
    try {
      const response = await fetch("/api/follow-ups");
      const result = (await response.json()) as ApiResponse<FollowUpRow[]>;

      if (result.success && result.data) {
        setFollowUps(result.data);
      }
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  async function handleDelete(followUp: FollowUpRow) {
    const contactName = followUp.customer
      ? `${followUp.customer.firstName} ${followUp.customer.lastName}`
      : followUp.lead
        ? `${followUp.lead.firstName} ${followUp.lead.lastName}`
        : "this contact";

    if (!window.confirm(`Delete the follow-up with ${contactName}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(followUp._id);
    try {
      const response = await fetch(`/api/follow-ups/${followUp._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete follow-up");
        return;
      }

      await loadFollowUps();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<FollowUpRow>[] = [
    {
      header: "Contact",
      cell: (followUp) => {
        const contact = followUp.customer ?? followUp.lead;
        return contact ? (
          <span className="font-medium">
            {contact.firstName} {contact.lastName}
          </span>
        ) : (
          "—"
        );
      },
    },
    { header: "Type", cell: (followUp) => <Badge variant="outline">{toTitleCase(followUp.type)}</Badge> },
    { header: "Scheduled", cell: (followUp) => formatDateTime(followUp.scheduledAt) },
    {
      header: "Status",
      cell: (followUp) => (
        <Badge variant={STATUS_BADGE_VARIANT[followUp.status]}>{toTitleCase(followUp.status)}</Badge>
      ),
    },
    {
      header: "Assigned To",
      cell: (followUp) => `${followUp.assignedTo.firstName} ${followUp.assignedTo.lastName}`,
    },
    {
      header: "",
      className: "w-10",
      cell: (followUp) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === followUp._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingFollowUp(followUp)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(followUp)}>
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
        title="Follow-ups"
        description="Stay on top of scheduled calls, messages, and meetings."
        action={
          <FollowUpFormModal
            trigger={
              <Button>
                <Plus />
                Add Follow-up
              </Button>
            }
            onSaved={loadFollowUps}
          />
        }
      />
      <DataTable
        columns={columns}
        data={followUps}
        keyExtractor={(followUp) => followUp._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={CalendarCheck}
              title="No follow-ups yet"
              description="Follow-ups scheduled with leads and customers will be listed here."
            />
          ) : null
        }
      />
      <FollowUpFormModal
        followUp={editingFollowUp}
        open={Boolean(editingFollowUp)}
        onOpenChange={(open) => {
          if (!open) setEditingFollowUp(null);
        }}
        onSaved={loadFollowUps}
      />
    </div>
  );
}
