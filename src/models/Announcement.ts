import mongoose, { Schema, Model } from "mongoose";

export type AnnouncementCategory =
  | "Company Update"
  | "Urgent Notice"
  | "Policy"
  | "Event & Culture";

export interface IAnnouncement {
  _id: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  category: AnnouncementCategory;
  author: string;
  authorAvatar: string;
  isImportant: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ["Company Update", "Urgent Notice", "Policy", "Event & Culture"],
      default: "Company Update",
    },
    author: { type: String, required: true, trim: true, default: "HR Team" },
    authorAvatar: { type: String, default: "" },
    isImportant: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AnnouncementModel: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
