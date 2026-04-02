import { Router } from "express";
import { validate } from "../../middleware/validate";
import { requireAuth, requirePermission } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";
import { RegisterOrgSchema, LoginSchema, RefreshTokenSchema, InviteMemberSchema, AcceptInviteSchema } from "@time-tracker/shared";
import * as authController from "./auth.controller";

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validate(RegisterOrgSchema), authController.register);
authRoutes.post("/login", authLimiter, validate(LoginSchema), authController.login);
authRoutes.post("/refresh", validate(RefreshTokenSchema), authController.refresh);
authRoutes.get("/me", requireAuth, authController.me);
authRoutes.get("/pending-invites", requireAuth, requirePermission("members.invite"), authController.listPendingInvites);
authRoutes.post("/invite", requireAuth, requirePermission("members.invite"), validate(InviteMemberSchema), authController.invite);
authRoutes.post("/accept-invite", validate(AcceptInviteSchema), authController.acceptInvite);
