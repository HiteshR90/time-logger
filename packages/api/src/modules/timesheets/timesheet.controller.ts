import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as timesheetService from "./timesheet.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timesheetService.listTimeEntries(req.user!.orgId, {
      userId: req.query.userId as string | undefined,
      projectId: req.query.projectId as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      approval: req.query.approval as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function createManual(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await timesheetService.createManualEntry(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await timesheetService.approveEntry(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await timesheetService.rejectEntry(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
}

export async function weeklySummary(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await timesheetService.getWeeklySummary(req.user!.orgId, {
      userId: req.query.userId as string | undefined,
      from: req.query.from as string,
      to: req.query.to as string,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
