import { Schema, Types, model, models, type Document } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

// TTL index — MongoDB automatically drops the document once expiresAt passes.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.Session || model<ISession>("Session", SessionSchema);
