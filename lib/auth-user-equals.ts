import type { AuthUser } from "@/contexts/auth-context";

export function authUsersEqual(a: AuthUser | null, b: AuthUser | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.email === b.email &&
    a.name === b.name &&
    a.role === b.role &&
    a.trainerProfileId === b.trainerProfileId &&
    a.clientProfileId === b.clientProfileId &&
    a.selectedTrainerId === b.selectedTrainerId
  );
}
