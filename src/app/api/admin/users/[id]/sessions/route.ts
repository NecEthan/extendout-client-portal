import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

async function requireAdmin(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.portalRole !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const sessions = await prisma.session.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const isAdmin = await requireAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.session.deleteMany({ where: { userId: id } });

  return NextResponse.json({ revoked: true });
}
