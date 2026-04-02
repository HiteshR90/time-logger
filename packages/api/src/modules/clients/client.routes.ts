import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { CreateClientSchema, UpdateClientSchema } from "@time-tracker/shared";
import * as clientController from "./client.controller";

export const clientRoutes = Router();
clientRoutes.get("/", requireAuth, clientController.list);
clientRoutes.get("/:id", requireAuth, clientController.get);
clientRoutes.post("/", requireAuth, requirePermission("clients.manage"), validate(CreateClientSchema), clientController.create);
clientRoutes.patch("/:id", requireAuth, requirePermission("clients.manage"), validate(UpdateClientSchema), clientController.update);
clientRoutes.delete("/:id", requireAuth, requirePermission("clients.manage"), clientController.remove);
