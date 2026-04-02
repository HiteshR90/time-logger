import { Router } from "express";
import { requireAuth, requirePermission } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { GenerateInvoiceSchema, UpdateInvoiceSchema, UpdateInvoiceStatusSchema } from "@time-tracker/shared";
import * as invoiceController from "./invoice.controller";

export const invoiceRoutes = Router();
invoiceRoutes.get("/", requireAuth, requirePermission("invoices.view"), invoiceController.list);
invoiceRoutes.get("/:id", requireAuth, requirePermission("invoices.view"), invoiceController.get);
invoiceRoutes.post("/generate", requireAuth, requirePermission("invoices.manage"), validate(GenerateInvoiceSchema), invoiceController.generate);
invoiceRoutes.patch("/:id", requireAuth, requirePermission("invoices.manage"), validate(UpdateInvoiceSchema), invoiceController.update);
invoiceRoutes.patch("/:id/status", requireAuth, requirePermission("invoices.manage"), validate(UpdateInvoiceStatusSchema), invoiceController.updateStatus);
invoiceRoutes.delete("/:id", requireAuth, requirePermission("invoices.manage"), invoiceController.remove);
