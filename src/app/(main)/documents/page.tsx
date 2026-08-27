"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
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
import { DocumentFormModal, type DocumentRow } from "@/components/documents/DocumentFormModal";
import { formatDate, toTitleCase } from "@/lib/utils/format";
import type { ApiResponse, DocumentType } from "@/types";

const TYPE_BADGE_VARIANT: Record<DocumentType, "default" | "secondary" | "outline"> = {
  contract: "default",
  agreement: "default",
  id_proof: "secondary",
  invoice: "secondary",
  brochure: "outline",
  other: "outline",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<DocumentRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      const result = (await response.json()) as ApiResponse<DocumentRow[]>;

      if (result.success && result.data) {
        setDocuments(result.data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleDelete(doc: DocumentRow) {
    if (!window.confirm(`Delete document "${doc.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(doc._id);
    try {
      const response = await fetch(`/api/documents/${doc._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        alert(result.message || "Unable to delete document");
        return;
      }

      await loadDocuments();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const columns: DataTableColumn<DocumentRow>[] = [
    {
      header: "Document Name",
      cell: (doc) => (
        <div className="flex items-center gap-2 font-medium text-foreground">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span>{doc.name}</span>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (doc) => (
        <Badge variant={TYPE_BADGE_VARIANT[doc.type] ?? "outline"}>
          {toTitleCase(doc.type)}
        </Badge>
      ),
    },
    {
      header: "Related Entity",
      cell: (doc) => (
        <span className="text-xs text-muted-foreground font-mono">
          {toTitleCase(doc.entityType)}: {String(doc.entityId).slice(0, 10)}…
        </span>
      ),
    },
    {
      header: "Uploaded By",
      cell: (doc) =>
        doc.uploadedBy ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName}` : "—",
    },
    {
      header: "Date",
      cell: (doc) => <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>,
    },
    {
      header: "File Link",
      cell: (doc) => (
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View File
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      header: "",
      className: "w-10",
      cell: (doc) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" disabled={deletingId === doc._id}>
              <MoreHorizontal />
              <span className="sr-only">Open actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingDoc(doc)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(doc)}>
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
        title="Documents"
        description="Manage property contracts, ID proofs, and customer agreements."
        action={
          <DocumentFormModal
            trigger={
              <Button>
                <Plus />
                Add Document
              </Button>
            }
            onSaved={loadDocuments}
          />
        }
      />
      <DataTable
        columns={columns}
        data={documents}
        keyExtractor={(d) => d._id}
        emptyState={
          !isLoading ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded yet"
              description="Documents, contracts, and attachments added to CRM entities will appear here."
            />
          ) : null
        }
      />
      <DocumentFormModal
        document={editingDoc}
        open={Boolean(editingDoc)}
        onOpenChange={(open) => {
          if (!open) setEditingDoc(null);
        }}
        onSaved={loadDocuments}
      />
    </div>
  );
}
