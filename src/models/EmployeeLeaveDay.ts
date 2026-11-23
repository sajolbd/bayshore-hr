import mongoose, { Schema, Model } from "mongoose";

export interface IEmployeeLeaveDay {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  employeeName: string;
  avatar: string;
  department: string;
  totalDays: number;
  usedDaysAdjustment: number;
  note?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeLeaveDaySchema = new Schema<IEmployeeLeaveDay>(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    employeeName: { type: String, required: true },
    avatar: { type: String, default: "" },
    department: { type: String, required: true },
    totalDays: { type: Number, required: true, min: 0, max: 365 },
    usedDaysAdjustment: { type: Number, default: 0, min: -365, max: 365 },
    note: { type: String, default: "" },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const EmployeeLeaveDayModel: Model<IEmployeeLeaveDay> =
  mongoose.models.EmployeeLeaveDay ||
  mongoose.model<IEmployeeLeaveDay>("EmployeeLeaveDay", EmployeeLeaveDaySchema);
