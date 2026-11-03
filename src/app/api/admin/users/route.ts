import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session || session.user.portalRole !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, role, password } = body;

  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof password !== "string" ||
    (role !== "ADMIN" && role !== "CLIENT" && role !== "BUILDER")
  ) {
    return NextResponse.json(
      { error: "email, name, password are required and role must be ADMIN, CLIENT or BUILDER" },
      { status: 400 },
    );
  }

  const created = await auth.api.createUser({
    body: {
      email,
      name,
      password,
      data: { portalRole: role, requirePasswordChange: true },
    },
  });

  return NextResponse.json({ id: created.user.id, email: created.user.email }, { status: 201 });
}
