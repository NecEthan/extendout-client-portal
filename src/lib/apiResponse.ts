import "server-only";
import { NextResponse } from "next/server";
import { APIError } from "better-auth/api";

// Throw in route handlers (and src/lib/session.ts), e.g. `throw new ApiError(404, "Project not found")`.
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Maps errors thrown in route handlers to HTTP responses. Use in every route handler's catch.
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  // Errors thrown by Better Auth calls in route handlers (e.g. "user already exists").
  if (error instanceof APIError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  throw error;
}
