import { z } from "zod";

export const RegisterOrgSchema = z.object({
  orgName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
});
export type RegisterOrgInput = z.infer<typeof RegisterOrgSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export const InviteMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(["manager", "employee"]),
  departmentId: z.string().uuid().nullable().optional(),
});
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
