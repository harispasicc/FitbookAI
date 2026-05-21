import { ApiError } from "@/server/http/api-error";
import { getSessionFromCookies, type SessionPayload } from "@/server/auth/session";
import { prisma } from "@/lib/prisma";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw ApiError.unauthorized();
  }
  return session;
}

export async function requireClientSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "client") {
    throw ApiError.forbidden("This action requires a client account");
  }
  return session;
}

export async function requireTrainerSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "trainer") {
    throw ApiError.forbidden("This action requires a coach account");
  }
  return session;
}

export async function getTrainerProfileIdForUser(userId: string): Promise<string> {
  const profile = await prisma.trainerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    throw ApiError.notFound("Trainer profile not found");
  }
  return profile.id;
}
