import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { apiError } from "@/lib/apiResponse";
import { ValidationError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";

const ROLES = ["ADMIN", "CLIENT", "BUILDER"] as const;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { email, name, password, role } = body;
    if (
      typeof email !== "string" ||
      typeof name !== "string" ||
      typeof password !== "string" ||
      !ROLES.includes(role)
    ) {
      throw new ValidationError("email, name, password are required and role must be ADMIN, CLIENT or BUILDER");
    }

    // Through Better Auth so the password is hashed and the Account row is created.
    const created = await auth.api.createUser({
      body: {
        email,
        name,
        password,
        data: { portalRole: role, requirePasswordChange: true },
      },
    });
    return NextResponse.json({ id: created.user.id, email: created.user.email }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
