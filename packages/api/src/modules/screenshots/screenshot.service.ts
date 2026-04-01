import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import * as s3Service from "../../services/s3";
import type { ScreenshotConfirmInput } from "@time-tracker/shared";

export async function getPresignedUploadUrl(userId: string, filename: string) {
  const date = new Date();
  const datePath = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  const key = `screenshots/${datePath}/${userId}/${Date.now()}-${filename}`;

  const url = await s3Service.generatePresignedUploadUrl(key);
  return { uploadUrl: url, s3Key: key };
}

export async function confirmUpload(input: ScreenshotConfirmInput) {
  return prisma.screenshot.create({
    data: {
      timeEntryId: input.timeEntryId,
      s3Key: input.s3Key,
      timestamp: new Date(input.timestamp),
      blurred: input.blurred,
    },
  });
}

export async function listScreenshots(
  orgId: string,
  filters: {
    userId?: string;
    projectId?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
) {
  const page = filters.page ?? 1;
  const limit = Math.min(filters.limit ?? 25, 100);
  const skip = (page - 1) * limit;

  const where: any = {
    timeEntry: {
      project: { orgId },
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
  };

  if (filters.from || filters.to) {
    where.timestamp = {};
    if (filters.from) where.timestamp.gte = new Date(filters.from);
    if (filters.to) where.timestamp.lte = new Date(filters.to);
  }

  const [screenshots, total] = await Promise.all([
    prisma.screenshot.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
      include: {
        timeEntry: {
          select: {
            userId: true,
            projectId: true,
            user: { select: { name: true } },
            project: { select: { name: true } },
          },
        },
      },
    }),
    prisma.screenshot.count({ where }),
  ]);

  // Generate download URLs
  const withUrls = await Promise.all(
    screenshots.map(async (ss) => ({
      ...ss,
      downloadUrl: await s3Service.generatePresignedDownloadUrl(ss.s3Key),
      thumbnailUrl: ss.thumbnailKey
        ? await s3Service.generatePresignedDownloadUrl(ss.thumbnailKey)
        : null,
    })),
  );

  return { screenshots: withUrls, total, page, limit };
}
