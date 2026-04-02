import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CreateDepartmentSchema } from "@time-tracker/shared";
import * as departmentController from "./department.controller";

export const departmentRoutes = Router();
departmentRoutes.get("/", requireAuth, departmentController.list);
departmentRoutes.post("/", requireAuth, requirePermission("teams.manage"), validate(CreateDepartmentSchema), departmentController.create);
departmentRoutes.patch("/:id", requireAuth, requirePermission("teams.manage"), departmentController.update);
departmentRoutes.delete("/:id", requireAuth, requirePermission("teams.manage"), departmentController.remove);
