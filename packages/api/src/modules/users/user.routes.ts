import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as userController from "./user.controller";

export const userRoutes = Router();

userRoutes.get("/", requireAuth, userController.listUsers);
userRoutes.get("/:id", requireAuth, userController.getUser);
userRoutes.get("/:id/monitoring-settings", requireAuth, userController.getMonitoringSettings);
userRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("owner", "manager"),
  userController.updateUser,
);
