import "server-only";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/apiResponse";
import { MAX_FILE_BYTES } from "@/lib/uploadConfig";

// Caps that stop anyone (including a compromised account) running up the storage bill.
// PENDING documents count too, so requesting upload URLs without finishing can't dodge them.
// Backblaze B2's own Caps & Alerts are the second line of defence (see README).
export const MAX_UPLOADS_PER_USER_PER_HOUR = 100;
export const MAX_PROJECT_BYTES = 5 * 1024 * 1024 * 1024;

const ONE_HOUR_MS = 60 * 60 * 1000;

// Must run inside the same transaction that creates the document. The row locks make
// concurrent uploads by the same user, or into the same project, wait their turn, so a burst
// of parallel requests can't all pass the counts before any of them inserts.
// Locks are always taken user → project so two transactions can't deadlock.
// FOR NO KEY UPDATE (not FOR UPDATE) so it doesn't block unrelated inserts that only reference
// these rows by foreign key.
export async function assertCanUpload(
  tx: Prisma.TransactionClient,
  userId: string,
  projectId: string,
  sizeBytes: number,
) {
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new ApiError(413, "File is too large (max 100 MB)");
  }

  await tx.$executeRaw`SELECT 1 FROM "User" WHERE id = ${userId} FOR NO KEY UPDATE`;
  await tx.$executeRaw`SELECT 1 FROM "Project" WHERE id = ${projectId} FOR NO KEY UPDATE`;

  const recentUploads = await tx.document.count({
    where: { uploadedById: userId, createdAt: { gte: new Date(Date.now() - ONE_HOUR_MS) } },
  });
  if (recentUploads >= MAX_UPLOADS_PER_USER_PER_HOUR) {
    throw new ApiError(429, "Too many uploads, please try again later");
  }

  const projectUsage = await tx.document.aggregate({
    where: { projectId },
    _sum: { sizeBytes: true },
  });
  if ((projectUsage._sum.sizeBytes ?? 0) + sizeBytes > MAX_PROJECT_BYTES) {
    throw new ApiError(413, "This project has reached its storage limit (5 GB)");
  }
}
