import { PrismaClient } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@time-tracker/shared";

const prisma = new PrismaClient();

async function seedRoles() {
  const orgs = await prisma.organization.findMany();
  console.log(`Seeding roles for ${orgs.length} organizations...`);

  for (const org of orgs) {
    // Create default roles if they don't exist
    for (const [roleName, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      const existing = await prisma.role.findUnique({
        where: { orgId_name: { orgId: org.id, name: roleName } },
      });
      if (!existing) {
        await prisma.role.create({
          data: {
            orgId: org.id,
            name: roleName,
            isSystem: true,
            permissions: perms,
          },
        });
        console.log(`  Created role "${roleName}" for org "${org.name}"`);
      }
    }

    // Assign roleId to users based on their role string
    const roles = await prisma.role.findMany({ where: { orgId: org.id } });
    const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

    const users = await prisma.user.findMany({ where: { orgId: org.id, roleId: null } });
    for (const user of users) {
      const roleId = roleMap[user.role] || roleMap["employee"];
      if (roleId) {
        await prisma.user.update({ where: { id: user.id }, data: { roleId } });
        console.log(`  Assigned "${user.role}" role to user "${user.name}"`);
      }
    }
  }

  console.log("Done.");
}

seedRoles().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); });
