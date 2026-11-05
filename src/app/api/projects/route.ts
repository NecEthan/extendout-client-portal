import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, errorResponse } from "@/lib/apiResponse";
import { requireAdmin, requireSession } from "@/lib/session";
import { allowedProjectsWhere } from "@/lib/projectAccess";

export async function GET() {
  try {
    const session = await requireSession();

    const projects = await prisma.project.findMany({
      where: allowedProjectsWhere(session.user.id, session.user.portalRole),
      orderBy: { createdAt: "desc" },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          include: { uploadedBy: { select: { name: true } } },
        },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { name } = body;
    if (typeof name !== "string" || name.trim() === "") {
      throw new ApiError(400, "name is required");
    }

    const project = await prisma.project.create({ data: { name: name.trim() } });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
