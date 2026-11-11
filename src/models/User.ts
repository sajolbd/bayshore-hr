import mongoose, { Schema, Model } from "mongoose";

export type UserRoleType =
  | "Super Admin"
  | "HR Admin"
  | "Payroll Admin"
  | "Compliance Auditor"
  | "Employee";

export type UserStatusType =
  | "Invited"
  | "Active"
  | "On Leave"
  | "Terminated"
  | "Suspended";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  employeeId: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRoleType;
  department: string;
  designation: string;
  phone: string;
  location: string;
  joinDate: string;
  salary: number;
  avatar: string;
  status: UserStatusType;
  inviteTokenHash?: string | null;
  inviteExpiresAt?: Date | null;
  inviteSentAt?: Date | null;
  lastLoginAt?: Date | null;
  bloodGroup?: string;
  nidOrPassport?: string;
  dateOfBirth?: string;
  reportingManager?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  skills?: string[];
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    employeeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: [
        "Super Admin",
        "HR Admin",
        "Payroll Admin",
        "Compliance Auditor",
        "Employee",
      ],
      default: "Employee",
    },
    department: { type: String, required: true, default: "Engineering" },
    designation: { type: String, required: true, default: "Team Member" },
    phone: { type: String, default: "" },
    location: { type: String, default: "Gulshan HQ, Dhaka" },
    joinDate: { type: String, default: () => new Date().toISOString().slice(0, 10) },
    salary: { type: Number, default: 60000 },
    avatar: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    status: {
      type: String,
      enum: ["Invited", "Active", "On Leave", "Terminated", "Suspended"],
      default: "Invited",
    },
    inviteTokenHash: { type: String, select: false, default: null },
    inviteExpiresAt: { type: Date, default: null },
    inviteSentAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    bloodGroup: { type: String, default: "O+" },
    nidOrPassport: { type: String, default: "Pending Verification" },
    dateOfBirth: { type: String, default: "Not Specified" },
    reportingManager: { type: String, default: "Shamim Ahsan (Super Admin)" },
    emergencyContact: {
      name: { type: String, default: "" },
      relationship: { type: String, default: "" },
      phone: { type: String, default: "" },
    },
    skills: { type: [String], default: [] },
    education: {
      type: [
        {
          degree: String,
          institution: String,
          year: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
