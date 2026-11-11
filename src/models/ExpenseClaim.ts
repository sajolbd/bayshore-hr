import mongoose, { Schema, Model } from "mongoose";

export interface IExpenseClaim {
  _id: mongoose.Types.ObjectId;
  claimCode: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar: string;
  department: string;
  title: string;
  category:
    | "Travel & Mileage"
    | "Meals & Entertainment"
    | "Medical & Wellness"
    | "Mobile & Internet"
    | "Office Supplies"
    | "Training & Certification"
    | "Client Hospitality";
  amount: number;
  dateIncurred: string;
  submissionDate: string;
  status: "Pending" | "Approved" | "Rejected" | "Reimbursed";
  merchantName: string;
  receiptUrl?: string;
  receiptFileName?: string;
  description: string;
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
  reimbursementDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseClaimSchema = new Schema<IExpenseClaim>(
  {
    claimCode: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true, index: true },
    employeeName: { type: String, required: true },
    employeeAvatar: { type: String, default: "" },
    department: { type: String, required: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Travel & Mileage",
        "Meals & Entertainment",
        "Medical & Wellness",
        "Mobile & Internet",
        "Office Supplies",
        "Training & Certification",
        "Client Hospitality",
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    dateIncurred: { type: String, required: true },
    submissionDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Reimbursed"],
      default: "Pending",
      index: true,
    },
    merchantName: { type: String, required: true },
    receiptUrl: { type: String },
    receiptFileName: { type: String },
    description: { type: String, required: true },
    approvedBy: { type: String },
    approvalDate: { type: String },
    rejectionReason: { type: String },
    reimbursementDate: { type: String },
  },
  { timestamps: true }
);

export const ExpenseClaimModel: Model<IExpenseClaim> =
  mongoose.models.ExpenseClaim ||
  mongoose.model<IExpenseClaim>("ExpenseClaim", ExpenseClaimSchema);
