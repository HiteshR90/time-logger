import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CreateClientSchema, UpdateClientSchema } from "@time-tracker/shared";
import * as clientController from "./client.controller";

export const clientRoutes = Router();

clientRoutes.get("/", requireAuth, clientController.list);
clientRoutes.get("/:id", requireAuth, clientController.get);
clientRoutes.post(
  "/",
  requireAuth,
  requireRole("owner", "manager"),
  validate(CreateClientSchema),
  clientController.create,
);
clientRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("owner", "manager"),
  validate(UpdateClientSchema),
  clientController.update,
);
clientRoutes.delete(
  "/:id",
  requireAuth,
  requireRole("owner", "manager"),
  clientController.remove,
);
