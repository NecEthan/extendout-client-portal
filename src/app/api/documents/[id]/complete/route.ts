import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";
import { deleteObject, getObjectSize } from "@/lib/storage";
import type { RouteParams } from "@/types/routeParams-type";

// Step 2 of an upload: after the browser has PUT the file to the bucket, check it really
// arrived with the size that was approved, then mark the document READY.
export async function POST(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        status: "PENDING",
        uploadedById: session.user.id,
        project: allowedProjectsWhere(session.user.id, session.user.portalRole),
      },
      select: { id: true, storageKey: true, sizeBytes: true },
    });
    if (!document) {
      throw new ApiError(404, "Upload not found");
    }

    const storedSize = await getObjectSize(document.storageKey);
    if (storedSize !== document.sizeBytes) {
      // Missing, or a different size than was approved: discard it entirely.
      if (storedSize !== null) {
        await deleteObject(document.storageKey);
      }
      await prisma.document.delete({ where: { id: document.id } });
      throw new ApiError(400, "Upload failed, please try again");
    }

    const ready = await prisma.document.update({
      where: { id: document.id },
      data: { status: "READY" },
    });
    return NextResponse.json(ready);
  } catch (error) {
    return errorResponse(error);
  }
}
