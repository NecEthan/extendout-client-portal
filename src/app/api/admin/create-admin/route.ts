import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      await requireAdmin();
    }

    const body = await req.json();
    const { email, name, password } = body;
    if (typeof email !== "string" || typeof name !== "string" || typeof password !== "string") {
      throw new ValidationError("email, name and password are required");
    }

    const created = await auth.api.createUser({
      body: {
        email,
        name,
        password,
        data: { portalRole: "ADMIN", requirePasswordChange: false },
      },
    });
    return NextResponse.json({ id: created.user.id, email: created.user.email }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
