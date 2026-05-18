import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError } from "@/server/http/api-error";

export type ApiSuccess<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
};

export function jsonOk<T>(
  data: T,
  init?: { status?: number; meta?: Record<string, unknown> },
) {
  const body: ApiSuccess<T> = { data };
  if (init?.meta) {
    body.meta = init.meta;
  }
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function jsonError(error: ApiError | ZodError | unknown) {
  if (error instanceof ApiError) {
    const body: ApiFailure = {
      error: {
        message: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    };
    return NextResponse.json(body, { status: error.status });
  }

  if (error instanceof ZodError) {
    const body: ApiFailure = {
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.flatten(),
      },
    };
    return NextResponse.json(body, { status: 400 });
  }

  console.error("[api] unhandled error", error);
  const body: ApiFailure = {
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  };
  return NextResponse.json(body, { status: 500 });
}

export async function handleRoute<T>(
  handler: () => Promise<NextResponse<T> | Response>,
) {
  try {
    return await handler();
  } catch (error) {
    return jsonError(error);
  }
}
