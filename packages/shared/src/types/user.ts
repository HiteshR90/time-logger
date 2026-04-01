import type { UserRole } from "../enums";

export interface User {
  readonly id: string;
  readonly orgId: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly departmentId: string | null;
  readonly avatarUrl: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Department {
  readonly id: string;
  readonly orgId: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
