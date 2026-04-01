import { prisma } from "../../config/prisma";
import { AppError } from "../../middleware/errorHandler";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddProjectMemberInput,
} from "@time-tracker/shared";

export async function listProjects(orgId: string) {
  return prisma.project.findMany({
    where: { orgId },
    include: {
      client: { select: { id: true, name: true } },
      _count: { select: { members: true, timeEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(orgId: string, id: string) {
  const project = await prisma.project.findFirst({
    where: { id, orgId },
    include: {
      client: { select: { id: true, name: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!project) throw new AppError(404, "Project not found");
  return project;
}

export async function createProject(orgId: string, input: CreateProjectInput) {
  if (input.clientId) {
    const client = await prisma.client.findFirst({
      where: { id: input.clientId, orgId },
    });
    if (!client) throw new AppError(404, "Client not found");
  }

  return prisma.project.create({
    data: { orgId, ...input },
  });
}

export async function updateProject(
  orgId: string,
  id: string,
  input: UpdateProjectInput,
) {
  const project = await prisma.project.findFirst({ where: { id, orgId } });
  if (!project) throw new AppError(404, "Project not found");

  return prisma.project.update({
    where: { id },
    data: input,
  });
}

export async function deleteProject(orgId: string, id: string) {
  const project = await prisma.project.findFirst({ where: { id, orgId } });
  if (!project) throw new AppError(404, "Project not found");

  return prisma.project.delete({ where: { id } });
}

export async function addMember(
  orgId: string,
  projectId: string,
  input: AddProjectMemberInput,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });
  if (!project) throw new AppError(404, "Project not found");

  const user = await prisma.user.findFirst({
    where: { id: input.userId, orgId },
  });
  if (!user) throw new AppError(404, "User not found in this organization");

  return prisma.projectMember.upsert({
    where: {
      projectId_userId: { projectId, userId: input.userId },
    },
    create: {
      projectId,
      userId: input.userId,
      hourlyRate: input.hourlyRate,
    },
    update: {
      hourlyRate: input.hourlyRate,
    },
  });
}

export async function removeMember(
  orgId: string,
  projectId: string,
  userId: string,
) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, orgId },
  });
  if (!project) throw new AppError(404, "Project not found");

  return prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}
