import { Request, Response, NextFunction } from "express";
import * as reportService from "./report.service";

export async function activityReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportService.getActivityReport(req.user!.orgId, {
      userId: req.query.userId as string | undefined,
      from: req.query.from as string,
      to: req.query.to as string,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function timeByProjectReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportService.getTimeByProjectReport(req.user!.orgId, {
      from: req.query.from as string,
      to: req.query.to as string,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function appUsageReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await reportService.getAppUsageReport(req.user!.orgId, {
      userId: req.query.userId as string | undefined,
      from: req.query.from as string,
      to: req.query.to as string,
    });
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
