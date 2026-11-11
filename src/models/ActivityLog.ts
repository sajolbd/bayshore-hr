import mongoose, { Schema, Model } from "mongoose";

export interface IActivityLog {
  _id: mongoose.Types.ObjectId;
  user: string;
  avatar: string;
  action: string;
  target: string;
  type: "leave" | "onboarding" | "payroll" | "recruitment" | "review" | "policy";
  ipAddress?: string;
  location?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: String, required: true },
    avatar: { type: String, default: "" },
    action: { type: String, required: true },
    target: { type: String, required: true },
    type: {
      type: String,
      enum: ["leave", "onboarding", "payroll", "recruitment", "review", "policy"],
      default: "onboarding",
    },
    ipAddress: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

export const ActivityLogModel: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
