import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { PresignedUrlRequestSchema, ScreenshotConfirmSchema } from "@time-tracker/shared";
import * as screenshotController from "./screenshot.controller";

export const screenshotRoutes = Router();

screenshotRoutes.post(
  "/presigned-url",
  requireAuth,
  validate(PresignedUrlRequestSchema),
  screenshotController.getPresignedUrl,
);

screenshotRoutes.post(
  "/confirm",
  requireAuth,
  validate(ScreenshotConfirmSchema),
  screenshotController.confirmUpload,
);

screenshotRoutes.get(
  "/",
  requireAuth,
  requireRole("owner", "manager"),
  screenshotController.list,
);
