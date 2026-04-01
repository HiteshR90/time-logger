import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  AddProjectMemberSchema,
} from "@time-tracker/shared";
import * as projectController from "./project.controller";

export const projectRoutes = Router();

projectRoutes.get("/", requireAuth, projectController.list);
projectRoutes.get("/:id", requireAuth, projectController.get);
projectRoutes.post(
  "/",
  requireAuth,
  requireRole("owner", "manager"),
  validate(CreateProjectSchema),
  projectController.create,
);
projectRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("owner", "manager"),
  validate(UpdateProjectSchema),
  projectController.update,
);
projectRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("owner", "manager"),
  projectController.remove,
);

// Project members
projectRoutes.post(
  "/:id/members",
  requireAuth,
  requireRole("owner", "manager"),
  validate(AddProjectMemberSchema),
  projectController.addMember,
);
projectRoutes.delete(
  "/:id/members/:userId",
  requireAuth,
  requireRole("owner", "manager"),
  projectController.removeMember,
);
