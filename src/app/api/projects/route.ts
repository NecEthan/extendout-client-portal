import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, clientId } = body;

  if (typeof name !== "string" || typeof clientId !== "string") {
    return NextResponse.json({ error: "name and clientId are required" }, { status: 400 });
  }

  const project = await prisma.project.create({ data: { name, clientId } });
  return NextResponse.json(project, { status: 201 });
}
