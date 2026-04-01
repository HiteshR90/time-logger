import type { ProjectBudgetType } from "../enums";

export interface Client {
  readonly id: string;
  readonly orgId: string;
  readonly name: string;
  readonly email: string | null;
  readonly address: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Project {
  readonly id: string;
  readonly orgId: string;
  readonly clientId: string | null;
  readonly name: string;
  readonly description: string | null;
  readonly budgetType: ProjectBudgetType;
  readonly budgetAmount: number | null;
  readonly currency: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ProjectMember {
  readonly projectId: string;
  readonly userId: string;
  readonly hourlyRate: number;
  readonly createdAt: Date;
}
