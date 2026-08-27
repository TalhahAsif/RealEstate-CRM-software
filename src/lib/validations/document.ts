import { z } from "zod";
import { DOCUMENT_TYPES, DOCUMENT_ENTITY_TYPES } from "@/constants";

export const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  url: z.string().min(1, "Document URL or file link is required"),
  type: z.enum(DOCUMENT_TYPES).default("other"),
  entityType: z.enum(DOCUMENT_ENTITY_TYPES),
  entityId: z.string().min(1, "Entity ID is required"),
  uploadedBy: z.string().min(1, "Uploaded By agent/user is required"),
});

export type DocumentInput = z.infer<typeof documentSchema>;

export const documentUpdateSchema = documentSchema.partial();

export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema>;
