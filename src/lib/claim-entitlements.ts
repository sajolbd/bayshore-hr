import { ClaimEntitlement } from "@/types/employee-portal";

/**
 * Company expense-claim policy: categories and yearly limits an employee
 * is entitled to. Spent/remaining are computed at runtime from real claims.
 */
export const claimEntitlements: Array<Omit<ClaimEntitlement, "spent" | "remaining">> = [
  { category: "Travel & Mileage", annualLimit: 50000 },
  { category: "Medical & Wellness", annualLimit: 30000 },
  { category: "Mobile & Internet", annualLimit: 30000 },
  { category: "Training & Certification", annualLimit: 60000 },
  { category: "Client Hospitality", annualLimit: 40000 },
];
