import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { UserModel } from "@/models/User";
import { LeavePolicyModel } from "@/models/LeavePolicy";
import { HolidayModel } from "@/models/Holiday";
import { companyHolidaysList } from "@/data/employee-mock-data";

let bootstrapPromise: Promise<void> | null = null;
let bootstrapped = false;

async function runBootstrap(): Promise<void> {
  await connectToDatabase();

  const superAdminEmail = (
    process.env.SUPER_ADMIN_EMAIL || "shamim.bayshore@gmail.com"
  )
    .toLowerCase()
    .trim();
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || "sajolbd";

  const existingSuperAdmin = await UserModel.findOne({
    email: superAdminEmail,
  }).select("+passwordHash");

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);
    await UserModel.create({
      employeeId: "ADM-001",
      name: "Shamim Ahsan",
      email: superAdminEmail,
      passwordHash,
      role: "Super Admin",
      department: "Executive Leadership",
      designation: "Root Super Administrator",
      phone: "+880 1700-000001",
      location: "Gulshan HQ, Dhaka",
      joinDate: "2024-01-01",
      salary: 0,
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
    });
  } else if (!existingSuperAdmin.passwordHash) {
    existingSuperAdmin.passwordHash = await bcrypt.hash(superAdminPassword, 10);
    existingSuperAdmin.status = "Active";
    existingSuperAdmin.role = "Super Admin";
    await existingSuperAdmin.save();
  }

  const existingPolicy = await LeavePolicyModel.findOne({ key: "annual_leave" });
  if (!existingPolicy) {
    await LeavePolicyModel.create({
      key: "annual_leave",
      type: "Annual Leave",
      yearlyQuota: 20,
      carryForwardMax: 5,
      paid: true,
      description:
        "Fixed yearly paid annual leave allocation per employee. Automatically deducts when leave is taken.",
      color: "#EA580C",
      updatedBy: "System Bootstrap",
    });
  }

  const holidayCount = await HolidayModel.countDocuments();
  if (holidayCount === 0) {
    await HolidayModel.insertMany(
      companyHolidaysList.map((h) => ({
        name: h.name,
        date: h.date,
        day: h.day,
        type: h.type,
      }))
    );
  }
}

export async function ensureDatabaseBootstrapped(): Promise<void> {
  if (bootstrapped) return;
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap()
      .then(() => {
        bootstrapped = true;
      })
      .catch((err) => {
        bootstrapPromise = null;
        throw err;
      });
  }
  await bootstrapPromise;
}
