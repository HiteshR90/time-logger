import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function listTimeEntries(
  orgId: string,
  filters: {
    userId?: string;
    projectId?: string;
    from?: string;
    to?: string;
    approval?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: any = {
    project: { orgId },
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.approval ? { approval: filters.approval } : {}),
  };

  if (filters.from || filters.to) {
    where.startTime = {};
    if (filters.from) where.startTime.gte = new Date(filters.from);
    if (filters.to) where.startTime.lte = new Date(filters.to);
  }

  const [entries, total] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      orderBy: { startTime: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { activitySnapshots: true, screenshots: true } },
      },
    }),
    prisma.timeEntry.count({ where }),
  ]);

  return { entries, total, page, limit };
}

export async function createManualEntry(
  userId: string,
  data: {
    projectId: string;
    startTime: string;
    endTime: string;
    description?: string;
  },
) {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const durationSec = Math.floor((end.getTime() - start.getTime()) / 1000);

  if (durationSec <= 0) {
    throw new AppError(400, "End time must be after start time");
  }

  return prisma.timeEntry.create({
    data: {
      userId,
      projectId: data.projectId,
      startTime: start,
      endTime: end,
      durationSec,
      status: "manual",
      approval: "pending",
    },
  });
}

export async function approveEntry(orgId: string, entryId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: { id: entryId, project: { orgId } },
  });
  if (!entry) throw new AppError(404, "Time entry not found");

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: { approval: "approved" },
  });
}

export async function rejectEntry(
  orgId: string,
  entryId: string,
) {
  const entry = await prisma.timeEntry.findFirst({
    where: { id: entryId, project: { orgId } },
  });
  if (!entry) throw new AppError(404, "Time entry not found");

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: { approval: "rejected" },
  });
}

export async function getWeeklySummary(
  orgId: string,
  filters: { userId?: string; from: string; to: string },
) {
  const entries = await prisma.timeEntry.findMany({
    where: {
      project: { orgId },
      ...(filters.userId ? { userId: filters.userId } : {}),
      startTime: { gte: new Date(filters.from) },
      endTime: { lte: new Date(filters.to) },
    },
    include: {
      user: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
    },
  });

  // Aggregate by user and project
  const summary: Record<
    string,
    { user: { id: string; name: string }; projects: Record<string, { project: { id: string; name: string }; totalSeconds: number; entries: number }> }
  > = {};

  for (const entry of entries) {
    if (!summary[entry.userId]) {
      summary[entry.userId] = { user: entry.user, projects: {} };
    }
    if (!summary[entry.userId].projects[entry.projectId]) {
      summary[entry.userId].projects[entry.projectId] = {
        project: entry.project,
        totalSeconds: 0,
        entries: 0,
      };
    }
    summary[entry.userId].projects[entry.projectId].totalSeconds += entry.durationSec;
    summary[entry.userId].projects[entry.projectId].entries += 1;
  }

  return Object.values(summary).map((s) => ({
    ...s,
    projects: Object.values(s.projects),
    totalSeconds: Object.values(s.projects).reduce((sum, p) => sum + p.totalSeconds, 0),
  }));
}
