import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";
import { createUploadUrl } from "@/lib/storage";
import { assertCanUpload } from "@/lib/uploadLimits";
import type { RouteParams } from "@/types/routeParams-type";

// Step 1 of an upload: records a PENDING document and returns a presigned URL the browser
// PUTs the file to directly. Step 2 is POST /api/documents/[id]/complete.
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    // 404 for "doesn't exist" and "not a member" alike, so project ids can't be probed.
    const project = await prisma.project.findFirst({
      where: { id, ...allowedProjectsWhere(session.user.id, session.user.portalRole) },
      select: { id: true },
    });
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const body = await req.json();
    const { fileName, mimeType, sizeBytes } = body;
    if (typeof fileName !== "string" || fileName.trim() === "" || fileName.length > 255) {
      throw new ApiError(400, "fileName is required (max 255 and min 1 characters)");
    }
    if (typeof mimeType !== "string") {
      throw new ApiError(400, "mimeType is required");
    }
    if (!Number.isInteger(sizeBytes) || sizeBytes <= 0) {
      throw new ApiError(400, "File is empty");
    }

    const contentType = mimeType || "application/octet-stream";
    // Check limits and insert in one transaction so parallel requests can't slip past the caps.
    const document = await prisma.$transaction(async (tx) => {
      await assertCanUpload(tx, session.user.id, project.id, sizeBytes);

      return tx.document.create({
        data: {
          fileName: fileName.trim(),
          // The key never includes the user's file name, so odd characters can't cause trouble.
          storageKey: `projects/${project.id}/${randomUUID()}`,
          mimeType: contentType,
          sizeBytes,
          projectId: project.id,
          // From the session, not the request — the client can't upload as someone else.
          uploadedById: session.user.id,
        },
        select: { id: true, storageKey: true },
      });
    });

    const uploadUrl = await createUploadUrl(document.storageKey, contentType, sizeBytes);
    return NextResponse.json({ documentId: document.id, uploadUrl }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
