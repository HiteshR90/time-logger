import { Request, Response, NextFunction } from "express";
import { prisma } from "../../config/prisma";
import * as authService from "./auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.registerOrg(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function invite(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.inviteMember(req.user!.orgId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.user!.userId, orgId: req.user!.orgId },
      select: { id: true, email: true, name: true, role: true, roleId: true },
    });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    let permissions: Record<string, boolean> = {};
    let roleName = user.role;
    if (user.roleId) {
      const role = await prisma.role.findFirst({ where: { id: user.roleId } });
      if (role) {
        roleName = role.name;
        permissions = role.isSystem && role.name === "owner"
          ? { __owner: true }
          : (role.permissions as Record<string, boolean>) || {};
      }
    }

    res.json({ success: true, data: { user: { ...user, roleName }, permissions } });
  } catch (err) { next(err); }
}

export async function listPendingInvites(req: Request, res: Response, next: NextFunction) {
  try {
    const invites = await authService.listPendingInvites(req.user!.orgId);
    res.json({ success: true, data: invites });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await authService.acceptInvite(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
