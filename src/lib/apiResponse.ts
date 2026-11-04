import "server-only";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";
import { ForbiddenError, UnauthorizedError, ValidationError } from "@/lib/errors";

// Maps errors thrown in route handlers to HTTP responses. Use in every route handler's catch.
export function apiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // Errors thrown by Better Auth calls in route handlers (e.g. "user already exists").
  if (error instanceof APIError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  throw error;
}
