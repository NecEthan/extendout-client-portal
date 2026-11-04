import "dotenv/config";
import { randomUUID } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Creates throwaway users/projects/documents for a single test and deletes them
// afterwards, so tests never depend on prisma/seed.ts or on each other.
// Everything is prefixed `e2e-` so leftovers from a crashed run are easy to spot.

export type Role = "ADMIN" | "CLIENT" | "BUILDER";

export type TestUser = { id: string; email: string; name: string; password: string; role: Role };
export type TestProject = { id: string; name: string };

const TEST_PASSWORD = "e2e-password-123";

export const uniqueName = (label: string) => `e2e-${label}-${randomUUID().slice(0, 8)}`;

export class TestData {
  private userIds = new Set<string>();
  private userEmails = new Set<string>();
  private projectIds = new Set<string>();

  async createUser({
    role,
    name = `E2E ${role}`,
    requirePasswordChange = false,
  }: {
    role: Role;
    name?: string;
    requirePasswordChange?: boolean;
  }): Promise<TestUser> {
    const email = `${uniqueName(role.toLowerCase())}@test.com`;

    // Through Better Auth so the password is hashed and the Account row exists.
    const { user } = await auth.api.createUser({
      body: { email, name, password: TEST_PASSWORD, data: { portalRole: role, requirePasswordChange } },
    });
    this.userIds.add(user.id);
    return { id: user.id, email, name, password: TEST_PASSWORD, role };
  }

  async createProject({
    name = uniqueName("project"),
    members = [],
    documents = [],
    uploadedBy,
  }: {
    name?: string;
    members?: TestUser[];
    documents?: string[];
    uploadedBy?: TestUser;
  } = {}): Promise<TestProject> {
    if (documents.length > 0 && !uploadedBy) {
      throw new Error("createProject: `uploadedBy` is required when adding documents");
    }

    const project = await prisma.project.create({
      data: {
        name,
        members: { create: members.map((user) => ({ userId: user.id })) },
        documents: {
          create: documents.map((fileName) => ({
            fileName,
            filePath: `e2e-${fileName}`, // metadata only, no file on disk
            mimeType: "application/pdf",
            sizeBytes: 1000,
            uploadedById: uploadedBy!.id,
          })),
        },
      },
    });
    this.projectIds.add(project.id);
    return { id: project.id, name: project.name };
  }

  // For records created through the app (API/UI) rather than this class.
  trackProject(id: string) {
    this.projectIds.add(id);
  }

  trackUserEmail(email: string) {
    this.userEmails.add(email);
  }

  async cleanup() {
    const projectIds = [...this.projectIds];
    const userFilter = { OR: [{ id: { in: [...this.userIds] } }, { email: { in: [...this.userEmails] } }] };

    // Document → Project/User FKs are RESTRICT, so documents go first.
    // Members, sessions and accounts cascade.
    await prisma.document.deleteMany({
      where: { OR: [{ projectId: { in: projectIds } }, { uploadedBy: userFilter }] },
    });
    await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
    await prisma.user.deleteMany({ where: userFilter });
  }
}
