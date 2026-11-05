import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/apiResponse";

export async function requireSession() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    throw new ApiError(401, "Unauthorized");
  }

  return session;
}

// Logged in (401 otherwise) and an ADMIN (403 otherwise).
export async function requireAdmin() {
  const session = await requireSession();

  if (session.user.portalRole !== "ADMIN") {
    throw new ApiError(403, "Forbidden");
  }

  return session;
}
