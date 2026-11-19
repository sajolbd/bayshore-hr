import mongoose, { Schema, Model } from "mongoose";

export type DocumentVisibility = "All Employees" | "HR & Admins Only";

export interface ICompanyDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: string;
  visibility: DocumentVisibility;
  fileUrl: string;
  fileSize: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyDocumentSchema = new Schema<ICompanyDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "Company Policy",
      maxlength: 80,
    },
    visibility: {
      type: String,
      enum: ["All Employees", "HR & Admins Only"],
      default: "All Employees",
    },
    fileUrl: { type: String, default: "" },
    fileSize: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true, collection: "documents" }
);

export const CompanyDocumentModel: Model<ICompanyDocument> =
  mongoose.models.CompanyDocument ||
  mongoose.model<ICompanyDocument>(
    "CompanyDocument",
    CompanyDocumentSchema
  );
