import mongoose, { Schema, Model } from "mongoose";

export interface IMailSettings {
  _id: mongoose.Types.ObjectId;
  key: string;
  deliveryMode: "relay" | "direct";
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassEncrypted: string;
  fromName: string;
  updatedBy: string;
  updatedAt: Date;
}

const MailSettingsSchema = new Schema<IMailSettings>(
  {
    key: { type: String, required: true, unique: true, default: "primary" },
    deliveryMode: {
      type: String,
      enum: ["relay", "direct"],
      default: "relay",
    },
    senderEmail: { type: String, default: "", trim: true },
    smtpHost: { type: String, required: true, default: "smtp.gmail.com" },
    smtpPort: { type: Number, required: true, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, default: "", trim: true },
    smtpPassEncrypted: { type: String, default: "", select: false },
    fromName: { type: String, default: "Bayshore HR" },
    updatedBy: { type: String, default: "Super Admin" },
  },
  { timestamps: true }
);

export const MailSettingsModel: Model<IMailSettings> =
  mongoose.models.MailSettings ||
  mongoose.model<IMailSettings>("MailSettings", MailSettingsSchema);

