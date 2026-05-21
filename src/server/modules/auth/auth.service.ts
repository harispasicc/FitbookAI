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
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  PASSWORD_RESET_TTL_MS,
} from "@/server/auth/password-reset";
import { sendPasswordResetEmail } from "@/server/email/send-password-reset";
import type {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from "@/server/modules/auth/auth.schemas";
import type { z } from "zod";

export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>;

const FORGOT_PASSWORD_MESSAGE =
  "If an account exists for this email, you will receive password reset instructions shortly.";

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

  async forgotPassword(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const user = await authRepository.findByEmail(email);

    let devResetUrl: string | undefined;

    if (user?.password) {
      await authRepository.invalidatePasswordResetTokens(user.id);

      const { token, tokenHash } = createPasswordResetToken();
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      await authRepository.createPasswordResetToken({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const sent = await sendPasswordResetEmail({ email: user.email, token });
      if (process.env.NODE_ENV === "development") {
        devResetUrl = sent.resetUrl;
      }
    }

    return {
      message: FORGOT_PASSWORD_MESSAGE,
      ...(devResetUrl ? { devResetUrl } : {}),
    };
  },

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashPasswordResetToken(input.token.trim());
    const record = await authRepository.findActivePasswordResetToken(tokenHash);

    if (!record?.user.password) {
      throw new ApiError(
        400,
        "This reset link is invalid or has expired. Request a new one.",
        "INVALID_RESET_TOKEN",
      );
    }

    const passwordHash = await hashPassword(input.password);
    await authRepository.updatePassword(record.userId, passwordHash);
    await authRepository.markPasswordResetTokenUsed(record.id);
    await authRepository.invalidatePasswordResetTokens(record.userId);

    return {
      message: "Your password has been updated. You can sign in now.",
    };
  },
};
