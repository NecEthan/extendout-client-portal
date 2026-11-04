import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { requireSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await requireSession();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { requirePasswordChange: false },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiError(error);
  }
}
