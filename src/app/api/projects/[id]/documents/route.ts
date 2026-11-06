import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";
import { createUploadUrl } from "@/lib/storage";
import { assertCanUpload } from "@/lib/uploadLimits";
import { validateUploadRequest } from "@/lib/validateUploadRequest";
import type { RouteParams } from "@/types/routeParams-type";

// Step 1 of an upload: records a PENDING document and returns a presigned URL the browser
// PUTs the file to directly. Step 2 is POST /api/documents/[id]/complete.
// Used for both tabs: `type` is "DOCUMENT" (default) or "PHOTO".
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
    const { fileName, mimeType, sizeBytes, type } = validateUploadRequest(body);

    const contentType = mimeType || "application/octet-stream";
    const document = await prisma.$transaction(async (tx) => {
      await assertCanUpload(tx, session.user.id, project.id, sizeBytes);

      return tx.document.create({
        data: {
          fileName: fileName.trim(),
          storageKey: `projects/${project.id}/${randomUUID()}`,
          mimeType: contentType,
          sizeBytes,
          type,
          projectId: project.id,
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
