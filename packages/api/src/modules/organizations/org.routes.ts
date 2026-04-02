import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import * as orgController from "./org.controller";

export const orgRoutes = Router();
orgRoutes.get("/me", requireAuth, orgController.getOrg);
orgRoutes.patch("/settings", requireAuth, requirePermission("settings.manage"), orgController.updateSettings);
