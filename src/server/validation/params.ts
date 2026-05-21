import { z } from "zod";

export const coachIdParamSchema = z.object({
  id: z
    .string({ error: "coach id must be a string" })
    .trim()
    .min(1, "coach id is required"),
});

export async function parseRouteParams<T extends z.ZodType>(
  params: Promise<Record<string, string>>,
  schema: T,
): Promise<z.infer<T>> {
  const raw = await params;
  return schema.parse(raw);
}

export function parseSearchParams<T extends z.ZodType>(
  request: Request,
  schema: T,
): z.infer<T> {
  const url = new URL(request.url);
  const raw = Object.fromEntries(url.searchParams.entries());
  return schema.parse(raw);
}
