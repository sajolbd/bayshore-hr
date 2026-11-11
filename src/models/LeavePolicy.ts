import mongoose, { Schema, Model } from "mongoose";

export interface ILeavePolicy {
  _id: mongoose.Types.ObjectId;
  key: string;
  type: "Annual Leave";
  yearlyQuota: number;
  carryForwardMax: number;
  paid: boolean;
  description: string;
  color: string;
  updatedBy?: string;
  updatedAt: Date;
}

const LeavePolicySchema = new Schema<ILeavePolicy>(
  {
    key: { type: String, required: true, unique: true, default: "annual_leave" },
    type: { type: String, enum: ["Annual Leave"], default: "Annual Leave" },
    yearlyQuota: { type: Number, required: true, default: 20, min: 0, max: 365 },
    carryForwardMax: { type: Number, default: 5, min: 0, max: 60 },
    paid: { type: Boolean, default: true },
    description: {
      type: String,
      default:
        "Fixed yearly paid annual leave allocation per employee. Automatically deducts when leave is taken.",
    },
    color: { type: String, default: "#EA580C" },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const LeavePolicyModel: Model<ILeavePolicy> =
  mongoose.models.LeavePolicy ||
  mongoose.model<ILeavePolicy>("LeavePolicy", LeavePolicySchema);
