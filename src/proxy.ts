import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { ApplicationRoutes } from "@/lib/applicationRoutes";

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith(ApplicationRoutes.login)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL(ApplicationRoutes.login, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
