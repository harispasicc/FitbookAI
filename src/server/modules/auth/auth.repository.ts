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
};
