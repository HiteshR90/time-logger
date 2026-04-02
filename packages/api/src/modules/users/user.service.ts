import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { DEFAULTS } from "@time-tracker/shared";

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
      monitoringSettings: true,
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
      monitoringSettings: true,
      createdAt: true,
      department: { select: { id: true, name: true, monitoringSettings: true } },
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
  callerRole: string,
  data: {
    role?: string;
    departmentId?: string | null;
    name?: string;
    isActive?: boolean;
    monitoringSettings?: Record<string, unknown> | null;
  },
) {
  const user = await prisma.user.findFirst({ where: { id: userId, orgId } });
  if (!user) throw new AppError(404, "User not found");

  // Permission checks
  if (callerRole === "manager") {
    // Managers can only edit employees
    if (user.role === "owner" || user.role === "manager") {
      throw new AppError(403, "Managers cannot edit owners or other managers");
    }
    // Managers cannot promote to owner
    if (data.role === "owner") {
      throw new AppError(403, "Managers cannot assign the owner role");
    }
  }
  // Only owners can change someone's role to owner
  if (data.role === "owner" && callerRole !== "owner") {
    throw new AppError(403, "Only owners can assign the owner role");
  }

  return prisma.user.update({
    where: { id: userId },
    data: data as any,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      isActive: true,
      monitoringSettings: true,
    },
  });
}

/**
 * Resolve effective monitoring settings for a user.
 * Priority: User override > Department override > Org default
 */
export async function getUserMonitoringSettings(orgId: string, userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, orgId },
    include: {
      department: { select: { monitoringSettings: true } },
      organization: { select: { settings: true } },
    },
  });
  if (!user) throw new AppError(404, "User not found");

  // Org defaults
  const orgSettings = (user.organization.settings as any) || {};
  const base = {
    screenshotEnabled: true,
    screenshotIntervalMin: orgSettings.screenshotIntervalMin ?? DEFAULTS.SCREENSHOT_INTERVAL_MIN,
    idleTimeoutMin: orgSettings.idleTimeoutMin ?? DEFAULTS.IDLE_TIMEOUT_MIN,
    blurScreenshots: orgSettings.blurScreenshots ?? false,
  };

  // Department overrides
  const deptSettings = (user.department?.monitoringSettings as any) || {};
  const withDept = {
    screenshotEnabled: deptSettings.screenshotEnabled ?? base.screenshotEnabled,
    screenshotIntervalMin: deptSettings.screenshotIntervalMin ?? base.screenshotIntervalMin,
    idleTimeoutMin: deptSettings.idleTimeoutMin ?? base.idleTimeoutMin,
    blurScreenshots: deptSettings.blurScreenshots ?? base.blurScreenshots,
  };

  // User overrides
  const userSettings = (user.monitoringSettings as any) || {};
  return {
    screenshotEnabled: userSettings.screenshotEnabled ?? withDept.screenshotEnabled,
    screenshotIntervalMin: userSettings.screenshotIntervalMin ?? withDept.screenshotIntervalMin,
    idleTimeoutMin: userSettings.idleTimeoutMin ?? withDept.idleTimeoutMin,
    blurScreenshots: userSettings.blurScreenshots ?? withDept.blurScreenshots,
    _source: {
      org: base,
      department: Object.keys(deptSettings).length > 0 ? deptSettings : null,
      user: Object.keys(userSettings).length > 0 ? userSettings : null,
    },
  };
}
