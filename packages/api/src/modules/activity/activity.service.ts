import { prisma } from "../../config/prisma";
import type { ActivityPayload } from "@time-tracker/shared";

export async function ingestActivity(payload: ActivityPayload) {
  const timestamp = new Date(payload.timestamp);

  // Find or create active time entry for this user+project
  let timeEntry = await prisma.timeEntry.findFirst({
    where: {
      userId: payload.userId,
      projectId: payload.projectId,
      endTime: null,
      status: "active",
    },
    orderBy: { startTime: "desc" },
  });

  if (!timeEntry) {
    timeEntry = await prisma.timeEntry.create({
      data: {
        userId: payload.userId,
        projectId: payload.projectId,
        startTime: timestamp,
        status: payload.isIdle ? "idle" : "active",
      },
    });
  }

  // Update duration
  const durationSec = Math.floor(
    (timestamp.getTime() - timeEntry.startTime.getTime()) / 1000,
  );
  await prisma.timeEntry.update({
    where: { id: timeEntry.id },
    data: {
      durationSec,
      endTime: timestamp,
      status: payload.isIdle ? "idle" : "active",
    },
  });

  // Create activity snapshot
  const snapshot = await prisma.activitySnapshot.create({
    data: {
      timeEntryId: timeEntry.id,
      timestamp,
      keystrokes: payload.keystrokes,
      mouseClicks: payload.mouseClicks,
      mouseDistancePx: Math.round(payload.mouseDistancePx),
      activityLevel: payload.activityLevel,
    },
  });

  // Create app usage logs
  if (payload.activeApps.length > 0) {
    await prisma.appUsageLog.createMany({
      data: payload.activeApps.map((app) => ({
        timeEntryId: timeEntry!.id,
        app: app.app,
        title: app.title,
        url: app.url ?? null,
        durationSec: app.durationSec,
        category: app.category,
      })),
    });
  }

  // Link screenshots
  if (payload.screenshots.length > 0) {
    for (const ss of payload.screenshots) {
      await prisma.screenshot.create({
        data: {
          timeEntryId: timeEntry.id,
          s3Key: ss.s3Key,
          timestamp,
          blurred: false,
        },
      });
    }
  }

  return { timeEntryId: timeEntry.id, snapshotId: snapshot.id };
}
