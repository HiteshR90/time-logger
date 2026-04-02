import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as invoiceService from "./invoice.service";

export async function generate(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.generateInvoice(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const invoices = await invoiceService.listInvoices(req.user!.orgId);
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.getInvoice(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.updateInvoice(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await invoiceService.deleteInvoice(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
