import mongoose, { Schema, Model } from "mongoose";

export interface ILeaveRequest {
  _id: mongoose.Types.ObjectId;
  requestCode: string;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  leaveType: "Annual Leave";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedDate: string;
  reviewedBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    requestCode: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    avatar: { type: String, default: "" },
    department: { type: String, required: true },
    leaveType: { type: String, enum: ["Annual Leave"], default: "Annual Leave" },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    appliedDate: { type: String, required: true },
    reviewedBy: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const LeaveRequestModel: Model<ILeaveRequest> =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
