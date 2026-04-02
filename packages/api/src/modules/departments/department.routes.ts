import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CreateDepartmentSchema } from "@time-tracker/shared";
import * as departmentController from "./department.controller";

export const departmentRoutes = Router();

departmentRoutes.get("/", requireAuth, departmentController.list);
departmentRoutes.post(
  "/",
  requireAuth,
  requireRole("owner"),
  validate(CreateDepartmentSchema),
  departmentController.create,
);
departmentRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("owner"),
  departmentController.update,
);
departmentRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("owner"),
  departmentController.remove,
);
