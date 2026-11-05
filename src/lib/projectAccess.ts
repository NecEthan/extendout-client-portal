import type { Prisma } from "@prisma/client";

// Projects a user can access: admins see every project, everyone else only
// the projects they're a member of.
export function allowedProjectsWhere(userId: string, portalRole: string): Prisma.ProjectWhereInput {
  return portalRole === "ADMIN" ? {} : { members: { some: { userId } } };
}
