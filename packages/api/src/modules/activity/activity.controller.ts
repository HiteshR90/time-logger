import { Request, Response, NextFunction } from "express";
import * as activityService from "./activity.service";

export async function ingest(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityService.ingestActivity(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
