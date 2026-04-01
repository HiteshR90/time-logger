import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import { calculateInvoiceTotal, calculateTaxAmount, secondsToHours } from "@time-tracker/shared";
import type { GenerateInvoiceInput, UpdateInvoiceInput, UpdateInvoiceStatusInput } from "@time-tracker/shared";

function generateInvoiceNumber(): string {
  const date = new Date();
  const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `${prefix}-${random}`;
}

export async function generateInvoice(orgId: string, input: GenerateInvoiceInput) {
  const client = await prisma.client.findFirst({
    where: { id: input.clientId, orgId },
    include: { projects: { select: { id: true } } },
  });
  if (!client) throw new AppError(404, "Client not found");

  const projectIds = client.projects.map((p) => p.id);
  if (projectIds.length === 0) throw new AppError(400, "Client has no projects");

  // Get approved time entries for this client's projects in the date range
  const entries = await prisma.timeEntry.findMany({
    where: {
      projectId: { in: projectIds },
      approval: "approved",
      startTime: { gte: new Date(input.fromDate) },
      endTime: { lte: new Date(input.toDate) },
    },
    include: {
      user: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          name: true,
          members: { select: { userId: true, hourlyRate: true } },
        },
      },
    },
  });

  // Aggregate by user+project
  const lineItemMap: Record<string, {
    userId: string;
    projectId: string;
    userName: string;
    projectName: string;
    totalSeconds: number;
    rate: number;
  }> = {};

  for (const entry of entries) {
    const key = `${entry.userId}:${entry.projectId}`;
    if (!lineItemMap[key]) {
      const member = entry.project.members.find((m) => m.userId === entry.userId);
      lineItemMap[key] = {
        userId: entry.userId,
        projectId: entry.projectId,
        userName: entry.user.name,
        projectName: entry.project.name,
        totalSeconds: 0,
        rate: member?.hourlyRate ?? 0,
      };
    }
    lineItemMap[key].totalSeconds += entry.durationSec;
  }

  const lineItems = Object.values(lineItemMap).map((item) => {
    const hours = secondsToHours(item.totalSeconds);
    return {
      userId: item.userId,
      projectId: item.projectId,
      description: `${item.userName} — ${item.projectName}`,
      hours,
      rate: item.rate,
      amount: Math.round(hours * item.rate * 100) / 100,
    };
  });

  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const taxAmount = calculateTaxAmount(subtotal, input.taxRate);
  const total = calculateInvoiceTotal(subtotal, input.taxRate);

  return prisma.invoice.create({
    data: {
      orgId,
      clientId: input.clientId,
      invoiceNumber: generateInvoiceNumber(),
      fromDate: new Date(input.fromDate),
      toDate: new Date(input.toDate),
      subtotal,
      taxRate: input.taxRate,
      taxAmount,
      total,
      status: "draft",
      notes: input.notes ?? null,
      lineItems: { create: lineItems },
    },
    include: {
      lineItems: true,
      client: { select: { name: true, email: true } },
    },
  });
}

export async function listInvoices(orgId: string) {
  return prisma.invoice.findMany({
    where: { orgId },
    include: {
      client: { select: { name: true } },
      _count: { select: { lineItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(orgId: string, id: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id, orgId },
    include: {
      client: true,
      lineItems: {
        include: {
          user: { select: { name: true, email: true } },
          project: { select: { name: true } },
        },
      },
    },
  });
  if (!invoice) throw new AppError(404, "Invoice not found");
  return invoice;
}

export async function updateInvoice(orgId: string, id: string, input: UpdateInvoiceInput) {
  const invoice = await prisma.invoice.findFirst({ where: { id, orgId } });
  if (!invoice) throw new AppError(404, "Invoice not found");
  if (invoice.status !== "draft") throw new AppError(400, "Only draft invoices can be edited");

  const data: any = {};
  if (input.taxRate !== undefined) {
    data.taxRate = input.taxRate;
    data.taxAmount = calculateTaxAmount(invoice.subtotal, input.taxRate);
    data.total = calculateInvoiceTotal(invoice.subtotal, input.taxRate);
  }
  if (input.notes !== undefined) data.notes = input.notes;

  return prisma.invoice.update({ where: { id }, data });
}

export async function updateInvoiceStatus(orgId: string, id: string, input: UpdateInvoiceStatusInput) {
  const invoice = await prisma.invoice.findFirst({ where: { id, orgId } });
  if (!invoice) throw new AppError(404, "Invoice not found");

  const validTransitions: Record<string, string[]> = {
    draft: ["sent"],
    sent: ["paid", "draft"],
    paid: [],
  };

  if (!validTransitions[invoice.status]?.includes(input.status)) {
    throw new AppError(400, `Cannot transition from ${invoice.status} to ${input.status}`);
  }

  return prisma.invoice.update({
    where: { id },
    data: { status: input.status },
  });
}
