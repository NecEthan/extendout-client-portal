import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";
import { createViewUrl } from "@/lib/storage";
import type { RouteParams } from "@/types/routeParams-type";

// Photos for the Photos tab, newest first, each with a short-lived URL to display it.
// Uploads go through POST /api/projects/[id]/documents with type "PHOTO".
export async function GET(_req: Request, { params }: RouteParams) {
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

    const photos = await prisma.document.findMany({
      where: { projectId: project.id, type: "PHOTO", status: "READY" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        storageKey: true,
        createdAt: true,
        uploadedBy: { select: { name: true } },
      },
    });

    // Signing is local (no request to the bucket), so this is cheap even for many photos.
    const withUrls = await Promise.all(
      photos.map(async ({ storageKey, ...photo }) => {
        const url = await createViewUrl(storageKey);
        return { ...photo, url };
      }),
    );
    return NextResponse.json(withUrls);
  } catch (error) {
    return errorResponse(error);
  }
}
