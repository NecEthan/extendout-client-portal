import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    await requireSession();

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
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
    await requireSession();

    const body = await req.json();
    const { name, clientId } = body;
    if (typeof name !== "string" || typeof clientId !== "string") {
      throw new ValidationError("name and clientId are required");
    }

    const project = await prisma.project.create({ data: { name, clientId } });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
