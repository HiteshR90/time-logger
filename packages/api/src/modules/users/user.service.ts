import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function listUsers(orgId: string) {
  return prisma.user.findMany({
    where: { orgId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getUser(orgId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, orgId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      department: { select: { id: true, name: true } },
      projectMembers: {
        select: {
          hourlyRate: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function updateUser(
  orgId: string,
  userId: string,
  data: { role?: string; departmentId?: string | null; name?: string; isActive?: boolean },
) {
  const user = await prisma.user.findFirst({ where: { id: userId, orgId } });
  if (!user) throw new AppError(404, "User not found");

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      isActive: true,
    },
  });
}
