import type { z } from "zod";

export async function parseJsonBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const json: unknown = await request.json();
  return schema.parse(json);
}
