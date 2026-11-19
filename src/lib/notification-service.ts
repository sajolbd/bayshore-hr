import { resolveSmtpConfig, buildSenderHeaders } from "./mailer";
import { connectToDatabase } from "./mongodb";
import {
  NotificationModel,
  SchedulerStateModel,
  NotificationType,
} from "@/models/Notification";
import { UserModel } from "@/models/User";

const DAILY_SWEEP_KEY = "daily-notification-sweep";

export interface CreateNotificationInput {
  recipients: Array<{ employeeId: string }>;
  type: NotificationType;
  title: string;
  message: string;
  refId?: string;
  dedupKey?: string;
}

/**
 * Inserts one notification per recipient. Skips rows already delivered for
 * the same dedupKey so repeated sweep runs never double-send.
 */
export async function createNotifications(
  input: CreateNotificationInput
): Promise<number> {
  const recipients = input.recipients.filter((r) => r.employeeId);
  if (recipients.length === 0) return 0;

  const uniqueEmployeeIds = Array.from(
    new Set(recipients.map((r) => r.employeeId))
  );

  let existingIds = new Set<string>();
  if (input.dedupKey) {
    const existing = await NotificationModel.find({
      recipientEmployeeId: { $in: uniqueEmployeeIds },
      dedupKey: input.dedupKey,
    })
      .select("recipientEmployeeId")
      .lean();
    existingIds = new Set(existing.map((d) => d.recipientEmployeeId));
  }

  const pending = uniqueEmployeeIds.filter((id) => !existingIds.has(id));
  if (pending.length === 0) return 0;

  const docs = pending.map((employeeId) => ({
    recipientEmployeeId: employeeId,
    type: input.type,
    title: input.title,
    message: input.message,
    refId: input.refId || "",
    dedupKey: input.dedupKey || "",
  }));

  await NotificationModel.insertMany(
    docs.map((d) => ({ ...d })),
    { ordered: false }
  );
  return pending.length;
}

export async function notifyAllActiveEmployees(
  input: Omit<CreateNotificationInput, "recipients">,
  excludeEmployeeId?: string
): Promise<number> {
  const activeUsers = await UserModel.find({
    status: { $ne: "Terminated" },
  })
    .select("employeeId")
    .lean();

  const recipients = activeUsers
    .map((u) => ({ employeeId: u.employeeId }))
    .filter((r) => r.employeeId !== excludeEmployeeId);

  return createNotifications({ ...input, recipients });
}

function parseDob(value?: string | null): Date | null {
  if (!value) return null;
  const parts = value.split("-").map((p) => parseInt(p, 10));
  if (parts.length < 3 || parts.some((p) => Number.isNaN(p))) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? null
      : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function localDateKey(now: Date): string {
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Daily sweep: creates birthday and work-anniversary notifications for the
 * current day. Idempotent — a SchedulerState row guarantees one run per
 * calendar day, and dedupKeys guard against duplicate rows per person.
 * Returns number of notifications delivered.
 */
export async function runDailyNotificationSweep(options?: {
  force?: boolean;
}): Promise<{ ran: boolean; delivered: number; dateKey: string }> {
  await connectToDatabase();

  const now = new Date();
  const dateKey = localDateKey(now);

  if (!options?.force) {
    const state = await SchedulerStateModel.findOne({
      key: DAILY_SWEEP_KEY,
    }).lean();
    if (state && state.lastRunDate === dateKey) {
      return { ran: false, delivered: 0, dateKey };
    }
  }

  const employees = await UserModel.find({
    status: { $ne: "Terminated" },
  })
    .select(
      "employeeId name email dateOfBirth joinDate avatar department designation"
    )
    .lean();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let delivered = 0;

  const birthdayPeople = employees.filter((emp) => {
    const dob = parseDob(emp.dateOfBirth);
    if (!dob) return false;
    const occurrence = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    return occurrence.getTime() === today.getTime();
  });

  for (const person of birthdayPeople) {
    const dedupKey = `birthday:${dateKey}:${person.employeeId}`;
    delivered += await createNotifications({
      recipients: [{ employeeId: person.employeeId }],
      type: "birthday",
      title: "Happy Birthday!",
      message: `Happy Birthday! The whole team wishes you a wonderful day and a great year ahead.`,
      refId: person.employeeId,
      dedupKey,
    });

    delivered += await createNotifications({
      recipients: employees
        .filter((e) => e.employeeId !== person.employeeId)
        .map((e) => ({ employeeId: e.employeeId })),
      type: "birthday",
      title: "Birthday Today",
      message: `Today is ${person.name}'s (${person.department || "Team"}) birthday — send your wishes!`,
      refId: person.employeeId,
      dedupKey,
    });

    void sendBirthdayEmail({ ...person }).catch(() => {
      // Email is best-effort; in-app notification already delivered.
    });
  }

  const anniversaryPeople = employees.filter((emp) => {
    if (!emp.joinDate) return false;
    const joined = parseDob(emp.joinDate);
    if (!joined) return false;
    const occurrence = new Date(
      today.getFullYear(),
      joined.getMonth(),
      joined.getDate()
    );
    if (occurrence.getTime() !== today.getTime()) return false;
    return today.getFullYear() > joined.getFullYear();
  });

  for (const person of anniversaryPeople) {
    const joined = parseDob(person.joinDate)!;
    const years = today.getFullYear() - joined.getFullYear();
    const dedupKey = `anniversary:${dateKey}:${person.employeeId}`;
    delivered += await createNotifications({
      recipients: [{ employeeId: person.employeeId }],
      type: "work-anniversary",
      title: `Happy Work Anniversary!`,
      message: `Congratulations on completing ${years} year${years > 1 ? "s" : ""} at the company. Thank you for your continued contribution.`,
      refId: person.employeeId,
      dedupKey,
    });
  }

  await SchedulerStateModel.updateOne(
    { key: DAILY_SWEEP_KEY },
    { lastRunDate: dateKey },
    { upsert: true }
  );

  return { ran: true, delivered, dateKey };
}

async function sendBirthdayEmail(person: {
  name: string;
  email: string;
}): Promise<void> {
  const smtp = await resolveSmtpConfig();
  if (!smtp) return;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  const headers = buildSenderHeaders({
    authUser: smtp.user,
    senderEmail: smtp.senderEmail,
    fromName: smtp.fromName,
  });

  await transporter.sendMail({
    from: headers.from,
    replyTo: headers.replyTo,
    to: person.email,
    subject: "Happy Birthday from Bayshore HR!",
    text: `Happy Birthday! The whole team wishes you a wonderful day and a great year ahead.`,
    html: `<div style="font-family: Inter, sans-serif; text-align:center; padding:32px; border:1px solid #e2e8f0; border-radius:16px;">
      <h2 style="color:#ea580c; margin:0 0 8px;">Happy Birthday!</h2>
      <p style="color:#334155; font-size:15px;">Hello ${person.name},</p>
      <p style="color:#475569; font-size:14px; line-height:1.6;">The whole team wishes you a wonderful day and a great year ahead.</p>
      <p style="color:#94a3b8; font-size:11px; margin-top:24px;">Bayshore Communication &bull; Automated HRMS Mailer</p>
    </div>`,
  });
}
