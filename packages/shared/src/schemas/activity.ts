import { z } from "zod";

const ActiveAppSchema = z.object({
  app: z.string().min(1),
  title: z.string(),
  url: z.string().nullable().optional(),
  durationSec: z.number().int().min(0),
  category: z.enum(["productive", "neutral", "unproductive"]),
});

const ScreenshotRefSchema = z.object({
  s3Key: z.string().min(1),
});

export const ActivityPayloadSchema = z.object({
  timestamp: z.string().datetime(),
  userId: z.string().min(1),
  projectId: z.string().min(1),
  screenshots: z.array(ScreenshotRefSchema).default([]),
  keystrokes: z.number().int().min(0),
  mouseClicks: z.number().int().min(0),
  mouseDistancePx: z.number().min(0),
  activityLevel: z.number().min(0).max(100),
  activeApps: z.array(ActiveAppSchema).default([]),
  isIdle: z.boolean(),
});
export type ActivityPayload = z.infer<typeof ActivityPayloadSchema>;

export const PresignedUrlRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().default("image/jpeg"),
});
export type PresignedUrlRequest = z.infer<typeof PresignedUrlRequestSchema>;

export const ScreenshotConfirmSchema = z.object({
  s3Key: z.string().min(1),
  timeEntryId: z.string().min(1),
  timestamp: z.string().datetime(),
  blurred: z.boolean().default(false),
});
export type ScreenshotConfirmInput = z.infer<typeof ScreenshotConfirmSchema>;
