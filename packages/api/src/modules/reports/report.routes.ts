import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as reportController from "./report.controller";

export const reportRoutes = Router();

reportRoutes.get(
  "/activity",
  requireAuth,
  requireRole("owner", "manager"),
  reportController.activityReport,
);

reportRoutes.get(
  "/time-by-project",
  requireAuth,
  requireRole("owner", "manager"),
  reportController.timeByProjectReport,
);

reportRoutes.get(
  "/app-usage",
  requireAuth,
  requireRole("owner", "manager"),
  reportController.appUsageReport,
);
