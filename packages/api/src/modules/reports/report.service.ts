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

  const byApp: Record<string, { app: string; totalSeconds: number; category: string }> = {};

  for (const log of logs) {
    if (!byApp[log.app]) {
      byApp[log.app] = { app: log.app, totalSeconds: 0, category: log.category };
    }
    byApp[log.app].totalSeconds += log.durationSec;
  }

  return Object.values(byApp)
    .map((a) => ({ ...a, totalHours: secondsToHours(a.totalSeconds) }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}
