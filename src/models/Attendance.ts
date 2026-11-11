import mongoose, { Schema, Model } from "mongoose";

export interface IAttendanceGeo {
  latitude: number;
  longitude: number;
  accuracy: number;
  address: string;
  geofenceStatus:
    | "Inside Office Geofence"
    | "Outside Geofence (Remote)"
    | "Field Client Visit";
  distanceFromHQ?: number;
  ipAddress?: string;
  selfieUrl?: string;
  checkInType: "Time Clock" | "Field Check-In";
  clientName?: string;
  purposeNote?: string;
  timestamp?: string;
}

export interface IAttendance {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  avatar: string;
  department: string;
  role: string;
  dateKey: string;
  dayLabel: string;
  checkIn: string;
  checkInAt: Date;
  checkOut: string | null;
  checkOutAt: Date | null;
  status: "Present" | "Late" | "On Leave" | "Remote" | "Absent";
  workHours: string;
  location: string;
  geo?: IAttendanceGeo;
  clockOutLocation?: string;
  clockOutGeo?: Partial<IAttendanceGeo>;
  createdAt: Date;
  updatedAt: Date;
}

const GeoSchema = new Schema<IAttendanceGeo>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number, default: 15 },
    address: { type: String, required: true },
    geofenceStatus: {
      type: String,
      enum: [
        "Inside Office Geofence",
        "Outside Geofence (Remote)",
        "Field Client Visit",
      ],
      default: "Outside Geofence (Remote)",
    },
    distanceFromHQ: { type: Number },
    ipAddress: { type: String },
    selfieUrl: { type: String },
    checkInType: {
      type: String,
      enum: ["Time Clock", "Field Check-In"],
      default: "Time Clock",
    },
    clientName: { type: String },
    purposeNote: { type: String },
    timestamp: { type: String },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeEmail: { type: String, required: true },
    avatar: { type: String, default: "" },
    department: { type: String, required: true },
    role: { type: String, required: true },
    dateKey: { type: String, required: true, index: true },
    dayLabel: { type: String, required: true },
    checkIn: { type: String, required: true },
    checkInAt: { type: Date, required: true },
    checkOut: { type: String, default: null },
    checkOutAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Present", "Late", "On Leave", "Remote", "Absent"],
      default: "Present",
    },
    workHours: { type: String, default: "In Progress" },
    location: { type: String, required: true },
    geo: { type: GeoSchema },
    clockOutLocation: { type: String },
    clockOutGeo: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employeeId: 1, dateKey: 1 }, { unique: true });

export const AttendanceModel: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>("Attendance", AttendanceSchema);
