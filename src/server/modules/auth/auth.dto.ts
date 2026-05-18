import type { UserRole } from "@prisma/client";

export type AppRole = "client" | "trainer";

export function prismaRoleToApp(role: UserRole): AppRole {
  return role === "TRAINER" ? "trainer" : "client";
}

export function appRoleToPrisma(role: AppRole): UserRole {
  return role === "trainer" ? "TRAINER" : "CLIENT";
}

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  trainerProfileId: string | null;
  clientProfileId: string | null;
};

export function toAuthUserDto(user: {
  id: string;
  email: string;
  role: UserRole;
  clientProfile: { id: string; fullName: string | null } | null;
  trainerProfile: { id: string; fullName: string | null } | null;
}): AuthUserDto {
  const role = prismaRoleToApp(user.role);
  const name =
    (role === "trainer"
      ? user.trainerProfile?.fullName
      : user.clientProfile?.fullName) ??
    user.email.split("@")[0] ??
    "User";

  return {
    id: user.id,
    email: user.email,
    name,
    role,
    trainerProfileId: user.trainerProfile?.id ?? null,
    clientProfileId: user.clientProfile?.id ?? null,
  };
}
