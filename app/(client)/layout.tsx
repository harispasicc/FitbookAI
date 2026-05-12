import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { RoleGuard } from "@/components/auth/role-guard";
import { ClientShell } from "@/components/client/client-shell";
export default function ClientAppLayout({ children }: {
    children: ReactNode;
}) {
    return (<AuthGuard>
      <RoleGuard role="client" redirectTo="/dashboard">
        <ClientShell>{children}</ClientShell>
      </RoleGuard>
    </AuthGuard>);
}
