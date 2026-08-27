"use client";

import { useEffect, useState, type ReactNode, type SubmitEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOCUMENT_TYPES, DOCUMENT_ENTITY_TYPES } from "@/constants";
import { toTitleCase } from "@/lib/utils/format";
import type { ApiResponse, DocumentType, DocumentEntityType } from "@/types";
import type { IDocument } from "@/models/Document";

export type DocumentRow = Pick<
  IDocument,
  "name" | "url" | "type" | "entityType" | "entityId" | "createdAt"
> & {
  _id: string;
  uploadedBy: { _id: string; firstName: string; lastName: string };
};

interface UserOption {
  _id: string;
  firstName: string;
  lastName: string;
}

interface FormState {
  name: string;
  url: string;
  type: DocumentType;
  entityType: DocumentEntityType;
  entityId: string;
  uploadedBy: string;
}

const initialFormState: FormState = {
  name: "",
  url: "",
  type: "contract",
  entityType: "property",
  entityId: "",
  uploadedBy: "",
};

function toFormState(doc?: DocumentRow | null): FormState {
  if (!doc) return initialFormState;

  return {
    name: doc.name,
    url: doc.url,
    type: doc.type,
    entityType: doc.entityType,
    entityId: String(doc.entityId),
    uploadedBy: doc.uploadedBy?._id ?? "",
  };
}

interface DocumentFormModalProps {
  document?: DocumentRow | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  onSaved?: () => void;
}

export function DocumentFormModal({
  document: doc,
  open: controlledOpen,
  onOpenChange,
  trigger,
  onSaved,
}: DocumentFormModalProps) {
  const isEdit = Boolean(doc);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const [form, setForm] = useState<FormState>(() => toFormState(doc));
  const [users, setUsers] = useState<UserOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(toFormState(doc));
      setError(null);
    }
  }, [open, doc]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    fetch("/api/users")
      .then((res) => res.json())
      .then((result: ApiResponse<UserOption[]>) => {
        if (!cancelled && result.success && result.data) {
          const usersList = result.data;
          setUsers(usersList);
          // Default uploadedBy to first user if empty
          if (usersList.length > 0 && !form.uploadedBy) {
            setForm((prev) => ({ ...prev, uploadedBy: usersList[0]._id }));
          }
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open, form.uploadedBy]);

  function setOpen(nextOpen: boolean) {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      url: form.url,
      type: form.type,
      entityType: form.entityType,
      entityId: form.entityId,
      uploadedBy: form.uploadedBy,
    };

    try {
      const response = await fetch(isEdit ? `/api/documents/${doc!._id}` : "/api/documents", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        setError(result.message || `Unable to ${isEdit ? "update" : "create"} document`);
        return;
      }

      setOpen(false);
      onSaved?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Document" : "Upload / Add Document"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update document details or file link."
              : "Attach a document record to an entity in the CRM."}
          </DialogDescription>
        </DialogHeader>
        <form className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto p-4 pt-0" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              required
              placeholder="Sale Agreement - Unit 402"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">File URL or Path</Label>
            <Input
              id="url"
              required
              placeholder="https://storage.example.com/docs/contract.pdf"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">Document Type</Label>
              <Select
                value={form.type}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, type: val as DocumentType }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {toTitleCase(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entityType">Related Entity Type</Label>
              <Select
                value={form.entityType}
                onValueChange={(val) =>
                  setForm((prev) => ({ ...prev, entityType: val as DocumentEntityType }))
                }
              >
                <SelectTrigger id="entityType">
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_ENTITY_TYPES.map((et) => (
                    <SelectItem key={et} value={et}>
                      {toTitleCase(et)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="entityId">Related Entity ID</Label>
              <Input
                id="entityId"
                required
                placeholder="Database Object ID"
                value={form.entityId}
                onChange={(e) => setForm((prev) => ({ ...prev, entityId: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="uploadedBy">Uploaded By</Label>
              <Select
                value={form.uploadedBy}
                onValueChange={(val) => setForm((prev) => ({ ...prev, uploadedBy: val }))}
              >
                <SelectTrigger id="uploadedBy">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Adding…"
                : isEdit
                  ? "Save changes"
                  : "Add document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
