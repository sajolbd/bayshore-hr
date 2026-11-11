import mongoose, { Schema, Model } from "mongoose";

export interface IMailSettings {
  _id: mongoose.Types.ObjectId;
  key: string;
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
    smtpHost: { type: String, required: true, default: "smtp.gmail.com" },
    smtpPort: { type: Number, required: true, default: 587 },
    smtpSecure: { type: Boolean, default: false },
    smtpUser: { type: String, required: true, trim: true },
    smtpPassEncrypted: { type: String, required: true, select: false },
    fromName: { type: String, default: "Bayshore HR" },
    updatedBy: { type: String, default: "Super Admin" },
  },
  { timestamps: true }
);

export const MailSettingsModel: Model<IMailSettings> =
  mongoose.models.MailSettings ||
  mongoose.model<IMailSettings>("MailSettings", MailSettingsSchema);

