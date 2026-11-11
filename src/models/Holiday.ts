import mongoose, { Schema, Model } from "mongoose";

export interface IHoliday {
  _id: mongoose.Types.ObjectId;
  name: string;
  date: string;
  day: string;
  type: "National Holiday" | "Gazetted Holiday" | "Company Holiday";
  createdAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    day: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["National Holiday", "Gazetted Holiday", "Company Holiday"],
      default: "Company Holiday",
    },
  },
  { timestamps: true }
);

export const HolidayModel: Model<IHoliday> =
  mongoose.models.Holiday ||
  mongoose.model<IHoliday>("Holiday", HolidaySchema);
