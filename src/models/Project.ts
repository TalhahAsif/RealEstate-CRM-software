import { Schema, model, models, type Document } from "mongoose";
import { PROJECT_STATUSES } from "@/constants";
import type { ProjectStatus } from "@/types";

export interface IProject extends Document {
  name: string;
  description?: string;
  developer?: string;
  location?: string;
  city: string;
  status: ProjectStatus;
  totalUnits?: number;
  images: string[];
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    developer: { type: String, trim: true },
    location: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    status: { type: String, enum: PROJECT_STATUSES, default: "upcoming" },
    totalUnits: { type: Number, min: 0 },
    images: [{ type: String }],
    amenities: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

ProjectSchema.index({ city: 1 });
ProjectSchema.index({ status: 1 });

export default models.Project || model<IProject>("Project", ProjectSchema);
