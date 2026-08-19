import { Schema, model, models, type Document as MongooseDocument, type Types } from "mongoose";
import { DOCUMENT_TYPES, DOCUMENT_ENTITY_TYPES } from "@/constants";
import type { DocumentType, DocumentEntityType } from "@/types";

export interface IDocument extends MongooseDocument {
  name: string;
  url: string;
  type: DocumentType;
  entityType: DocumentEntityType;
  entityId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    type: { type: String, enum: DOCUMENT_TYPES, default: "other" },
    entityType: { type: String, enum: DOCUMENT_ENTITY_TYPES, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

DocumentSchema.index({ entityType: 1, entityId: 1 });

export default models.Document || model<IDocument>("Document", DocumentSchema);
