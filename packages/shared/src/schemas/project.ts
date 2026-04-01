import { z } from "zod";

export const CreateClientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().nullable().optional(),
  address: z.string().max(500).nullable().optional(),
});
export type CreateClientInput = z.infer<typeof CreateClientSchema>;

export const UpdateClientSchema = CreateClientSchema.partial();
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).nullable().optional(),
  clientId: z.string().uuid().nullable().optional(),
  budgetType: z.enum(["hourly", "fixed"]),
  budgetAmount: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).default("USD"),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = CreateProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export const AddProjectMemberSchema = z.object({
  userId: z.string().uuid(),
  hourlyRate: z.number().min(0),
});
export type AddProjectMemberInput = z.infer<typeof AddProjectMemberSchema>;

export const CreateDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
