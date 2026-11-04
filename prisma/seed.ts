// Dev seed data. Run with: npm run db:seed
// Safe to re-run: existing users/projects/documents are skipped, not duplicated.
// Also runs automatically after `npx prisma migrate reset`.
import "dotenv/config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PASSWORD = "password";

type Role = "ADMIN" | "CLIENT" | "BUILDER";

const users: { email: string; name: string; role: Role }[] = [
  { email: "test@gmail.com", name: "Test Admin", role: "ADMIN" },
  { email: "sarah@example.com", name: "Sarah Mitchell", role: "CLIENT" },
  { email: "james@example.com", name: "James Patel", role: "CLIENT" },
  { email: "tom@example.com", name: "Tom Harris", role: "BUILDER" },
];

const projects: { name: string; clientEmail: string; documents: string[] }[] = [
  {
    name: "Rear Kitchen Extension",
    clientEmail: "sarah@example.com",
    documents: ["Project Brief.pdf", "Kitchen Layout v2.png", "Building Regs Approval.pdf"],
  },
  {
    name: "Garage Conversion",
    clientEmail: "sarah@example.com",
    documents: ["Planning Application.pdf"],
  },
  {
    name: "Loft Conversion",
    clientEmail: "james@example.com",
    documents: ["Loft Survey.pdf", "Dormer Drawings.docx"],
  },
];

const mimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

async function seedUser({ email, name, role }: (typeof users)[number]) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  // Through Better Auth (not prisma.user.create) so the password is hashed
  // and the Account row is created — otherwise the user couldn't log in.
  await auth.api.createUser({
    body: {
      email,
      name,
      password: PASSWORD,
      data: { portalRole: role, requirePasswordChange: false },
    },
  });
  console.log(`  + user ${email} (${role})`);
  return prisma.user.findUniqueOrThrow({ where: { email } });
}

async function main() {
  console.log("Seeding users...");
  const byEmail = new Map<string, Awaited<ReturnType<typeof seedUser>>>();
  for (const user of users) {
    byEmail.set(user.email, await seedUser(user));
  }

  const admin = byEmail.get("test@gmail.com")!;

  console.log("Seeding projects + documents...");
  for (const { name, clientEmail, documents } of projects) {
    const client = byEmail.get(clientEmail)!;

    let project = await prisma.project.findFirst({ where: { name, clientId: client.id } });
    if (!project) {
      project = await prisma.project.create({ data: { name, clientId: client.id } });
      console.log(`  + project ${name}`);
    }

    for (const fileName of documents) {
      const exists = await prisma.document.findFirst({ where: { projectId: project.id, fileName } });
      if (exists) continue;

      // Metadata only — no file is written to UPLOAD_DIR.
      await prisma.document.create({
        data: {
          fileName,
          filePath: `seed-${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`,
          mimeType: mimeTypes[fileName.split(".").pop()!] ?? "application/octet-stream",
          sizeBytes: 250_000,
          projectId: project.id,
          uploadedById: admin.id,
        },
      });
      console.log(`  + document ${fileName}`);
    }
  }

  console.log(`Done. All seeded users log in with password "${PASSWORD}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
