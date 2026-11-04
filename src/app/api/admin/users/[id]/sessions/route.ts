import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/session";
import type { RouteParams } from "@/types/routeParams-type";

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    const sessions = await prisma.session.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      // Never return `token` — it's the session credential.
      select: { id: true, createdAt: true, expiresAt: true, ipAddress: true, userAgent: true },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.session.deleteMany({ where: { userId: id } });
    return NextResponse.json({ revoked: true });
  } catch (error) {
    return apiError(error);
  }
}
