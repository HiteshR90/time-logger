import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as departmentService from "./department.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const departments = await departmentService.listDepartments(req.user!.orgId);
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await departmentService.createDepartment(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const department = await departmentService.updateDepartment(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await departmentService.deleteDepartment(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
