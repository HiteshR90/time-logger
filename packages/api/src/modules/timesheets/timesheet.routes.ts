import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import * as timesheetController from "./timesheet.controller";

export const timesheetRoutes = Router();
timesheetRoutes.get("/", requireAuth, timesheetController.list);
timesheetRoutes.get("/summary", requireAuth, timesheetController.weeklySummary);
timesheetRoutes.post("/manual", requireAuth, timesheetController.createManual);
timesheetRoutes.patch("/:id/approve", requireAuth, requirePermission("timesheets.approve"), timesheetController.approve);
timesheetRoutes.patch("/:id/reject", requireAuth, requirePermission("timesheets.approve"), timesheetController.reject);
