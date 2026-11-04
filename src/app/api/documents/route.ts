import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { requireSession } from "@/lib/session";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function GET() {
  try {
    await requireSession();
    const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(documents);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession();

    const formData = await req.formData();
    const file = formData.get("file");
    const projectId = formData.get("projectId");
    if (!(file instanceof File) || typeof projectId !== "string") {
      throw new ValidationError("file and projectId are required");
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(path.join(UPLOAD_DIR, safeName), buffer);

    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        filePath: safeName,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: buffer.byteLength,
        projectId,
        // From the session, not the request — the client can't upload as someone else.
        uploadedById: session.user.id,
      },
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
