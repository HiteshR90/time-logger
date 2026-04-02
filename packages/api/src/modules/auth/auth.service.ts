import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../config/prisma";
import { config } from "../../config";
import { AppError } from "../../middleware/errorHandler";
import type { AuthPayload } from "../../middleware/auth";
import type {
  RegisterOrgInput,
  LoginInput,
  InviteMemberInput,
  AcceptInviteInput,
} from "@time-tracker/shared";
import { DEFAULTS } from "@time-tracker/shared";

function generateTokens(payload: AuthPayload) {
  const accessToken = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  });
  return { accessToken, refreshToken };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .concat("-", crypto.randomBytes(3).toString("hex"));
}

export async function registerOrg(input: RegisterOrgInput) {
  const slug = slugify(input.orgName);
  const passwordHash = await bcrypt.hash(input.password, 12);

  const defaultSettings = {
    screenshotIntervalMin: DEFAULTS.SCREENSHOT_INTERVAL_MIN,
    idleTimeoutMin: DEFAULTS.IDLE_TIMEOUT_MIN,
    blurScreenshots: false,
    defaultCurrency: "USD",
    defaultTaxRate: 0,
    dataRetentionDays: DEFAULTS.DATA_RETENTION_DAYS,
    appCategories: [],
  };

  const org = await prisma.organization.create({
    data: {
      name: input.orgName,
      slug,
      settings: defaultSettings,
      users: {
        create: {
          email: input.email,
          passwordHash,
          name: input.name,
          role: "owner",
        },
      },
    },
    include: { users: true },
  });

  const user = org.users[0];
  const tokens = generateTokens({
    userId: user.id,
    orgId: org.id,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    organization: { id: org.id, name: org.name, slug: org.slug },
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    ...tokens,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findFirst({
    where: { email: input.email, isActive: true },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokens = generateTokens({
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    ...tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: AuthPayload;
  try {
    payload = jwt.verify(
      refreshToken,
      config.jwt.refreshSecret,
    ) as AuthPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, "Refresh token expired or revoked");
  }

  // Rotate: delete old, create new
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const tokens = generateTokens({
    userId: payload.userId,
    orgId: payload.orgId,
    role: payload.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: payload.userId,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return tokens;
}

export async function inviteMember(orgId: string, input: InviteMemberInput) {
  const existing = await prisma.user.findFirst({
    where: { orgId, email: input.email },
  });
  if (existing) {
    throw new AppError(409, "User with this email already exists in the organization");
  }

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.inviteToken.create({
    data: {
      orgId,
      email: input.email,
      name: input.name,
      role: input.role,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { inviteToken: token, email: input.email, name: input.name, role: input.role };
}

export async function listPendingInvites(orgId: string) {
  return prisma.inviteToken.findMany({
    where: { orgId, expiresAt: { gt: new Date() } },
    select: { id: true, email: true, name: true, role: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function acceptInvite(input: AcceptInviteInput) {
  const invite = await prisma.inviteToken.findUnique({
    where: { token: input.token },
  });
  if (!invite || invite.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired invite token");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      orgId: invite.orgId,
      email: invite.email,
      passwordHash,
      name: invite.name,
      role: invite.role,
    },
  });

  await prisma.inviteToken.delete({ where: { id: invite.id } });

  const tokens = generateTokens({
    userId: user.id,
    orgId: user.orgId,
    role: user.role,
  });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    ...tokens,
  };
}
