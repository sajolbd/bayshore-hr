import mongoose, { Schema, Model } from "mongoose";

export interface IJobOpening {
  _id: mongoose.Types.ObjectId;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  stage: string;
  applicants: number;
  urgent: boolean;
  isOpen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobOpeningSchema = new Schema<IJobOpening>(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, default: "Abtab Nagar HQ, Dhaka" },
    employmentType: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract", "Internship"],
      default: "Full-Time",
    },
    stage: { type: String, default: "Open" },
    applicants: { type: Number, default: 0, min: 0 },
    urgent: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "jobopenings" }
);

export const JobOpeningModel: Model<IJobOpening> =
  mongoose.models.JobOpening ||
  mongoose.model<IJobOpening>("JobOpening", JobOpeningSchema);
