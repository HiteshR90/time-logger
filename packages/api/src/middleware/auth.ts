import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { prisma } from "../config/prisma";
import { AppError } from "./errorHandler";

export interface AuthPayload {
  userId: string;
  orgId: string;
  role: string;
  roleId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      permissions?: Record<string, boolean>;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or invalid authorization header"));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

// Legacy — keep for backward compat during transition
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) return next(new AppError(403, "Insufficient permissions"));
    next();
  };
}

// New permission-based middleware
export function requirePermission(...perms: string[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError(401, "Not authenticated"));

    try {
      // Cache permissions per request
      if (!req.permissions) {
        const roleId = req.user.roleId;
        if (roleId) {
          const role = await prisma.role.findFirst({
            where: { id: roleId, orgId: req.user.orgId },
          });
          if (role) {
            // Owner system role always has all permissions
            if (role.name === "owner" && role.isSystem) {
              req.permissions = { __owner: true };
            } else {
              req.permissions = (role.permissions as Record<string, boolean>) || {};
            }
          }
        }

        // Fallback: legacy role string check
        if (!req.permissions) {
          if (req.user.role === "owner") {
            req.permissions = { __owner: true };
          } else {
            req.permissions = {};
          }
        }
      }

      // Owner bypasses all checks
      if (req.permissions.__owner) return next();

      // Check all required permissions
      const hasAll = perms.every((p) => req.permissions![p] === true);
      if (!hasAll) return next(new AppError(403, "Insufficient permissions"));

      next();
    } catch (err) {
      next(err);
    }
  };
}
