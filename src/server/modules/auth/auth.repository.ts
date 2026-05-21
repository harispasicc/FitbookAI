import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

const userWithProfiles = {
  clientProfile: { select: { id: true, fullName: true } },
  trainerProfile: { select: { id: true, fullName: true } },
} as const;

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: userWithProfiles,
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: userWithProfiles,
    });
  },

  createUser(input: {
    email: string;
    passwordHash: string;
    role: UserRole;
    fullName: string;
  }) {
    return prisma.user.create({
      data: {
        email: input.email,
        password: input.passwordHash,
        role: input.role,
        ...(input.role === "TRAINER"
          ? {
              trainerProfile: {
                create: {
                  fullName: input.fullName,
                },
              },
            }
          : {
              clientProfile: {
                create: {
                  fullName: input.fullName,
                },
              },
            }),
      },
      include: userWithProfiles,
    });
  },

  updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });
  },

  invalidatePasswordResetTokens(userId: string) {
    return prisma.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  },

  createPasswordResetToken(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({
      data: input,
    });
  },

  findActivePasswordResetToken(tokenHash: string) {
    return prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  },
};
