import { Request, Response, NextFunction } from "express";
import { getParam } from "../../middleware/params";
import * as clientService from "./client.service";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await clientService.listClients(req.user!.orgId);
    res.json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await clientService.getClient(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await clientService.createClient(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await clientService.updateClient(req.user!.orgId, getParam(req, "id"), req.body);
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await clientService.deleteClient(req.user!.orgId, getParam(req, "id"));
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
