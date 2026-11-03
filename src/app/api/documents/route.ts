import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function GET() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const projectId = formData.get("projectId");
  const uploadedById = formData.get("uploadedById");

  if (!(file instanceof File) || typeof projectId !== "string" || typeof uploadedById !== "string") {
    return NextResponse.json({ error: "file, projectId and uploadedById are required" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(UPLOAD_DIR, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const document = await prisma.document.create({
    data: {
      fileName: file.name,
      filePath: safeName,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: buffer.byteLength,
      projectId,
      uploadedById,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
