import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as projectService from "./project.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.listProjects(req.user!.orgId);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProject(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await projectService.addMember(req.user!.orgId, getParam(req, "id"), req.body);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.removeMember(req.user!.orgId, getParam(req, "id"), getParam(req, "userId"));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
