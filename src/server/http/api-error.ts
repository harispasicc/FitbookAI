export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR"
  | "EMAIL_TAKEN"
  | "INVALID_CREDENTIALS"
  | "ROLE_MISMATCH"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INVALID_RESET_TOKEN"
  | "AI_DAILY_LIMIT";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(
    status: number,
    message: string,
    code: ApiErrorCode,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static notFound(message: string) {
    return new ApiError(404, message, "NOT_FOUND");
  }

  static validation(message: string, details?: unknown) {
    return new ApiError(400, message, "VALIDATION_ERROR", details);
  }

  static unprocessableEntity(message: string, details?: unknown) {
    return new ApiError(422, message, "VALIDATION_ERROR", details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message, "INTERNAL_ERROR");
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, "FORBIDDEN");
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError(409, message, "CONFLICT", details);
  }

  static aiDailyLimitReached(limit: number) {
    return new ApiError(
      429,
      `You have used all ${limit} FitBook AI messages for today. Try again tomorrow.`,
      "AI_DAILY_LIMIT",
      { limit },
    );
  }
}
