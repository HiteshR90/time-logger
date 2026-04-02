import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import * as roleController from "./role.controller";

export const roleRoutes = Router();

roleRoutes.get("/", requireAuth, roleController.list);
roleRoutes.post("/", requireAuth, requirePermission("roles.manage"), roleController.create);
roleRoutes.patch("/:id", requireAuth, requirePermission("roles.manage"), roleController.update);
roleRoutes.delete("/:id", requireAuth, requirePermission("roles.manage"), roleController.remove);
