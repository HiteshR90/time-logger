import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type { CreateClientInput, UpdateClientInput } from "@time-tracker/shared";

export async function listClients(orgId: string) {
  return prisma.client.findMany({
    where: { orgId },
    include: { _count: { select: { projects: true, invoices: true } } },
    orderBy: { name: "asc" },
  });
}

export async function getClient(orgId: string, id: string) {
  const client = await prisma.client.findFirst({
    where: { id, orgId },
    include: {
      projects: { select: { id: true, name: true, isActive: true, budgetType: true, budgetAmount: true } },
      _count: { select: { invoices: true } },
    },
  });
  if (!client) throw new AppError(404, "Client not found");
  return client;
}

export async function createClient(orgId: string, input: CreateClientInput) {
  return prisma.client.create({
    data: { orgId, ...input },
  });
}

export async function updateClient(orgId: string, id: string, input: UpdateClientInput) {
  const client = await prisma.client.findFirst({ where: { id, orgId } });
  if (!client) throw new AppError(404, "Client not found");

  return prisma.client.update({
    where: { id },
    data: input,
  });
}

export async function deleteClient(orgId: string, id: string) {
  const client = await prisma.client.findFirst({ where: { id, orgId } });
  if (!client) throw new AppError(404, "Client not found");

  return prisma.client.delete({ where: { id } });
}
