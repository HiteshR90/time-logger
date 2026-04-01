import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";

export async function getOrg(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
  });
  if (!org) throw new AppError(404, "Organization not found");
  return org;
}

export async function updateSettings(orgId: string, settings: Record<string, unknown>) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) throw new AppError(404, "Organization not found");

  const currentSettings = (org.settings as Record<string, unknown>) || {};
  const merged = { ...currentSettings, ...settings };

  return prisma.organization.update({
    where: { id: orgId },
    data: { settings: merged as any },
  });
}
