import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as userService from "./user.service";

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await userService.listUsers(req.user!.orgId);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.getUser(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await userService.updateUser(
      req.user!.orgId,
      getParam(req, "id"),
      req.body,
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
