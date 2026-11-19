import mongoose, { Schema, Model } from "mongoose";

export type InterviewType =
  | "Initial HR"
  | "Technical Round"
  | "System Design"
  | "Culture Fit"
  | "Final Executive";

export type InterviewStatus = "Scheduled" | "Completed" | "Cancelled";

export interface IInterview {
  _id: mongoose.Types.ObjectId;
  candidateName: string;
  position: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  interviewType: InterviewType;
  interviewers: string[];
  status: InterviewStatus;
  meetingLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    candidateName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    interviewType: {
      type: String,
      enum: ["Initial HR", "Technical Round", "System Design", "Culture Fit", "Final Executive"],
      default: "Initial HR",
    },
    interviewers: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    meetingLink: { type: String, default: "" },
  },
  { timestamps: true, collection: "interviews" }
);

export const InterviewModel: Model<IInterview> =
  mongoose.models.Interview ||
  mongoose.model<IInterview>("Interview", InterviewSchema);
