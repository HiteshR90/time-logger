import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { CreateDepartmentInput } from "@time-tracker/shared";

export async function listDepartments(orgId: string) {
  return prisma.department.findMany({
    where: { orgId },
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createDepartment(orgId: string, input: CreateDepartmentInput) {
  return prisma.department.create({
    data: { orgId, name: input.name },
  });
}

export async function updateDepartment(
  orgId: string,
  id: string,
  input: { name?: string; monitoringSettings?: Record<string, unknown> | null },
) {
  const dept = await prisma.department.findFirst({ where: { id, orgId } });
  if (!dept) throw new AppError(404, "Department not found");

  return prisma.department.update({
    where: { id },
    data: input as any,
  });
}

export async function deleteDepartment(orgId: string, id: string) {
  const dept = await prisma.department.findFirst({ where: { id, orgId } });
  if (!dept) throw new AppError(404, "Department not found");

  return prisma.department.delete({ where: { id } });
}
