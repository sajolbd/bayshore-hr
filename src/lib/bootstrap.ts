import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { UserModel } from "@/models/User";
import { LeavePolicyModel } from "@/models/LeavePolicy";
import { HolidayModel } from "@/models/Holiday";

/** Seed holiday calendar for a fresh database. */
const SEED_HOLIDAYS: Array<{ name: string; date: string; day: string; type: string }> = [
  { name: "Victory Day (বিজয় দিবস)", date: "Dec 16, 2026", day: "Wednesday", type: "National Holiday" },
  { name: "Christmas Day", date: "Dec 25, 2026", day: "Friday", type: "Gazetted Holiday" },
  { name: "New Year's Day", date: "Jan 01, 2027", day: "Friday", type: "Company Holiday" },
  { name: "International Mother Language Day (শহীদ দিবস)", date: "Feb 21, 2027", day: "Sunday", type: "National Holiday" },
  { name: "Independence Day (স্বাধীনতা দিবস)", date: "Mar 26, 2027", day: "Friday", type: "National Holiday" },
];

let bootstrapPromise: Promise<void> | null = null;
let bootstrapped = false;

async function runBootstrap(): Promise<void> {
  await connectToDatabase();

  const superAdminEmail = (
    process.env.SUPER_ADMIN_EMAIL || "shamim.bayshore@gmail.com"
  )
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();
  const superAdminPassword = (
    process.env.SUPER_ADMIN_PASSWORD || "sajolbd"
  )
    .trim()
    .replace(/^["']|["']$/g, "");

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
      location: "Abtab Nagar HQ, Dhaka",
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
    await HolidayModel.insertMany(SEED_HOLIDAYS);
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
