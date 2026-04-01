import { Request, Response, NextFunction } from "express";
import * as orgService from "./org.service";

export async function getOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await orgService.getOrg(req.user!.orgId);
    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const org = await orgService.updateSettings(req.user!.orgId, req.body);
    res.json({ success: true, data: org });
  } catch (err) {
    next(err);
  }
}
