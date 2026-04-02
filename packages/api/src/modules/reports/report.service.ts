import { prisma } from "../../config/prisma";
import { secondsToHours } from "@time-tracker/shared";

export async function getActivityReport(
  orgId: string,
  filters: { userId?: string; from: string; to: string },
) {
  const toDate = new Date(filters.to);
  toDate.setHours(23, 59, 59, 999);

  const entries = await prisma.timeEntry.findMany({
    where: {
      project: { orgId },
      ...(filters.userId ? { userId: filters.userId } : {}),
      startTime: { gte: new Date(filters.from), lte: toDate },
    },
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      activitySnapshots: { select: { activityLevel: true } },
    },
  });

  // Aggregate by user
  const byUser: Record<string, {
    user: { id: string; name: string };
    totalSeconds: number;
    avgActivity: number;
    entries: number;
  }> = {};

  for (const entry of entries) {
    if (!byUser[entry.userId]) {
      byUser[entry.userId] = { user: entry.user, totalSeconds: 0, avgActivity: 0, entries: 0 };
    }
    byUser[entry.userId].totalSeconds += entry.durationSec;
    byUser[entry.userId].entries += 1;
    const snapAvg = entry.activitySnapshots.length > 0
      ? entry.activitySnapshots.reduce((s, a) => s + a.activityLevel, 0) / entry.activitySnapshots.length
      : 0;
    byUser[entry.userId].avgActivity += snapAvg;
  }

  return Object.values(byUser).map((u) => ({
    ...u,
    totalHours: secondsToHours(u.totalSeconds),
    avgActivity: u.entries > 0 ? Math.round(u.avgActivity / u.entries) : 0,
  }));
}

export async function getTimeByProjectReport(
  orgId: string,
  filters: { from: string; to: string },
) {
  const toDate = new Date(filters.to);
  toDate.setHours(23, 59, 59, 999);

  const entries = await prisma.timeEntry.findMany({
    where: {
      project: { orgId },
      startTime: { gte: new Date(filters.from), lte: toDate },
    },
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  const byProject: Record<string, { project: { id: string; name: string }; totalSeconds: number; entries: number }> = {};

  for (const entry of entries) {
    if (!byProject[entry.projectId]) {
      byProject[entry.projectId] = { project: entry.project, totalSeconds: 0, entries: 0 };
    }
    byProject[entry.projectId].totalSeconds += entry.durationSec;
    byProject[entry.projectId].entries += 1;
  }

  return Object.values(byProject)
    .map((p) => ({ ...p, totalHours: secondsToHours(p.totalSeconds) }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export async function getAppUsageReport(
  orgId: string,
  filters: { userId?: string; from: string; to: string },
) {
  const toDate = new Date(filters.to);
  toDate.setHours(23, 59, 59, 999);

  const logs = await prisma.appUsageLog.findMany({
    where: {
      timeEntry: {
        project: { orgId },
        ...(filters.userId ? { userId: filters.userId } : {}),
        startTime: { gte: new Date(filters.from), lte: toDate },
      },
    },
  });

  const byApp: Record<string, {
    app: string;
    totalSeconds: number;
    category: string;
    details: Record<string, { title: string; url: string | null; totalSeconds: number }>;
  }> = {};

  for (const log of logs) {
    if (!byApp[log.app]) {
      byApp[log.app] = { app: log.app, totalSeconds: 0, category: log.category, details: {} };
    }
    byApp[log.app].totalSeconds += log.durationSec;

    // Aggregate by title for detail view
    const titleKey = log.title || "(untitled)";
    if (!byApp[log.app].details[titleKey]) {
      byApp[log.app].details[titleKey] = { title: titleKey, url: log.url, totalSeconds: 0 };
    }
    byApp[log.app].details[titleKey].totalSeconds += log.durationSec;
  }

  return Object.values(byApp)
    .map((a) => ({
      ...a,
      totalHours: secondsToHours(a.totalSeconds),
      details: Object.values(a.details)
        .map((d) => ({ ...d, totalHours: secondsToHours(d.totalSeconds) }))
        .sort((x, y) => y.totalSeconds - x.totalSeconds),
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export async function getEmployeeEarningsReport(
  orgId: string,
  filters: { from: string; to: string },
) {
  const toDate = new Date(filters.to);
  toDate.setHours(23, 59, 59, 999);

  const users = await prisma.user.findMany({
    where: { orgId, isActive: true },
    select: {
      id: true, name: true, email: true, role: true, yearlySalary: true,
      department: { select: { name: true } },
      timeEntries: {
        where: { startTime: { gte: new Date(filters.from), lte: toDate } },
        select: { durationSec: true, project: { select: { id: true, name: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return users.map((user) => {
    const totalSeconds = user.timeEntries.reduce((sum, e) => sum + e.durationSec, 0);
    const totalHours = secondsToHours(totalSeconds);
    const effectiveHourlyCost = user.yearlySalary
      ? Math.round((user.yearlySalary / 2080) * 100) / 100 : null;

    const projectMap: Record<string, { id: string; name: string; hours: number }> = {};
    for (const entry of user.timeEntries) {
      if (!projectMap[entry.project.id]) {
        projectMap[entry.project.id] = { id: entry.project.id, name: entry.project.name, hours: 0 };
      }
      projectMap[entry.project.id].hours += secondsToHours(entry.durationSec);
    }

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department?.name },
      yearlySalary: user.yearlySalary, totalHours, totalSeconds, effectiveHourlyCost,
      projects: Object.values(projectMap).sort((a, b) => b.hours - a.hours),
    };
  });
}
