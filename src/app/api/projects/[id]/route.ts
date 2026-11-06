import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";
import type { RouteParams } from "@/types/routeParams-type";

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    // 404 for both "doesn't exist" and "not a member", so project ids can't be probed.
    const project = await prisma.project.findFirst({
      where: { id, ...allowedProjectsWhere(session.user.id, session.user.portalRole) },
      include: {
        documents: {
          where: { status: "READY", type: "DOCUMENT" },
          orderBy: { createdAt: "desc" },
          include: { uploadedBy: { select: { name: true } } },
        },
      },
    });
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return NextResponse.json(project);
  } catch (error) {
    return errorResponse(error);
  }
}
