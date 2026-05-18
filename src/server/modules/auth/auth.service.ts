import { ApiError } from "@/server/http/api-error";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  signSessionToken,
  type SessionPayload,
} from "@/server/auth/session";
import { authRepository } from "@/server/modules/auth/auth.repository";
import {
  appRoleToPrisma,
  prismaRoleToApp,
  toAuthUserDto,
  type AppRole,
} from "@/server/modules/auth/auth.dto";
import type { registerBodySchema, loginBodySchema } from "@/server/modules/auth/auth.schemas";
import type { z } from "zod";

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;

async function createSessionForUser(user: {
  id: string;
  email: string;
  role: import("@prisma/client").UserRole;
}) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    role: prismaRoleToApp(user.role),
  };
  const token = await signSessionToken(payload);
  return { token, user: await authRepository.findById(user.id) };
}

function assertRoleMatch(
  actual: AppRole,
  expected: AppRole | undefined,
) {
  if (expected && actual !== expected) {
    throw new ApiError(
      403,
      expected === "trainer"
        ? "This account is not a coach account. Use client sign in."
        : "This account is a coach account. Use coach sign in.",
      "ROLE_MISMATCH",
      { existingRole: actual },
    );
  }
}

export const authService = {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await authRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, "Email is already registered", "EMAIL_TAKEN");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email,
      passwordHash,
      role: appRoleToPrisma(input.role),
      fullName: input.name.trim(),
    });

    const session = await createSessionForUser(user);
    if (!session.user) {
      throw ApiError.internal();
    }

    return {
      token: session.token,
      user: toAuthUserDto(session.user),
    };
  },

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const user = await authRepository.findByEmail(email);

    if (!user?.password) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const appRole = prismaRoleToApp(user.role);
    assertRoleMatch(appRole, input.expectedRole);

    const session = await createSessionForUser(user);
    if (!session.user) {
      throw ApiError.internal();
    }

    return {
      token: session.token,
      user: toAuthUserDto(session.user),
    };
  },

  async getCurrentUser(userId: string) {
    const user = await authRepository.findById(userId);
    if (!user) {
      return null;
    }
    return toAuthUserDto(user);
  },
};
