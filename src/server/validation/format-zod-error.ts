import type { ZodError } from "zod";

export type ValidationIssue = {
  field: string;
  message: string;
};

function formatFieldPath(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "request";
  }
  return path.map(String).join(".");
}

export function formatZodError(error: ZodError): {
  message: string;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = error.issues.map((issue) => ({
    field: formatFieldPath(issue.path),
    message: issue.message,
  }));

  const message =
    issues.length === 1
      ? issues[0]!.message
      : issues.map((issue) => `${issue.field}: ${issue.message}`).join("; ");

  return { message, issues };
}
