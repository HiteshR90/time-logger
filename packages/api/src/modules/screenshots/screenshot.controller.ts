import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { getParam } from "../../middleware/params";
import { prisma } from "../../config/prisma";
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

export async function serveFile(req: Request, res: Response, next: NextFunction) {
  try {
    const ss = await prisma.screenshot.findUnique({ where: { id: getParam(req, "id") } });
    if (!ss || !ss.s3Key.startsWith("local://")) {
      res.status(404).json({ success: false, error: "Not found" });
      return;
    }
    const filePath = ss.s3Key.replace("local://", "");
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ success: false, error: "File not found" });
      return;
    }
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=3600");
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
}
