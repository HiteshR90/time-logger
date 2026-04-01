import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  GenerateInvoiceSchema,
  UpdateInvoiceSchema,
  UpdateInvoiceStatusSchema,
} from "@time-tracker/shared";
import * as invoiceController from "./invoice.controller";

export const invoiceRoutes = Router();

invoiceRoutes.get(
  "/",
  requireAuth,
  requireRole("owner"),
  invoiceController.list,
);

invoiceRoutes.get(
  "/:id",
  requireAuth,
  requireRole("owner"),
  invoiceController.get,
);

invoiceRoutes.post(
  "/generate",
  requireAuth,
  requireRole("owner"),
  validate(GenerateInvoiceSchema),
  invoiceController.generate,
);

invoiceRoutes.patch(
  "/:id",
  requireAuth,
  requireRole("owner"),
  validate(UpdateInvoiceSchema),
  invoiceController.update,
);

invoiceRoutes.patch(
  "/:id/status",
  requireAuth,
  requireRole("owner"),
  validate(UpdateInvoiceStatusSchema),
  invoiceController.updateStatus,
);
