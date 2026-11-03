import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Only works while the User table is empty. Creates the first ADMIN account
// so there's a way in once self-signup is disabled. Disable or remove this
// route once the real admin account has been created.
export async function POST(req: NextRequest) {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    return NextResponse.json({ error: "Already bootstrapped" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, password } = body;

  if (typeof email !== "string" || typeof name !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "email, name and password are required" }, { status: 400 });
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
}
