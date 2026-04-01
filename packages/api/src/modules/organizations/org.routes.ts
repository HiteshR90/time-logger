import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as orgController from "./org.controller";

export const orgRoutes = Router();

orgRoutes.get("/me", requireAuth, orgController.getOrg);
orgRoutes.patch(
  "/settings",
  requireAuth,
  requireRole("owner"),
  orgController.updateSettings,
);
