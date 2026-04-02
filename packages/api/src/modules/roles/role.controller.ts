import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as roleService from "./role.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await roleService.listRoles(req.user!.orgId);
    res.json({ success: true, data: roles });
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.createRole(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const role = await roleService.updateRole(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: role });
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await roleService.deleteRole(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: null });
  } catch (err) { next(err); }
}
