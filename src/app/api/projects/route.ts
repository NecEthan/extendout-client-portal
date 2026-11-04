import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { requireAdmin, requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();

    const where =
      session.user.portalRole === "ADMIN" ? {} : { members: { some: { userId: session.user.id } } };

    const projects = await prisma.project.findMany({
      where,
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
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { name } = body;
    if (typeof name !== "string" || name.trim() === "") {
      throw new ValidationError("name is required");
    }

    const project = await prisma.project.create({ data: { name: name.trim() } });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
