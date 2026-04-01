// Types
export type {
  Organization,
  OrganizationSettings,
  AppCategoryRule,
} from "./types/organization";
export type { User, Department } from "./types/user";
export type { Client, Project, ProjectMember } from "./types/project";
export type {
  TimeEntry,
  ActivitySnapshot,
  AppUsageLog,
  Screenshot,
} from "./types/time-entry";
export type { Invoice, InvoiceLineItem } from "./types/invoice";

// Enums
export {
  UserRole,
  ProjectBudgetType,
  InvoiceStatus,
  TimeEntryStatus,
  TimesheetApproval,
  AppCategory,
  ScreenshotInterval,
} from "./enums";

// Constants
export { DEFAULTS, ACTIVITY_THRESHOLDS, PAGINATION } from "./constants";

// Schemas
export {
  RegisterOrgSchema,
  LoginSchema,
  RefreshTokenSchema,
  InviteMemberSchema,
  AcceptInviteSchema,
  ActivityPayloadSchema,
  PresignedUrlRequestSchema,
  ScreenshotConfirmSchema,
  CreateClientSchema,
  UpdateClientSchema,
  CreateProjectSchema,
  UpdateProjectSchema,
  AddProjectMemberSchema,
  CreateDepartmentSchema,
  GenerateInvoiceSchema,
  UpdateInvoiceSchema,
  UpdateInvoiceStatusSchema,
  UpdateLineItemSchema,
} from "./schemas";
export type {
  RegisterOrgInput,
  LoginInput,
  RefreshTokenInput,
  InviteMemberInput,
  AcceptInviteInput,
  ActivityPayload,
  PresignedUrlRequest,
  ScreenshotConfirmInput,
  CreateClientInput,
  UpdateClientInput,
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectMemberInput,
  CreateDepartmentInput,
  GenerateInvoiceInput,
  UpdateInvoiceInput,
  UpdateInvoiceStatusInput,
  UpdateLineItemInput,
} from "./schemas";

// Utils
export {
  calculateActivityLevel,
  formatDuration,
  secondsToHours,
  calculateInvoiceSubtotal,
  calculateTaxAmount,
  calculateInvoiceTotal,
  calculateBudgetConsumption,
} from "./utils";
export type { InvoiceLineItemCalc } from "./utils";
