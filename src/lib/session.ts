import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

export async function requireSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    throw new UnauthorizedError();
  }

  return session;
}

// Logged in (401 otherwise) and an ADMIN (403 otherwise).
export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.portalRole !== "ADMIN") {
    throw new ForbiddenError();
  }

  return session;
}
