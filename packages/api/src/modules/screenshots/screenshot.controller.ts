import { Request, Response, NextFunction } from "express";
import * as screenshotService from "./screenshot.service";

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await screenshotService.getPresignedUploadUrl(
      req.user!.userId,
      req.body.filename,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function confirmUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const screenshot = await screenshotService.confirmUpload(req.body);
    res.status(201).json({ success: true, data: screenshot });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await screenshotService.listScreenshots(req.user!.orgId, {
      userId: req.query.userId as string | undefined,
      projectId: req.query.projectId as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
