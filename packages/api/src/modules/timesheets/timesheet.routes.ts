import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as timesheetController from "./timesheet.controller";

export const timesheetRoutes = Router();

timesheetRoutes.get("/", requireAuth, timesheetController.list);
timesheetRoutes.get("/summary", requireAuth, timesheetController.weeklySummary);
timesheetRoutes.post("/manual", requireAuth, timesheetController.createManual);
timesheetRoutes.patch(
  "/:id/approve",
  requireAuth,
  requireRole("owner", "manager"),
  timesheetController.approve,
);
timesheetRoutes.patch(
  "/:id/reject",
  requireAuth,
  requireRole("owner", "manager"),
  timesheetController.reject,
);
