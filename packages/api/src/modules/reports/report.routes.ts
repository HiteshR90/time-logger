import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import * as reportController from "./report.controller";

export const reportRoutes = Router();
reportRoutes.get("/activity", requireAuth, requirePermission("reports.view"), reportController.activityReport);
reportRoutes.get("/time-by-project", requireAuth, requirePermission("reports.view"), reportController.timeByProjectReport);
reportRoutes.get("/app-usage", requireAuth, requirePermission("reports.view"), reportController.appUsageReport);
reportRoutes.get("/employee-earnings", requireAuth, requirePermission("reports.earnings"), reportController.employeeEarningsReport);
