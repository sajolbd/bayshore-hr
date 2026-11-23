import mongoose, { Schema, Model } from "mongoose";

export interface IBirthdayWish {
  _id: mongoose.Types.ObjectId;
  celebrantEmployeeId: string;
  celebrantName: string;
  senderEmployeeId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  /** DHAKA date key ("YYYY-MM-DD") the wish belongs to. */
  dateKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const BirthdayWishSchema = new Schema<IBirthdayWish>(
  {
    celebrantEmployeeId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    celebrantName: { type: String, required: true },
    senderEmployeeId: { type: String, required: true, trim: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: "" },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    dateKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// One wish per sender per celebrant per day.
BirthdayWishSchema.index(
  { celebrantEmployeeId: 1, senderEmployeeId: 1, dateKey: 1 },
  { unique: true }
);

export const BirthdayWishModel: Model<IBirthdayWish> =
  mongoose.models.BirthdayWish ||
  mongoose.model<IBirthdayWish>("BirthdayWish", BirthdayWishSchema);
