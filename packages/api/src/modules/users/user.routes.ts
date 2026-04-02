import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import * as userController from "./user.controller";

export const userRoutes = Router();
userRoutes.get("/", requireAuth, userController.listUsers);
userRoutes.get("/:id", requireAuth, userController.getUser);
userRoutes.get("/:id/monitoring-settings", requireAuth, userController.getMonitoringSettings);
userRoutes.patch("/:id", requireAuth, requirePermission("members.edit"), userController.updateUser);
