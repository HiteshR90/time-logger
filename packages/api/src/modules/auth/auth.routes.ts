import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";
import {
  RegisterOrgSchema,
  LoginSchema,
  RefreshTokenSchema,
  InviteMemberSchema,
  AcceptInviteSchema,
} from "@time-tracker/shared";
import * as authController from "./auth.controller";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  authLimiter,
  validate(RegisterOrgSchema),
  authController.register,
);

authRoutes.post(
  "/login",
  authLimiter,
  validate(LoginSchema),
  authController.login,
);

authRoutes.post(
  "/refresh",
  validate(RefreshTokenSchema),
  authController.refresh,
);

authRoutes.get(
  "/pending-invites",
  requireAuth,
  requireRole("owner", "manager"),
  authController.listPendingInvites,
);

authRoutes.post(
  "/invite",
  requireAuth,
  requireRole("owner", "manager"),
  validate(InviteMemberSchema),
  authController.invite,
);

authRoutes.post(
  "/accept-invite",
  validate(AcceptInviteSchema),
  authController.acceptInvite,
);
