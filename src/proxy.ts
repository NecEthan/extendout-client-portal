import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ApplicationRoutes } from "@/lib/applicationRoutes";
import { ApiRoutes } from "@/lib/apiRoutes";

const PUBLIC_PATHS = [ApplicationRoutes.login, ApiRoutes.authBase, ApiRoutes.adminBootstrap];

// Edge runtime can't run Prisma, so this only checks cookie presence
// (fast redirect for logged-out users). Real session + requirePasswordChange
// checks happen server-side in the page (Node runtime) via auth.api.getSession.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL(ApplicationRoutes.login, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
