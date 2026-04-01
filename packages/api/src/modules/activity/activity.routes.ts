import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { ActivityPayloadSchema } from "@time-tracker/shared";
import * as activityController from "./activity.controller";

export const activityRoutes = Router();

activityRoutes.post(
  "/ingest",
  requireAuth,
  validate(ActivityPayloadSchema),
  activityController.ingest,
);
