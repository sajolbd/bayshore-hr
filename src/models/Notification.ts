import mongoose, { Schema, Model, Document } from "mongoose";

export type NotificationType =
  | "announcement"
  | "birthday"
  | "work-anniversary"
  | "leave"
  | "attendance"
  | "payroll";

export interface INotification extends Document {
  recipientEmployeeId: string;
  type: NotificationType;
  title: string;
  message: string;
  refId?: string;
  dedupKey?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientEmployeeId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "announcement",
        "birthday",
        "work-anniversary",
        "leave",
        "attendance",
        "payroll",
      ],
      default: "announcement",
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    refId: { type: String, default: "" },
    dedupKey: { type: String, default: "", index: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipientEmployeeId: 1, createdAt: -1 });
NotificationSchema.index({ recipientEmployeeId: 1, dedupKey: 1 });

export const NotificationModel: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

/**
 * Single-row state used by the daily scheduler sweep so birthday /
 * anniversary wishes are generated once per calendar day no matter how
 * many times the sweep endpoint is hit.
 */
export interface ISchedulerState extends Document {
  key: string;
  lastRunDate: string;
  updatedAt: Date;
}

const SchedulerStateSchema = new Schema<ISchedulerState>({
  key: { type: String, required: true, unique: true },
  lastRunDate: { type: String, required: true },
});

export const SchedulerStateModel: Model<ISchedulerState> =
  mongoose.models.SchedulerState ||
  mongoose.model<ISchedulerState>("SchedulerState", SchedulerStateSchema);
