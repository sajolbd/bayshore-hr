import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  head: string;
  headRole: string;
  headAvatar?: string;
  headcount: number;
  openPositions: number;
  budget: number;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    head: { type: String, required: true, trim: true },
    headRole: { type: String, required: true, trim: true },
    headAvatar: { type: String, default: "" },
    headcount: { type: Number, default: 0, min: 0 },
    openPositions: { type: Number, default: 0, min: 0 },
    budget: { type: Number, default: 0, min: 0 },
    color: { type: String, default: "orange" },
  },
  { timestamps: true }
);

export const DepartmentModel: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>("Department", DepartmentSchema);

