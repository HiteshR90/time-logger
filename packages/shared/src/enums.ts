export const UserRole = {
  OWNER: "owner",
  MANAGER: "manager",
  EMPLOYEE: "employee",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ProjectBudgetType = {
  HOURLY: "hourly",
  FIXED: "fixed",
} as const;
export type ProjectBudgetType =
  (typeof ProjectBudgetType)[keyof typeof ProjectBudgetType];

export const InvoiceStatus = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
} as const;
export type InvoiceStatus =
  (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const TimeEntryStatus = {
  ACTIVE: "active",
  IDLE: "idle",
  MANUAL: "manual",
} as const;
export type TimeEntryStatus =
  (typeof TimeEntryStatus)[keyof typeof TimeEntryStatus];

export const TimesheetApproval = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type TimesheetApproval =
  (typeof TimesheetApproval)[keyof typeof TimesheetApproval];

export const AppCategory = {
  PRODUCTIVE: "productive",
  NEUTRAL: "neutral",
  UNPRODUCTIVE: "unproductive",
} as const;
export type AppCategory = (typeof AppCategory)[keyof typeof AppCategory];

export const ScreenshotInterval = {
  ONE_MIN: 1,
  TWO_MIN: 2,
  FIVE_MIN: 5,
  TEN_MIN: 10,
  RANDOM: -1,
} as const;
export type ScreenshotInterval =
  (typeof ScreenshotInterval)[keyof typeof ScreenshotInterval];
