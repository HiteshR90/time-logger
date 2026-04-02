import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { DEFAULT_ROLE_PERMISSIONS } from "@time-tracker/shared";

export async function listRoles(orgId: string) {
  return prisma.role.findMany({
    where: { orgId },
    include: { _count: { select: { users: true } } },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
}

export async function createRole(
  orgId: string,
  data: { name: string; permissions?: Record<string, boolean> },
) {
  const existing = await prisma.role.findUnique({
    where: { orgId_name: { orgId, name: data.name } },
  });
  if (existing) throw new AppError(409, "Role with this name already exists");

  return prisma.role.create({
    data: {
      orgId,
      name: data.name,
      isSystem: false,
      permissions: data.permissions || DEFAULT_ROLE_PERMISSIONS.employee,
    },
  });
}

export async function updateRole(
  orgId: string,
  roleId: string,
  data: { name?: string; permissions?: Record<string, boolean> },
) {
  const role = await prisma.role.findFirst({ where: { id: roleId, orgId } });
  if (!role) throw new AppError(404, "Role not found");

  // Can't rename system owner role
  if (role.isSystem && role.name === "owner" && data.name && data.name !== "owner") {
    throw new AppError(400, "Cannot rename the Owner role");
  }
  // Can't modify owner permissions
  if (role.isSystem && role.name === "owner" && data.permissions) {
    throw new AppError(400, "Owner role always has all permissions");
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.permissions) updateData.permissions = data.permissions;

  return prisma.role.update({ where: { id: roleId }, data: updateData });
}

export async function deleteRole(orgId: string, roleId: string) {
  const role = await prisma.role.findFirst({ where: { id: roleId, orgId } });
  if (!role) throw new AppError(404, "Role not found");
  if (role.isSystem) throw new AppError(400, "Cannot delete system roles");

  // Reassign users to employee role
  const employeeRole = await prisma.role.findFirst({
    where: { orgId, name: "employee", isSystem: true },
  });

  if (employeeRole) {
    await prisma.user.updateMany({
      where: { roleId: roleId },
      data: { roleId: employeeRole.id, role: "employee" },
    });
  }

  return prisma.role.delete({ where: { id: roleId } });
}

export async function createDefaultRoles(orgId: string) {
  const roles: Record<string, string> = {};
  for (const [name, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const role = await prisma.role.create({
      data: { orgId, name, isSystem: true, permissions: perms },
    });
    roles[name] = role.id;
  }
  return roles;
}
