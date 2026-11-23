/**
 * Maps a notification type to the page that shows its subject matter.
 * Used by the header bell popover and the notifications center so
 * clicking a notification message lands on the relevant page.
 */
export function getNotificationRoute(type: string): string {
  switch (type) {
    case "leave":
      return "/employee/leave";
    case "attendance":
      return "/employee/attendance";
    case "payroll":
      return "/employee/salary";
    case "announcement":
      return "/employee/announcements";
    case "review":
      return "/employee/performance";
    case "birthday":
    case "work-anniversary":
    default:
      // Celebrations and anything unmapped land on the dashboard widgets.
      return "/employee/dashboard";
  }
}
