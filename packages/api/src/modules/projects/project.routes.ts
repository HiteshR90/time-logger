import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CreateProjectSchema, UpdateProjectSchema, AddProjectMemberSchema } from "@time-tracker/shared";
import * as projectController from "./project.controller";

export const projectRoutes = Router();
projectRoutes.get("/", requireAuth, projectController.list);
projectRoutes.get("/:id", requireAuth, projectController.get);
projectRoutes.post("/", requireAuth, requirePermission("projects.manage"), validate(CreateProjectSchema), projectController.create);
projectRoutes.patch("/:id", requireAuth, requirePermission("projects.manage"), validate(UpdateProjectSchema), projectController.update);
projectRoutes.delete("/:id", requireAuth, requirePermission("projects.manage"), projectController.remove);
projectRoutes.post("/:id/members", requireAuth, requirePermission("projects.manage"), validate(AddProjectMemberSchema), projectController.addMember);
projectRoutes.delete("/:id/members/:userId", requireAuth, requirePermission("projects.manage"), projectController.removeMember);
